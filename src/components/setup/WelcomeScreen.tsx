import React, { useState } from 'react';
import { LogIn, Building2, Key, Folder, ArrowRight, Check, AlertCircle, FolderPlus } from 'lucide-react';
import { SetupFormData } from '../../types/auth';
import { TauriFileService } from '../../services/fileService';
import { invoke } from '@tauri-apps/api/core';

interface WelcomeScreenProps {
  onSetupComplete: (settings: SetupFormData) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSetupComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SetupFormData>({
    accessKey: '',
    userName: '',
    userEmail: '',
    company: '',
    workspaceName: 'My Tokenization Projects',
    workspaceFolder: '',
    agreeToTerms: true
  });
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationResult, setKeyValidationResult] = useState<{ isValid: boolean; error?: string; userData?: any } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Asetta RWA Studio',
      description: 'Transform your assets into digital tokens with AI-powered assistance'
    },
    {
      id: 'access-key',
      title: 'Connect Your Account',
      description: 'Enter your access key from Asetta.xyz dashboard'
    },
    {
      id: 'workspace',
      title: 'Setup Your Workspace',
      description: 'Choose where to store your tokenization projects'
    }
  ];

  const handleAccessKeyValidation = async () => {
    if (!formData.accessKey.trim()) {
      setKeyValidationResult({ isValid: false, error: 'Please enter your access key' });
      return;
    }

    setIsValidatingKey(true);
    setKeyValidationResult(null);

    try {
      const result = await invoke('validate_access_key', { accessKey: formData.accessKey }) as {
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

        // Auto-fill user name from profile
        const fullName = `${result.user_data.firstName || ''} ${result.user_data.lastName || ''}`.trim();
        setFormData(prev => ({
          ...prev,
          userName: fullName || prev.userName,
          userEmail: result.user_data?.email || prev.userEmail
        }));
      } else {
        setKeyValidationResult({
          isValid: false,
          error: result.error || 'Invalid access key'
        });
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

  const handleFolderSelect = async () => {
    try {
      const selectedPath = await TauriFileService.selectFolder();
      if (selectedPath) {
        setFormData(prev => ({ ...prev, workspaceFolder: selectedPath }));
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
      // Fallback to a default path
      const defaultPath = process.platform === 'win32'
        ? 'C:\\Users\\Documents\\TokenizationProjects'
        : '~/Documents/TokenizationProjects';
      setFormData(prev => ({ ...prev, workspaceFolder: defaultPath }));
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: return true; // Welcome step
      case 1: return keyValidationResult?.isValid || false; // Access key must be valid
      case 2: return formData.workspaceName.trim() && formData.workspaceFolder.trim(); // Workspace required
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // Simulate setup process
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSetupComplete(formData);
    } catch (error) {
      console.error('Setup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Welcome</h2>
              <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
                Transform your valuable assets into digital tokens using multiple AI agents.
                Real estate, commodities, art collections - all tokenized in minutes, not months.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto text-sm">
              <div className="bg-slate-800 p-6 rounded-xl">
                <div className="text-blue-400 font-bold text-2xl">4+</div>
                <div className="text-slate-400">AI Agents</div>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl">
                <div className="text-green-400 font-bold text-2xl">3+</div>
                <div className="text-slate-400">Blockchains</div>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl">
                <div className="text-purple-400 font-bold text-2xl">90%</div>
                <div className="text-slate-400">Cost Saving</div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <LogIn className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-3">Connect Your Account</h2>
              <p className="text-slate-300 text-lg">
                Enter your access key from the Asetta.xyz dashboard
              </p>
            </div>

            <div className="max-w-lg mx-auto space-y-6">
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.accessKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessKey: e.target.value }))}
                    placeholder="Enter your access key"
                    className="w-full px-6 py-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-lg placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 pr-20"
                  />
                  <button
                    onClick={handleAccessKeyValidation}
                    disabled={isValidatingKey || !formData.accessKey.trim()}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                  >
                    {isValidatingKey ? 'Checking...' : 'Check'}
                  </button>
                </div>

                {keyValidationResult && (
                  <div className={`mt-3 flex items-center justify-center text-sm ${keyValidationResult.isValid ? 'text-green-400' : 'text-red-400'
                    }`}>
                    {keyValidationResult.isValid ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Welcome {keyValidationResult.userData?.firstName}! Access key verified.
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {keyValidationResult.error}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-slate-800 p-6 px-2 rounded-xl">
                <h4 className="text-white font-medium mb-3">Don't have an access key?</h4>
                <p className="text-slate-300 text-sm mb-4">
                  Get your access key from the Asetta.xyz dashboard. Login to your account and find it in your profile section.
                </p> 
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <Folder className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-3">Setup Your Workspace</h2>
              <p className="text-slate-300 text-lg">
                Choose where to store your tokenization projects and files
              </p>
            </div>

            <div className="max-w-lg mx-auto space-y-6">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-3">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={formData.workspaceName}
                  onChange={(e) => setFormData(prev => ({ ...prev, workspaceName: e.target.value }))}
                  placeholder="My Tokenization Projects"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-3">
                  Project Folder Location
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.workspaceFolder}
                    onChange={(e) => setFormData(prev => ({ ...prev, workspaceFolder: e.target.value }))}
                    placeholder="/path/to/your/projects"
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    readOnly
                  />
                  <button
                    onClick={handleFolderSelect}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium whitespace-nowrap flex items-center gap-2"
                  >
                    <FolderPlus size={16} />
                    Browse
                  </button>
                </div>
                <p className="text-slate-400 text-sm mt-2">
                  We'll create organized folders for legal docs, smart contracts, and more
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center flex flex-col">
          <div className="w-16 mx-auto h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-white mx-auto text-xl font-semibold mb-2">Setting up your workspace...</h2>
          <p className="text-slate-400 mx-auto">This will only take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${index <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                    }`}
                >
                  {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-6 ${index < currentStep ? 'bg-blue-600' : 'bg-slate-700'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white">
              {steps[currentStep].title}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>

        {/* Step content */}
        <div className="bg-slate-800 rounded-2xl p-12 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-8 py-3 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceedToNext()}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg"
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
