/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Slack-inspired color palette
        'slack-bg': '#1a1d29',
        'slack-sidebar': '#19171d',
        'slack-sidebar-hover': '#350d36',
        'slack-primary': '#611f69',
        'slack-accent': '#1264a3',
        'slack-text': '#d1d2d3',
        'slack-text-muted': '#868686',
        'slack-border': '#3f4a5f',
        'slack-message-hover': '#1c1c1c',
        'slack-online': '#2eb67d',
        'slack-away': '#ecb22e',
        'slack-busy': '#e01e5a',
        
        // Editor colors (keeping existing)
        'editor-bg': '#1e1e1e',
        'sidebar-bg': '#252526',
        'titlebar-bg': '#2d2d2d',
        'border': '#404040',
        'text-primary': '#e0e0e0',
        'text-secondary': '#cccccc',
        'text-muted': '#999999',
        'accent': '#007acc',
        'accent-hover': '#005a9e',
        'success': '#4caf50',
        'error': '#f44336',
        'warning': '#ff9800',
      },
      fontFamily: {
        'mono': ['Consolas', 'Monaco', 'Courier New', 'monospace'],
        'sans': ['Lato', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
