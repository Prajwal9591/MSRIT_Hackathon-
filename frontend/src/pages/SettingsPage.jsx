import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Key,
  Sliders,
  Bell,
  Cpu,
  Save,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Radio,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const SettingsPage = () => {
  const { settings, setSettings, showToast } = useApp();
  const [showApiKey, setShowApiKey] = useState(false);
  const [formData, setFormData] = useState(settings);

  const handleSave = (e) => {
    e.preventDefault();
    setSettings(formData);
    showToast('Configuration & AI Provider settings updated successfully!', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="h-6 w-6 text-cyan-400" /> System Configuration & AI Setup
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure LLM providers, risk thresholds, and CI/CD webhook integrations
          </p>
        </div>

        <Badge variant="low" className="text-xs px-3 py-1">
          Config v2 border locked
        </Badge>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. AI Provider Selection */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <Cpu className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">AI Code Analysis Provider</h3>
              <p className="text-xs text-slate-400">Select model engine used for blast radius synthesis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'Antigravity AI Engine (Default)', name: 'Gemini 3.6 Flash (Antigravity Core)', desc: 'Ultra-low latency, high precision AST traversal & security audit.' },
              { id: 'OpenAI GPT-4o', name: 'OpenAI GPT-4o', desc: 'Standard cloud LLM reasoning engine.' },
              { id: 'Anthropic Claude 3.5 Sonnet', name: 'Claude 3.5 Sonnet', desc: 'Deep architectural code context parsing.' },
              { id: 'Groq Llama-3-70b', name: 'Groq Llama 3 70B', desc: 'Sub-second inference speed for instant pull requests.' }
            ].map((provider) => (
              <label
                key={provider.id}
                onClick={() => setFormData({ ...formData, aiProvider: provider.id })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  formData.aiProvider === provider.id
                    ? 'bg-slate-900 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-100">{provider.name}</span>
                  <input
                    type="radio"
                    name="aiProvider"
                    checked={formData.aiProvider === provider.id}
                    onChange={() => {}}
                    className="accent-cyan-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">{provider.desc}</p>
              </label>
            ))}
          </div>

          {/* API Key Input */}
          <div className="pt-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Provider API Key</label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 rounded-xl pl-9 pr-10 py-2.5 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Analysis Sensitivity & Thresholds */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <Sliders className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">Blast Radius Sensitivity Threshold</h3>
              <p className="text-xs text-slate-400">Configure false-positive filter and call-graph depth</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sensitivity Level</label>
              <select
                value={formData.sensitivityThreshold}
                onChange={(e) => setFormData({ ...formData, sensitivityThreshold: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
              >
                <option value="Strict (High Precision)">Strict (High Precision - Recommended)</option>
                <option value="Balanced">Balanced (Standard Threshold)</option>
                <option value="Permissive">Permissive (Critical Vulnerabilities Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Blast Graph Depth</label>
              <select
                value={formData.maxBlastRadiusDepth}
                onChange={(e) => setFormData({ ...formData, maxBlastRadiusDepth: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
              >
                <option value={2}>2 Layers (Direct Dependents)</option>
                <option value={3}>3 Layers (Microservices & APIs)</option>
                <option value={5}>5 Layers (Full Monorepo Transitive Graph)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Notifications & Webhooks */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <Bell className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">CI/CD & Alert Integrations</h3>
              <p className="text-xs text-slate-400">Automate alerts on high blast radius pull requests</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Auto Scan Pull Requests</span>
                <span className="text-[11px] text-slate-400">Automatically trigger AST scan on GitHub PR open/update</span>
              </div>
              <input
                type="checkbox"
                checked={formData.autoScanPullRequests}
                onChange={(e) => setFormData({ ...formData, autoScanPullRequests: e.target.checked })}
                className="h-4 w-4 accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Slack Webhook Alerts</span>
                <span className="text-[11px] text-slate-400">Dispatch alerts to #sec-alerts when risk score &gt; 70</span>
              </div>
              <input
                type="checkbox"
                checked={formData.notifySlack}
                onChange={(e) => setFormData({ ...formData, notifySlack: e.target.checked })}
                className="h-4 w-4 accent-cyan-500"
              />
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={Save} className="px-6 py-3">
            Save System Settings
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
