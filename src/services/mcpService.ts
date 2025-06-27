import { tauriMCPService } from './tauriMCPService';
import { MCPServerConfig, MCPServerInstance, MCPTool, MCPResource, MCPServerEvent } from '../types/mcp';
import { Logger } from '../utils/logger';

export class MCPService {
  private servers: Map<string, MCPServerInstance> = new Map();
  private eventListeners: Map<string, ((event: MCPServerEvent) => void)[]> = new Map();
  private workspaceRoot: string | null = null;
  private logger = Logger.getInstance();
  private storage_key = 'asetta-mcp-servers';

  constructor() {
    this.loadServersFromStorage();
    this.setupDefaultServers();
    this.logger.info('mcp', 'MCP Service initialized with Tauri integration');
  }

  // Load servers from localStorage
  private loadServersFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storage_key);
      if (stored) {
        const serversData = JSON.parse(stored);
        serversData.forEach((serverData: any) => {
          const instance: MCPServerInstance = {
            config: serverData.config,
            status: 'stopped', // Always start as stopped on load
            tools: [],
            resources: [],
            error: undefined,
            lastStarted: serverData.lastStarted ? new Date(serverData.lastStarted) : undefined
          };
          this.servers.set(serverData.config.name, instance);
        });
      }
    } catch (error) {
      console.error('Failed to load MCP servers from storage:', error);
    }
  }

  // Save servers to localStorage
  private saveServersToStorage(): void {
    try {
      const serversArray = Array.from(this.servers.values()).map(server => ({
        config: server.config,
        lastStarted: server.lastStarted
      }));
      localStorage.setItem(this.storage_key, JSON.stringify(serversArray));
    } catch (error) {
      console.error('Failed to save MCP servers to storage:', error);
    }
  }

  setWorkspaceRoot(path: string | null) {
    this.logger.info('mcp', `Setting current folder to: ${path}`);
    this.workspaceRoot = path;
    const fsServer = this.servers.get('filesystem');
    if (fsServer && path) {
      this.logger.info('mcp', `Updating filesystem server args with new folder: ${path}`);
      fsServer.config.args = ['-y', '@modelcontextprotocol/server-filesystem', path];

      if (fsServer.status === 'running') {
        this.logger.info('mcp', `Restarting filesystem server with new folder: ${path}`);
        this.restartServer('filesystem').then(() => {
          this.logger.info('mcp', `Filesystem server restarted successfully with folder: ${path}`);
        }).catch(err => {
          this.logger.error('mcp', `Failed to restart filesystem server: ${err.message}`);
        });
      } else {
        this.logger.info('mcp', `Starting filesystem server with folder: ${path}`);
        this.startServer('filesystem').then(() => {
          this.logger.info('mcp', `Filesystem server started successfully with folder: ${path}`);
        }).catch(err => {
          this.logger.error('mcp', `Failed to start filesystem server: ${err.message}`);
        });
      }
    } else if (!path) {
      this.logger.info('mcp', 'No folder path provided, stopping filesystem server');
      if (fsServer && fsServer.status === 'running') {
        this.stopServer('filesystem');
      }
    }
  }

  getWorkspaceRoot(): string | null {
    return this.workspaceRoot;
  }

  private setupDefaultServers() {
    // Only add filesystem if not already loaded from storage
    if (!this.servers.has('filesystem')) {
      const filesystemServer: MCPServerConfig = {
        name: 'filesystem',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '/'],
        description: 'Provides file system operations and navigation',
        category: 'filesystem'
      };

      this.servers.set('filesystem', {
        config: filesystemServer,
        status: 'stopped',
        tools: [],
        resources: []
      });
    }
  }

  addEventListener(event: string, callback: (event: MCPServerEvent) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: (event: MCPServerEvent) => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const eventData: MCPServerEvent = { type: event, data };
      listeners.forEach(callback => callback(eventData));
    }
  }

  async startServer(serverName: string): Promise<boolean> {
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(`Server ${serverName} not found`);
    }

    if (server.status === 'running') {
      return true;
    }

    try {
      server.status = 'starting';
      this.emit('serverStatusChanged', { serverName, status: 'starting' });

      this.logger.info('mcp', `Starting MCP server ${serverName}`, {
        command: server.config.command,
        args: server.config.args,
        env: server.config.env
      });

      // Connect to MCP server using real protocol with environment variables
      await tauriMCPService.connectServerWithEnv(
        serverName,
        server.config.command,
        server.config.args,
        server.config.env || {}
      );

      // Load real tools from the server
      const toolsResponse = await tauriMCPService.listTools(serverName);
      server.tools = this.formatMCPTools(toolsResponse);
      this.logger.info('mcp', `Loaded ${server.tools.length} tools from ${serverName}`, {
        tools: server.tools.map(t => t.name)
      });

      // Only try to load resources if server supports it (skip for filesystem)
      if (serverName !== 'filesystem') {
        try {
          const resourcesResponse = await tauriMCPService.listResources(serverName);
          server.resources = this.formatMCPResources(resourcesResponse);
        } catch (error) {
          this.logger.warn('mcp', `Server ${serverName} doesn't support resources`, { error });
          server.resources = [];
        }
      } else {
        server.resources = [];
      }

      server.status = 'running';
      server.lastStarted = new Date();
      server.error = undefined;

      this.logger.info('mcp', `MCP server ${serverName} started successfully`);
      this.emit('serverStatusChanged', { serverName, status: 'running' });
      this.emit('serverStarted', { serverName, tools: server.tools, resources: server.resources });
      
      // Save to storage after successful start
      this.saveServersToStorage();
      
      return true;
    } catch (error: any) {
      this.logger.error('mcp', `Failed to start MCP server ${serverName}`, { error: error.message });
      server.status = 'error';
      server.error = error instanceof Error ? error.message : 'Unknown error';

      this.emit('serverStatusChanged', { serverName, status: 'error', error: server.error });
      return false;
    }
  }

  async stopServer(serverName: string): Promise<boolean> {
    const server = this.servers.get(serverName);
    if (!server || server.status === 'stopped') {
      return true;
    }

    try {
      await tauriMCPService.disconnectServer(serverName);

      server.status = 'stopped';
      server.tools = [];
      server.resources = [];

      this.emit('serverStatusChanged', { serverName, status: 'stopped' });
      this.emit('serverStopped', { serverName });
   
      return true;
    } catch (error: any) {
      this.logger.error('mcp', `Failed to stop MCP server ${serverName}`, { error: error.message });
      server.status = 'error';
      server.error = error instanceof Error ? error.message : 'Unknown error';

      this.emit('serverStatusChanged', { serverName, status: 'error', error: server.error });
      return false;
    }
  }

  async restartServer(serverName: string): Promise<boolean> {
    this.logger.info('mcp', `Restarting server ${serverName}`);

    // For filesystem server, make sure it fully stops before starting
    if (serverName === 'filesystem') {
      const server = this.servers.get(serverName);
      if (server) {
        this.logger.info('mcp', 'Filesystem server config before restart', { config: server.config });
      }
    }

    await this.stopServer(serverName);

    // Add a small delay to ensure complete shutdown
    await new Promise(resolve => setTimeout(resolve, 500));

    return await this.startServer(serverName);
  }

  addServer(config: MCPServerConfig): void {
    if (this.servers.has(config.name)) {
      throw new Error(`Server ${config.name} already exists`);
    }

    this.servers.set(config.name, {
      config,
      status: 'stopped',
      tools: [],
      resources: []
    });

    // Save to storage after adding
    this.saveServersToStorage();

    this.emit('serverAdded', { serverName: config.name, config });
  }

  removeServer(serverName: string): void {
    // Prevent removing the default filesystem server
    if (serverName === 'filesystem') {
      throw new Error('Cannot remove the default filesystem server');
    }

    const server = this.servers.get(serverName);
    if (!server) {
      return;
    }

    if (server.status === 'running') {
      this.stopServer(serverName);
    }

    this.servers.delete(serverName);
    
    // Save to storage after removing
    this.saveServersToStorage();
    
    this.emit('serverRemoved', { serverName });
  }

  updateServerConfig(serverName: string, config: Partial<MCPServerConfig>): void {
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(`Server ${serverName} not found`);
    }

    server.config = { ...server.config, ...config };
    
    // Save to storage after updating
    this.saveServersToStorage();
    
    this.emit('serverConfigUpdated', { serverName, config: server.config });
  }

  private formatMCPTools(toolsResponse: any): MCPTool[] {
    if (!toolsResponse || !toolsResponse.result || !toolsResponse.result.tools) {
      return [];
    }

    return toolsResponse.result.tools.map((tool: any) => ({
      name: tool.name,
      description: tool.description || tool.name,
      inputSchema: tool.inputSchema || {}
    }));
  }

  private formatMCPResources(resourcesResponse: any): MCPResource[] {
    if (!resourcesResponse || !resourcesResponse.result || !resourcesResponse.result.resources) {
      return [];
    }

    return resourcesResponse.result.resources.map((resource: any) => ({
      uri: resource.uri,
      name: resource.name || resource.uri,
      description: resource.description,
      mimeType: resource.mimeType
    }));
  }

  async callTool(serverName: string, toolName: string, args: Record<string, any>): Promise<any> {
    const server = this.servers.get(serverName);
    if (!server || server.status !== 'running') {
      throw new Error(`Server ${serverName} is not running`);
    }

    const tool = server.tools.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found on server ${serverName}`);
    }

    try {
      const result = await tauriMCPService.callTool(serverName, toolName, args);
      this.emit('toolCalled', { serverName, toolName, arguments: args, result });
      return result;
    } catch (error) {
      console.error(`Failed to call tool ${toolName} on server ${serverName}:`, error);
      this.emit('toolError', { serverName, toolName, arguments: args, error });
      throw error;
    }
  }

  async readResource(serverName: string, uri: string): Promise<any> {
    const server = this.servers.get(serverName);
    if (!server || server.status !== 'running') {
      throw new Error(`Server ${serverName} is not running`);
    }

    try {
      const result = await tauriMCPService.readResource(serverName, uri);
      this.emit('resourceRead', { serverName, uri, result });
      return result;
    } catch (error) {
      console.error(`Failed to read resource ${uri} from server ${serverName}:`, error);
      this.emit('resourceError', { serverName, uri, error });
      throw error;
    }
  }

  getServers(): MCPServerInstance[] {
    return Array.from(this.servers.values());
  }

  getServer(serverName: string): MCPServerInstance | undefined {
    return this.servers.get(serverName);
  }

  getRunningServers(): MCPServerInstance[] {
    return Array.from(this.servers.values()).filter(server => server.status === 'running');
  }

  getAvailableTools(): { serverName: string; tools: MCPTool[] }[] {
    return Array.from(this.servers.values())
      .filter(server => server.status === 'running')
      .map(server => ({
        serverName: server.config.name,
        tools: server.tools
      }));
  }

  getAvailableResources(): { serverName: string; resources: MCPResource[] }[] {
    return Array.from(this.servers.values())
      .filter(server => server.status === 'running')
      .map(server => ({
        serverName: server.config.name,
        resources: server.resources
      }));
  }

  getServerTemplates(): MCPServerConfig[] {
    return [ 
      // Asetta Core MCP
      {
        name: 'asetta-mcp-legal',
        command: 'npx',
        args: ['-y', '@tamago-labs/asetta-mcp', '--access_key=YOUR_ACCESS_KEY', '--agent_mode=legal'],
        description: 'MCP for legal agent for Asetta.xyz platform',
        category: 'core'
      },
      {
        name: 'asetta-mcp-tokenization',
        command: 'npx',
        args: ['-y', '@tamago-labs/asetta-mcp', '--access_key=YOUR_ACCESS_KEY', '--wallet_private_key=YOUR_PRIVATE_KEY' ,'--agent_mode=tokenization'],
        description: 'MCP for tokenization agent for Asetta.xyz platform',
        category: 'core'
      },
      // AWS Development Tools
      {
        name: 'frontend-mcp',
        command: 'uvx',
        args: ['awslabs.frontend-mcp-server@latest'],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR'
        },
        description: 'React and modern web development guidance with AWS integration',
        category: 'development'
      },
      // AWS Conversational Assistants
      {
        name: 'aws-documentation-mcp',
        command: 'uvx',
        args: ['awslabs.aws-documentation-mcp-server@latest'],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR'
        },
        description: 'Get latest AWS docs and API references for accurate technical answers',
        category: 'conversational'
      },
      {
        name: 'bedrock-data-automation',
        command: 'uvx',
        args: ['awslabs.aws-bedrock-data-automation-mcp-server@latest'],
        env: {
          AWS_PROFILE: 'YOUR_AWS_PROFILE',
          AWS_REGION: 'us-east-1',
          FASTMCP_LOG_LEVEL: 'ERROR'
        },
        description: 'Analyze documents, images, videos, and audio files using Amazon Bedrock',
        category: 'conversational'
      },
      {
        name: 'bedrock-knowledge-base',
        command: 'uvx',
        args: ['awslabs.bedrock-kb-retrieval-mcp-server@latest'],
        env: {
          AWS_PROFILE: 'YOUR_AWS_PROFILE',
          AWS_REGION: 'us-east-1',
          FASTMCP_LOG_LEVEL: 'ERROR'
        },
        description: 'Query enterprise knowledge bases with citation support using Amazon Bedrock',
        category: 'conversational'
      }, 
      // {
      //   name: 'web-search',
      //   command: 'npx',
      //   args: ['-y', '@modelcontextprotocol/server-web-search'],
      //   description: 'Web search and content scraping capabilities for research and documentation',
      //   category: 'search'
      // }
    ];
  }

  async cleanup(): Promise<void> {
    const runningServers = this.getRunningServers();
    await Promise.all(
      runningServers.map(server => this.stopServer(server.config.name))
    );
    this.servers.clear();
    this.eventListeners.clear();
  }

}

// Create singleton instance
export const mcpService = new MCPService();