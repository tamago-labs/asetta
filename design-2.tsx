import React, { useState } from 'react';
import { Hash, Users, Search, Plus, Send, FolderOpen, FileText, Code, Terminal, Play, Download, Eye, Copy, Zap } from 'lucide-react';

const SlackVSCodeSimple = () => {
  const [activeChannel, setActiveChannel] = useState('technical-development');
  const [activeView, setActiveView] = useState('chat');
  const [activeFile, setActiveFile] = useState('RealEstateToken.sol');

  const channels = [
    { id: 'general', name: 'general', unread: 0 },
    { id: 'legal-compliance', name: 'legal-compliance', unread: 3 },
    { id: 'technical-development', name: 'technical-development', unread: 1 },
    { id: 'tokenomics-finance', name: 'tokenomics-finance', unread: 0 }
  ];

  const agents = [
    { id: 'legal', name: 'Legal Agent', avatar: 'LA', color: 'bg-blue-500', status: 'active' },
    { id: 'tech', name: 'Technical Agent', avatar: 'TA', color: 'bg-green-500', status: 'active' },
    { id: 'finance', name: 'Finance Agent', avatar: 'FA', color: 'bg-purple-500', status: 'idle' }
  ];

  const files = [
    { name: 'contracts/', type: 'folder', children: [
      { name: 'RealEstateToken.sol', status: 'modified', size: '2.1 KB' },
      { name: 'AccreditationVerifier.sol', status: 'new', size: '1.2 KB' }
    ]},
    { name: 'frontend/', type: 'folder', children: [
      { name: 'App.tsx', status: 'modified', size: '3.4 KB' },
      { name: 'InvestorDashboard.tsx', status: 'new', size: '2.8 KB' }
    ]}
  ];

  const messages = [
    {
      id: 1,
      sender: 'Technical Agent',
      avatar: 'TA',
      color: 'bg-green-500',
      time: '2:30 PM',
      message: "I've generated the smart contract for real estate tokenization with compliance features built-in.",
      codeFiles: ['RealEstateToken.sol'],
      actions: ['View Code', 'Test Contract', 'Deploy']
    },
    {
      id: 2,
      sender: 'You',
      time: '2:35 PM',
      message: "Great! Can you also create the frontend interface?"
    },
    {
      id: 3,
      sender: 'Technical Agent',
      avatar: 'TA',
      color: 'bg-green-500',
      time: '2:37 PM',
      message: "Done! I've created a React app with wallet connection and investment features.",
      codeFiles: ['App.tsx', 'InvestorDashboard.tsx'],
      actions: ['View Code', 'Run Dev Server']
    }
  ];

  const getStatusColor = (status) => {
    if (status === 'modified') return 'text-orange-600';
    if (status === 'new') return 'text-green-600';
    return 'text-gray-600';
  };

  const renderFileTree = (files, level = 0) => {
    return files.map((file, index) => (
      <div key={index} style={{ paddingLeft: `${level * 16}px` }}>
        {file.type === 'folder' ? (
          <div>
            <div className="flex items-center space-x-2 py-1 hover:bg-gray-100 cursor-pointer">
              <FolderOpen className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700">{file.name}</span>
            </div>
            {file.children && renderFileTree(file.children, level + 1)}
          </div>
        ) : (
          <div
            onClick={() => setActiveFile(file.name)}
            className={`flex items-center justify-between py-1 hover:bg-gray-100 cursor-pointer rounded px-2 ${
              activeFile === file.name ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className={`text-sm ${getStatusColor(file.status)}`}>{file.name}</span>
            </div>
            <span className="text-xs text-gray-400">{file.size}</span>
          </div>
        )}
      </div>
    ));
  };

  const codePreview = {
    'RealEstateToken.sol': 'Smart contract for tokenizing real estate assets with compliance features...',
    'App.tsx': 'React frontend application with wallet connection and investment interface...',
    'AccreditationVerifier.sol': 'Contract for verifying investor accreditation status...',
    'InvestorDashboard.tsx': 'Dashboard component for investors to view and manage their tokens...'
  };

  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-white font-bold text-lg">Build Your Dream</h1>
          <select className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 mt-2">
            <option>Manhattan Office RWA</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide mb-2">Channels</h3>
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`w-full flex items-center px-2 py-1 rounded text-left mb-1 ${
                  activeChannel === channel.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Hash className="w-4 h-4 mr-2" />
                <span className="flex-1 text-sm">{channel.name}</span>
                {channel.unread > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {channel.unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide mb-2">AI Agents</h3>
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center px-2 py-1 text-gray-300 mb-1">
                <div className="relative mr-2">
                  <div className={`w-6 h-6 ${agent.color} rounded flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{agent.avatar}</span>
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                    agent.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                  } rounded-full border-2 border-gray-800`} />
                </div>
                <span className="text-sm">{agent.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Hash className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">{activeChannel}</h2>
              </div>
              
              {/* View Switcher */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('chat')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeView === 'chat' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setActiveView('code')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeView === 'code' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  📝 Code
                </button>
                <button
                  onClick={() => setActiveView('preview')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeView === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  👀 Preview
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-medium">
                <Play className="w-4 h-4 inline mr-1" />
                Deploy
              </button>
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium">
                <Download className="w-4 h-4 inline mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Chat View */}
          {activeView === 'chat' && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-start space-x-3">
                    {msg.avatar ? (
                      <div className={`w-9 h-9 ${msg.color} rounded flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-sm font-bold">{msg.avatar}</span>
                      </div>
                    ) : (
                      <div className="w-9 h-9 bg-gray-500 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">You</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{msg.sender}</span>
                        <span className="text-sm text-gray-500">{msg.time}</span>
                      </div>
                      <p className="mt-1 text-gray-900">{msg.message}</p>
                      
                      {msg.codeFiles && (
                        <div className="mt-3 space-y-2">
                          {msg.codeFiles.map((file, i) => (
                            <div key={i} className="flex items-center space-x-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <Code className="w-5 h-5 text-blue-600" />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{file}</p>
                                <p className="text-sm text-gray-500">Generated code file</p>
                              </div>
                              <button
                                onClick={() => {
                                  setActiveView('code');
                                  setActiveFile(file);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View Code
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.actions && (
                        <div className="mt-3 flex items-center space-x-2">
                          {msg.actions.map((action, i) => (
                            <button
                              key={i}
                              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={`Message #${activeChannel}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Code View */}
          {activeView === 'code' && (
            <div className="flex-1 flex">
              {/* File Explorer */}
              <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FolderOpen className="w-5 h-5 mr-2" />
                  Project Files
                </h3>
                <div className="space-y-1">
                  {renderFileTree(files)}
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 bg-white">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{activeFile}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      <Copy className="w-4 h-4 inline mr-1" />
                      Copy
                    </button>
                    <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                      <Play className="w-4 h-4 inline mr-1" />
                      Run
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-auto">
                  <div className="text-gray-500 mb-4">// {activeFile}</div>
                  <div className="text-green-400">
                    {codePreview[activeFile] || 'Select a file to view its content...'}
                  </div>
                  <div className="mt-4 text-blue-400">
                    // Complete source code would be displayed here
                    <br />
                    // Click "Export" to download full project files
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview View */}
          {activeView === 'preview' && (
            <div className="flex-1 p-6">
              <div className="bg-white rounded-lg border h-full">
                <div className="border-b px-6 py-4">
                  <h3 className="text-lg font-semibold">Live Preview - RWA Platform</h3>
                </div>
                <div className="p-6 flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <div className="bg-blue-600 text-white p-8 rounded-lg mb-4">
                      <h2 className="text-2xl font-bold mb-4">RWA Investment Platform</h2>
                      <p className="mb-4">Connect your wallet to invest in tokenized real estate</p>
                      <button className="bg-white text-blue-600 px-6 py-2 rounded font-medium">
                        Connect Wallet
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Live preview of generated frontend application
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 bg-gray-50 border-l border-gray-200 p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                Generate more code
              </button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center">
                <Terminal className="w-4 h-4 mr-2 text-green-500" />
                Run tests
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Agent Status</h3>
            <div className="space-y-2">
              <div className="bg-white rounded p-3 border">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Technical Agent</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Generating smart contract tests...</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Console</h3>
            <div className="bg-gray-900 rounded p-3 text-sm font-mono text-green-400">
              <div>✓ Contract compiled</div>
              <div>✓ Frontend built</div>
              <div className="text-blue-400">ℹ Ready to deploy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlackVSCodeSimple;