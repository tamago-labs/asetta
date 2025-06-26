import { Agent } from '../types/agent';
import { agentService } from './agentService';
import { mcpService } from './mcpService';
import { MCPTool } from '../types/mcp';

export class AgentChatService {
  private activeAgent: Agent | null = null;
  private claudeService: any = null;

  setActiveAgent(agentId: string): void {
    const agent = agentService.getAgent(agentId);
    if (agent) {
      this.activeAgent = agent;
      this.updateAgentToolsContext(agent);
      
      // Update ClaudeService if available
      if (this.claudeService) {
        this.claudeService.setActiveAgent(agent);
      }
    }
  }

  getActiveAgent(): Agent | null {
    return this.activeAgent;
  }

  getActiveAgentId(): string | null {
    return this.activeAgent?.id || null;
  }

  // Get tools available to the current agent
  getAgentTools(agentId?: string): MCPTool[] {
    const agent = agentId ? agentService.getAgent(agentId) : this.activeAgent;
    if (!agent) return [];

    const availableTools = mcpService.getAvailableTools();
    const agentServerNames = agent.mcpServers;

    // Filter tools to only include those from agent's connected servers
    const filteredTools: MCPTool[] = [];
    for (const serverTools of availableTools) {
      if (agentServerNames.includes(serverTools.serverName)) {
        filteredTools.push(...serverTools.tools);
      }
    }

    return filteredTools;
  }

  // Get formatted tools context for agent
  getAgentToolsContext(agentId?: string): string {
    const tools = this.getAgentTools(agentId);
    if (tools.length === 0) return '';

    const toolsByServer = this.groupToolsByServer(agentId);
    let context = '\nAvailable tools:\n';
    
    for (const [serverName, serverTools] of Object.entries(toolsByServer)) {
      context += `\n[${serverName}] ${serverTools.map(t => t.name).join(', ')}`;
    }

    return context;
  }

  // Group tools by server for better organization
  private groupToolsByServer(agentId?: string): Record<string, MCPTool[]> {
    const agent = agentId ? agentService.getAgent(agentId) : this.activeAgent;
    if (!agent) return {};

    const availableTools = mcpService.getAvailableTools();
    const result: Record<string, MCPTool[]> = {};

    for (const serverTools of availableTools) {
      if (agent.mcpServers.includes(serverTools.serverName)) {
        result[serverTools.serverName] = serverTools.tools;
      }
    }

    return result;
  }

  // Get agent's system prompt with tools context
  getAgentSystemPrompt(agentId?: string): string {
    const agent = agentId ? agentService.getAgent(agentId) : this.activeAgent;
    if (!agent) return '';

    const toolsContext = this.getAgentToolsContext(agentId);
    const basePrompt = agent.systemPrompt;
    
    return toolsContext ? `${basePrompt}${toolsContext}` : basePrompt;
  }

  // Start chat session with an agent
  startAgentChat(agentId: string): void {
    this.setActiveAgent(agentId); 
  }

  // End chat session
  endAgentChat(): void {
    // if (this.activeAgent) {
    //   agentService.updateStatus(this.activeAgent.id, 'away');
    // }
    // this.activeAgent = null;
    
    // if (this.claudeService) {
    //   this.claudeService.setActiveAgent(null);
    // }
  }

  // Update agent's tools context when servers change
  private updateAgentToolsContext(agent: Agent): void {
    const toolsContext = this.getAgentToolsContext(agent.id);
    agentService.updateAgentToolsContext(agent.id, toolsContext);
  }

  // Register ClaudeService for updates
  registerClaudeService(claudeService: any): void {
    this.claudeService = claudeService;
  }

  // Check if agent can use a specific tool
  canUseServer(serverName: string, agentId?: string): boolean {
    const agent = agentId ? agentService.getAgent(agentId) : this.activeAgent;
    if (!agent) return false;

    return agent.mcpServers.includes(serverName);
  }

  // Get agent's connected server status
  getAgentServerStatus(agentId?: string): Record<string, 'running' | 'stopped' | 'error'> {
    const agent = agentId ? agentService.getAgent(agentId) : this.activeAgent;
    if (!agent) return {};

    const servers = mcpService.getServers();
    const status: Record<string, 'running' | 'stopped' | 'error'> = {};

    // for (const serverName of agent.mcpServers) {
    //   const server = servers.find(s => s.config.name === serverName);
    //   status[serverName] = server?.status || 'stopped';
    // }

    return status;
  }

  // Track tool usage for metrics
  recordToolUsage(agentId?: string): void {
    const agent = agentId ? agentService.getAgent(agentId) : this.activeAgent;
    // if (agent) {
    //   agentService.incrementAgentToolUsage(agent.id);
    // }
  }
}

// Create singleton instance
export const agentChatService = new AgentChatService();
