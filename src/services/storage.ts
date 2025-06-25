import { AppSettings, UserProfile, WorkspaceSettings } from '../types/auth';

const STORAGE_KEY = 'asseta_settings';
const ENCRYPTION_KEY = 'asseta_secure_key_v1'; // In production, this should be more secure

class StorageService {
  // Simple XOR encryption for access key (in production, use proper encryption)
  private encryptAccessKey(accessKey: string): string {
    return btoa(accessKey.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    ).join(''));
  }

  private decryptAccessKey(encryptedKey: string): string {
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
        accessKey: this.encryptAccessKey(settings.accessKey)
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
        accessKey: this.decryptAccessKey(settings.accessKey)
      };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  }

  clearSettings(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  updateAccessKey(accessKey: string): void {
    const settings = this.loadSettings();
    if (settings) {
      settings.accessKey = accessKey;
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
    
    // Don't export the access key for security
    const exportData = {
      ...settings,
      accessKey: '[REDACTED]'
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
          // Merge imported data but keep current access key
          const mergedSettings = {
            ...importedData,
            accessKey: currentSettings.accessKey
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