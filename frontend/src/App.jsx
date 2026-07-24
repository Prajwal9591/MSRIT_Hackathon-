import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Toast } from './components/common/Toast';

import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { ChangeSelectionPage } from './pages/ChangeSelectionPage';
import { AnalysisResultsPage } from './pages/AnalysisResultsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent = () => {
  const { activeTab } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage key="dashboard" />;
      case 'upload':
        return <UploadPage key="upload" />;
      case 'change-selection':
        return <ChangeSelectionPage key="change-selection" />;
      case 'analysis-results':
        return <AnalysisResultsPage key="analysis-results" />;
      case 'settings':
        return <SettingsPage key="settings" />;
      default:
        return <DashboardPage key="dashboard" />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f17] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Navbar */}
        <Navbar />

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-grid-pattern relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto pb-12"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Toast Notification */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
