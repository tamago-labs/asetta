export interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  description: string;
  category: 'filesystem' | 'database' | 'search' | 'git' | 'web3' | 'custom' | 'conversational' | 'development';
}

export interface MCPServerInstance {
  config: MCPServerConfig;
  status: 'stopped' | 'starting' | 'running' | 'error';
  error?: string;
  tools: MCPTool[];
  resources: MCPResource[];
  lastStarted?: Date;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPServerEvent {
  type: string;
  data: any;
}
