import React from 'react';
import { FileCode, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const KeyFilesCard = ({ className = '' }) => {
  const { setActiveTab, setSelectedFile, showToast } = useApp();

  const keyFiles = [
    {
      path: 'src/api/controller/AppController.ts',
      lines: 248,
      risk: 'High',
      riskBadgeClass: 'bg-[#450a0a] border border-[#7f1d1d] text-[#f87171]'
    },
    {
      path: 'src/services/AuthService.ts',
      lines: 186,
      risk: 'Medium',
      riskBadgeClass: 'bg-[#291807] border border-[#78350f] text-[#fbbf24]'
    },
    {
      path: 'src/repositories/UserRepository.ts',
      lines: 142,
      risk: 'Low',
      riskBadgeClass: 'bg-[#06261f] border border-[#065f46] text-[#34d399]'
    },
    {
      path: 'src/config/index.ts',
      lines: 98,
      risk: 'Low',
      riskBadgeClass: 'bg-[#06261f] border border-[#065f46] text-[#34d399]'
    },
    {
      path: 'src/models/User.ts',
      lines: 76,
      risk: 'Low',
      riskBadgeClass: 'bg-[#06261f] border border-[#065f46] text-[#34d399]'
    }
  ];

  const handleFileClick = (file) => {
    if (setSelectedFile) {
      setSelectedFile({
        path: file.path,
        name: file.path.split('/').pop(),
        lines: file.lines,
        risk: file.risk
      });
    }
    showToast(`Selected file: ${file.path}`, 'info');
  };

  return (
    <div
      id="key-files-card"
      className={`bg-[#0c1322] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#1e293b]">
          <FileCode className="w-5 h-5 text-[#38bdf8]" />
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Key Files
          </h2>
        </div>

        {/* Table */}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#64748b] text-[11px] font-medium border-b border-[#1e293b]/70">
                <th className="pb-2.5 font-medium">File</th>
                <th className="pb-2.5 font-medium px-3 text-center">Lines</th>
                <th className="pb-2.5 font-medium text-right">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172540]/60">
              {keyFiles.map((file) => (
                <tr
                  key={file.path}
                  onClick={() => handleFileClick(file)}
                  className="hover:bg-[#101c33] transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 pr-2 font-mono text-slate-300 group-hover:text-cyan-300 truncate max-w-[190px] sm:max-w-[240px]">
                    {file.path}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-center">
                    {file.lines}
                  </td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block ${file.riskBadgeClass}`}
                    >
                      {file.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-4 pt-3 border-t border-[#1e293b]/70">
        <button
          type="button"
          onClick={() => setActiveTab('change-selection')}
          className="text-xs font-semibold text-[#38bdf8] hover:text-[#7dd3fc] flex items-center justify-end gap-1 w-full transition-colors cursor-pointer"
        >
          <span>View all files</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
