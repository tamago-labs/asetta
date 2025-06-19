import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ProjectPanel } from './components/ProjectPanel';
import { FileManager } from './components/FileManager';
import { FileViewer } from './components/FileViewer';
import { WelcomeScreen } from './components/setup/WelcomeScreen';
import { SettingsModal } from './components/setup/SettingsModal';
import { MCPManagerModal } from './components/MCPManagerModal';
import { ConnectionStatus, OnboardingManager } from './components/auth/AuthComponents';
import { authService } from './services/auth';
import { agentService } from './services/agentService';
import { mcpService } from './services/mcpService';
import { agents, messages, currentProject } from './data/agentTemplates';
import { AppSettings, SetupFormData } from './types/auth';
import { FileInfo } from './types/files';
import { Agent } from './types/agent';
import { Server } from 'lucide-react';

function App() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMCPManager, setShowMCPManager] = useState(false);
  
  // File management state
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [showFileManager, setShowFileManager] = useState(true);

  // Agent management state
  const [realAgents, setRealAgents] = useState<Agent[]>([]);
  const [legacyMode, setLegacyMode] = useState(true);

  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = authService.loadSettings();
      if (savedSettings && authService.isAuthenticated()) {
        setSettings(savedSettings);
        setIsAuthenticated(true);
        setProjectPath(savedSettings.workspace?.defaultFolder || null);
        authService.updateLastLogin();
      }
      setIsLoading(false);
    };

    const timer = setTimeout(loadSettings, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Load real agents
  useEffect(() => {
    const loadAgents = () => {
      const allAgents = agentService.getAgents();
      setRealAgents(allAgents);
      
      // Switch to real mode if we have real agents
      if (allAgents.length > 0) {
        setLegacyMode(false);
      }
    };

    loadAgents();
    
    // Set up MCP workspace
    if (projectPath) {
      mcpService.setWorkspaceRoot(projectPath);
    }
  }, [projectPath]);

  const handleAgentCreated = (agentId: string) => {
    // Refresh agents list
    const allAgents = agentService.getAgents();
    setRealAgents(allAgents);
    setLegacyMode(false);
    
    // Select the newly created agent
    setSelectedAgentId(agentId);
  };

  const handleAgentRemoved = (agentId: string) => {
    // Remove the agent
    agentService.deleteAgent(agentId);
    
    // Refresh agents list
    const allAgents = agentService.getAgents();
    setRealAgents(allAgents);
    
    // If the removed agent was selected, clear selection
    if (selectedAgentId === agentId) {
      setSelectedAgentId(null);
    }
    
    // If no agents left, switch back to legacy mode
    if (allAgents.length === 0) {
      setLegacyMode(true);
    }
  };

  const handleSetupComplete = (formData: SetupFormData) => {
    const newSettings = authService.createDefaultSettings(formData);
    authService.saveSettings(newSettings);
    setSettings(newSettings);
    setIsAuthenticated(true);
    setProjectPath(formData.workspaceFolder || null);
  };

  const handleSettingsUpdate = (updatedSettings: AppSettings) => {
    setSettings(updatedSettings);
    authService.saveSettings(updatedSettings);
    // Update project path if workspace folder changed
    if (updatedSettings.workspace?.defaultFolder !== projectPath) {
      setProjectPath(updatedSettings.workspace?.defaultFolder || null);
    }
  };

  const handleResetApp = () => {
    // Clear all settings and return to welcome screen
    authService.logout();
    localStorage.removeItem('hasSeenOnboarding');
    setSettings(null);
    setIsAuthenticated(false);
    setShowSettings(false);
    setShowOnboarding(false);
    setSelectedAgentId(null);
    setProjectPath(null);
    setSelectedFile(null);
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(selectedAgentId === agentId ? null : agentId);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleFileSelect = (file: FileInfo) => {
    setSelectedFile(file);
  };

  const handleCloseFile = () => {
    setSelectedFile(null);
  };

  // Use real agents if available, otherwise show empty state
  const currentAgents = legacyMode && realAgents.length === 0 ? [] : realAgents;
  const currentMessages = legacyMode ? [] : [];
  const showEmptyState = currentAgents.length === 0;

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="text-center flex flex-col">
          <div className="w-16 mx-auto h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-white mx-auto text-xl font-semibold mb-2">Build Your Dream</h2>
          <p className="text-slate-400 mx-auto">Initializing AI agents...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !settings) {
    return <WelcomeScreen onSetupComplete={handleSetupComplete} />;
  }

  return (
    <div className="h-screen w-screen bg-slate-900 text-white overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 h-full" data-onboarding="sidebar">
          <Sidebar 
            agents={currentAgents}
            selectedAgentId={selectedAgentId}
            onAgentSelect={handleAgentSelect}
            onAgentCreated={handleAgentCreated}
            onAgentRemoved={handleAgentRemoved}
            activeFolder={projectPath}
          />
        </div>
        
        {/* Chat Area or File Viewer */}
        <div className="flex-1 h-full" data-onboarding="chat">
          {selectedFile ? (
            <FileViewer 
              selectedFile={selectedFile}
              onClose={handleCloseFile}
            />
          ) : (
            <ChatArea 
              messages={currentMessages}
              agents={currentAgents}
              selectedAgentId={selectedAgentId}
            />
          )}
        </div>
        
        {/* File Manager (replacing Project Panel) */}
        <div className="w-80 h-full" data-onboarding="project">
          <FileManager
            projectPath={projectPath}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onProjectPathChange={setProjectPath}
          />
        </div>
      </div>

      {/* Overlay UI Elements */}
      <div className="absolute top-4 right-4 z-30">
        <div className="flex items-center gap-2">
          {/* MCP Manager Button */}
          <button
            onClick={() => setShowMCPManager(true)}
            className="p-2  hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Manage MCP Servers"
          >
            <Server className="w-4 h-4" />
          </button>
          
          {/* Connection Status */}
          <ConnectionStatus
            isConnected={settings.isApiKeyValid}
            onSettingsClick={() => setShowSettings(true)}
          />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-30 flex gap-2">
        <button 
          onClick={handleStartOnboarding}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-lg"
        >
          Help Tour
        </button>
        <div data-onboarding="new-project">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg">
            New Project
          </button>
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsUpdate={handleSettingsUpdate}
          onResetApp={handleResetApp}
        />
      )}

      {showOnboarding && (
        <OnboardingManager
          isActive={showOnboarding}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* MCP Manager Modal */}
      <MCPManagerModal
        isOpen={showMCPManager}
        onClose={() => setShowMCPManager(false)}
      />
    </div>
  );
}

export default App;
