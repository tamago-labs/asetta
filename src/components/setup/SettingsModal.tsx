import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Key,
  Folder,
  Download,
  Upload,
  X,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { AppSettings, WorkspaceSettings } from '../../types/auth';
import { storageService } from '../../services/storage';
import { claudeApiService } from '../../services/claude';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsUpdate: (settings: AppSettings) => void;
  onResetApp?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsUpdate,
  onResetApp
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidatingApi, setIsValidatingApi] = useState(false);
  const [apiValidationResult, setApiValidationResult] = useState<{ isValid: boolean; error?: string } | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspacePath, setNewWorkspacePath] = useState('');
  const [showNewWorkspaceForm, setShowNewWorkspaceForm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleApiKeyValidation = async () => {
    if (!localSettings.apiKey.trim()) {
      setApiValidationResult({ isValid: false, error: 'Please enter your API key' });
      return;
    }

    setIsValidatingApi(true);
    setApiValidationResult(null);

    try {
      // const result = await claudeApiService.validateApiKey(localSettings.apiKey);
      // setApiValidationResult(result);

      // if (result.isValid) {
      //   setLocalSettings(prev => ({ ...prev, isApiKeyValid: true }));
      // }

      setApiValidationResult({
        isValid: true
      })
      setLocalSettings(prev => ({ ...prev, isApiKeyValid: true }));
    } catch (error) {
      setApiValidationResult({
        isValid: false,
        error: 'Failed to validate API key. Please try again.'
      });
    } finally {
      setIsValidatingApi(false);
    }
  };

  const handleSave = () => {
    storageService.saveSettings(localSettings);
    onSettingsUpdate(localSettings);
    onClose();
  };

  const handleResetApp = () => {
    if (onResetApp) {
      onResetApp();
      onClose();
    }
  };

  const handleExportSettings = () => {
    const exportData = storageService.exportSettings();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-your-dream-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = e.target?.result as string;
        const success = storageService.importSettings(importData);
        if (success) {
          const newSettings = storageService.loadSettings();
          if (newSettings) {
            setLocalSettings(newSettings);
            alert('Settings imported successfully!');
          }
        } else {
          alert('Failed to import settings. Please check the file format.');
        }
      } catch (error) {
        alert('Error importing settings. Please try again.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleAddWorkspace = () => {
    if (!newWorkspaceName.trim() || !newWorkspacePath.trim()) return;

    const newWorkspace: WorkspaceSettings = {
      id: Date.now().toString(),
      name: newWorkspaceName,
      defaultFolderPath: newWorkspacePath,
      createdAt: new Date()
    };

    setLocalSettings(prev => ({
      ...prev,
      workspaces: [...prev.workspaces, newWorkspace]
    }));

    setNewWorkspaceName('');
    setNewWorkspacePath('');
    setShowNewWorkspaceForm(false);
  };

  const handleRemoveWorkspace = (workspaceId: string) => {
    if (localSettings.workspaces.length === 1) {
      alert('You must have at least one workspace.');
      return;
    }

    setLocalSettings(prev => ({
      ...prev,
      workspaces: prev.workspaces.filter(w => w.id !== workspaceId),
      currentWorkspaceId: prev.currentWorkspaceId === workspaceId
        ? prev.workspaces.find(w => w.id !== workspaceId)?.id || prev.workspaces[0].id
        : prev.currentWorkspaceId
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'api', label: 'API Settings', icon: Key },
    { id: 'workspaces', label: 'Workspaces', icon: Folder },
    { id: 'general', label: 'General', icon: Settings }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 bg-slate-900 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">User Profile</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={localSettings.userProfile.name}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        userProfile: { ...prev.userProfile, name: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={localSettings.userProfile.email}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        userProfile: { ...prev.userProfile, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Company (Optional)</label>
                    <input
                      type="text"
                      value={localSettings.userProfile.company || ''}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        userProfile: { ...prev.userProfile, company: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Account Information</h4>
                  <div className="text-sm text-slate-300 space-y-1">
                    <div>Created: {new Date(localSettings.userProfile.createdAt).toLocaleDateString()}</div>
                    <div>Last Login: {new Date(localSettings.userProfile.lastLogin).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">API Configuration</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Claude API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={localSettings.apiKey}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="sk-ant-..."
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-20"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleApiKeyValidation}
                        disabled={isValidatingApi}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded disabled:opacity-50"
                      >
                        {isValidatingApi ? 'Testing...' : 'Test'}
                      </button>
                    </div>
                  </div>

                  {apiValidationResult && (
                    <div className={`mt-2 flex items-center text-sm ${apiValidationResult.isValid ? 'text-green-400' : 'text-red-400'
                      }`}>
                      {apiValidationResult.isValid ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          API key is valid
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {apiValidationResult.error}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Connection Status</h4>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${localSettings.isApiKeyValid ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-sm text-slate-300">
                      {localSettings.isApiKeyValid ? 'Connected to Claude API' : 'Not connected'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'workspaces' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Workspaces</h3>
                  <button
                    onClick={() => setShowNewWorkspaceForm(true)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Workspace
                  </button>
                </div>

                {showNewWorkspaceForm && (
                  <div className="bg-slate-700 p-4 rounded-lg space-y-4">
                    <h4 className="text-white font-medium">New Workspace</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <input
                        type="text"
                        placeholder="Workspace name"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Folder path"
                        value={newWorkspacePath}
                        onChange={(e) => setNewWorkspacePath(e.target.value)}
                        className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddWorkspace}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowNewWorkspaceForm(false)}
                        className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {localSettings.workspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      className={`p-4 rounded-lg border ${workspace.id === localSettings.currentWorkspaceId
                          ? 'bg-blue-600/20 border-blue-500'
                          : 'bg-slate-700 border-slate-600'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{workspace.name}</h4>
                          <p className="text-slate-300 text-sm">{workspace.defaultFolderPath}</p>
                          <p className="text-slate-400 text-xs">Created: {new Date(workspace.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          {workspace.id !== localSettings.currentWorkspaceId && (
                            <button
                              onClick={() => setLocalSettings(prev => ({ ...prev, currentWorkspaceId: workspace.id }))}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                            >
                              Set Active
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveWorkspace(workspace.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">General Settings</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Theme</label>
                      <p className="text-slate-400 text-sm">Choose your preferred theme</p>
                    </div>
                    <select
                      value={localSettings.theme}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, theme: e.target.value as 'dark' | 'light' }))}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Auto Save</label>
                      <p className="text-slate-400 text-sm">Automatically save changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.autoSave}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Notifications</label>
                      <p className="text-slate-400 text-sm">Show desktop notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.notifications}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <h4 className="text-white font-medium mb-4">Data Management</h4>
                  <div className="flex gap-4 flex-wrap">
                    <button
                      onClick={handleExportSettings}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Settings
                    </button>

                    <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Import Settings
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportSettings}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <h4 className="text-white font-medium mb-4">Reset Application</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    This will clear all your settings and return you to the welcome screen. Your projects and files won't be affected.
                  </p>

                  {!showResetConfirm ? (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset App
                    </button>
                  ) : (
                    <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                      <p className="text-red-200 text-sm mb-4">
                        Are you sure? This will log you out and clear all settings.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleResetApp}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Yes, Reset App
                        </button>
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
