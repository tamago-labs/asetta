import React, { useState, useRef, useEffect } from 'react';
import { Agent } from '../types/agent';
import { LegacyAgent } from '../data/agentTemplates';
import { ClaudeService, ChatMessage } from '../services/claudeService';
import clsx from 'clsx';
import { Copy, FileText, Send, Plus, Paperclip, Bot, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  agentId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'code' | 'file' | 'system';
  sender: 'user' | 'assistant';
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
  const [isStreaming, setIsStreaming] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [claudeService, setClaudeService] = useState<ClaudeService | null>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Always use all messages (no agent filtering needed for now)
  const allMessages = [...messages, ...localMessages];

  useEffect(() => {
    // Initialize Claude service
    const service = new ClaudeService();
        setClaudeService(service);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isStreaming || !claudeService) return;

    const userMessageId = `msg_${Date.now()}_user`;
    const assistantMessageId = `msg_${Date.now()}_assistant`;
    
    // Add user message
    const userMessage: Message = {
      id: userMessageId,
      agentId: 'claude',
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'text',
      sender: 'user'
    };

    setLocalMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage.trim();
    setNewMessage('');
    setIsStreaming(true);

    try {
      // Convert messages to Claude format for history
      const chatHistory: ChatMessage[] = allMessages.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp
      }));

      // Start streaming response
      let responseContent = '';
      const assistantMessage: Message = {
        id: assistantMessageId,
        agentId: 'claude',
        content: '',
        timestamp: new Date(),
        type: 'text',
        sender: 'assistant'
      };

      setLocalMessages(prev => [...prev, assistantMessage]);

      // Stream Claude's response
      const stream = claudeService.streamChat(chatHistory, currentMessage);

      for await (const chunk of stream) {
        responseContent += chunk;
        
        // Update the assistant message content in real-time
        setLocalMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: responseContent }
              : msg
          )
        );
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        agentId: 'claude',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        type: 'system',
        sender: 'assistant'
      };
      
      setLocalMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    const isStreamingMessage = isStreaming && message.sender === 'assistant' && message.id === localMessages[localMessages.length - 1]?.id;
    
    return (
      <div key={message.id} className="group hover:bg-slate-800/30 px-4 py-3 transition-colors">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {isUser ? (
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-medium text-white">
                U
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center text-sm font-medium text-white">
                <Bot className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline space-x-2">
              <span className="font-semibold text-white">
                {isUser ? 'You' : 'Claude'}
              </span>
              <span className="text-xs text-slate-400">{formatTime(message.timestamp)}</span>
              {isStreamingMessage && (
                <div className="flex items-center space-x-1 text-xs text-blue-400">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  <span className="ml-1">typing...</span>
                </div>
              )}
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
                <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3 mt-2">
                  <div className="text-sm text-red-200 font-medium">{message.content}</div>
                </div>
              ) : (
                <div className="text-slate-200 text-sm leading-relaxed mt-1">
                  {message.content.split('\n').map((line, index) => (
                    <div key={index} className="whitespace-pre-wrap">{line}</div>
                  ))}
                  {isStreamingMessage && message.content && (
                    <div className="inline-flex items-center ml-1">
                      <div className="w-2 h-4 bg-blue-400 animate-pulse rounded-sm"></div>
                    </div>
                  )}
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
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg"># claude-chat</h2>
              <p className="text-sm text-slate-400">Chat with Claude AI assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs text-slate-400">
              <div className={`w-2 h-2 rounded-full ${'bg-green-400'}`}></div>
              <span>{'Online'}</span>
            </div> 
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="py-2">
          {allMessages.length > 0 ? (
            allMessages.map(renderMessage)
          ) : (
            <div className="px-6 text-center text-slate-400 mt-12">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-medium mb-2">Welcome to Claude Chat</h3>
              <p className="text-sm">Start a conversation with Claude AI. I can help with coding, explanations, creative writing, and more!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-700 bg-slate-800 flex-shrink-0"> 
        <form onSubmit={handleSendMessage}>
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={ isStreaming 
                    ? "Claude is typing..."
                    : "Message Claude..."
                }
                disabled={ isStreaming}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            <button 
              type="submit"
              disabled={!newMessage.trim() || isStreaming}
              className="flex-shrink-0 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isStreaming ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
