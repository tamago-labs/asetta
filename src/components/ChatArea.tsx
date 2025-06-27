import React, { useState, useRef, useEffect } from 'react';
import { Agent } from '../types/agent';
import { LegacyAgent } from '../data/agentTemplates';
import { ClaudeService, ChatMessage } from '../services/claudeService';
import { mcpService } from '../services/mcpService';
import { agentChatService } from '../services/agentChatService';
import clsx from 'clsx';
import {
  Copy,
  FileText,
  Send,
  Plus,
  Paperclip,
  Bot,
  AlertCircle,
  Trash2,
  RotateCcw,
  Edit3,
  MoreVertical,
  Download,
  Search,
  X
} from 'lucide-react';

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
  const [streamingMessage, setStreamingMessage] = useState('')
  const [claudeService, setClaudeService] = useState<ClaudeService | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get current agent ID
  const currentAgentId = selectedAgentId || undefined

  // Get messages for current agent/general chat
  // const getCurrentChatHistory = (): ChatMessage[] => {
  //   return agentChatService.getAgentChatHistory(currentAgentId);
  // };

  // Refresh chat history when agent changes
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [currentAgentId]);

  let currentChatHistory: any = []

  if (currentAgentId) {
    currentChatHistory = agentChatService.getAgentChatHistory(currentAgentId)
  }

  // Convert ChatMessage to Message format for display
  const displayMessages: Message[] = currentChatHistory.map((msg: any) => ({
    id: msg.id,
    agentId: currentAgentId,
    content: msg.content,
    timestamp: msg.timestamp,
    type: 'text',
    sender: msg.sender
  }));

  // Always use all messages (no agent filtering needed for now)
  // const allMessages = [...messages, ...localMessages];

  // Filter messages based on search query
  const filteredMessages = showSearch && searchQuery
    ? displayMessages.filter(msg =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : displayMessages;

  useEffect(() => {
    // Initialize Claude service
    const service = new ClaudeService();
    setClaudeService(service);

  }, []);

  useEffect(() => {
    // Update active agent when selection changes
    if (selectedAgentId) {
      agentChatService.setActiveAgent(selectedAgentId);
    } else {
      if (claudeService) {
        claudeService.setActiveAgent(null);
      }
    }
  }, [selectedAgentId, claudeService]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [newMessage]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatFullTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const deleteMessage = (messageId: string) => {

    if (currentAgentId) {
      const currentHistory = agentChatService.getAgentChatHistory(currentAgentId);
      const filteredHistory = currentHistory.filter(msg => msg.id !== messageId);
      agentChatService.clearAgentChatHistory(currentAgentId);
      filteredHistory.forEach(msg => {
        agentChatService.addMessageToHistory(currentAgentId, msg);
      });
      setRefreshKey(prev => prev + 1);
    }

  };



  const startEdit = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  const saveEdit = (messageId: string) => {
    if (currentAgentId) {
      // For agent chats, rebuild history with edited message
      const currentHistory = agentChatService.getAgentChatHistory(currentAgentId);
      const updatedHistory = currentHistory.map(msg =>
        msg.id === messageId
          ? { ...msg, content: editContent, timestamp: new Date() }
          : msg
      );
      agentChatService.clearAgentChatHistory(currentAgentId);
      updatedHistory.forEach(msg => {
        agentChatService.addMessageToHistory(currentAgentId, msg);
      });
    }
    setEditingMessageId(null);
    setEditContent('');
    setRefreshKey(prev => prev + 1);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const regenerateResponse = async (messageIndex: number) => {
    if (!claudeService || isStreaming) return;

    // Find the user message that triggered this response
    const userMessage = displayMessages[messageIndex - 1];
    if (!userMessage || userMessage.sender !== 'user') return;

    // Remove all messages after the user message
    const messagesToKeep = currentChatHistory.slice(0, messageIndex);

    // Update the chat history
    if (currentAgentId) {
      // For agents, we need to clear and re-add messages
      agentChatService.clearAgentChatHistory(currentAgentId);
      messagesToKeep.forEach((msg: any) => {
        agentChatService.addMessageToHistory(currentAgentId, msg);
      });
    }

    // Regenerate the response
    setIsStreaming(true);
    const assistantMessageId = `msg_${Date.now()}_assistant_regen`;

    try {
      const chatHistory: ChatMessage[] = messagesToKeep
        .filter((msg: any) => msg.sender === 'user' || msg.sender === 'assistant');

      let responseContent = '';
      // let streamingMessage: ChatMessage = {
      //   id: assistantMessageId,
      //   sender: 'assistant',
      //   content: '',
      //   timestamp: new Date()
      // };

      // Update UI with streaming message
      const updateStreamingMessage = (content: string) => {
        // streamingMessage.content = content;
        console.log("updating...", content)
        setStreamingMessage(content)
        // if (currentAgentId === 'general') {
        //   const updatedHistories = new Map(agentChatHistories);
        //   const history = updatedHistories.get('general') || [];
        //   const existingIndex = history.findIndex(msg => msg.id === assistantMessageId);
        //   if (existingIndex >= 0) {
        //     history[existingIndex] = { ...streamingMessage };
        //   } else {
        //     history.push(streamingMessage);
        //   }
        //   updatedHistories.set('general', [...history]);
        //   setAgentChatHistories(updatedHistories);
        // }
      };

      updateStreamingMessage('');

      const stream = claudeService.streamChat(chatHistory, userMessage.content);

      for await (const chunk of stream) {
        responseContent += chunk;
        updateStreamingMessage(responseContent);
      }

      // Save the final response
      const finalMessage: ChatMessage = {
        id: assistantMessageId,
        sender: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      if (currentAgentId) {
        agentChatService.addMessageToHistory(currentAgentId, finalMessage);
        setRefreshKey(prev => prev + 1);
      }

    } catch (error) {
      console.error('Failed to regenerate response:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isStreaming || !claudeService) return;

    const userMessageId = `msg_${Date.now()}_user`;
    const assistantMessageId = `msg_${Date.now()}_assistant`;
    const currentMessage = newMessage.trim();
    setNewMessage('');
    setIsStreaming(true);

    // Add user message to history
    const userMessage: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    if (currentAgentId) {
      agentChatService.addMessageToHistory(currentAgentId, userMessage);
      setRefreshKey(prev => prev + 1);
    }

    try {
      // Get chat history for streaming
      const chatHistoryBeforeFilter = currentAgentId ? agentChatService.getAgentChatHistory(currentAgentId) : []
      const chatHistory = chatHistoryBeforeFilter.filter(msg => msg.sender === 'user' || msg.sender === 'assistant');

      // Start streaming response
      let responseContent = '';
      let streamingMessage: ChatMessage = {
        id: assistantMessageId,
        sender: 'assistant',
        content: '',
        timestamp: new Date()
      };

      // Update UI with streaming message
      const updateStreamingMessage = (content: string) => {
        streamingMessage.content = content;
        setStreamingMessage(content) 
      };

      // Add initial streaming message
      updateStreamingMessage('');

      // Stream Claude's response
      const stream = claudeService.streamChat(chatHistory, currentMessage);

      for await (const chunk of stream) {
        responseContent += chunk;
        updateStreamingMessage(responseContent);
      }

      // Save final message
      const finalMessage: ChatMessage = {
        id: assistantMessageId,
        sender: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      if (currentAgentId) {
        agentChatService.addMessageToHistory(currentAgentId, finalMessage);
        setRefreshKey(prev => prev + 1);
      }

    } catch (error) {
      console.error('Failed to send message:', error);

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        sender: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };

      if (currentAgentId) {
        agentChatService.addMessageToHistory(currentAgentId, errorMessage);
        setRefreshKey(prev => prev + 1);
      }

    } finally {
      setIsStreaming(false);
    }
  };
 
  const renderMessage = (message: Message, index: number) => {
    const isUser = message.sender === 'user';
    const isStreamingMessage = isStreaming && index === displayMessages.length - 1;
    const isEditing = editingMessageId === message.id;

    return (
      <div key={`${message.id}-${refreshKey}`} className="group hover:bg-slate-800/30 px-4 py-3 transition-colors relative">
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
              <span
                className="text-xs text-slate-400 cursor-help"
                title={formatFullTime(message.timestamp)}
              >
                {formatTime(message.timestamp)}
              </span>
              {isStreamingMessage && (
                <div className="flex items-center space-x-1 text-xs text-blue-400">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <span className="ml-1">processing...</span>
                </div>
              )}
            </div>

            <div className="mt-1">
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(message.id)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : message.type === 'code' ? (
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
                  {message.content.includes('🔧 Using') ? (
                    // Handle tool usage messages with special formatting
                    <div className="space-y-2">
                      {message.content.split('\n').map((line, lineIndex) => {
                        if (line.includes('🔧 Using')) {
                          return (
                            <div key={lineIndex} className="inline-flex items-center gap-2 bg-blue-900/20 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                              <span>{line}</span>
                            </div>
                          );
                        }
                        return line ? (
                          <div key={lineIndex} className="whitespace-pre-wrap">{line}</div>
                        ) : (
                          <br key={lineIndex} />
                        );
                      })}
                    </div>
                  ) : (
                    // Regular text content
                    message.content.split('\n').map((line, lineIndex) => (
                      <div key={lineIndex} className="whitespace-pre-wrap">{line}</div>
                    ))
                  )}
                  { isStreamingMessage && streamingMessage && (
                    <div  className="whitespace-pre-wrap">{streamingMessage}</div>
                  ) }
                  {isStreamingMessage && message.content && (
                    <div className="inline-flex items-center ml-1">
                      <div className="w-2 h-4 bg-blue-400 animate-pulse rounded-sm"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Message Actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
            <button
              onClick={() => copyToClipboard(message.content)}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
              title="Copy message"
            >
              <Copy size={14} />
            </button>

            {!isStreaming && (
              <>
                {isUser && (
                  <button
                    onClick={() => startEdit(message.id, message.content)}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                    title="Edit message"
                  >
                    <Edit3 size={14} />
                  </button>
                )}

                {!isUser && index > 0 && (
                  <button
                    onClick={() => regenerateResponse(index)}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                    title="Regenerate response"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}

                <button
                  onClick={() => deleteMessage(message.id)}
                  className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400"
                  title="Delete message"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
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
              <p className="text-sm text-slate-400">
                Chat with Claude AI assistant
                {(() => {
                  try {
                    const availableTools = mcpService.getAvailableTools();
                    const toolCount = availableTools.reduce((total, server) => total + server.tools.length, 0);
                    return toolCount > 0 ? ` • ${toolCount} MCP tools available` : '';
                  } catch {
                    return '';
                  }
                })()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Chat Actions */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Search messages"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* <button
              onClick={exportChat}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Export chat"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={clearAllMessages}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
              title="Clear all messages"
            >
              <Trash2 className="w-4 h-4" />
            </button> */}

            <div className="flex items-center space-x-1 text-xs text-slate-400">
              <div className={`w-2 h-2 rounded-full ${'bg-green-400'}`}></div>
              <span>{'Online'}</span>
            </div>

          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-3 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-600 rounded"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="py-2">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((message, index) => renderMessage(message, index))
          ) : showSearch && searchQuery ? (
            <div className="px-6 text-center text-slate-400 mt-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium mb-2">No matches found</h3>
              <p className="text-sm">Try different search terms</p>
            </div>
          ) : (
            <div className="px-6 text-center text-slate-400 mt-12">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-medium mb-2">Welcome to Claude Chat</h3>
              <p className="text-sm">
                Start a conversation with Claude AI. I can help with coding, explanations, creative writing, and more!
                {(() => {
                  try {
                    const availableTools = mcpService.getAvailableTools();
                    const toolCount = availableTools.reduce((total, server) => total + server.tools.length, 0);
                    return toolCount > 0 ? ` I also have access to ${toolCount} MCP tools for advanced operations.` : '';
                  } catch {
                    return '';
                  }
                })()}
              </p>
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
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isStreaming
                  ? "Claude is typing..."
                  : "Message Claude... (Shift+Enter for new line)"
                }
                disabled={isStreaming}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
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