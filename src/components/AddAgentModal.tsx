import React, { useState } from 'react';
import {
  X,
  Plus,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Settings,
  Server
} from 'lucide-react';
import { AgentTemplate, CreateAgentRequest } from '../types/agent';
import { agentService } from '../services/agentService';

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (agentId: string) => void;
}

export const AddAgentModal: React.FC<AddAgentModalProps> = ({
  isOpen,
  onClose,
  onAgentCreated
}) => {
  const [step, setStep] = useState<'template' | 'configure'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [customName, setCustomName] = useState('');
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [selectedMCPServers, setSelectedMCPServers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templates = agentService.getAgentTemplates();
  // const availableServers = mcpService.getServers();

  React.useEffect(() => {
    if (selectedTemplate) {
      setCustomName(selectedTemplate.name);
      setCustomSystemPrompt(selectedTemplate.systemPrompt);

      // Set default MCP servers for the template
      const defaultServers = ['filesystem']; // Always include filesystem
      if (selectedTemplate.mcpServerName) {
        for (let mcp of selectedTemplate.mcpServerName) {
          defaultServers.push(mcp);
        }
      }
      setSelectedMCPServers(defaultServers);
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setStep('configure');
  };

  const handleCreateAgent = async () => {
    if (!selectedTemplate) return;

    setIsCreating(true);
    setError(null);

    try {
      const request: CreateAgentRequest = {
        templateId: selectedTemplate.id,
        customName: customName.trim() || selectedTemplate.name,
        customSystemPrompt: customSystemPrompt.trim() || selectedTemplate.systemPrompt,
        mcpServers: selectedMCPServers
      };

      const agent = agentService.createAgent(request);
      onAgentCreated(agent.id);
      handleClose();
    } catch (error: any) {
      setError(error.message || 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setStep('template');
    setSelectedTemplate(null);
    setCustomName('');
    setCustomSystemPrompt('');
    setSelectedMCPServers([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Add New Agent</h2>
              <p className="text-slate-400 text-sm">
                {step === 'template' ? 'Choose an agent template' : 'Configure your agent'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {step === 'template' && (
          <div className="space-y-6">
            {/* <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-white mb-2">Choose Your Agent Template</h3> 
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template: AgentTemplate) => {

                return (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="p-6 border border-slate-700 rounded-xl hover:border-slate-600 hover:bg-slate-700/50 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors text-lg">
                            {template.name}
                          </h3>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    </div>

                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                      {template.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs">
                      {template.mcpServerName && (
                        <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full">
                          {template.mcpServerName.map(item => `${item}, `)}filesystem
                        </span>
                      )} 
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'configure' && selectedTemplate && (
          <div className="space-y-6">
            {/* Template Summary */}
            {/* <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div>
                  <h3 className="font-medium text-white">{selectedTemplate.name}</h3>
                </div>
              </div>
              <p className="text-slate-300 text-sm">{selectedTemplate.description}</p>
            </div> */}

            {/* Configuration Form */}
            <div className="space-y-4">
              {/* <h4 className="font-medium text-white mb-3">Agent Configuration</h4> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter custom name or leave default"
                  />
                </div>
              </div>
            </div>

            

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                System Prompt
                <span className="text-slate-400 text-xs ml-2">(Optional - leave default for best results)</span>
              </label>
              <textarea
                value={customSystemPrompt}
                onChange={(e) => setCustomSystemPrompt(e.target.value)}
                rows={8}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono"
                placeholder="Enter custom system prompt or leave the default..."
              />
              <p className="text-slate-400 text-xs mt-1">
                The system prompt defines this agent's expertise and behavior. The default is optimized for best results.
              </p>
            </div>

            {/* MCP Server Selection */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-400" />
                  <h4 className="font-medium text-white">MCP Server Connections</h4>
                </div>
              </div>

              <div className="text-slate-400 text-sm mb-3">
                Select which MCP servers this agent can use for tools and capabilities.
              </div>

              {/* Selected servers preview */}
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedMCPServers.map(serverName => {
                  return (
                    <div
                      key={serverName}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-600 rounded-lg text-sm"
                    >
                      <span className={'text-white'}>
                        {serverName}
                      </span>
                      {serverName === 'filesystem' && (
                        <span className="text-slate-400 text-xs">(default)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MCP Server Info */}
            {(selectedTemplate.mcpServerName || selectedMCPServers.length > 1) && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Settings className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-300 mb-1">Agent Capabilities</h4>
                    <p className="text-purple-200 text-sm mb-2">
                      This agent will have access to tools from: {selectedMCPServers.join(', ')}
                    </p>
                    <p className="text-yellow-300 text-sm font-medium">
                      ⚠️ Some servers may not running by default. Start them via MCP Manager.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <button
                onClick={() => setStep('template')}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                disabled={isCreating}
              >
                ← Back to Templates
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAgent}
                  disabled={isCreating || !customName.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <> 
                      Create Agent
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
