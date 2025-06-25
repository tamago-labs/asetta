import { AppSettings, UserProfile, WorkspaceSettings } from '../types/auth';
import { storageService } from './storage';

class AuthService {
  private static instance: AuthService;
  private settings: AppSettings | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  loadSettings(): AppSettings | null {
    if (!this.settings) {
      this.settings = storageService.loadSettings();
    }
    return this.settings;
  }

  isAuthenticated(): boolean {
    const settings = this.loadSettings();
    return !!(settings?.accessKey && settings?.isAccessKeyValid);
  }

  saveSettings(settings: AppSettings): void {
    this.settings = settings;
    storageService.saveSettings(settings);
  }

  createDefaultSettings(formData: any): AppSettings {
    const userId = Date.now().toString();
    const workspaceId = Date.now().toString();
    
    const userProfile: UserProfile = {
      id: userId,
      name: formData.userName,
      email: formData.userEmail || `${formData.userName.toLowerCase().replace(/\s+/g, '')}@local.app`,
      company: formData.company || '',
      createdAt: new Date(),
      lastLogin: new Date()
    };

    const workspace: WorkspaceSettings = {
      id: workspaceId,
      name: formData.workspaceName,
      defaultFolder: formData.workspaceFolder || '/Users/yourname/Documents/TokenizationProjects',
      createdAt: new Date()
    };

    return {
      accessKey: formData.accessKey,
      isAccessKeyValid: true,
      currentWorkspaceId: workspaceId,
      workspace: workspace,
      workspaces: [workspace],
      userProfile,
      theme: 'dark',
      autoSave: true,
      notifications: true
    };
  }

  logout(): void {
    this.settings = null;
    storageService.clearSettings();
  }

  updateLastLogin(): void {
    if (this.settings) {
      this.settings.userProfile.lastLogin = new Date();
      this.saveSettings(this.settings);
    }
  }
}

export const authService = AuthService.getInstance();
