import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  FolderOpen, 
  ChevronDown, 
  ChevronRight, 
  Home,
  RefreshCw,
  FolderPlus,
  Search,
  X
} from 'lucide-react';
import { FileInfo } from '../types/files';
import { TauriFileService } from '../services/fileService';
import { formatFileSize, formatTimeAgo } from '../utils/helpers';
import clsx from 'clsx';

interface FileManagerProps {
  projectPath: string | null;
  onFileSelect: (file: FileInfo) => void;
  selectedFile: FileInfo | null;
  onProjectPathChange: (path: string) => void;
  onHide?: () => void; // Optional hide function
}

interface TreeNode extends FileInfo {
  children?: TreeNode[];
  isExpanded?: boolean;
  level: number;
}

export const FileManager: React.FC<FileManagerProps> = ({ 
  projectPath, 
  onFileSelect, 
  selectedFile,
  onProjectPathChange,
  onHide
}) => {
  const [files, setFiles] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Load directory contents
  const loadDirectory = async (path: string, level: number = 0): Promise<TreeNode[]> => {
    try {
      const fileInfos = await TauriFileService.readDirectory(path);
      return fileInfos.map(info => ({
        ...info,
        level,
        isExpanded: expandedFolders.has(info.path)
      }));
    } catch (err) {
      console.error('Failed to load directory:', err);
      throw err;
    }
  };

  // Load files when project path changes
  useEffect(() => {
    if (!projectPath) {
      setFiles([]);
      return;
    }

    const loadFiles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const rootFiles = await loadDirectory(projectPath, 0);
        setFiles(rootFiles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load files');
      } finally {
        setIsLoading(false);
      }
    };

    loadFiles();
  }, [projectPath, expandedFolders]);

  // Handle folder selection
  const handleSelectFolder = async () => {
    const selectedPath = await TauriFileService.selectFolder();
    if (selectedPath) {
      onProjectPathChange(selectedPath);
    }
  };

  // Handle file/folder click
  const handleItemClick = async (item: TreeNode) => {
    if (item.is_dir) {
      // Toggle folder expansion
      const newExpanded = new Set(expandedFolders);
      if (expandedFolders.has(item.path)) {
        newExpanded.delete(item.path);
      } else {
        newExpanded.add(item.path);
      }
      setExpandedFolders(newExpanded);
    } else {
      // Select file
      onFileSelect(item);
    }
  };

  // Refresh current directory
  const handleRefresh = async () => {
    if (projectPath) {
      setIsLoading(true);
      try {
        const rootFiles = await loadDirectory(projectPath, 0);
        setFiles(rootFiles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Filter files based on search
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render file tree recursively
  const renderFileTree = (items: TreeNode[]) => {
    return items.map((item) => (
      <div key={item.path}>
        <div
          className={clsx(
            'flex items-center px-2 py-1 text-sm cursor-pointer hover:bg-slate-700 transition-colors',
            selectedFile?.path === item.path && 'bg-blue-600 hover:bg-blue-600',
            'group'
          )}
          style={{ paddingLeft: `${8 + item.level * 16}px` }}
          onClick={() => handleItemClick(item)}
        >
          {/* Folder expand/collapse icon */}
          {item.is_dir && (
            <div className="mr-1 w-4 h-4 flex items-center justify-center">
              {expandedFolders.has(item.path) ? (
                <ChevronDown size={12} className="text-slate-400" />
              ) : (
                <ChevronRight size={12} className="text-slate-400" />
              )}
            </div>
          )}
          
          {/* File/folder icon */}
          <div className="mr-2 w-4 h-4 flex items-center justify-center">
            {item.is_dir ? (
              expandedFolders.has(item.path) ? (
                <FolderOpen size={16} className="text-blue-400" />
              ) : (
                <Folder size={16} className="text-blue-400" />
              )
            ) : (
              <File size={16} className="text-slate-400" />
            )}
          </div>
          
          {/* File name */}
          <span className={clsx(
            'flex-1 truncate',
            selectedFile?.path === item.path ? 'text-white font-medium' : 'text-slate-300'
          )}>
            {item.name}
          </span>
          
          {/* File size (for files only) */}
          {!item.is_dir && item.size && (
            <span className="text-xs text-slate-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {formatFileSize(item.size)}
            </span>
          )}
        </div>
        
        {/* Render children if folder is expanded */}
        {item.is_dir && expandedFolders.has(item.path) && item.children && (
          <div>
            {renderFileTree(item.children)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-lg">File Explorer </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleRefresh}
              disabled={!projectPath || isLoading}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
            {onHide && (
              <button
                onClick={onHide}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Hide File Explorer"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={handleSelectFolder}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Select Project Folder"
            >
              <FolderPlus size={16} />
            </button>
          </div>
        </div>
        
        {/* Current folder path */}
        {projectPath && (
          <div className="flex items-center space-x-2  p-2 bg-slate-700/50 rounded text-xs">
            <Home size={12} className="text-slate-400" />
            <span className="text-slate-300 truncate" title={projectPath}>
              {projectPath.split('/').pop() || projectPath}
            </span>
          </div>
        )}
        
        {/* Search */}
        {/* {projectPath && (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )} */}
      </div>
      
      {/* File tree */}
      <div className="flex-1 overflow-y-auto">
        {!projectPath ? (
          <div className="p-4 text-center">
            <Folder size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 mb-4">No project folder selected</p>
            <button
              onClick={handleSelectFolder}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Select Folder
            </button>
          </div>
        ) : isLoading ? (
          <div className="p-4 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-slate-400 text-sm">Loading files...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <div className="text-red-400 mb-2">⚠️</div>
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-4 text-center">
            <File size={32} className="mx-auto text-slate-600 mb-2" />
            <p className="text-slate-400 text-sm">
              {searchTerm ? 'No files match your search' : 'No files found'}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {renderFileTree(filteredFiles)}
          </div>
        )}
      </div>
      
      {/* Footer info */}
      {projectPath && !isLoading && !error && (
        <div className="p-3 border-t border-slate-700 text-xs text-slate-500">
          {filteredFiles.length} {filteredFiles.length === 1 ? 'item' : 'items'}
          {searchTerm && ` (filtered)`}
        </div>
      )}
    </div>
  );
};
