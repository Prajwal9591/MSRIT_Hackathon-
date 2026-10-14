import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { RecentAnalysisSidebar } from './components/layout/RecentAnalysisSidebar';
import { InPageBackButton } from './components/layout/InPageBackButton';
import { Toast } from './components/common/Toast';
import { GlobalLoadingOverlay } from './components/common/GlobalLoadingOverlay';

import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { ChangeSelectionPage } from './pages/ChangeSelectionPage';
import { AnalysisResultsPage } from './pages/AnalysisResultsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './components/landing/LandingPage';

const AppContent = () => {
  const { activeTab, scrollContainerRef } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage key="landing" />;
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
        return <LandingPage key="landing" />;
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] font-sans selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-250">
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Content Container - Independently scrolls */}
      <div className="flex-1 flex flex-col h-screen h-[100dvh] overflow-hidden relative min-w-0">
        {/* Navbar */}
        <Navbar />

        {/* Dynamic Page Content Viewport - Independent scroll container */}
        <main
          ref={scrollContainerRef}
          id="main-content-viewport"
          className="flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain custom-scrollbar p-3 sm:p-5 md:p-6 lg:p-8 bg-grid-pattern relative min-h-0 touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="max-w-7xl mx-auto pb-12"
            >
              <InPageBackButton />
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Analysis Processing Overlay */}
      <GlobalLoadingOverlay />

      {/* Global Recent Analysis History Sidebar / Drawer */}
      <RecentAnalysisSidebar />

      {/* Global Toast Notification */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

