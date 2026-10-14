import React, { useState } from 'react';
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  X,
  Code2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AIInsightsCard = ({ className = '' }) => {
  const { showToast } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'example' | 'fix' | 'tests' | 'generate-tests'
  const [fixApplied, setFixApplied] = useState(false);
  const [testsGenerated, setTestsGenerated] = useState(false);

  const handleGenerateNewInsights = () => {
    setIsGenerating(true);
    showToast('AI analysis engine analyzing AST call-graph patterns...', 'info');
    setTimeout(() => {
      setIsGenerating(false);
      showToast('AI Insights refreshed with latest AST recommendations', 'success');
    }, 850);
  };

  const handleApplyFix = () => {
    setFixApplied(true);
    showToast('Applied dependency injection refactoring patch to AppController.ts', 'success');
    setActiveModal(null);
  };

  const handleGenerateTests = () => {
    setTestsGenerated(true);
    showToast('Generated 8 comprehensive unit tests for AuthService.ts (coverage: 92%)', 'success');
    setActiveModal(null);
  };

  return (
    <div
      id="ai-insights-card"
      className={`bg-[#0c1322] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header with Generate Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#1e293b]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#818cf8]" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              AI Insights
            </h2>
          </div>

          <button
            id="btn-generate-insights"
            type="button"
            onClick={handleGenerateNewInsights}
            disabled={isGenerating}
            className="bg-[#101a2e] hover:bg-[#182745] active:bg-[#1e3259] border border-[#3730a3] text-xs font-medium text-[#c7d2fe] hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer shadow-sm"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#818cf8] ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Generate New Insights'}</span>
          </button>
        </div>

        {/* Insight Cards List */}
        <div className="mt-4 space-y-3.5">
          {/* Card 1: Potential Refactoring Opportunity */}
          <div className="bg-[#0b1220] border border-[#1e293b] rounded-xl p-4 transition-all hover:border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3d270c] border border-[#78350f] text-[#f59e0b] flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 fill-[#f59e0b]/20" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-semibold text-white">
                    Potential Refactoring Opportunity
                  </h3>
                  <span className="border border-[#78350f] bg-[#291807] text-[#fbbf24] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Medium Impact
                  </span>
                </div>

                <p className="text-xs text-[#94a3b8] mt-1.5 leading-relaxed">
                  The AppController has high coupling with multiple services. Consider using dependency injection to reduce direct dependencies.
                </p>

                {/* Actions */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal('example')}
                    className="text-xs font-medium text-[#cbd5e1] hover:text-white bg-[#131d33] hover:bg-[#1a2745] border border-[#233554] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    View Example
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal('fix')}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      fixApplied
                        ? 'bg-[#06261f] text-[#34d399] border-[#065f46]'
                        : 'bg-[#1e293b] hover:bg-[#334155] text-white border-[#334155]'
                    }`}
                  >
                    {fixApplied ? 'Fix Applied ✓' : 'Apply Fix'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Improve Test Coverage */}
          <div className="bg-[#0b1220] border border-[#1e293b] rounded-xl p-4 transition-all hover:border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2a1b4e] border border-[#4c1d95] text-[#a855f7] flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-semibold text-white">
                    Improve Test Coverage
                  </h3>
                  <span className="border border-[#065f46] bg-[#06261f] text-[#34d399] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Low Impact
                  </span>
                </div>

                <p className="text-xs text-[#94a3b8] mt-1.5 leading-relaxed">
                  AuthService.ts is missing unit tests. Current test coverage is 65%.
                </p>

                {/* Actions */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal('tests')}
                    className="text-xs font-medium text-[#cbd5e1] hover:text-white bg-[#131d33] hover:bg-[#1a2745] border border-[#233554] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    View Tests
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal('generate-tests')}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      testsGenerated
                        ? 'bg-[#06261f] text-[#34d399] border-[#065f46]'
                        : 'bg-[#06261f] hover:bg-[#0b382d] text-[#34d399] hover:text-[#6ee7b7] border-[#065f46]'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{testsGenerated ? 'Tests Generated (92%) ✓' : 'Generate Tests'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modals for View Example / Apply Fix / View Tests / Generate Tests */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0c1527] border border-[#1e293b] rounded-2xl p-5 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                {activeModal === 'example' && 'Refactoring Example: Dependency Injection'}
                {activeModal === 'fix' && 'Apply Dependency Injection Refactor'}
                {activeModal === 'tests' && 'Current Test Coverage (AuthService.ts)'}
                {activeModal === 'generate-tests' && 'AI Unit Test Generator'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#16233d]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 text-xs text-slate-300 space-y-3">
              {activeModal === 'example' && (
                <>
                  <p className="text-slate-400">
                    Replace direct singleton imports with constructor injection to decouple <code className="text-cyan-300">AppController</code> from <code className="text-cyan-300">AuthService</code> and <code className="text-cyan-300">UserService</code>:
                  </p>
                  <pre className="p-3 rounded-xl bg-[#070d19] border border-[#172540] font-mono text-[11px] text-slate-200 overflow-x-auto">
{`// Before: Direct Coupling
class AppController {
  private auth = new AuthService();
}

// After: Injected Dependency
export class AppController {
  constructor(
    @Inject() private readonly authService: IAuthService,
    @Inject() private readonly userService: IUserService
  ) {}
}`}
                  </pre>
                </>
              )}

              {activeModal === 'fix' && (
                <>
                  <p className="text-slate-400">
                    Applying this automated refactoring will modify <code className="text-cyan-300">src/api/controller/AppController.ts</code> to accept injected instances of <code className="text-cyan-300">AuthService</code> and reduce its blast radius coupling score from <strong>78</strong> to <strong>24</strong>.
                  </p>
                  <div className="p-3 rounded-xl bg-[#06261f] border border-[#065f46] text-[#6ee7b7] text-[11px]">
                    ✓ No breaking public API signature modifications detected.
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyFix}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                    >
                      Confirm & Apply Fix
                    </button>
                  </div>
                </>
              )}

              {activeModal === 'tests' && (
                <>
                  <p className="text-slate-400">
                    Test suites for <code className="text-cyan-300">AuthService.ts</code>:
                  </p>
                  <div className="space-y-1.5">
                    <div className="p-2 rounded-lg bg-[#070d19] border border-[#172540] flex justify-between items-center">
                      <span>test/unit/auth/token.spec.ts</span>
                      <span className="text-[#34d399] font-bold">PASS (4/4)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#070d19] border border-[#172540] flex justify-between items-center">
                      <span>test/unit/auth/rbac.spec.ts</span>
                      <span className="text-[#fbbf24] font-bold">MISSING (0/6)</span>
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'generate-tests' && (
                <>
                  <p className="text-slate-400">
                    Generate Jest unit test suites for edge cases, token expiration, and API key validation.
                  </p>
                  <div className="p-3 rounded-xl bg-[#070d19] border border-[#172540] font-mono text-[11px] text-cyan-300">
                    + describe('AuthService', () =&gt; &#123; it('should invalidate expired API keys', ...) &#125;)
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateTests}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                    >
                      Generate 8 Test Cases
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
