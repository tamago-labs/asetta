import { AppSettings, UserProfile, WorkspaceSettings } from '../types/auth';

const STORAGE_KEY = 'build_your_dream_settings';
const ENCRYPTION_KEY = 'byd_secure_key_v1'; // In production, this should be more secure

class StorageService {
  // Simple XOR encryption for API key (in production, use proper encryption)
  private encryptApiKey(apiKey: string): string {
    return btoa(apiKey.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    ).join(''));
  }

  private decryptApiKey(encryptedKey: string): string {
    try {
      return atob(encryptedKey).split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
      ).join('');
    } catch {
      return '';
    }
  }

  saveSettings(settings: AppSettings): void {
    try {
      const encryptedSettings = {
        ...settings,
        apiKey: this.encryptApiKey(settings.apiKey)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  loadSettings(): AppSettings | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const settings = JSON.parse(stored);
      return {
        ...settings,
        apiKey: this.decryptApiKey(settings.apiKey)
      };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  }

  clearSettings(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  updateApiKey(apiKey: string): void {
    const settings = this.loadSettings();
    if (settings) {
      settings.apiKey = apiKey;
      this.saveSettings(settings);
    }
  }

  updateUserProfile(profile: Partial<UserProfile>): void {
    const settings = this.loadSettings();
    if (settings) {
      settings.userProfile = { ...settings.userProfile, ...profile };
      this.saveSettings(settings);
    }
  }

  addWorkspace(workspace: WorkspaceSettings): void {
    const settings = this.loadSettings();
    if (settings) {
      settings.workspaces.push(workspace);
      this.saveSettings(settings);
    }
  }

  updateWorkspace(workspaceId: string, updates: Partial<WorkspaceSettings>): void {
    const settings = this.loadSettings();
    if (settings) {
      const workspace = settings.workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        Object.assign(workspace, updates);
        this.saveSettings(settings);
      }
    }
  }

  setCurrentWorkspace(workspaceId: string): void {
    const settings = this.loadSettings();
    if (settings) {
      settings.currentWorkspaceId = workspaceId;
      this.saveSettings(settings);
    }
  }

  exportSettings(): string {
    const settings = this.loadSettings();
    if (!settings) return '';
    
    // Don't export the API key for security
    const exportData = {
      ...settings,
      apiKey: '[REDACTED]'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  importSettings(data: string): boolean {
    try {
      const importedData = JSON.parse(data);
      // Validate the structure
      if (importedData.userProfile && importedData.workspaces) {
        const currentSettings = this.loadSettings();
        if (currentSettings) {
          // Merge imported data but keep current API key
          const mergedSettings = {
            ...importedData,
            apiKey: currentSettings.apiKey
          };
          this.saveSettings(mergedSettings);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();
