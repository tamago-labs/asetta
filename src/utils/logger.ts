// Enhanced logger utility for MCP operations with log storage
export interface LogEntry {
  id: string;
  timestamp: Date;
  category: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs
  private listeners: ((logs: LogEntry[]) => void)[] = [];
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private addLog(level: 'info' | 'warn' | 'error', category: string, message: string, data?: any) {
    const logEntry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      category,
      level,
      message,
      data
    };

    this.logs.unshift(logEntry); // Add to beginning

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Notify listeners
    this.notifyListeners();

    // Also log to console
    const consoleMessage = `[${category.toUpperCase()}] ${message}`;
    switch (level) {
      case 'info':
        console.log(consoleMessage, data || '');
        break;
      case 'warn':
        console.warn(consoleMessage, data || '');
        break;
      case 'error':
        console.error(consoleMessage, data || '');
        break;
    }
  }

  info(category: string, message: string, data?: any) {
    this.addLog('info', category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.addLog('error', category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.addLog('warn', category, message, data);
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Get logs by category
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  // Get logs by level
  getLogsByLevel(level: 'info' | 'warn' | 'error'): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }

  // Subscribe to log updates
  subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener);
    // Immediately call with current logs
    listener([...this.logs]);
  }

  // Unsubscribe from log updates
  unsubscribe(listener: (logs: LogEntry[]) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Get stats
  getStats() {
    const total = this.logs.length;
    const errors = this.logs.filter(log => log.level === 'error').length;
    const warnings = this.logs.filter(log => log.level === 'warn').length;
    const info = this.logs.filter(log => log.level === 'info').length;
    
    const categories = new Set(this.logs.map(log => log.category));
    
    return {
      total,
      errors,
      warnings,
      info,
      categories: Array.from(categories)
    };
  }
}
