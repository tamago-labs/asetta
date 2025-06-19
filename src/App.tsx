import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ProjectPanel } from './components/ProjectPanel';
import { agents, messages, currentProject } from './data/mockData';

function App() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(selectedAgentId === agentId ? null : agentId);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Build Your Dream</h2>
          <p className="text-slate-400">Initializing AI agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-slate-900 text-white overflow-hidden">
      <Sidebar 
        agents={agents}
        selectedAgentId={selectedAgentId}
        onAgentSelect={handleAgentSelect}
      />
      <ChatArea 
        messages={messages}
        agents={agents}
        selectedAgentId={selectedAgentId}
      />
      <ProjectPanel 
        project={currentProject}
      />
    </div>
  );
}

export default App;
