import { MCPServerConfig, MCPServerInstance, MCPTool, MCPResource, MCPServerEvent } from '../types/mcp';

class MCPService {
  private servers: Map<string, MCPServerInstance> = new Map();
  private eventListeners: Map<string, ((event: MCPServerEvent) => void)[]> = new Map();
  private workspaceRoot: string | null = null;

  constructor() {
    this.setupDefaultServers();
    console.log('MCP Service initialized');
  }

  setWorkspaceRoot(path: string | null) {
    console.log(`Setting current folder to: ${path}`);
    this.workspaceRoot = path;
    const fsServer = this.servers.get('filesystem');
    if (fsServer && path) {
      console.log(`Updating filesystem server args with new folder: ${path}`);
      fsServer.config.args = ['-y', '@modelcontextprotocol/server-filesystem', path];

      if (fsServer.status === 'running') {
        console.log(`Restarting filesystem server with new folder: ${path}`);
        this.restartServer('filesystem').then(() => {
          console.log(`Filesystem server restarted successfully with folder: ${path}`);
        }).catch(err => {
          console.error(`Failed to restart filesystem server: ${err.message}`);
        });
      }
    }
  }

  getWorkspaceRoot(): string | null {
    return this.workspaceRoot;
  }

  private setupDefaultServers() {
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

      console.log(`Starting MCP server ${serverName}`, {
        command: server.config.command,
        args: server.config.args,
        env: server.config.env
      });

      // Simulate MCP server connection
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock tools for now
      server.tools = this.getMockTools(serverName);
      server.resources = [];

      server.status = 'running';
      server.lastStarted = new Date();
      server.error = undefined;

      console.log(`MCP server ${serverName} started successfully`);
      this.emit('serverStatusChanged', { serverName, status: 'running' });
      this.emit('serverStarted', { serverName, tools: server.tools, resources: server.resources });

      return true;
    } catch (error: any) {
      console.error(`Failed to start MCP server ${serverName}`, { error: error.message });
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
      server.status = 'stopped';
      server.tools = [];
      server.resources = [];

      this.emit('serverStatusChanged', { serverName, status: 'stopped' });
      this.emit('serverStopped', { serverName });

      return true;
    } catch (error: any) {
      console.error(`Failed to stop MCP server ${serverName}:`, error);
      server.status = 'error';
      server.error = error instanceof Error ? error.message : 'Unknown error';

      this.emit('serverStatusChanged', { serverName, status: 'error', error: server.error });
      return false;
    }
  }

  async restartServer(serverName: string): Promise<boolean> {
    console.log(`Restarting server ${serverName}`);
    await this.stopServer(serverName);
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

    this.emit('serverAdded', { serverName: config.name, config });
  }

  removeServer(serverName: string): void {
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
    this.emit('serverRemoved', { serverName });
  }

  private getMockTools(serverName: string): MCPTool[] {
    switch (serverName) {
      case 'filesystem':
        return [
          { name: 'read_file', description: 'Read file contents', inputSchema: {} },
          { name: 'write_file', description: 'Write file contents', inputSchema: {} },
          { name: 'list_directory', description: 'List directory contents', inputSchema: {} }
        ];
      case '@tamago-labs/smart-contract-dev':
        return [
          { name: 'compile_contract', description: 'Compile Solidity contract', inputSchema: {} },
          { name: 'deploy_contract', description: 'Deploy contract to network', inputSchema: {} },
          { name: 'verify_contract', description: 'Verify contract on explorer', inputSchema: {} }
        ];
      default:
        return [];
    }
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
      // Mock tool execution
      const result = { success: true, tool: toolName, args, timestamp: new Date() };
      this.emit('toolCalled', { serverName, toolName, arguments: args, result });
      return result;
    } catch (error) {
      console.error(`Failed to call tool ${toolName} on server ${serverName}:`, error);
      this.emit('toolError', { serverName, toolName, arguments: args, error });
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

  getServerTemplates(): MCPServerConfig[] {
    return [
      {
        name: '@tamago-labs/smart-contract-dev',
        command: 'npx',
        args: ['-y', '@tamago-labs/smart-contract-dev'],
        env: {},
        description: 'Comprehensive smart contract development tools with deployment and verification capabilities',
        category: 'web3'
      },
      {
        name: 'web-search',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-web-search'],
        description: 'Web search and scraping capabilities',
        category: 'search'
      }
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
