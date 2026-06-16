import React from 'react';
import { X, Sparkles, ArrowRight, Lock } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureKey: string | null;
  currentPlan: string;
  onUpgradeSuccess: () => void;
  onNavigateToBilling: () => void;
  authFetch: (url: string, opts?: any) => Promise<Response>;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  featureKey,
  currentPlan,
  onNavigateToBilling,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  const getFeatureName = (key: string | null): string => {
    if (!key) return 'Premium Feature';
    const normalized = key.toLowerCase().trim();
    if (normalized === 'reports') return 'Advanced Reports';
    if (normalized === 'voice') return 'AI Voice Agent';
    if (normalized === 'team') return 'Team Members';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const featureName = getFeatureName(featureKey);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" id="upgrade-modal-overlay">
      <div 
        className="relative w-full max-w-md p-6 rounded-3xl border shadow-2xl flex flex-col gap-6"
        style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        id="upgrade-modal-card"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors cursor-pointer"
          id="upgrade-modal-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 pt-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Upgrade Required
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed px-2">
            The feature <span className="text-indigo-400 font-bold">"{featureName}"</span> is exclusive to premium plans. You are currently on the <span className="text-amber-400 font-bold">"{currentPlan}"</span>. Please upgrade to unlock clinical level features.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onNavigateToBilling();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-505 bg-indigo-600/95 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            id="upgrade-modal-action-btn"
          >
            Upgrade Plan
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-950/20 hover:bg-neutral-900 text-xs font-bold text-neutral-400 hover:text-white transition-all cursor-pointer"
            id="upgrade-modal-cancel-btn"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
