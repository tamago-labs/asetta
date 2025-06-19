import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Bot, 
  Code, 
  Cloud, 
  Monitor, 
  Scale, 
  Target,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { AgentTemplate, CreateAgentRequest } from '../types/agent';
import { agentService } from '../services/agentService';

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (agentId: string) => void;
  activeFolder: string | null;
}

const categoryIcons = {
  'smart-contract': Code,
  'infrastructure': Cloud,
  'fullstack': Monitor,
  'legal': Scale,
  'project-management': Target,
  'custom': Bot
};

const categoryColors = {
  'smart-contract': 'text-purple-400 bg-purple-500/20',
  'infrastructure': 'text-orange-400 bg-orange-500/20',
  'fullstack': 'text-green-400 bg-green-500/20',
  'legal': 'text-red-400 bg-red-500/20',
  'project-management': 'text-blue-400 bg-blue-500/20',
  'custom': 'text-gray-400 bg-gray-500/20'
};

export const AddAgentModal: React.FC<AddAgentModalProps> = ({
  isOpen,
  onClose,
  onAgentCreated,
  activeFolder
}) => {
  const [step, setStep] = useState<'template' | 'configure'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [customName, setCustomName] = useState('');
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [responseFolder, setResponseFolder] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templates = agentService.getAgentTemplates();

  React.useEffect(() => {
    if (selectedTemplate) {
      setCustomName(selectedTemplate.name);
      setCustomSystemPrompt(selectedTemplate.systemPrompt);
      setResponseFolder(selectedTemplate.responseFolder || '');
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
        responseFolder: responseFolder.trim() || selectedTemplate.responseFolder
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
    setResponseFolder('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
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
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-white mb-2">Choose Your Agent Type</h3>
              <p className="text-slate-400">Select a specialized agent template for your Web3 RWA project</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => {
                const IconComponent = categoryIcons[template.category];
                const colorClass = categoryColors[template.category];
                
                return (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="p-6 border border-slate-700 rounded-xl hover:border-slate-600 hover:bg-slate-700/50 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors text-lg">
                            {template.name}
                          </h3>
                          <p className="text-slate-400 text-sm">{template.role}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full capitalize">
                        {template.category.replace('-', ' ')}
                      </span>
                      {template.mcpServerName && (
                        <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full">
                          {template.mcpServerName}
                        </span>
                      )}
                      {template.responseFolder && (
                        <span className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full">
                          {template.responseFolder}/
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-300 mb-1">Need MCP Server Tools?</h4>
                  <p className="text-purple-200 text-sm mb-3">
                    Some agents work best with MCP servers for specialized capabilities. Use the global MCP button (top-right) to manage servers.
                  </p>
                  <p className="text-purple-400 text-sm font-medium">
                    MCP button is available in the top toolbar →
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'configure' && selectedTemplate && (
          <div className="space-y-6">
            {/* Template Summary */}
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColors[selectedTemplate.category]}`}>
                  {React.createElement(categoryIcons[selectedTemplate.category], { className: "w-5 h-5" })}
                </div>
                <div>
                  <h3 className="font-medium text-white">{selectedTemplate.name}</h3>
                  <p className="text-slate-400 text-sm">{selectedTemplate.role}</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">{selectedTemplate.description}</p>
            </div>

            {/* Configuration Form */}
            <div className="space-y-4">
              <h4 className="font-medium text-white mb-3">Agent Configuration</h4>
              
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

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Response Folder
                    {activeFolder && (
                      <span className="text-slate-400 text-xs ml-2">
                        Will save to: {activeFolder}/{responseFolder || selectedTemplate.responseFolder}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={responseFolder}
                    onChange={(e) => setResponseFolder(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder={selectedTemplate.responseFolder || "Enter folder name"}
                  />
                  <p className="text-slate-400 text-xs mt-1">
                    Folder where this agent will save its generated files (relative to active project folder)
                  </p>
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

            {/* MCP Server Info */}
            {selectedTemplate.mcpServerName && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Settings className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-300 mb-1">MCP Server Integration</h4>
                    <p className="text-purple-200 text-sm mb-2">
                      This agent can connect to <strong>{selectedTemplate.mcpServerName}</strong> for specialized tools.
                    </p>
                    <p className="text-purple-400 text-sm font-medium">
                      Use the MCP button (top-right) to configure servers →
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
                      <CheckCircle className="w-4 h-4" />
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
