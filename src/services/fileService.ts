import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { FileInfo } from '../types/files';

export class TauriFileService {
  /**
   * Read directory contents
   */
  static async readDirectory(path: string): Promise<FileInfo[]> {
    try {
      return await invoke<FileInfo[]>('read_directory', { path });
    } catch (error) {
      console.error('Failed to read directory:', error);
      throw new Error(`Failed to read directory: ${error}`);
    }
  }

  /**
   * Read file content
   */
  static async readFileContent(path: string): Promise<string> {
    try {
      return await invoke<string>('read_file_content', { path });
    } catch (error) {
      console.error('Failed to read file:', error);
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  /**
   * Write file content
   */
  static async writeFileContent(path: string, content: string): Promise<void> {
    try {
      await invoke('write_file_content', { path, content });
    } catch (error) {
      console.error('Failed to write file:', error);
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  /**
   * Open folder dialog
   */
  static async selectFolder(): Promise<string | null> {
    try {
      const result = await open({
        directory: true,
        multiple: false,
        title: 'Select Project Folder'
      });
      return result as string | null;
    } catch (error) {
      console.error('Failed to open folder dialog:', error);
      return null;
    }
  }

  /**
   * Get file extension for syntax highlighting
   */
  static getFileLanguage(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'sol': 'solidity',
      'rs': 'rust',
      'go': 'go',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'txt': 'text',
      'log': 'text',
      'env': 'bash',
      'sh': 'bash',
      'dockerfile': 'dockerfile',
      'toml': 'toml',
      'ini': 'ini'
    };
    
    return languageMap[ext || ''] || 'text';
  }

  /**
   * Check if file is text-based (can be previewed)
   */
  static isTextFile(filename: string): boolean {
    const ext = filename.toLowerCase().split('.').pop();
    const textExtensions = [
      'txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'py', 'sol', 'rs', 'go', 'java',
      'cpp', 'c', 'h', 'html', 'css', 'scss', 'sass', 'xml', 'yaml', 'yml', 'toml',
      'ini', 'env', 'sh', 'bash', 'dockerfile', 'gitignore', 'log', 'csv', 'sql'
    ];
    return textExtensions.includes(ext || '');
  }

  /**
   * Get file icon based on type
   */
  static getFileIcon(file: FileInfo): string {
    if (file.is_dir) return '📁';
    
    const ext = file.extension?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'js': '📄',
      'ts': '📘',
      'jsx': '⚛️',
      'tsx': '⚛️',
      'py': '🐍',
      'sol': '⛓️',
      'rs': '🦀',
      'go': '🐹',
      'java': '☕',
      'html': '🌐',
      'css': '🎨',
      'json': '📋',
      'md': '📝',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'pdf': '📕',
      'zip': '📦',
      'tar': '📦',
      'gz': '📦'
    };
    
    return iconMap[ext || ''] || '📄';
  }
}
