import React, { useState } from 'react';
import { CheckCircle2, Circle, ArrowRight, Sparkles, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  tabKey: string;
  completed: boolean;
}

interface OnboardingChecklistProps {
  steps: Step[];
  onToggleStep: (id: number) => void;
  onDismiss: () => void;
  onNavigateTab: (tabKey: string) => void;
}

export default function OnboardingChecklist({ steps, onToggleStep, onDismiss, onNavigateTab }: OnboardingChecklistProps) {
  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('neslead_checklist_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    const nextVal = !isCollapsed;
    setIsCollapsed(nextVal);
    localStorage.setItem('neslead_checklist_collapsed', String(nextVal));
  };

  return (
    <div className="p-6 md:p-8 rounded-3xl border shadow-xl relative overflow-hidden transition-all duration-300" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
      {/* Control Buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <button 
          onClick={toggleCollapse}
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title={isCollapsed ? "Expand Checklist" : "Collapse Checklist"}
        >
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-neutral-400 hover:text-indigo-500" />
          ) : (
            <ChevronUp className="w-4 h-4 text-neutral-400 hover:text-indigo-500" />
          )}
        </button>
        <button 
          onClick={onDismiss}
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Dismiss Checklist"
        >
          <X className="w-4 h-4 text-neutral-400 hover:text-red-500" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-indigo-500">Getting Started</span>
          </div>
          <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Onboarding Checklist</h2>
          {!isCollapsed && (
            <p className="text-sm text-neutral-400">Complete these configuration steps to finalize your AI Admissions Officer setup.</p>
          )}
        </div>

        <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800/50 p-2.5 rounded-2xl min-w-[140px] justify-center border border-neutral-200/25">
          <div className="text-center">
            <div className="text-xl font-black text-indigo-500">{progressPercent}%</div>
            <div className="text-[10px] uppercase font-bold text-neutral-400">Progress</div>
          </div>
          <div className="w-1.5 h-8 bg-neutral-200 dark:bg-neutral-700/50 rounded-full overflow-hidden relative">
            <div className="w-full bg-indigo-500 rounded-full absolute bottom-0 transition-all duration-500" style={{ height: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {steps.map(step => (
            <div 
              key={step.id} 
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${step.completed ? 'bg-indigo-500/[0.02]' : 'hover:scale-[1.01]'}`}
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-3.5">
                <button 
                  onClick={() => onToggleStep(step.id)}
                  className="focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-neutral-400 hover:text-indigo-500" />
                  )}
                </button>
                <span className={`text-sm font-semibold transition-all ${step.completed ? 'line-through text-neutral-400/80 font-normal' : 'text-neutral-200'}`} style={{ color: step.completed ? undefined : 'var(--color-text-primary)' }}>
                  {step.label}
                </span>
              </div>

              <button 
                onClick={() => onNavigateTab(step.tabKey)}
                className="p-2 rounded-xl hover:bg-indigo-500/10 text-indigo-500 transition-all cursor-pointer"
                title="Navigate to configuration"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
