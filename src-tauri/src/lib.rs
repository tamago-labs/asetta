use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::State;
use serde_json::Value;
use serde::{Deserialize, Serialize};

mod mcp;
use mcp::MCPClient;

type MCPClients = Arc<Mutex<HashMap<String, MCPClient>>>;

#[derive(Debug, Serialize, Deserialize)]
struct FileInfo {
    name: String,
    path: String,
    is_dir: bool,
    size: Option<u64>,
    modified: Option<String>,
    extension: Option<String>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn read_directory(path: String) -> Result<Vec<FileInfo>, String> {
    use std::fs;
    
    let entries = fs::read_dir(&path)
        .map_err(|e| format!("Failed to read directory: {}", e))?;
    
    let mut files = Vec::new();
    
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();
        
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("Unknown")
            .to_string();
        
        let path_str = path.to_string_lossy().to_string();
        let is_dir = path.is_dir();
        
        // Try to get size and modified time, but don't fail if we can't
        let size = if is_dir { 
            None 
        } else {
            entry.metadata().ok().map(|m| m.len())
        };
        
        let modified = entry.metadata()
            .ok()
            .and_then(|metadata| {
                metadata.modified()
                    .ok()
                    .and_then(|time| {
                        time.duration_since(std::time::UNIX_EPOCH)
                            .ok()
                            .map(|dur| dur.as_secs().to_string())
                    })
            });
            
        let extension = path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|s| s.to_string());
        
        files.push(FileInfo {
            name,
            path: path_str,
            is_dir,
            size,
            modified,
            extension,
        });
    }
    
    // Sort: directories first, then files, alphabetically
    files.sort_by(|a, b| {
        match (a.is_dir, b.is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });
    
    Ok(files)
}

#[tauri::command]
fn read_file_content(path: String) -> Result<String, String> {
    use std::fs;
    
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
fn write_file_content(path: String, content: String) -> Result<(), String> {
    use std::fs;
    
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write file: {}", e))
}


#[tauri::command]
async fn connect_mcp_server(
    server_name: String,
    command: String,
    args: Vec<String>,
    env: HashMap<String, String>,
    clients: State<'_, MCPClients>,
) -> Result<String, String> {
    println!("[DEBUG] connect_mcp_server_with_env called for {}", server_name);
    println!("[DEBUG] Command: {} {:?}", command, args);
    println!("[DEBUG] Environment variables: {:?}", env.keys().collect::<Vec<_>>());
    
    let mut clients_map = clients.lock().await;
    
    if clients_map.contains_key(&server_name) {
        return Err(format!("Server {} is already connected", server_name));
    }

    match MCPClient::new_with_env(command.clone(), args.clone(), env).await {
        Ok(client) => {
            clients_map.insert(server_name.clone(), client);
            Ok(format!("Connected to MCP server with environment: {}", server_name))
        },
        Err(e) => {
            println!("[ERROR] Failed to connect {}: {}", server_name, e);
            Err(format!("Failed to connect to {}: {}", server_name, e))
        }
    }
}

#[tauri::command]
async fn disconnect_mcp_server(
    server_name: String,
    clients: State<'_, MCPClients>,
) -> Result<String, String> {
    let mut clients_map = clients.lock().await;
    
    if let Some(mut client) = clients_map.remove(&server_name) {
        client.shutdown().await
            .map_err(|e| format!("Failed to shutdown {}: {}", server_name, e))?;
        Ok(format!("Disconnected MCP server: {}", server_name))
    } else {
        Err(format!("Server {} not connected", server_name))
    }
}

#[tauri::command]
async fn list_mcp_tools(
    server_name: String,
    clients: State<'_, MCPClients>,
) -> Result<Value, String> {
    let mut clients_map = clients.lock().await;
    
    if let Some(client) = clients_map.get_mut(&server_name) {
        client.list_tools().await
            .map_err(|e| format!("Failed to list tools: {}", e))
    } else {
        Err(format!("Server {} not connected", server_name))
    }
}

#[tauri::command]
async fn call_mcp_tool(
    server_name: String,
    tool_name: String,
    arguments: Value,
    clients: State<'_, MCPClients>,
) -> Result<Value, String> {
    let mut clients_map = clients.lock().await;
    
    if let Some(client) = clients_map.get_mut(&server_name) {
        client.call_tool(&tool_name, arguments).await
            .map_err(|e| format!("Failed to call tool: {}", e))
    } else {
        Err(format!("Server {} not connected", server_name))
    }
}

#[tauri::command]
async fn list_mcp_resources(
    server_name: String,
    clients: State<'_, MCPClients>,
) -> Result<Value, String> {
    let mut clients_map = clients.lock().await;
    
    if let Some(client) = clients_map.get_mut(&server_name) {
        client.list_resources().await
            .map_err(|e| format!("Failed to list resources: {}", e))
    } else {
        Err(format!("Server {} not connected", server_name))
    }
}

#[tauri::command]
async fn read_mcp_resource(
    server_name: String,
    uri: String,
    clients: State<'_, MCPClients>,
) -> Result<Value, String> {
    let mut clients_map = clients.lock().await;
    
    if let Some(client) = clients_map.get_mut(&server_name) {
        client.read_resource(&uri).await
            .map_err(|e| format!("Failed to read resource: {}", e))
    } else {
        Err(format!("Server {} not connected", server_name))
    }
}

#[tauri::command]
async fn list_connected_servers(
    clients: State<'_, MCPClients>,
) -> Result<Vec<String>, String> {
    let clients_map = clients.lock().await;
    Ok(clients_map.keys().cloned().collect())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(MCPClients::default())
        .invoke_handler(tauri::generate_handler![
            greet, 
            read_directory, 
            read_file_content, 
            write_file_content,
            connect_mcp_server,
            disconnect_mcp_server,
            list_mcp_tools,
            call_mcp_tool,
            list_mcp_resources,
            read_mcp_resource,
            list_connected_servers
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
