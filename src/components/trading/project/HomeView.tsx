import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, Coins } from 'lucide-react';
import { RWAProject } from '../../../types/trading';

interface HomeViewProps {
  projects: RWAProject[];
  onProjectSelect: (projectId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ projects, onProjectSelect }) => {
  const totalMarketCap = projects.reduce((sum, p) => sum + p.marketCap, 0);
  const totalVolume24h = projects.reduce((sum, p) => sum + p.volume24h, 0);
  const avgYield = projects.reduce((sum, p) => sum + p.yield, 0) / projects.length;

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white mb-2">RWA Marketplace</h1>
        <p className="text-slate-400">Discover and invest in tokenized real-world assets</p>
      </div>

      {/* Stats Overview */}
      <div className="p-6 border-b border-slate-700">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-400">Total Market Cap</span>
            </div>
            <div className="text-xl font-bold text-white">{formatCurrency(totalMarketCap)}</div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">24h Volume</span>
            </div>
            <div className="text-xl font-bold text-white">{formatCurrency(totalVolume24h)}</div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-400">Avg Yield</span>
            </div>
            <div className="text-xl font-bold text-white">{avgYield.toFixed(1)}%</div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-slate-400">Active Projects</span>
            </div>
            <div className="text-xl font-bold text-white">{projects.length}</div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold text-white mb-4">Available Projects</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.map((project) => {
            const isPositive = project.performance24h >= 0;
            
            return (
              <div
                key={project.id}
                onClick={() => onProjectSelect(project.id)}
                className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-750 transition-colors cursor-pointer border border-slate-700 hover:border-slate-600"
              >
                <div className="relative">
                  <img 
                    src={project.images[0] || '/api/placeholder/300/200'} 
                    alt={project.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      isPositive 
                        ? 'bg-green-900/80 text-green-300' 
                        : 'bg-red-900/80 text-red-300'
                    }`}>
                      {isPositive ? '+' : ''}{project.performance24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white truncate">{project.name}</h3>
                    <span className="text-sm font-mono text-slate-400">{project.symbol}</span>
                  </div>
                  
                  <div className="text-sm text-slate-400 mb-3 capitalize">
                    {project.assetType.replace('-', ' ')} • {project.location}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Price</span>
                      <span className="font-semibold text-white">{formatCurrency(project.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Yield</span>
                      <span className="text-green-400">{project.yield}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Market Cap</span>
                      <span className="text-white">{formatCurrency(project.marketCap)}</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    View Project
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};