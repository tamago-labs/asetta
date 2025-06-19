import React from 'react';
import { Project } from '../data/mockData';
import { Calendar, DollarSign, TrendingUp, Clock, FileText, Settings, BarChart3, Users, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface ProjectPanelProps {
  project: Project;
}

const statusColors = {
  planning: 'bg-yellow-500',
  in_progress: 'bg-blue-500',
  review: 'bg-purple-500',
  completed: 'bg-green-500'
};

const statusLabels = {
  planning: 'Planning',
  in_progress: 'In Progress',
  review: 'Under Review',
  completed: 'Completed'
};

const milestones = [
  { id: 1, name: 'Legal Analysis', status: 'completed', progress: 100 },
  { id: 2, name: 'Smart Contract Development', status: 'in_progress', progress: 75 },
  { id: 3, name: 'Infrastructure Setup', status: 'in_progress', progress: 60 },
  { id: 4, name: 'Frontend Development', status: 'pending', progress: 25 },
  { id: 5, name: 'Testing & Deployment', status: 'pending', progress: 0 }
];

const teamMetrics = {
  totalTasks: 47,
  completedTasks: 31,
  activeTasks: 12,
  blockedTasks: 4
};

export const ProjectPanel: React.FC<ProjectPanelProps> = ({ project }) => {
  const daysRemaining = Math.ceil(
    (project.estimatedCompletion.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const progressColor = project.progress >= 75 ? 'bg-green-500' : 
                       project.progress >= 50 ? 'bg-blue-500' : 
                       project.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-semibold text-lg">Project Overview</h2>
          <button className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
            <Settings size={16} />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <div className={clsx('w-2 h-2 rounded-full', statusColors[project.status])}></div>
          <span className="text-slate-400 text-sm">{statusLabels[project.status]}</span>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-slate-400 text-xs">{daysRemaining} days left</span>
        </div>
      </div>

      {/* Project Details */}
      <div className="flex-1 overflow-y-auto">
        {/* Project Info */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-white font-semibold mb-2">{project.name}</h3>
          <p className="text-slate-400 text-sm mb-4">{project.description}</p>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign size={14} className="text-green-400" />
                <span className="text-xs text-slate-400">Asset Value</span>
              </div>
              <div className="text-white font-semibold">{project.value}</div>
              <div className="text-xs text-slate-400">{project.assetType}</div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar size={14} className="text-blue-400" />
                <span className="text-xs text-slate-400">Completion</span>
              </div>
              <div className="text-white font-semibold text-sm">
                {project.estimatedCompletion.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xs text-slate-400">{daysRemaining} days</div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold">Overall Progress</span>
            <span className="text-slate-400 text-sm font-medium">{project.progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
            <div 
              className={clsx('h-3 rounded-full transition-all duration-500', progressColor)}
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-slate-500">On track for completion</div>
        </div>

        {/* Team Metrics */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2 mb-3">
            <BarChart3 size={16} className="text-slate-400" />
            <span className="text-white font-semibold">Team Metrics</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Tasks:</span>
              <span className="text-white font-medium">{teamMetrics.totalTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Completed:</span>
              <span className="text-green-400 font-medium">{teamMetrics.completedTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active:</span>
              <span className="text-blue-400 font-medium">{teamMetrics.activeTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Blocked:</span>
              <span className="text-red-400 font-medium">{teamMetrics.blockedTasks}</span>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp size={16} className="text-slate-400" />
            <span className="text-white font-semibold">Milestones</span>
          </div>
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center space-x-3">
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  milestone.status === 'completed' ? 'bg-green-400' :
                  milestone.status === 'in_progress' ? 'bg-blue-400 animate-pulse' :
                  'bg-slate-600'
                )}></div>
                <div className="flex-1 min-w-0">
                  <div className={clsx(
                    'text-sm font-medium',
                    milestone.status === 'completed' ? 'text-white' :
                    milestone.status === 'in_progress' ? 'text-white' :
                    'text-slate-400'
                  )}>
                    {milestone.name}
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                    <div 
                      className={clsx(
                        'h-1 rounded-full transition-all duration-300',
                        milestone.status === 'completed' ? 'bg-green-400' :
                        milestone.status === 'in_progress' ? 'bg-blue-400' :
                        'bg-slate-600'
                      )}
                      style={{ width: `${milestone.progress}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {milestone.progress}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4">
          <h4 className="text-white font-semibold mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 px-3 rounded-lg transition-colors flex items-center space-x-2">
              <FileText size={14} />
              <span>View Documents</span>
            </button>
            <button className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm py-2.5 px-3 rounded-lg transition-colors flex items-center space-x-2">
              <BarChart3 size={14} />
              <span>Progress Report</span>
            </button>
            <button className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm py-2.5 px-3 rounded-lg transition-colors flex items-center space-x-2">
              <Users size={14} />
              <span>Team Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="p-4 border-t border-slate-700">
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-yellow-200 text-sm font-medium">Action Required</div>
              <div className="text-yellow-300 text-xs mt-1">
                Smart contract review needed before deployment
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
