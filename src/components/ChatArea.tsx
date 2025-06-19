import React, { useState, useRef, useEffect } from 'react';
import { Agent } from '../types/agent';
import { LegacyAgent } from '../data/agentTemplates';
import clsx from 'clsx';
import { Copy, FileText, Send, Plus, Paperclip, Bot, Sparkles } from 'lucide-react';

interface Message {
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

interface ChatAreaProps {
  messages: Message[];
  agents: (Agent | LegacyAgent)[];
  selectedAgentId: string | null;
  onAddAgent?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, agents, selectedAgentId, onAddAgent }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const getAgent = (agentId: string) => agents.find(a => a.id === agentId);

  const filteredMessages = selectedAgentId 
    ? messages.filter(m => m.agentId === selectedAgentId)
    : messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // In a real app, this would send the message to the backend
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  // Show empty state when no agents are available
  if (agents.length === 0) {
    return (
      <div className="w-full h-full flex flex-col bg-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white text-lg">AI Agent Workspace</h2>
              <p className="text-sm text-slate-400">Get started by adding your first AI agent</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-2xl font-semibold text-white mb-3">
              Welcome to Build Your Dream
            </h3>
            
            <p className="text-slate-400 mb-8 leading-relaxed">
              Create specialized AI agents to help with your Web3 RWA projects. Each agent has unique expertise and can connect to MCP servers for advanced capabilities.
            </p>
            
            <button
              onClick={onAddAgent}
              className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add Your First Agent
            </button>
            
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-800/50 rounded-lg p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center text-xs">🔗</div>
                  <span className="text-white font-medium">Smart Contract</span>
                </div>
                <p className="text-slate-400 text-xs">Solidity development & blockchain integration</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center text-xs">☁️</div>
                  <span className="text-white font-medium">AWS Infrastructure</span>
                </div>
                <p className="text-slate-400 text-xs">Cloud architecture & deployment</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-xs">💻</div>
                  <span className="text-white font-medium">Full-Stack Dev</span>
                </div>
                <p className="text-slate-400 text-xs">React, Node.js & Web3 integration</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center text-xs">⚖️</div>
                  <span className="text-white font-medium">Legal Compliance</span>
                </div>
                <p className="text-slate-400 text-xs">SEC regulations & compliance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderMessage = (message: Message) => {
    const agent = getAgent(message.agentId);
    if (!agent) return null;

    return (
      <div key={message.id} className="group hover:bg-slate-800/30 px-4 py-3 transition-colors">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium', agent.color)}>
              {agent.avatar}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline space-x-2">
              <span className="font-semibold text-white">{agent.name}</span>
              <span className="text-xs text-slate-400">{formatTime(message.timestamp)}</span>
            </div>
            <div className="mt-1">
              {message.type === 'code' ? (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-300 font-medium">
                        {message.metadata?.fileName || 'Code snippet'}
                      </span>
                      {message.metadata?.language && (
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded font-mono">
                          {message.metadata.language}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(message.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded"
                    >
                      <Copy size={14} className="text-slate-400 hover:text-white" />
                    </button>
                  </div>
                  <pre className="text-sm text-slate-200 whitespace-pre-wrap overflow-x-auto font-mono leading-relaxed">
                    <code>{message.content}</code>
                  </pre>
                </div>
              ) : message.type === 'system' ? (
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 mt-2">
                  <div className="text-sm text-blue-200 font-medium">{message.content}</div>
                </div>
              ) : (
                <div className="text-slate-200 text-sm leading-relaxed mt-1">
                  {message.content.split('\n').map((line, index) => (
                    <div key={index} className="whitespace-pre-wrap">{line}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedAgentId ? (
              <>
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium', 
                  getAgent(selectedAgentId)?.color)}>
                  {getAgent(selectedAgentId)?.avatar}
                </div>
                <div>
                  <h2 className="font-semibold text-white text-lg">
                    # {getAgent(selectedAgentId)?.name.toLowerCase().replace(' ', '-')}
                  </h2>
                  <p className="text-sm text-slate-400">{getAgent(selectedAgentId)?.description}</p>
                </div>
              </>
            ) : (
              <div>
                <h2 className="font-semibold text-white text-lg"># general</h2>
                <p className="text-sm text-slate-400">All agent communications</p>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs text-slate-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>{agents.filter(a => a.status === 'online').length} online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="py-2">
          {filteredMessages.length > 0 ? (
            filteredMessages.map(renderMessage)
          ) : selectedAgentId ? (
            <div className="px-6 text-center text-slate-400 mt-12">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-sm">Start a conversation with {getAgent(selectedAgentId)?.name}!</p>
            </div>
          ) : (
            <div className="px-6 text-center text-slate-400 mt-12">
              <div className="text-4xl mb-4">👋</div>
              <h3 className="text-lg font-medium mb-2">Welcome to your workspace</h3>
              <p className="text-sm">Select an agent from the sidebar to start chatting!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-700 bg-slate-800 flex-shrink-0">
        <form onSubmit={handleSendMessage}>
          <div className="flex items-end space-x-3">
            <button 
              type="button"
              className="flex-shrink-0 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={selectedAgentId 
                  ? `Message ${getAgent(selectedAgentId)?.name}...`
                  : "Message all agents..."
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button 
                type="button"
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
              >
                <Paperclip size={16} />
              </button>
            </div>
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="flex-shrink-0 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
