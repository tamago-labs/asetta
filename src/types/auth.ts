export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company?: string;
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface WorkspaceSettings {
  id: string;
  name: string;
  defaultFolder: string;  // Changed from defaultFolderPath
  description?: string;
  createdAt: Date;
}

export interface AppSettings {
  apiKey: string;
  isApiKeyValid: boolean;
  currentWorkspaceId: string;
  workspace?: WorkspaceSettings;  // Add optional workspace reference
  workspaces: WorkspaceSettings[];
  userProfile: UserProfile;
  theme: 'dark' | 'light';
  autoSave: boolean;
  notifications: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface ApiValidationResult {
  isValid: boolean;
  error?: string;
  userInfo?: {
    usage: {
      requests: number;
      tokens: number;
    };
  };
}

export interface SetupFormData {
  apiKey: string;
  userName: string;
  userEmail: string;
  company?: string;
  workspaceName: string;
  workspaceFolder: string;  // Changed from workspacePath
  agreeToTerms: boolean;
}
