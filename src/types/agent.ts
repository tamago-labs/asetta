export interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  avatar: string;
  description: string;
  category: 'smart-contract' | 'infrastructure' | 'fullstack' | 'legal' | 'project-management' | 'custom';
  systemPrompt: string;
  mcpServerName?: string;
  mcpServerConfig?: {
    command: string;
    args: string[];
    env?: Record<string, string>;
  };
  responseFolder?: string; // relative to active folder
  color: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  description: string;
  color: string;
  systemPrompt: string;
  mcpServerName?: string;
  responseFolder?: string;
  messages: AgentMessage[];
  templateId?: string;
  createdAt: Date;
  lastActive?: Date;
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
  mcpServerConfig?: {
    serverName: string;
    args?: string[];
    env?: Record<string, string>;
  };
  responseFolder?: string;
}
