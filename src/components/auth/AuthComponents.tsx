import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  onSettingsClick: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  onSettingsClick
}) => {
  return (
    <div className="flex items-center gap-2 "> 
      <button
        onClick={onSettingsClick}
        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
        title="Settings"
      >
        <SettingsIcon className="w-4 h-4"/>
      </button>
    </div>
  );
};

interface OnboardingTooltipProps {
  isVisible: boolean;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  onNext?: () => void;
  onSkip?: () => void;
  step?: number;
  totalSteps?: number;
  targetElement?: HTMLElement | null;
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  isVisible,
  title,
  description,
  position,
  onNext,
  onSkip,
  step = 1,
  totalSteps = 5,
  targetElement
}) => {
  if (!isVisible) return null;

  // Position tooltip relative to target element if available
  const getTooltipStyle = () => {
    if (!targetElement) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const tooltipOffset = 16;

    switch (position) {
      case 'right':
        return {
          position: 'fixed' as const,
          left: rect.right + tooltipOffset,
          top: rect.top + rect.height / 2,
          transform: 'translateY(-50%)',
          zIndex: 60
        };
      case 'left':
        return {
          position: 'fixed' as const,
          right: window.innerWidth - rect.left + tooltipOffset,
          top: rect.top + rect.height / 2,
          transform: 'translateY(-50%)',
          zIndex: 60
        };
      case 'bottom':
        return {
          position: 'fixed' as const,
          left: rect.left + rect.width / 2,
          top: rect.bottom + tooltipOffset,
          transform: 'translateX(-50%)',
          zIndex: 60
        };
      case 'top':
        return {
          position: 'fixed' as const,
          left: rect.left + rect.width / 2,
          bottom: window.innerHeight - rect.top + tooltipOffset,
          transform: 'translateX(-50%)',
          zIndex: 60
        };
      default:
        return {
          position: 'fixed' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 60
        };
    }
  };

  return (
    <div style={getTooltipStyle()}>
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-xl max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white font-medium text-sm">{title}</h4>
          <span className="text-xs text-slate-400">{step}/{totalSteps}</span>
        </div>
        <p className="text-slate-300 text-xs mb-3">{description}</p>
        <div className="flex gap-2">
          {onNext && (
            <button
              onClick={onNext}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
            >
              Next
            </button>
          )}
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-3 py-1 text-slate-400 hover:text-white text-xs"
            >
              Skip Tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface OnboardingManagerProps {
  isActive: boolean;
  onComplete: () => void;
}

export const OnboardingManager: React.FC<OnboardingManagerProps> = ({
  isActive,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  const steps = [
    {
      id: 'sidebar',
      title: 'AI Agents',
      description: 'These are your specialized AI agents. Each handles different aspects of tokenization.',
      selector: '[data-onboarding="sidebar"]',
      position: 'right' as const
    },
    {
      id: 'chat',
      title: 'Chat Interface',
      description: 'Communicate with your AI agents here. They will help you through the entire process.',
      selector: '[data-onboarding="chat"]',
      position: 'left' as const
    },
    {
      id: 'project-panel',
      title: 'Project Tracking',
      description: 'Monitor your tokenization progress and see what each agent is working on.',
      selector: '[data-onboarding="project"]',
      position: 'left' as const
    },
    {
      id: 'new-project',
      title: 'Start a Project',
      description: 'Click here to begin tokenizing your first asset.',
      selector: '[data-onboarding="new-project"]',
      position: 'top' as const
    }
  ];

  useEffect(() => {
    if (isActive && currentStep < steps.length) {
      const currentStepData = steps[currentStep];
      const element = document.querySelector(currentStepData.selector) as HTMLElement;
      setTargetElement(element);
    }
  }, [isActive, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (!isActive || currentStep >= steps.length) return null;

  const currentStepData = steps[currentStep];

  return (
    <>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-30 z-50" onClick={handleComplete} />

      {/* Highlight the target element */}
      {targetElement && (
        <div
          style={{
            position: 'fixed',
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            zIndex: 55,
            pointerEvents: 'none'
          }}
        />
      )}

      <OnboardingTooltip
        isVisible={true}
        title={currentStepData.title}
        description={currentStepData.description}
        position={currentStepData.position}
        onNext={handleNext}
        onSkip={handleComplete}
        step={currentStep + 1}
        totalSteps={steps.length}
        targetElement={targetElement}
      />
    </>
  );
};
