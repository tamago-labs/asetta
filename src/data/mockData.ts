// Legacy mock data - keeping for backward compatibility
// New agent system uses data/agentTemplates.ts and services/agentService.ts

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  description: string;
  color: string;
}

export interface Message {
  id: string;
  agentId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'code' | 'file' | 'system';
  metadata?: {
    language?: string;
    fileName?: string;
    fileSize?: string;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  assetType: string;
  value: string;
  progress: number;
  startDate: Date;
  estimatedCompletion: Date;
}

// Legacy agents - will be replaced by real agent system
export const agents: Agent[] = [];

// Legacy messages - will be replaced by real agent messages
export const messages: Message[] = [];

export const currentProject: Project = {
  id: 'manhattan-office',
  name: 'Manhattan Office Building',
  description: '$5M Manhattan office building tokenization',
  status: 'in_progress',
  assetType: 'Real Estate',
  value: '$5,000,000',
  progress: 65,
  startDate: new Date('2025-06-01'),
  estimatedCompletion: new Date('2025-07-15')
};
