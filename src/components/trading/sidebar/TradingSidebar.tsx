import React from 'react';
import { Home, Building2, Coins, TrendingUp } from 'lucide-react';
import { RWAProject } from '../../../types/trading';

interface TradingSidebarProps {
  projects: RWAProject[];
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string | null) => void;
}

export const TradingSidebar: React.FC<TradingSidebarProps> = ({
  projects,
  selectedProjectId,
  onProjectSelect
}) => {
  const getAssetIcon = (assetType: string) => {
    switch (assetType) {
      case 'real-estate': return Building2;
      case 'commodity': return Coins;
      case 'infrastructure': return TrendingUp;
      case 'art': return Building2;
      default: return Building2;
    }
  };

  return (
    <div className="w-64 h-full bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">RWA Trading</h2>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* General Section */}
        <div className="p-2">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 px-2">
            General
          </div>
          
          <button
            onClick={() => onProjectSelect(null)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedProjectId === null
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>

        {/* RWA Projects Section */}
        <div className="p-2">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 px-2">
            RWA Projects
          </div>
          
          <div className="space-y-1">
            {projects.map((project) => {
              const Icon = getAssetIcon(project.assetType);
              const isSelected = selectedProjectId === project.id;
              const isPositive = project.performance24h >= 0;
              
              return (
                <button
                  key={project.id}
                  onClick={() => onProjectSelect(project.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <div className="truncate font-medium">{project.name}</div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">${project.price}</span>
                      <span className={`${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{project.performance24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Trading Active</span>
        </div>
      </div>
    </div>
  );
};