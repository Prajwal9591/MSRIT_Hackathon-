import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, XCircle, X, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Tooltip } from './Tooltip';

export const Toast = () => {
  const { activeToast, dismissToast, toasts } = useApp();
  // Render only the single active notification
  const toast = activeToast || (toasts && toasts.length > 0 ? toasts[0] : null);

  return (
    <div
      id="notification-workflow-root"
      className="fixed bottom-6 right-6 z-50 pointer-events-auto max-w-md w-[calc(100vw-3rem)] sm:w-auto"
      aria-live="polite"
      role="region"
      aria-label="System Notifications & Progress"
    >
      <AnimatePresence mode="wait">
        {toast && (
          <ToastCard
            key={toast.id || toast.msg}
            toast={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ToastCard = ({ toast, onDismiss }) => {
  const isAnalysisReady = toast.msg === 'Analysis Ready';
  const isSuccess = toast.type === 'success' || isAnalysisReady;
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';
  
  // Identify active in-flight progress states vs completed milestones
  const activeProgressStates = [
    'Uploading Repository...',
    'Analyzing Dependencies...',
    'Running Security Scan...',
    'Generating AI Report...'
  ];
  
  const isProgress = toast.type === 'progress' || toast.isProgress || activeProgressStates.includes(toast.msg);

  // Auto-dismiss logic:
  // - Success notifications (including 'Analysis Ready'): automatically dismiss after 2.5 seconds (2–3 seconds requirement)
  // - Standard informational/warning notifications: auto-dismiss after 2.5 seconds
  // - Error notifications: stay visible longer (7 seconds) or until user dismisses
  // - Active progress notifications: do not auto-dismiss on timer, but transition smoothly to next state in the workflow
  useEffect(() => {
    if (isProgress) return;

    const timeoutDuration = isSuccess ? 2500 : isError ? 7000 : 2500;
    const timer = setTimeout(() => {
      onDismiss();
    }, timeoutDuration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.msg, toast.type, isSuccess, isError, isProgress, onDismiss]);

  const getIcon = () => {
    if (isProgress) {
      return <Loader2 className="h-4 w-4 text-cyan-400 animate-spin shrink-0" />;
    }
    if (isSuccess) {
      return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
    }
    if (isError) {
      return <XCircle className="h-4 w-4 text-rose-400 shrink-0" />;
    }
    if (isWarning) {
      return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
    }
    return <Info className="h-4 w-4 text-cyan-400 shrink-0" />;
  };

  const borderStyles = () => {
    if (isProgress) return 'border-cyan-500/50 bg-slate-900/95 text-cyan-100 shadow-cyan-500/15';
    if (isSuccess) return 'border-emerald-500/50 bg-slate-900/95 text-emerald-100 shadow-emerald-500/15';
    if (isError) return 'border-rose-500/60 bg-slate-900/98 text-rose-100 shadow-rose-500/20';
    if (isWarning) return 'border-amber-500/50 bg-slate-900/95 text-amber-100 shadow-amber-500/15';
    return 'border-slate-700 bg-slate-900/95 text-slate-100 shadow-slate-900/50';
  };

  const progressColors = () => {
    if (isSuccess) return 'bg-emerald-500';
    if (isError) return 'bg-rose-500';
    if (isWarning) return 'bg-amber-500';
    return 'bg-cyan-500';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`relative overflow-hidden flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[280px] sm:min-w-[320px] max-w-md ${borderStyles()}`}
    >
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <div className="p-1 rounded-xl bg-slate-800/80 border border-slate-700/50 shrink-0">
          {getIcon()}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-slate-100 truncate">
              {toast.msg}
            </span>
            {isProgress && (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 shrink-0">
                In Progress
              </span>
            )}
            {isSuccess && (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shrink-0">
                Done
              </span>
            )}
          </div>
          {toast.detail && (
            <span className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
              {toast.detail}
            </span>
          )}
        </div>
      </div>

      <Tooltip title="Dismiss" content="Dismiss notification" position="left">
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/90 transition-colors shrink-0 focus:outline-none"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </Tooltip>

      {/* Timer / Progress Bar Indicator */}
      {isProgress ? (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950/80 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-cyan-400 w-full"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          />
        </div>
      ) : (
        <motion.div
          key={toast.id || toast.msg}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: isSuccess ? 2.5 : isError ? 7.0 : 2.5, ease: 'linear' }}
          className={`absolute bottom-0 left-0 h-0.5 ${progressColors()}`}
        />
      )}
    </motion.div>
  );
};
