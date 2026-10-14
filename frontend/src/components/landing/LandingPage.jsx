import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Cpu,
  Layers,
  TestTube2,
  Users,
  CheckCircle2,
  GitBranch,
  ArrowRight,
  Zap,
  Activity,
  Code2,
  Network
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';

export const LandingPage = () => {
  const { setActiveTab, runAnalysis, selectedRepo } = useApp();

  const handleAnalyzeClick = () => {
    runAnalysis();
    setActiveTab('dashboard');
  };

  const questionsAnswered = [
    {
      question: 'Which modules depend on this component?',
      answer: 'AST call-graph engines trace direct (L1), middleware (L2), and database (L3) callers across your entire repository.',
      icon: Network,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/30'
    },
    {
      question: 'Which services break if I change this API?',
      answer: 'Cross-service API contract validation detects broken REST endpoints, gRPC payloads, and GraphQL schemas before merge.',
      icon: Layers,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/30'
    },
    {
      question: 'What tests should I run?',
      answer: 'Precision test suite pruning identifies the exact unit, integration, and E2E specs affected by your git diff.',
      icon: TestTube2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30'
    },
    {
      question: 'Which teams are affected?',
      answer: 'CODEOWNERS parsing and git blame analysis map every downstream file to the responsible engineering squad.',
      icon: Users,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30'
    },
    {
      question: 'How risky is this change?',
      answer: 'Algorithmic blast-radius risk scoring (0–100) paired with Gemini 2.5 AI explanations of concurrency and data risks.',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30'
    }
  ];

  const outcomes = [
    {
      title: 'Dependency & Blast-Radius Insight',
      description:
        'Complete visibility into how a single component change propagates through services, APIs, libraries, applications, CI/CD pipelines, and customer-facing features.',
      icon: Activity,
      badge: 'Multi-Tier Graph'
    },
    {
      title: 'Recommended Tests to Run',
      description:
        'Eliminate blind full-suite runs. Run only the tests that cover affected code paths, reducing CI pipeline execution time while guaranteeing regression safety.',
      icon: TestTube2,
      badge: 'CI/CD Optimized'
    },
    {
      title: 'Affected-Teams Awareness',
      description:
        'Automatically notify downstream owners before breaking changes reach staging. Prevent cross-team friction with clear blast-radius ownership reports.',
      icon: Users,
      badge: 'Zero Surprises'
    }
  ];

  return (
    <div className="w-full min-h-[calc(100dvh-7rem)] flex flex-col items-center justify-center py-6 sm:py-10 px-2 sm:px-6 lg:px-8">
      {/* Hero Section Centered Inside the Root Div */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl mx-auto text-center space-y-8"
      >
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-semibold shadow-lg shadow-cyan-500/10">
          <Zap className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span>AegisBlast AI — Next-Generation Blast-Radius & Code Impact Platform</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 leading-tight">
            Map The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-rose-400">Ripple Effect</span> of Every Code Change
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Modern software is highly interconnected. A small change in a shared component can ripple across services,
            APIs, libraries, applications, CI/CD pipelines, test suites, and customer-facing features.
            Developers struggle to answer what depends on a component, what breaks if an API changes, what to test,
            who is affected, and how risky the change is.
          </p>
        </div>

        {/* Analyze Code Action Button Centered */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button
            onClick={handleAnalyzeClick}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto px-8 py-4 text-base font-bold shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-3 group"
          >
            <Cpu className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            <span>Analyze Code</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            onClick={() => setActiveTab('change-selection')}
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto px-6 py-4 text-base font-semibold border-slate-700 hover:border-slate-500"
          >
            <GitBranch className="h-5 w-5 text-slate-400" />
            <span>Select PR / Commit</span>
          </Button>
        </div>

        {/* Active Repository Pill */}
        {selectedRepo && (
          <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-slate-800">
            <Code2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Ready to analyze repository: <strong className="text-slate-200">{selectedRepo.owner}/{selectedRepo.name}</strong> ({selectedRepo.branch || 'main'})</span>
          </div>
        )}
      </motion.div>

      {/* The Challenge Section: 5 Core Questions Answered */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="w-full max-w-6xl mx-auto mt-16 space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            The Challenge: Answering The 5 Hardest Engineering Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            For any given code change, AegisBlast AI computes deterministic AST dependency graphs and AI risk explanations to answer:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4">
          {questionsAnswered.map((q, idx) => {
            const IconComponent = q.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl glass-card border ${q.bg} space-y-3 transition-all hover:translate-y-[-2px]`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 ${q.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                    Q0{idx + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 leading-snug">
                  {q.question}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {q.answer}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Expected Outcomes Section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="w-full max-w-6xl mx-auto mt-16 pt-10 border-t border-slate-800/80 space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Expected Outcomes & Architectural Pillars
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Deliver confidence across your entire development lifecycle with three core automated outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {outcomes.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-cyan-500/40 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {item.badge}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-100">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verified by AST & AI</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Footer Callout */}
      <div className="w-full max-w-4xl mx-auto mt-16 pt-8 border-t border-slate-800/50 text-center">
        <p className="text-xs text-slate-500 font-mono">
          AegisBlast AI Platform — Protecting Shared Components across Microservices, APIs, CI/CD, and Customer-Facing Features.
        </p>
      </div>
    </div>
  );
};
