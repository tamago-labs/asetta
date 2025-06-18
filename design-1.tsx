import React, { useState } from 'react';
import { Hash, Users, Phone, Video, Settings, Search, Plus, Paperclip, Smile, Send, MoreVertical, Star, Pin } from 'lucide-react';

const SlackModelMockup = () => {
  const [activeChannel, setActiveChannel] = useState('legal-compliance');
  const [messageInput, setMessageInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);

  const channels = [
    { id: 'general', name: 'general', unread: 0, type: 'channel' },
    { id: 'legal-compliance', name: 'legal-compliance', unread: 3, type: 'channel' },
    { id: 'technical-development', name: 'technical-development', unread: 1, type: 'channel' },
    { id: 'tokenomics-finance', name: 'tokenomics-finance', unread: 0, type: 'channel' },
    { id: 'marketing-strategy', name: 'marketing-strategy', unread: 0, type: 'channel' },
    { id: 'project-updates', name: 'project-updates', unread: 2, type: 'channel' }
  ];

  const agents = [
    { id: 'legal-agent', name: 'Legal Agent', status: 'active', avatar: 'LA', color: 'bg-blue-500' },
    { id: 'tech-agent', name: 'Technical Agent', status: 'active', avatar: 'TA', color: 'bg-green-500' },
    { id: 'finance-agent', name: 'Finance Agent', status: 'idle', avatar: 'FA', color: 'bg-purple-500' },
    { id: 'marketing-agent', name: 'Marketing Agent', status: 'away', avatar: 'MA', color: 'bg-orange-500' },
    { id: 'project-manager', name: 'Project Manager', status: 'active', avatar: 'PM', color: 'bg-red-500' }
  ];

  const projects = [
    { id: 'rwa-001', name: 'Manhattan Office Building', active: true },
    { id: 'rwa-002', name: 'Gold Commodity Fund', active: false },
    { id: 'rwa-003', name: 'Art Collection NFT', active: false }
  ];

  const messages = {
    'legal-compliance': [
      {
        id: 1,
        sender: 'Legal Agent',
        avatar: 'LA',
        color: 'bg-blue-500',
        time: '2:30 PM',
        message: "I've completed the initial jurisdiction analysis for the Manhattan office building tokenization. Delaware LLC structure is recommended.",
        files: [{ name: 'Delaware_Analysis.pdf', size: '2.1 MB' }]
      },
      {
        id: 2,
        sender: 'You',
        avatar: 'You',
        color: 'bg-gray-500',
        time: '2:35 PM',
        message: "Great work! What about investor accreditation requirements under the new SEC guidelines?"
      },
      {
        id: 3,
        sender: 'Legal Agent',
        avatar: 'LA',
        color: 'bg-blue-500',
        time: '2:37 PM',
        message: "Good question. For Rule 506(c) offerings, we need robust verification. I'm drafting an accreditation framework that will integrate with the smart contract verification system.",
        typing: false
      },
      {
        id: 4,
        sender: 'Technical Agent',
        avatar: 'TA',
        color: 'bg-green-500',
        time: '2:40 PM',
        message: "🔗 Joined from #technical-development\n\n@legal-agent I can build the accreditation verification directly into the smart contract. Would you prefer on-chain or hybrid verification?",
        mention: true
      },
      {
        id: 5,
        sender: 'Legal Agent',
        avatar: 'LA',
        color: 'bg-blue-500',
        time: '2:42 PM',
        message: "Hybrid approach would be best for compliance. Keep personal data off-chain but store verification hashes on-chain for audit trails.",
        typing: true
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-400';
      case 'idle': return 'bg-yellow-400';
      case 'away': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const currentMessages = messages[activeChannel] || [];

  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 flex flex-col">
        {/* Workspace Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-white font-bold text-lg">Build Your Dream</h1>
            <button className="text-gray-400 hover:text-white">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2">
            <select className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 border-none">
              <option>Manhattan Office Building</option>
              <option>Gold Commodity Fund</option>
              <option>Art Collection NFT</option>
            </select>
          </div>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Channels</h3>
                <button className="text-gray-400 hover:text-white">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={`w-full flex items-center px-2 py-1 rounded text-left ${
                      activeChannel === channel.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Hash className="w-4 h-4 mr-2" />
                    <span className="flex-1 text-sm">{channel.name}</span>
                    {channel.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                        {channel.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">AI Agents</h3>
                <button className="text-gray-400 hover:text-white">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`w-full flex items-center px-2 py-1 rounded text-left ${
                      selectedAgent === agent.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="relative mr-2">
                      <div className={`w-6 h-6 ${agent.color} rounded flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">{agent.avatar}</span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(agent.status)} rounded-full border-2 border-gray-800`} />
                    </div>
                    <span className="flex-1 text-sm">{agent.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Hash className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">{activeChannel}</h2>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-gray-400" />
                <Pin className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
                <Users className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Legal compliance discussions for RWA tokenization projects. 3 agents active.
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentMessages.map((msg) => (
            <div key={msg.id} className="flex items-start space-x-3 group">
              <div className={`w-9 h-9 ${msg.color} rounded flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-sm font-bold">{msg.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{msg.sender}</span>
                  <span className="text-sm text-gray-500">{msg.time}</span>
                </div>
                <div className={`mt-1 text-gray-900 ${msg.mention ? 'bg-yellow-50 border-l-4 border-yellow-400 pl-3 py-1' : ''}`}>
                  {msg.message.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                  ))}
                </div>
                {msg.files && (
                  <div className="mt-2">
                    {msg.files.map((file, i) => (
                      <div key={i} className="inline-flex items-center space-x-2 bg-gray-100 rounded px-3 py-2 text-sm">
                        <Paperclip className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-900 font-medium">{file.name}</span>
                        <span className="text-gray-500">({file.size})</span>
                      </div>
                    ))}
                  </div>
                )}
                {msg.typing && (
                  <div className="mt-2 flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm text-gray-500">Legal Agent is typing...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message #${activeChannel}`}
                  className="w-full px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                      <Smile className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500">@mention agents with @legal-agent, @tech-agent, etc.</span>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
        <div className="space-y-6">
          {/* Channel Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Channel Details</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-900">June 15, 2025</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Members</span>
                <span className="text-gray-900">You + 4 agents</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Purpose</span>
              </div>
              <p className="text-sm text-gray-700">Legal compliance discussions and document review for RWA tokenization projects.</p>
            </div>
          </div>

          {/* Active Agents */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Active in Channel</h3>
            <div className="space-y-3">
              {agents.filter(agent => ['legal-agent', 'tech-agent', 'project-manager'].includes(agent.id)).map((agent) => (
                <div key={agent.id} className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-8 h-8 ${agent.color} rounded flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">{agent.avatar}</span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(agent.status)} rounded-full border-2 border-gray-50`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{agent.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{agent.status}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Files */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Recent Files</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer">
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">PDF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Delaware_Analysis.pdf</p>
                  <p className="text-xs text-gray-500">Shared by Legal Agent</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">DOC</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">LLC_Formation_Draft.docx</p>
                  <p className="text-xs text-gray-500">Shared by Legal Agent</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer">
                <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">SOL</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">AccreditationVerify.sol</p>
                  <p className="text-xs text-gray-500">Shared by Technical Agent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                📋 Create task for agents
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                📁 Upload document
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                🔗 Share project link
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                📊 View project progress
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlackModelMockup;