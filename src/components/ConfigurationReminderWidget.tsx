import React, { useState } from 'react';
import { AlertTriangle, Sparkles, ArrowRight, CheckCircle, X, GripHorizontal, Minus, Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';
import { VERTICAL_LABELS } from '../lib/industryPersona';

interface ConfigurationReminderWidgetProps {
  onboarded: boolean;
  tenantProfile: any;
  onResumeWizard: () => void;
  vertical?: string | null;
  onboardingContext?: string | null;
}

export default function ConfigurationReminderWidget({ 
  onboarded, 
  tenantProfile, 
  onResumeWizard,
  vertical,
  onboardingContext
}: ConfigurationReminderWidgetProps) {
  const [dismissed, setDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = React.useRef(false);

  // If they are finished with onboarding or dismissed, do not show any distracting alerts
  if (onboarded || dismissed) return null;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(true);
  };

  if (isMinimized) {
    return (
      <motion.div
        layoutId="config-reminder-card"
        onClick={() => setIsMinimized(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 bg-zinc-950/90 border border-amber-500/30 rounded-full px-4 py-2.5 flex items-center gap-2.5 shadow-2xl backdrop-blur-md cursor-pointer hover:bg-zinc-900 transition-all select-none hover:border-amber-500/50 ring-2 ring-amber-500/10 touch-none"
        id="config-reminder-minimized"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Setup Pending (Click to Restore)
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId="config-reminder-card"
      drag
      dragMomentum={false}
      dragElastic={0.15}
      onDragStart={() => {
        isDraggingRef.current = true;
        setIsDragging(true);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 100);
      }}
      whileDrag={{ scale: 1.03, zIndex: 50, cursor: 'grabbing' }}
      animate={isDragging ? {} : {
        y: [0, -6, 0],
      }}
      transition={{
        y: {
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      onClick={(e) => {
        if (isDraggingRef.current) return;
        onResumeWizard();
      }}
      className="fixed bottom-4 left-4 right-4 sm:right-6 sm:left-auto sm:bottom-6 z-40 max-w-full sm:max-w-sm p-5 pr-10 rounded-2xl border shadow-2xl flex items-start gap-4 cursor-grab active:cursor-grabbing select-none transition-shadow duration-200 group touch-none" 
      style={{ 
        backgroundColor: 'var(--color-bg-card)', 
        borderColor: 'var(--color-border)', 
      }}
      id="config-reminder-card"
    >
      {/* Tiny Drag Handle to visually indicate reposition-ability */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 opacity-40 group-hover:opacity-100 transition-opacity flex items-center justify-center text-neutral-400">
        <GripHorizontal className="w-4 h-3 cursor-grab" />
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {/* Minimize Action */}
        <button
          onClick={handleMinimize}
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/10 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
          aria-label="Minimize message"
          title="Minimize to bubble"
          id="minimize-reminder-btn"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        {/* Close Action */}
        <button
          onClick={handleClose}
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/10 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
          aria-label="Dismiss message"
          title="Dismiss alert"
          id="dismiss-reminder-btn"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl relative shrink-0 mt-1">
        <AlertTriangle className="w-5 h-5 animate-pulse" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <h4 className="text-xs font-black tracking-wider uppercase text-amber-500">Assistant Setup Pending</h4>
          <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-md font-bold tracking-wide uppercase">Draggable</span>
        </div>
        <p className="text-xs text-neutral-400 font-semibold leading-relaxed">
          {vertical && (!onboardingContext || onboardingContext.trim() === '') ? (
            `We detected your industry as ${VERTICAL_LABELS[vertical] || vertical}. Complete your setup to personalize your assistant for ${VERTICAL_LABELS[vertical] || vertical} clients.`
          ) : (
            "Your AI assistant is running on default settings. Complete your setup to personalize it for your business."
          )}
        </p>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onResumeWizard();
          }}
          className="text-[11px] font-black text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 hover:underline text-left mt-1 cursor-pointer"
          id="resume-wizard-btn"
        >
          Resume Setup Assistant
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
