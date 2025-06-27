import { AppSettings, UserProfile, WorkspaceSettings } from '../types/auth';

const STORAGE_KEY = 'asseta_settings';
const ENCRYPTION_KEY = 'asseta_secure_key_v1'; // In production, this should be more secure

class StorageService {
  // Simple XOR encryption for access key (in production, use proper encryption)
  private encryptAccessKey(accessKey: string): string {
    try {
      return btoa(accessKey.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
      ).join(''));
    } catch (error) {
      console.error('Failed to encrypt access key:', error);
      return accessKey; // Fallback to unencrypted
    }
  }

  private decryptAccessKey(encryptedKey: string): string {
    try {
      return atob(encryptedKey).split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
      ).join('');
    } catch (error) {
      console.error('Failed to decrypt access key:', error);
      return encryptedKey; // Fallback to returning as-is
    }
  }

  // Check if localStorage is available
  private isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  saveSettings(settings: AppSettings): void {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage is not available, settings cannot be saved');
      return;
    }

    try {
      const encryptedSettings = {
        ...settings,
        accessKey: this.encryptAccessKey(settings.accessKey),
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  loadSettings(): AppSettings | null {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage is not available, cannot load settings');
      return null;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const settings = JSON.parse(stored);
      
      // Validate required fields
      if (!settings.accessKey) {
        console.warn('Invalid settings: missing access key');
        return null;
      }

      return {
        ...settings,
        accessKey: this.decryptAccessKey(settings.accessKey),
        workspaces: settings.workspaces || [],
        userProfile: settings.userProfile || {}
      };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  }

  clearSettings(): void {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage is not available');
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear settings:', error);
    }
  }

  updateAccessKey(accessKey: string): void {
    const settings = this.loadSettings();
    if (settings) {
      settings.accessKey = accessKey;
      this.saveSettings(settings);
    } else {
      console.warn('No existing settings found, cannot update access key');
    }
  }

  updateUserProfile(profile: Partial<UserProfile>): void {
    const settings = this.loadSettings();
    if (settings) {
      settings.userProfile = { ...settings.userProfile, ...profile };
      this.saveSettings(settings);
    } else {
      console.warn('No existing settings found, cannot update user profile');
    }
  }

  addWorkspace(workspace: WorkspaceSettings): void {
    const settings = this.loadSettings();
    if (settings) {
      if (!settings.workspaces) {
        settings.workspaces = [];
      }
      settings.workspaces.push(workspace);
      this.saveSettings(settings);
    } else {
      console.warn('No existing settings found, cannot add workspace');
    }
  }

  updateWorkspace(workspaceId: string, updates: Partial<WorkspaceSettings>): void {
    const settings = this.loadSettings();
    if (settings && settings.workspaces) {
      const workspace = settings.workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        Object.assign(workspace, updates);
        this.saveSettings(settings);
      } else {
        console.warn(`Workspace ${workspaceId} not found`);
      }
    } else {
      console.warn('No existing settings found, cannot update workspace');
    }
  }

  setCurrentWorkspace(workspaceId: string): void {
    const settings = this.loadSettings();
    if (settings) {
      settings.currentWorkspaceId = workspaceId;
      this.saveSettings(settings);
    } else {
      console.warn('No existing settings found, cannot set current workspace');
    }
  }

  exportSettings(): string {
    const settings = this.loadSettings();
    if (!settings) return '';
    
    // Don't export the access key for security
    const exportData = {
      ...settings,
      accessKey: '[REDACTED]',
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  importSettings(data: string): boolean {
    try {
      const importedData = JSON.parse(data);
      
      // Validate the structure
      if (!importedData || typeof importedData !== 'object') {
        console.error('Invalid import data: not an object');
        return false;
      }

      if (importedData.userProfile && importedData.workspaces) {
        const currentSettings = this.loadSettings();
        if (currentSettings) {
          // Merge imported data but keep current access key
          const mergedSettings = {
            ...importedData,
            accessKey: currentSettings.accessKey,
            importedAt: new Date().toISOString()
          };
          this.saveSettings(mergedSettings);
          return true;
        } else {
          console.warn('No current settings found, cannot import without access key');
          return false;
        }
      }
      
      console.error('Invalid import data: missing required fields');
      return false;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  // Backup settings to a different key
  backupSettings(): boolean {
    try {
      const settings = this.loadSettings();
      if (settings) {
        const backupKey = `${STORAGE_KEY}_backup_${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(settings));
        console.log(`Settings backed up to ${backupKey}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to backup settings:', error);
      return false;
    }
  }

  // Get storage usage info
  getStorageInfo(): { used: number; total: number; available: number } | null {
    if (!this.isStorageAvailable()) return null;

    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }

      // Most browsers have 5-10MB limit for localStorage
      const estimatedLimit = 5 * 1024 * 1024; // 5MB
      
      return {
        used: total,
        total: estimatedLimit,
        available: estimatedLimit - total
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return null;
    }
  }
}

export const storageService = new StorageService();