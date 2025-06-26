

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  mcpServerName?: string[];
}

export interface Agent {
  id: string;
  name: string; 
  description: string; 
  systemPrompt: string;
  mcpServers: string[];           // Connected MCP servers
  isOnline: boolean;              // Computed from MCP status
  toolsContext?: string;          // Auto-generated tools description
  messages: AgentMessage[];
  templateId?: string;
}

export interface AgentMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'code' | 'file' | 'system';
  metadata?: {
    language?: string;
    fileName?: string;
    fileSize?: string;
    mcpTool?: string;
    mcpArgs?: Record<string, any>;
  };
}

export interface CreateAgentRequest {
  templateId: string;
  customName?: string;
  customSystemPrompt?: string;
  mcpServers?: string[];          // Selected MCP servers
}
