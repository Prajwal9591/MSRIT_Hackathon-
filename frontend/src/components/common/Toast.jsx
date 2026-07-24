import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  const icons = {
    info: <Info className="h-5 w-5 text-cyan-400" />,
    success: <CheckCircle className="h-5 w-5 text-emerald-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    error: <XCircle className="h-5 w-5 text-rose-400" />
  };

  const borders = {
    info: 'border-cyan-500/40 bg-cyan-950/80 text-cyan-200',
    success: 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200',
    warning: 'border-amber-500/40 bg-amber-950/80 text-amber-200',
    error: 'border-rose-500/40 bg-rose-950/80 text-rose-200'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl ${borders[toastMessage.type] || borders.info}`}
      >
        {icons[toastMessage.type] || icons.info}
        <span className="text-sm font-medium">{toastMessage.msg}</span>
      </motion.div>
    </AnimatePresence>
  );
};
