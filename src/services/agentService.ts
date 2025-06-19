import { Agent, AgentTemplate, CreateAgentRequest } from '../types/agent';
import { agentTemplates } from '../data/agentTemplates';

class AgentService {
  private agents: Map<string, Agent> = new Map();
  private storage_key = 'build-your-dream-agents';

  constructor() {
    this.loadAgents();
  }

  // Load agents from localStorage
  private loadAgents(): void {
    try {
      const stored = localStorage.getItem(this.storage_key);
      if (stored) {
        const agentsData = JSON.parse(stored);
        agentsData.forEach((agentData: any) => {
          const agent: Agent = {
            ...agentData,
            createdAt: new Date(agentData.createdAt),
            lastActive: agentData.lastActive ? new Date(agentData.lastActive) : undefined,
            messages: agentData.messages?.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })) || []
          };
          this.agents.set(agent.id, agent);
        });
      }
    } catch (error) {
      console.error('Failed to load agents from storage:', error);
    }
  }

  // Save agents to localStorage
  private saveAgents(): void {
    try {
      const agentsArray = Array.from(this.agents.values());
      localStorage.setItem(this.storage_key, JSON.stringify(agentsArray));
    } catch (error) {
      console.error('Failed to save agents to storage:', error);
    }
  }

  // Get all agent templates
  getAgentTemplates(): AgentTemplate[] {
    return agentTemplates;
  }

  // Get template by ID
  getTemplate(templateId: string): AgentTemplate | undefined {
    return agentTemplates.find(template => template.id === templateId);
  }

  // Create a new agent from template
  createAgent(request: CreateAgentRequest): Agent {
    const template = this.getTemplate(request.templateId);
    if (!template) {
      throw new Error(`Template with ID ${request.templateId} not found`);
    }

    const agentId = `${template.id}-${Date.now()}`;
    const agent: Agent = {
      id: agentId,
      name: request.customName || template.name,
      role: template.role,
      avatar: template.avatar,
      status: 'offline',
      description: template.description,
      color: template.color,
      systemPrompt: request.customSystemPrompt || template.systemPrompt,
      mcpServerName: request.mcpServerConfig?.serverName || template.mcpServerName,
      responseFolder: request.responseFolder || template.responseFolder,
      messages: [],
      templateId: template.id,
      createdAt: new Date()
    };

    this.agents.set(agentId, agent);
    this.saveAgents();

    return agent;
  }

  // Get all agents
  getAgents(): Agent[] {
    return Array.from(this.agents.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Get agent by ID
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  // Update agent
  updateAgent(agentId: string, updates: Partial<Agent>): Agent | undefined {
    const agent = this.agents.get(agentId);
    if (!agent) return undefined;

    const updatedAgent = { ...agent, ...updates };
    this.agents.set(agentId, updatedAgent);
    this.saveAgents();

    return updatedAgent;
  }

  // Delete agent
  deleteAgent(agentId: string): boolean {
    const deleted = this.agents.delete(agentId);
    if (deleted) {
      this.saveAgents();
    }
    return deleted;
  }

  // Add message to agent
  addMessage(agentId: string, content: string, type: 'text' | 'code' | 'file' | 'system' = 'text', metadata?: any): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      timestamp: new Date(),
      type,
      metadata
    };

    agent.messages.push(message);
    agent.lastActive = new Date();
    
    this.agents.set(agentId, agent);
    this.saveAgents();
  }

  // Get messages for agent
  getMessages(agentId: string): any[] {
    const agent = this.agents.get(agentId);
    return agent?.messages || [];
  }

  // Update agent status
  updateStatus(agentId: string, status: 'online' | 'away' | 'busy' | 'offline'): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      if (status === 'online') {
        agent.lastActive = new Date();
      }
      this.agents.set(agentId, agent);
      this.saveAgents();
    }
  }

  // Get agents by status
  getAgentsByStatus(status: 'online' | 'away' | 'busy' | 'offline'): Agent[] {
    return this.getAgents().filter(agent => agent.status === status);
  }

  // Clear all agents (for development/testing)
  clearAllAgents(): void {
    this.agents.clear();
    localStorage.removeItem(this.storage_key);
  }

  // Get active folder path for agent responses
  getResponsePath(agent: Agent, activeFolder: string | null): string | null {
    if (!activeFolder || !agent.responseFolder) return null;
    return `${activeFolder}/${agent.responseFolder}`;
  }
}

// Create singleton instance
export const agentService = new AgentService();
