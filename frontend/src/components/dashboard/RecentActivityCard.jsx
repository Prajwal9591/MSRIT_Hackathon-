import React, { useState } from 'react';
import { Clock, ArrowRight, X } from 'lucide-react';

export const RecentActivityCard = ({ className = '' }) => {
  const [showAllModal, setShowAllModal] = useState(false);

  const activities = [
    {
      id: 'act-1',
      time: '2 hours ago',
      event: 'Repository Analyzed',
      details: 'Successfully analyzed 100 files',
      status: 'Success'
    },
    {
      id: 'act-2',
      time: '2 hours ago',
      event: 'Security Scan',
      details: 'No vulnerabilities found',
      status: 'Success'
    },
    {
      id: 'act-3',
      time: '3 hours ago',
      event: 'Code Quality Analysis',
      details: 'Maintainability score: 85/100',
      status: 'Success'
    },
    {
      id: 'act-4',
      time: '4 hours ago',
      event: 'Repository Synced',
      details: 'Fetched latest changes from main',
      status: 'Success'
    }
  ];

  const extendedActivities = [
    ...activities,
    { id: 'act-5', time: '1 day ago', event: 'Branch Merged', details: 'Merged PR #12 into main', status: 'Success' },
    { id: 'act-6', time: '2 days ago', event: 'Dependency Check', details: 'Updated typescript to 5.4.2', status: 'Success' }
  ];

  return (
    <div
      id="recent-activity-card"
      className={`bg-[#0c1322] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#1e293b]">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-[#38bdf8]" />
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Recent Activity
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowAllModal(true)}
          className="text-xs font-semibold text-[#38bdf8] hover:text-[#7dd3fc] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[#64748b] text-[11px] font-medium border-b border-[#1e293b]/70">
              <th className="pb-2.5 font-medium">Time</th>
              <th className="pb-2.5 font-medium px-4">Event</th>
              <th className="pb-2.5 font-medium px-4">Details</th>
              <th className="pb-2.5 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#172540]/60">
            {activities.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-[#101c33] transition-colors"
              >
                <td className="py-3 text-slate-400 font-mono whitespace-nowrap">
                  {item.time}
                </td>
                <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                  {item.event}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {item.details}
                </td>
                <td className="py-3 text-right whitespace-nowrap">
                  <span className="border border-[#065f46] bg-[#06261f] text-[#34d399] text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View All Modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0c1527] border border-[#1e293b] rounded-2xl p-5 max-w-xl w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#38bdf8]" />
                All Audit Activity Logs
              </h3>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#16233d]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
              {extendedActivities.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#070d19] border border-[#172540] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{log.event}</div>
                    <div className="text-slate-400 mt-0.5">{log.details}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-slate-500 font-mono text-[10px]">{log.time}</div>
                    <span className="text-[#34d399] text-[10px] font-bold">Success</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
