import React, { useState } from 'react';
import { Agent } from '../types/agent';
import clsx from 'clsx';
import { Settings, Plus, Search, Trash2, MoreVertical, RefreshCw, PlusSquare } from 'lucide-react';
import { agentService } from '../services/agentService';

interface SidebarProps {
  agents: (Agent)[];
  selectedAgentId: string | null;
  onAgentSelect: (agentId: string) => void;
  onAgentCreated?: (agentId: string) => void;
  onAgentRemoved?: (agentId: string) => void;
  activeFolder?: string | null;
  onAddAgent?: () => void
}

// const statusColors = {
//   online: 'bg-green-400',
//   away: 'bg-yellow-400',
//   busy: 'bg-red-400',
//   offline: 'bg-gray-400'
// };

export const Sidebar: React.FC<SidebarProps> = ({
  agents,
  selectedAgentId,
  onAgentSelect,
  onAgentCreated,
  onAgentRemoved,
  activeFolder,
  onAddAgent
}) => {

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [agentMenuOpen, setAgentMenuOpen] = useState<string | null>(null);

  // Close agent menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setAgentMenuOpen(null);
    if (agentMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [agentMenuOpen]);

  const onlineAgents = agents.filter(a => a.isOnline);
  const offlineAgents = agents.filter(a => !a.isOnline);

  const getHealthStatusColor = (agent: Agent) => {
    switch (agent.isOnline) {
      case true: return 'bg-green-400';
      case false: return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getHealthStatusText = (agent: Agent) => {
    return `${agent.isOnline ? 'online' : 'offline'}`;
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    console.log('Manual agent status refresh triggered');
    agentService.refreshAllAgentStatus();

    // Show refresh animation for 2 seconds
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const handleRemoveAgent = (agentId: string, agentName: string) => {
    if (confirm(`Are you sure you want to remove "${agentName}"? This action cannot be undone.`)) {
      if (onAgentRemoved) {
        onAgentRemoved(agentId);
      }
      setAgentMenuOpen(null);
    }
  };

  const renderAgentGroup = (title: string, agentList: (Agent)[], showCount = true) => {
    if (agentList.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2 px-3">
          {title} {showCount && `(${agentList.length})`}
        </h3>
        <div className="space-y-1 px-2">
          {agentList.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onAgentSelect(agent.id)}
              className={clsx(
                'w-full p-3 rounded-lg text-left transition-all duration-200 group relative',
                'hover:bg-slate-700',
                selectedAgentId === agent.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white'
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-transform group-hover:scale-105',
                      selectedAgentId === agent.id ? 'bg-slate-300 text-black' : 'bg-slate-700 text-white'
                    )}
                  >
                    {agent.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className={clsx(
                    'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800',
                    getHealthStatusColor(agent)
                  )}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{agent.name}</div>
                  {agent.mcpServers && (
                    <div className={clsx(
                      'text-xs truncate mt-0.5',
                      selectedAgentId === agent.id ? 'text-blue-200' : 'text-slate-500'
                    )}>
                      {agent.mcpServers.join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className={clsx(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    getHealthStatusColor(agent)
                  )}
                    title={getHealthStatusText(agent)}
                  ></div>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAgentMenuOpen(agentMenuOpen === agent.id ? null : agent.id);
                      }}
                      className="p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Agent options"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </button>

                    {/* Dropdown menu */}
                    {agentMenuOpen === agent.id && (
                      <div className="absolute right-0 top-6 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-50 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAgent(agent.id, agent.name);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-600 hover:text-red-300 rounded-lg flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove Agent
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-0">
          <div>
            <h1 className="text-white font-bold text-lg">Asetta</h1>
            <p className="text-slate-400 text-sm">v.0.1.0</p>
          </div>

          {/* Refresh button */}
          {/* <button
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh agent statuses"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button> */}
          <button
            onClick={onAddAgent}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            title="Add new agent"
          >
            <Plus className={`w-5 h-5`} />
          </button>
        </div>
      </div>

      {/* General Channel */}
      {/* <div className="p-3 border-b border-slate-700 flex-shrink-0">
        <button
          onClick={() => onAgentSelect('')}
          className={clsx(
            'w-full p-3 rounded-lg text-left transition-all duration-200',
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
            <div className="flex-1 min-w-0">
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
      </div> */}

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto py-3">
        {renderAgentGroup('Online', onlineAgents)}
        {renderAgentGroup('Offline', offlineAgents)}

        {agents.length === 0 && (
          <div className="text-center text-slate-400 py-8 px-4">
            <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No agents added yet</p>
            <p className="text-xs mt-1">Click + to add your first agent</p>
          </div>
        )}
      </div>
    </div>
  );
};
