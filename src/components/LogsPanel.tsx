import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  AlertCircle,
  Info,
  AlertTriangle,
  Trash2,
  Download,
  Filter,
  Search,
  Clock,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { Logger, LogEntry } from '../utils/logger';

interface LogsPanelProps {
  className?: string;
}

export const LogsPanel: React.FC<LogsPanelProps> = ({ className = '' }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const logger = Logger.getInstance();

  useEffect(() => {
    const handleLogUpdate = (newLogs: LogEntry[]) => {
      setLogs(newLogs);
    };

    logger.subscribe(handleLogUpdate);

    return () => {
      logger.unsubscribe(handleLogUpdate);
    };
  }, [logger]);

  useEffect(() => {
    let filtered = logs;

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(log => log.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(query) ||
        log.category.toLowerCase().includes(query) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(query))
      );
    }

    setFilteredLogs(filtered);
  }, [logs, selectedLevel, selectedCategory, searchQuery]);

  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = 0; // Scroll to top since we add new logs at the beginning
    }
  }, [filteredLogs, autoScroll]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'warn':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'info':
      default:
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      logger.clearLogs();
    }
  };

  const handleExportLogs = () => {
    const exportData = logger.exportLogs();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcp-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = logger.getStats();
  const categories = stats.categories;

  return (
    <div className={`h-full flex flex-col bg-slate-900 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">MCP Logs</h3>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
              {filteredLogs.length} / {logs.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`p-2 rounded text-xs transition-colors ${
                autoScroll 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              title="Auto-scroll to new logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button> */}
            
            <button
              onClick={handleExportLogs}
              className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
              title="Export logs"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleClearLogs}
              className="p-2 hover:bg-red-700 rounded text-red-400 hover:text-red-300 transition-colors"
              title="Clear all logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>  
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="flex-1">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-black text-sm"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warnings</option>
              <option value="error">Errors</option>
            </select>
          </div>
          
          <div className="flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-black text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Container */}
      <div 
        ref={logsContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No logs found</p>
            <p className="text-sm">
              {logs.length === 0 
                ? 'Start using MCP servers to see logs here'
                : 'Try adjusting your filters'
              }
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`border rounded-lg p-3 ${getLevelColor(log.level)}`}
            >
              <div className="flex items-start gap-3">
                {getLevelIcon(log.level)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded">
                        {log.category.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm font-medium mb-1">
                    {log.message}
                  </div>
                  
                  {log.data && (
                    <div className="text-xs font-mono bg-slate-800/50 rounded p-2 mt-2 overflow-x-auto">
                      <pre className="whitespace-pre-wrap">
                        {typeof log.data === 'string' 
                          ? log.data 
                          : JSON.stringify(log.data, null, 2)
                        }
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
