import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Image, 
  Download, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  Code,
  AlertCircle,
  Clock,
  HardDrive,
  Type,
  Folder
} from 'lucide-react';
import { FileInfo } from '../types/files';
import { TauriFileService } from '../services/fileService';
import { formatFileSize, formatTimeAgo } from '../utils/helpers';
import clsx from 'clsx';

interface FileViewerProps {
  selectedFile: FileInfo | null;
  onClose: () => void;
}

export const FileViewer: React.FC<FileViewerProps> = ({ selectedFile, onClose }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load file content when selected file changes
  useEffect(() => {
    if (!selectedFile || selectedFile.is_dir) {
      setContent('');
      setEditedContent('');
      setIsEditing(false);
      setError(null);
      return;
    }

    const loadContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (TauriFileService.isTextFile(selectedFile.name)) {
          const fileContent = await TauriFileService.readFileContent(selectedFile.path);
          setContent(fileContent);
          setEditedContent(fileContent);
        } else {
          setContent('');
          setEditedContent('');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [selectedFile]);

  // Handle save file
  const handleSave = async () => {
    if (!selectedFile || !isEditing) return;
    
    setIsSaving(true);
    try {
      await TauriFileService.writeFileContent(selectedFile.path, editedContent);
      setContent(editedContent);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  // Get file language for syntax highlighting
  const getLanguage = (filename: string) => {
    return TauriFileService.getFileLanguage(filename);
  };

  // Render different file types
  const renderFilePreview = () => {
    if (!selectedFile) return null;

    const isTextFile = TauriFileService.isTextFile(selectedFile.name);
    const language = getLanguage(selectedFile.name);

    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-slate-400 text-sm">Loading file...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <p className="text-red-400 mb-2">Failed to load file</p>
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        </div>
      );
    }

    if (!isTextFile) {
      const ext = selectedFile.extension?.toLowerCase();
      const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '');
      
      if (isImage) {
        return (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-full max-h-full">
              <img 
                src={`file://${selectedFile.path}`} 
                alt={selectedFile.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        );
      }
      
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <FileText size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 mb-2">Cannot preview this file type</p>
            <p className="text-slate-500 text-sm mb-4">
              {selectedFile.extension?.toUpperCase() || 'Unknown'} files are not supported for preview
            </p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
              <Download size={16} className="inline mr-2" />
              Download File
            </button>
          </div>
        </div>
      );
    }

    // Text file preview/editor
    return (
      <div className="flex-1 flex flex-col">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="flex-1 w-full p-4 bg-slate-900 text-white font-mono text-sm border-none outline-none resize-none"
            spellCheck={false}
            style={{ 
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              lineHeight: '1.5'
            }}
          />
        ) : (
          <pre className="flex-1 w-full p-4 bg-slate-900 text-slate-300 font-mono text-sm overflow-auto whitespace-pre-wrap">
            <code className={`language-${language}`}>
              {content || 'Empty file'}
            </code>
          </pre>
        )}
      </div>
    );
  };

  if (!selectedFile) {
    return (
      <div className="flex-1 h-full bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <FileText size={64} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">No file selected</h3>
          <p className="text-slate-400 text-sm">
            Select a file from the explorer to view its contents
          </p>
        </div>
      </div>
    );
  }

  const isTextFile = TauriFileService.isTextFile(selectedFile.name);
  const modifiedDate = selectedFile.modified ? new Date(parseInt(selectedFile.modified) * 1000) : null;

  return (
    <div className="flex-1 h-full bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {selectedFile.is_dir ? (
              <Folder size={20} className="text-blue-400" />
            ) : (
              <FileText size={20} className="text-slate-400" />
            )}
            <span className="text-white font-medium">{selectedFile.name}</span>
          </div>
          
          {/* File metadata */}
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            {selectedFile.size && (
              <div className="flex items-center space-x-1">
                <HardDrive size={12} />
                <span>{formatFileSize(selectedFile.size)}</span>
              </div>
            )}
            {modifiedDate && (
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{formatTimeAgo(modifiedDate)}</span>
              </div>
            )}
            {selectedFile.extension && (
              <div className="flex items-center space-x-1">
                <Type size={12} />
                <span>{selectedFile.extension.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Edit/Save buttons for text files */}
          {isTextFile && !selectedFile.is_dir && (
            <>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || editedContent === content}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded text-sm transition-colors flex items-center space-x-1"
                  >
                    <Save size={14} />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-3 py-1 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded text-sm transition-colors flex items-center space-x-1"
                  >
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center space-x-1"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
              )}
            </>
          )}
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title="Close file"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      {/* File content */}
      {renderFilePreview()}
      
      {/* Status bar */}
      <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-4">
          <span>{selectedFile.path}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {isTextFile && content && (
            <>
              <span>{content.split('\n').length} lines</span>
              <span>{content.length} characters</span>
            </>
          )}
          {isEditing && (
            <span className="text-orange-400">Modified</span>
          )}
        </div>
      </div>
    </div>
  );
};
