import { useState, useEffect, useCallback } from 'react';
import { Agent, AgentTemplate, CreateAgentRequest } from '../types/agent';
import { agentService } from '../services/agentService';

export interface UseAgentsReturn {
  agents: Agent[];
  templates: AgentTemplate[];
  isLoading: boolean;
  error: string | null;
  
  // Agent management
  createAgent: (request: CreateAgentRequest) => Promise<Agent>;
  updateAgent: (agentId: string, updates: Partial<Agent>) => Agent | undefined;
  deleteAgent: (agentId: string) => boolean;
  updateAgentStatus: (agentId: string, status: 'online' | 'away' | 'busy' | 'offline') => void;
  
  // Agent messages
  addMessage: (agentId: string, content: string, type?: 'text' | 'code' | 'file' | 'system', metadata?: any) => void;
  getMessages: (agentId: string) => any[];
  
  // Utilities
  refreshAgents: () => void;
  clearError: () => void;
  getAgent: (agentId: string) => Agent | undefined;
  getAgentsByStatus: (status: 'online' | 'away' | 'busy' | 'offline') => Agent[];
}

export function useAgents(): UseAgentsReturn {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load agents from service
  const refreshAgents = useCallback(() => {
    try {
      const allAgents = agentService.getAgents();
      setAgents(allAgents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load agents';
      setError(errorMessage);
    }
  }, []);

  // Initialize agents
  useEffect(() => {
    refreshAgents();
  }, [refreshAgents]);

  // Create a new agent
  const createAgent = useCallback(async (request: CreateAgentRequest): Promise<Agent> => {
    setIsLoading(true);
    setError(null);
    try {
      const agent = agentService.createAgent(request);
      refreshAgents();
      return agent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create agent';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshAgents]);

  // Update agent
  const updateAgent = useCallback((agentId: string, updates: Partial<Agent>): Agent | undefined => {
    setError(null);
    try {
      const updatedAgent = agentService.updateAgent(agentId, updates);
      if (updatedAgent) {
        refreshAgents();
      }
      return updatedAgent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update agent';
      setError(errorMessage);
      return undefined;
    }
  }, [refreshAgents]);

  // Delete agent
  const deleteAgent = useCallback((agentId: string): boolean => {
    setError(null);
    try {
      const deleted = agentService.deleteAgent(agentId);
      if (deleted) {
        refreshAgents();
      }
      return deleted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete agent';
      setError(errorMessage);
      return false;
    }
  }, [refreshAgents]);

  // Update agent status
  const updateAgentStatus = useCallback((agentId: string, status: 'online' | 'away' | 'busy' | 'offline') => {
    setError(null);
    try {
      agentService.updateStatus(agentId, status);
      refreshAgents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update agent status';
      setError(errorMessage);
    }
  }, [refreshAgents]);

  // Add message to agent
  const addMessage = useCallback((agentId: string, content: string, type: 'text' | 'code' | 'file' | 'system' = 'text', metadata?: any) => {
    setError(null);
    try {
      agentService.addMessage(agentId, content, type, metadata);
      refreshAgents(); // Refresh to update lastActive time
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add message';
      setError(errorMessage);
    }
  }, [refreshAgents]);

  // Get messages for agent
  const getMessages = useCallback((agentId: string): any[] => {
    try {
      return agentService.getMessages(agentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get messages';
      setError(errorMessage);
      return [];
    }
  }, []);

  // Get agent by ID
  const getAgent = useCallback((agentId: string): Agent | undefined => {
    return agentService.getAgent(agentId);
  }, []);

  // Get agents by status
  const getAgentsByStatus = useCallback((status: 'online' | 'away' | 'busy' | 'offline'): Agent[] => {
    return agentService.getAgentsByStatus(status);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get templates
  const templates = agentService.getAgentTemplates();

  return {
    agents,
    templates,
    isLoading,
    error,
    
    // Agent management
    createAgent,
    updateAgent,
    deleteAgent,
    updateAgentStatus,
    
    // Agent messages
    addMessage,
    getMessages,
    
    // Utilities
    refreshAgents,
    clearError,
    getAgent,
    getAgentsByStatus
  };
}
