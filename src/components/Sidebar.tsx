import React from 'react';
import { Agent } from '../data/mockData';
import clsx from 'clsx';
import { Settings, Plus, Search } from 'lucide-react';

interface SidebarProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onAgentSelect: (agentId: string) => void;
}

const statusColors = {
  online: 'bg-green-400',
  away: 'bg-yellow-400', 
  busy: 'bg-red-400',
  offline: 'bg-gray-400'
};

const statusLabels = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline'
};

export const Sidebar: React.FC<SidebarProps> = ({ agents, selectedAgentId, onAgentSelect }) => {
  const onlineAgents = agents.filter(a => a.status === 'online');
  const awayAgents = agents.filter(a => a.status === 'away');
  const busyAgents = agents.filter(a => a.status === 'busy');
  const offlineAgents = agents.filter(a => a.status === 'offline');

  const renderAgentGroup = (title: string, agentList: Agent[], showCount = true) => {
    if (agentList.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2 px-3">
          {title} {showCount && `(${agentList.length})`}
        </h3>
        <div className="space-y-1">
          {agentList.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onAgentSelect(agent.id)}
              className={clsx(
                'w-full mx-2 p-2 rounded-lg text-left transition-all duration-200 group',
                'hover:bg-slate-700',
                selectedAgentId === agent.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white'
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-transform group-hover:scale-105',
                    selectedAgentId === agent.id ? 'bg-white/20' : agent.color
                  )}>
                    {agent.avatar}
                  </div>
                  <div className={clsx(
                    'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800',
                    statusColors[agent.status]
                  )}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{agent.name}</div>
                  <div className={clsx(
                    'text-xs truncate',
                    selectedAgentId === agent.id ? 'text-blue-100' : 'text-slate-400'
                  )}>
                    {agent.role}
                  </div>
                </div>
                {agent.status !== 'offline' && (
                  <div className={clsx(
                    'w-2 h-2 rounded-full',
                    statusColors[agent.status]
                  )}></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-white font-bold text-lg">Build Your Dream</h1>
            <p className="text-slate-400 text-sm">AI Tokenization Team</p>
          </div>
          <button className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
            <Settings size={16} />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search agents..."
            className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* General Channel */}
      <div className="p-3 border-b border-slate-700">
        <button
          onClick={() => onAgentSelect('')}
          className={clsx(
            'w-full p-2 rounded-lg text-left transition-all duration-200',
            'hover:bg-slate-700',
            !selectedAgentId 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-300 hover:text-white'
          )}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center text-sm font-medium">
              #
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">general</div>
              <div className={clsx(
                'text-xs',
                !selectedAgentId ? 'text-blue-100' : 'text-slate-400'
              )}>
                All communications
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto py-3">
        {renderAgentGroup('Online', onlineAgents)}
        {renderAgentGroup('Away', awayAgents)}
        {renderAgentGroup('Busy', busyAgents)}
        {renderAgentGroup('Offline', offlineAgents)}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-slate-400">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs">All systems operational</span>
          </div>
          <button className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
            <Plus size={14} />
          </button>
        </div>
        <div className="text-xs text-slate-500">
          {onlineAgents.length} of {agents.length} agents active
        </div>
      </div>
    </div>
  );
};
