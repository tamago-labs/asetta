use std::path::Path;
use serde::{Deserialize, Serialize};

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            read_directory, 
            read_file_content, 
            write_file_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
