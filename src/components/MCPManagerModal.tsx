import React, { useState, useEffect } from 'react';
import {
  Server,
  Terminal,
  Play,
  Square,
  RefreshCw,
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wrench,
  Database,
  FileText,
  Activity,
  Layout,
  Trash2,
  Copy,
  ExternalLink,
  X
} from 'lucide-react';
import { mcpService } from '../services/mcpService';
import { MCPServerInstance, MCPServerConfig } from '../types/mcp';
import { LogsPanel } from './LogsPanel';

interface MCPManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MCPManagerModal: React.FC<MCPManagerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'servers' | 'templates' | 'logs'>('servers');
  const [servers, setServers] = useState<MCPServerInstance[]>([]);
  const [serverTemplates, setServerTemplates] = useState<MCPServerConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddServer, setShowAddServer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customArgs, setCustomArgs] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [customEnv, setCustomEnv] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadServers();
      loadTemplates();
    }
  }, [isOpen]);

  const loadServers = () => {
    setServers(mcpService.getServers());
  };

  const loadTemplates = () => {
    setServerTemplates(mcpService.getServerTemplates());
  };

  const handleStartServer = async (serverName: string) => {
    setIsLoading(true);
    try {
      await mcpService.startServer(serverName);
      loadServers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopServer = async (serverName: string) => {
    setIsLoading(true);
    try {
      await mcpService.stopServer(serverName);
      loadServers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartServer = async (serverName: string) => {
    setIsLoading(true);
    try {
      await mcpService.restartServer(serverName);
      loadServers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restart server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveServer = async (serverName: string) => {
    if (serverName === 'filesystem') {
      alert('Cannot remove the default filesystem server');
      return;
    }

    if (confirm(`Are you sure you want to remove server "${serverName}"?`)) {
      try {
        mcpService.removeServer(serverName);
        loadServers();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove server');
      }
    }
  };

  const handleAddCustomServer = () => {
    const template = serverTemplates.find(t => t.name === selectedTemplate);
    if (!template) return;

    const args = customArgs.trim() ? customArgs.split(' ') : template.args;
    const name = customName.trim() || `${template.name}-${Date.now()}`;
    const env = Object.keys(customEnv).length > 0 ? customEnv : template.env;

    try {
      mcpService.addServer({
        ...template,
        name,
        args,
        env
      });
      loadServers();
      setShowAddServer(false);
      resetAddServerForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add server');
    }
  };

  const resetAddServerForm = () => {
    setSelectedTemplate('');
    setCustomArgs('');
    setCustomName('');
    setCustomEnv({});
  };

  const addEnvVar = () => {
    setCustomEnv(prev => ({ ...prev, '': '' }));
  };

  const updateEnvVar = (oldKey: string, newKey: string, value: string) => {
    setCustomEnv(prev => {
      const updated = { ...prev };
      if (oldKey !== newKey) {
        delete updated[oldKey];
      }
      updated[newKey] = value;
      return updated;
    });
  };

  const removeEnvVar = (key: string) => {
    setCustomEnv(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'starting':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Square className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'filesystem':
        return <FileText className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'web3':
        return <ExternalLink className="w-4 h-4" />;
      case 'search':
        return <Terminal className="w-4 h-4" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'filesystem':
        return 'text-blue-400';
      case 'database':
        return 'text-green-400';
      case 'web3':
        return 'text-purple-400';
      case 'search':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">MCP Server Manager</h2>
              <p className="text-slate-400 text-sm">Manage Model Context Protocol servers and tools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('servers')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'servers'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            Servers
            <span className="text-xs bg-slate-700 px-2 py-1 rounded">
              {servers.filter(s => s.status === 'running').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'templates'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layout className="w-4 h-4" />
            Templates
            <span className="text-xs bg-slate-700 px-2 py-1 rounded">
              {serverTemplates.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'logs'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            Logs
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'servers' && (
            <div className="h-full flex flex-col">
              {/* Header with Add Button */}
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Running Servers</h3>
                    <p className="text-slate-400 text-sm">Manage your MCP server instances</p>
                  </div> 
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mx-6 mt-4 p-3 bg-red-900/50 border border-red-500 rounded text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-red-200">{error}</span>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-400 hover:text-red-200"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Server List */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {servers.map((server) => (
                    <div
                      key={server.config.name}
                      className="border border-slate-700 rounded-lg p-4 bg-slate-800/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(server.status)}
                          <div className={`flex items-center gap-2 ${getCategoryColor(server.config.category)}`}>
                            {getCategoryIcon(server.config.category)}
                          </div>
                          <span className="font-medium text-white">
                            {server.config.name}
                          </span>
                          {server.config.name === 'filesystem' && (
                            <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {server.status === 'running' ? (
                            <>
                              <button
                                onClick={() => handleRestartServer(server.config.name)}
                                className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                                title="Restart"
                                disabled={isLoading}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStopServer(server.config.name)}
                                className="p-2 hover:bg-slate-700 rounded text-red-400 hover:text-red-300"
                                title="Stop"
                                disabled={isLoading}
                              >
                                <Square className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleStartServer(server.config.name)}
                              className="p-2 hover:bg-slate-700 rounded text-green-400 hover:text-green-300"
                              title="Start"
                              disabled={isLoading || server.status === 'starting'}
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}

                          {server.config.name !== 'filesystem' && (
                            <button
                              onClick={() => handleRemoveServer(server.config.name)}
                              className="p-2 hover:bg-slate-700 rounded text-red-400 hover:text-red-300"
                              title="Remove Server"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-slate-400 mb-3">
                        {server.config.description}
                      </div>

                      {server.status === 'error' && server.error && (
                        <div className="text-sm text-red-400 mb-3">
                          Error: {server.error}
                        </div>
                      )}

                      {server.status === 'running' && (
                        <div className="space-y-3">
                          {/* Tools */}
                          {server.tools.length > 0 && (
                            <div className="bg-slate-900/50 rounded p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Wrench className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-slate-300">Tools ({server.tools.length})</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {server.tools.slice(0, 5).map((tool) => (
                                  <span
                                    key={tool.name}
                                    className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs"
                                    title={tool.description}
                                  >
                                    {tool.name}
                                  </span>
                                ))}
                                {server.tools.length > 5 && (
                                  <span className="px-2 py-1 bg-slate-700 text-slate-400 rounded text-xs">
                                    +{server.tools.length - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {servers.length === 0 && (
                    <div className="text-center text-slate-400 py-12">
                      <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No MCP servers configured</p>
                      <p className="text-sm">Add a server from templates to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white  ">Server Templates</h3>
                <p className="text-slate-400 text-sm">Available MCP server templates. Click to add to your servers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serverTemplates.map((template) => (
                  <div
                    key={template.name}
                    className="border border-slate-700 rounded-lg p-4 bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 ${getCategoryColor(template.category)}`}>
                          {getCategoryIcon(template.category)}
                        </div>
                        <div>
                          <span className="font-medium text-white text-sm">
                            {template.name}
                          </span>
                          <div className="text-xs text-slate-400 capitalize">
                            {template.category}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedTemplate(template.name);
                          setCustomArgs(template.args.join(' '));
                          setCustomEnv(template.env || {});
                          setShowAddServer(true);
                        }}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium"
                      >
                        Add Server
                      </button>
                    </div>

                    <div className="text-xs text-slate-300 mb-3">
                      {template.description}
                    </div>

                    <div className="bg-slate-900/50 rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Terminal className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400">Command</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${template.command} ${template.args.join(' ')}`);
                          }}
                          className="ml-auto p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                          title="Copy command"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="font-mono text-xs text-green-300 break-all">
                        {template.command} {template.args.join(' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="h-full">
              <LogsPanel />
            </div>
          )}
        </div>

        {/* Add Server Modal */}
        {showAddServer && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h4 className="font-medium text-white mb-4">Add MCP Server</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Server Template</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    <option value="">Select a template...</option>
                    {serverTemplates.map((template) => (
                      <option key={template.name} value={template.name}>
                        {template.name} - {template.description.substring(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTemplate && (
                  <>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Server Name (optional)
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder={`${selectedTemplate}-${Date.now()}`}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Custom Arguments (optional)
                      </label>
                      <textarea
                        value={customArgs}
                        onChange={(e) => setCustomArgs(e.target.value)}
                        placeholder="Enter custom arguments..."
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white h-20 resize-none"
                      />
                      <div className="text-xs text-slate-400 mt-1">
                        Leave default for MCPs that don't require extra parameters. For Web3 MCPs, you may need to configure your private key and network.
                      </div>
                    </div>

                    {/* Environment Variables */}
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Environment Variables
                      </label>
                      <div className="border border-slate-600 rounded bg-slate-700 p-3">
                        {Object.entries(customEnv).map(([key, value]) => (
                          <div key={key} className="flex gap-2 mb-2 last:mb-0">
                            <input
                              type="text"
                              value={key}
                              onChange={(e) => updateEnvVar(key, e.target.value, value)}
                              placeholder="Key"
                              className="flex-1 bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm text-white"
                            />
                            <input
                              type={key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') ? 'password' : 'text'}
                              value={value}
                              onChange={(e) => updateEnvVar(key, key, e.target.value)}
                              placeholder="Value"
                              className="flex-1 bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm text-white"
                            />
                            <button
                              onClick={() => removeEnvVar(key)}
                              className="p-1 hover:bg-red-700 rounded text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        
                        <button
                          onClick={addEnvVar}
                          className="w-full mt-2 py-2 border border-dashed border-slate-500 rounded text-sm text-slate-400 hover:text-slate-300 hover:border-slate-400 transition-colors"
                        >
                          + Add Environment Variable
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddCustomServer}
                  disabled={!selectedTemplate}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded font-medium"
                >
                  Add Server
                </button>
                <button
                  onClick={() => {
                    setShowAddServer(false);
                    resetAddServerForm();
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
