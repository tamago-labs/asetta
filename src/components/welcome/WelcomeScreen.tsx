import React from 'react';
import { Building2, TrendingUp, Sparkles, Users } from 'lucide-react';

interface WelcomeScreenProps {
  onModeSelect: (mode: 'trading' | 'creator') => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onModeSelect }) => {
  return (
    <div className="h-screen w-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Asseta
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Create and trade Real World Assets (RWA) with AI-powered tools
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* RWA Trader */}
          <div 
            onClick={() => onModeSelect('trading')}
            className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-blue-500 transition-all duration-300 cursor-pointer group hover:bg-slate-750"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500 transition-colors">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4 text-white">RWA Trader</h2>
              <p className="text-slate-400 mb-6">
                Trade existing RWA tokens, manage your portfolio, and earn yield through staking
              </p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Browse marketplace of RWA projects
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Buy, sell, and trade RWA tokens
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Manage your investment portfolio
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Stake tokens for yield generation
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  AI-powered trading assistance
                </div>
              </div>

              <button className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors group-hover:bg-blue-500">
                Enter Trading Platform
              </button>
            </div>
          </div>

          {/* RWA Creator */}
          <div 
            onClick={() => onModeSelect('creator')}
            className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group hover:bg-slate-750"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500 transition-colors">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4 text-white">RWA Creator</h2>
              <p className="text-slate-400 mb-6">
                Build new RWA projects with AI agents that handle legal, technical, and compliance aspects
              </p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  AI-powered project generation
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Smart contract deployment
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Legal compliance automation
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Token economics design
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Multi-agent collaboration
                </div>
              </div>

              <button className="w-full mt-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors group-hover:bg-purple-500">
                Start Building
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="flex items-center justify-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Community-Driven</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};