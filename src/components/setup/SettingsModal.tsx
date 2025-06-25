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
  FolderPlus,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { AppSettings, WorkspaceSettings } from '../../types/auth';
import { storageService } from '../../services/storage';
import { TauriFileService } from '../../services/fileService';
import { invoke } from '@tauri-apps/api/core';

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
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationResult, setKeyValidationResult] = useState<{ isValid: boolean; error?: string; userData?: any } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleAccessKeyValidation = async () => {
    if (!localSettings.accessKey.trim()) {
      setKeyValidationResult({ isValid: false, error: 'Please enter your access key' });
      return;
    }

    setIsValidatingKey(true);
    setKeyValidationResult(null);

    try {
      const result = await invoke('validate_access_key', { accessKey: localSettings.accessKey }) as {
        is_valid: boolean;
        error?: string;
        user_data?: {
          firstName?: string;
          lastName?: string;
          email?: string;
        };
      };
      
      if (result.is_valid && result.user_data) {
        setKeyValidationResult({
          isValid: true,
          userData: {
            firstName: result.user_data.firstName,
            lastName: result.user_data.lastName,
            email: result.user_data.email
          }
        });
        setLocalSettings(prev => ({ ...prev, isAccessKeyValid: true }));
      } else {
        setKeyValidationResult({ 
          isValid: false, 
          error: result.error || 'Invalid access key' 
        });
        setLocalSettings(prev => ({ ...prev, isAccessKeyValid: false }));
      }
    } catch (error) {
      setKeyValidationResult({ 
        isValid: false, 
        error: 'Failed to validate access key. Please try again.' 
      });
    } finally {
      setIsValidatingKey(false);
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
    a.download = 'asseta-settings.json';
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

  // Handle workspace folder selection
  const handleSelectWorkspaceFolder = async () => {
    try {
      const selectedPath = await TauriFileService.selectFolder();
      if (selectedPath && localSettings.workspace) {
        const updatedWorkspace = {
          ...localSettings.workspace,
          defaultFolder: selectedPath
        };
        
        setLocalSettings(prev => ({
          ...prev,
          workspace: updatedWorkspace,
          workspaces: prev.workspaces.map(w => 
            w.id === updatedWorkspace.id ? updatedWorkspace : w
          )
        }));
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'access', label: 'Access Key', icon: Key },
    { id: 'workspace', label: 'Workspace', icon: Folder },
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
                </div>

                <div className="bg-slate-700 p-4  rounded-lg">
                  <h4 className="text-white font-medium mb-2">Account Information</h4>
                  <div className="text-sm text-slate-300 space-y-1">
                    <div>Created: {new Date(localSettings.userProfile.createdAt).toLocaleDateString()}</div>
                    <div>Last Login: {new Date(localSettings.userProfile.lastLogin).toLocaleDateString()}</div>
                     
                  </div>
                </div>
                <div className='text-sm font-medium text-slate-300'>Please note that you cannot update profile information on this desktop application</div>
              </div>
            )}

            {activeTab === 'access' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Access Key Configuration</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Asseta Access Key</label>
                  <div className="relative">
                    <input
                      type={showAccessKey ? 'text' : 'password'}
                      value={localSettings.accessKey}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, accessKey: e.target.value }))}
                      placeholder="Enter your access key"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-20"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                      <button
                        onClick={() => setShowAccessKey(!showAccessKey)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        {showAccessKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleAccessKeyValidation}
                        disabled={isValidatingKey}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded disabled:opacity-50"
                      >
                        {isValidatingKey ? 'Checking...' : 'Check'}
                      </button>
                    </div>
                  </div>

                  {keyValidationResult && (
                    <div className={`mt-2 flex items-center text-sm ${
                      keyValidationResult.isValid ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {keyValidationResult.isValid ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Access key is valid - {keyValidationResult.userData?.firstName} {keyValidationResult.userData?.lastName}
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {keyValidationResult.error}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Connection Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-sm text-slate-300">
                        Claude AI ready (via AWS Bedrock)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        localSettings.isAccessKeyValid ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <span className="text-sm text-slate-300">
                        {localSettings.isAccessKeyValid ? 'Connected to Asseta.xyz' : 'Not connected'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Get Your Access Key</h4>
                  <p className="text-slate-300 text-sm mb-4">
                    Get your access key from the Asseta.xyz dashboard. Login to your account and find it in your profile section.
                  </p>
                  <button
                    onClick={() => window.open('https://asseta.xyz', '_blank')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Go to Dashboard →
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'workspace' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Current Workspace</h3>
                
                {localSettings.workspace ? (
                  <div className="bg-slate-700 p-6 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Folder className="w-8 h-8 text-blue-400" />
                        <div>
                          <h4 className="text-white font-medium text-lg">{localSettings.workspace.name}</h4>
                          <p className="text-slate-300 text-sm">Active project workspace</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Workspace Name</label>
                        <input
                          type="text"
                          value={localSettings.workspace.name}
                          onChange={(e) => {
                            if (localSettings.workspace) {
                              const updatedWorkspace = { ...localSettings.workspace, name: e.target.value };
                              setLocalSettings(prev => ({
                                ...prev,
                                workspace: updatedWorkspace,
                                workspaces: prev.workspaces.map(w => 
                                  w.id === updatedWorkspace.id ? updatedWorkspace : w
                                )
                              }));
                            }
                          }}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Project Folder</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={localSettings.workspace.defaultFolder}
                            readOnly
                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                          />
                          <button
                            onClick={handleSelectWorkspaceFolder}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
                          >
                            <FolderPlus size={16} />
                            Change
                          </button>
                        </div>
                        <p className="text-slate-400 text-sm mt-2">
                          All your tokenization projects will be stored in this folder
                        </p>
                      </div>

                      <div className="bg-slate-800 p-4 rounded-lg">
                        <h5 className="text-white font-medium mb-2">Workspace Info</h5>
                        <div className="text-sm text-slate-300 space-y-1">
                          <div>Created: {new Date(localSettings.workspace.createdAt).toLocaleDateString()}</div>
                          <div>Path: {localSettings.workspace.defaultFolder}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-700 p-6 rounded-lg text-center">
                    <Folder className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-white font-medium mb-2">No Workspace Found</h4>
                    <p className="text-slate-400 text-sm">
                      Something went wrong. Please reset the app to set up a new workspace.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">General Settings</h3>

                <div className="space-y-4">
                  {/* <div className="flex items-center justify-between">
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
                  </div> */}

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