import { Agent } from '../types/agent';
import { agentService } from './agentService';
import { mcpService } from './mcpService';
import { MCPTool } from '../types/mcp';
import { ChatMessage } from './claudeService';

export interface AgentChatHistory {
  agentId: string;
  messages: ChatMessage[];
}

export class AgentChatService {
  private activeAgent: Agent | null = null;
  private claudeService: any = null;
  private chatHistories: Map<string, ChatMessage[]> = new Map();
  private storage_key = 'asetta-agent-chat-histories';

  constructor() {
    this.loadChatHistories();
  }

  // Load chat histories from localStorage
  private loadChatHistories(): void {
    try {
      const stored = localStorage.getItem(this.storage_key);
      if (stored) {
        const histories: AgentChatHistory[] = JSON.parse(stored);
        histories.forEach(history => {
          const messages = history.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          this.chatHistories.set(history.agentId, messages);
        });
      }
    } catch (error) {
      console.error('Failed to load chat histories:', error);
    }
  }

  // Save chat histories to localStorage
  private saveChatHistories(): void {
    try {
      const histories: AgentChatHistory[] = [];
      this.chatHistories.forEach((messages, agentId) => {
        histories.push({ agentId, messages });
      });
      localStorage.setItem(this.storage_key, JSON.stringify(histories));
    } catch (error) {
      console.error('Failed to save chat histories:', error);
    }
  }

  setActiveAgent(agentId: string): void {
    const agent = agentService.getAgent(agentId);
    if (agent) {
      this.activeAgent = agent;
      this.updateAgentToolsContext(agent);
      
      // Initialize chat history for this agent if not exists
      if (!this.chatHistories.has(agentId)) {
        this.chatHistories.set(agentId, []);
      }
      
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
    if (!agent) {
      // Return general system prompt when no agent is active
      return this.getGeneralSystemPrompt();
    }

    const toolsContext = this.getAgentToolsContext(agentId);
    const basePrompt = agent.systemPrompt;
    
    return toolsContext ? `${basePrompt}${toolsContext}` : basePrompt;
  }

  // General system prompt when no agent is selected
  private getGeneralSystemPrompt(): string {
    return `You are Claude, an AI assistant powered by multiple specialized agents.

Available agents for different tasks:
- **RWA Expert**: Specializes in Real World Asset tokenization, blockchain implementation, and regulatory compliance
- **Smart Contract Developer**: Expert in Solidity, smart contract development, testing, and deployment
- **Business Analyst**: Helps with financial modeling, market analysis, and investment strategies
- **Legal Advisor**: Provides guidance on regulatory compliance, legal frameworks, and documentation
- **Technical Architect**: Designs system architecture, integrations, and infrastructure

You currently have access to filesystem tools to help manage and work with files in the workspace.

To use a specialized agent, the user can select one from the agents panel. Each agent has specific tools and expertise tailored to their domain.

How can I assist you today?`;
  }

  // Start chat session with an agent
  startAgentChat(agentId: string): void {
    this.setActiveAgent(agentId);
    // Initialize empty chat history if not exists
    if (!this.chatHistories.has(agentId)) {
      this.chatHistories.set(agentId, []);
      this.saveChatHistories();
    }
  }

  // Get chat history for an agent
  getAgentChatHistory(agentId: string): ChatMessage[] {
    const id = agentId || this.activeAgent?.id;
    if (!id) return [];
    return this.chatHistories.get(id) || [];
  }

  // Add message to agent's chat history
  addMessageToHistory(agentId: string, message: ChatMessage): void {
    const history = this.chatHistories.get(agentId) || [];
    history.push(message);
    this.chatHistories.set(agentId, history);
    this.saveChatHistories();
  }

  // Clear chat history for an agent
  clearAgentChatHistory(agentId: string): void {
    this.chatHistories.set(agentId, []);
    this.saveChatHistories();
  }

  // Get current agent's chat history
  getCurrentAgentChatHistory(): ChatMessage[] {
    if (!this.activeAgent) return [];
    return this.getAgentChatHistory(this.activeAgent.id);
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

}

// Create singleton instance
export const agentChatService = new AgentChatService();
