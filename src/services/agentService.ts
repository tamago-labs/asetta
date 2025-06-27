import { Agent, AgentTemplate, CreateAgentRequest } from '../types/agent';
import { agentTemplates } from '../data/agentTemplates';
import { mcpService } from "./mcpService"

class AgentService {
  private agents: Map<string, Agent> = new Map();
  private storage_key = 'asetta-agents';
  private statusCheckInterval: any

  constructor() {
    this.loadAgents();
    // Start status checking interval
    this.startStatusMonitoring();
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
            mcpServers: agentData.mcpServers || (
              agentData.mcpServerName ? ['filesystem', agentData.mcpServerName] : ['filesystem']
            ),
            isOnline: agentData.isOnline || false, 
            metrics: agentData.metrics || {
              totalChats: 0,
              toolsUsed: 0,
              uptime: 0
            },
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
      const agentsArray = Array.from(this.agents.values()).map(agent => ({
        ...agent, 
        messages: agent.messages?.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        }))
      }));
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

    // Default MCP servers: always include filesystem + template servers + custom servers
    let mcpServers = ['filesystem'];
    if (template.mcpServerName) {
      for (let mcp of template.mcpServerName) {
        mcpServers.push(mcp);
      }
    }

    const agent: Agent = {
      id: agentId,
      name: request.customName || template.name,
      description: template.description,
      systemPrompt: request.customSystemPrompt || template.systemPrompt,
      mcpServers: mcpServers,
      isOnline: false,
      messages: [],
      templateId: template.id
    };

    console.log('Creating agent with servers:', mcpServers);
    this.agents.set(agentId, agent);
    this.saveAgents();

    // Update agent status immediately after creation
    setTimeout(() => {
      console.log('Updating agent status after creation...');
      this.updateAgentOnlineStatus(agentId);
    }, 500);

    return agent;
  }

  // Get all agents
  getAgents(): Agent[] {
    return Array.from(this.agents.values())
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

    this.agents.set(agentId, agent);
    this.saveAgents();
  }

  // Get messages for agent
  getMessages(agentId: string): any[] {
    const agent = this.agents.get(agentId);
    return agent?.messages || [];
  }

  // Get agents by status
  getAgentsByStatus(status: 'online' | 'offline'): Agent[] {
    return status === "online" ? this.getAgents().filter(agent => agent.isOnline) : this.getAgents().filter(agent => !agent.isOnline)
  }

  // Clear all agents (for development/testing)
  clearAllAgents(): void {
    this.agents.clear();
    localStorage.removeItem(this.storage_key);
  }

  // Get agent's connected MCP servers
  getAgentMCPServers(agentId: string): string[] {
    const agent = this.agents.get(agentId);
    return agent?.mcpServers || [];
  }

  // Get tools context for agent's system prompt
  getAgentToolsContext(agentId: string): string {
    const agent = this.agents.get(agentId);
    return agent?.toolsContext || '';
  }

  // Update agent's tools context
  updateAgentToolsContext(agentId: string, toolsContext: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.toolsContext = toolsContext;
      this.saveAgents();
    }
  }

  // Check if agent is online (all connected MCP servers running)
  isAgentOnline(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    return agent?.isOnline || false;
  }

  // Update agent online status based on MCP servers
  updateAgentOnlineStatus(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) {
      console.warn(`Agent ${agentId} not found for status update`);
      return;
    }

    try {
      // Get current server statuses
      // const allServers = mcpService.getServers();
      // const serverStatusMap = new Map(allServers.map(s => [s.config.name, s.status]));

      // console.log(`=== Agent: ${agent.name} ===`);
      // console.log('Required servers:', agent.mcpServers);

      // // Check each required server
      // const serverStatuses = agent.mcpServers?.map(serverName => {
      //   const status = serverStatusMap.get(serverName) || 'not-found'; 
      //   console.log(`  ${serverName}: ${status}`);
      //   return { name: serverName, status, isRunning: status === 'running' };
      // }) || [];

      // // Count running servers
      // const runningCount = serverStatuses.filter(s => s.isRunning).length;
      // const totalCount = serverStatuses.length;

      // // Update agent status - online if all required servers are running
      // agent.isOnline = totalCount > 0 && runningCount === totalCount; 

      // console.log(`Result: ${runningCount}/${totalCount} servers running -> ${agent.isOnline ? 'ONLINE' : 'OFFLINE'}`);

      agent.isOnline = true

    } catch (error) {
      console.error('Failed to update agent status:', error);
      agent.isOnline = false; 
    }

    // Save changes
    this.saveAgents();
  }

  // Update all agents' online status
  updateAllAgentsOnlineStatus(): void {
    this.agents.forEach((_, agentId) => {
      this.updateAgentOnlineStatus(agentId);
    });
  }

  // Start monitoring agent status with interval
  private startStatusMonitoring(): void {
    // Initial check after a short delay
    setTimeout(() => this.updateAllAgentsOnlineStatus(), 1000);

    // Set up interval to check every 5 seconds
    this.statusCheckInterval = setInterval(() => {
      this.updateAllAgentsOnlineStatus();
    }, 5000);
  }

  // Stop monitoring (cleanup)
  stopStatusMonitoring(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }

  // Force refresh all agent statuses
  refreshAllAgentStatus(): void {
    console.log('Manually refreshing all agent statuses...');
    this.updateAllAgentsOnlineStatus();
  }

  // Auto-start required MCP servers for agent
  async startRequiredServers(agentId: string): Promise<boolean[]> {
    const agent = this.agents.get(agentId);
    if (!agent || !agent.mcpServers) return [];

    const results: boolean[] = [];
    
    for (const serverName of agent.mcpServers) {
      try {
        const server = mcpService.getServer(serverName);
        if (server && server.status !== 'running') {
          console.log(`Starting required server for agent ${agent.name}: ${serverName}`);
          const success = await mcpService.startServer(serverName);
          results.push(success);
        } else {
          results.push(true); // Already running
        }
      } catch (error) {
        console.error(`Failed to start server ${serverName} for agent ${agent.name}:`, error);
        results.push(false);
      }
    }

    // Update agent status after starting servers
    setTimeout(() => this.updateAgentOnlineStatus(agentId), 1000);

    return results;
  }
}

// Create singleton instance
export const agentService = new AgentService();