import React, { useState } from 'react';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { Badge } from '../../components/ui/badge';

const AlertsPage: React.FC = () => {
  const { incidents } = useDemoSimulation();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filtered = filterSeverity === 'ALL'
    ? incidents
    : incidents.filter(i => i.severity === filterSeverity);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#E53935] text-white font-mono text-[10px] font-bold">
              CRISIS ALERT CENTER
            </Badge>
            <span className="text-xs text-[#666666] dark:text-gray-400">• NMC Emergency Dispatch Notifications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            System Alerts & Threat Notifications
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Active waterlogging alerts, road damage warnings, and traffic diversion notices across Nagpur.
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1 bg-[#F7F7F7] dark:bg-[#0B1320] p-1 rounded-xl border border-[#E5E5E5] dark:border-white/10">
          {['ALL', 'SEVERE', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterSeverity === sev ? 'bg-[#FFC107] text-[#111111] shadow-2xs font-black' : 'text-[#666666] dark:text-gray-400 hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(item => (
          <div key={item.id} className="bg-white dark:bg-[#111C2E] p-4 rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-2 hover:border-[#FFC107] transition-colors">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded font-mono ${
                  item.severity === 'SEVERE' ? 'bg-[#E53935] text-white' : item.severity === 'HIGH' ? 'bg-[#FF8A00] text-white' : item.severity === 'MEDIUM' ? 'bg-[#FFC107] text-[#111111]' : 'bg-[#22A447] text-white'
                }`}>
                  {item.severity} ({item.riskScore}%)
                </span>
                <h3 className="font-bold text-base text-[#111111] dark:text-white">{item.title}</h3>
              </div>
              <span className="text-xs text-[#666666] dark:text-gray-400 font-mono">{item.reportedTime}</span>
            </div>

            <p className="text-xs text-[#666666] dark:text-gray-400">📍 Location: {item.locationName}</p>

            <p className="text-xs text-[#111111] dark:text-gray-200 bg-[#F7F7F7] dark:bg-[#0B1320] p-2.5 rounded-lg border border-[#E5E5E5] dark:border-white/10">
              {item.description}
            </p>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-[#E5E5E5] dark:border-white/10">
              <span className="font-bold text-[#FF8A00]">
                🤖 Recommended Dispatch: {item.recommendedAction}
              </span>
              <span className="text-[#666666] dark:text-gray-400 font-mono">Assigned: {item.assignedTeam || 'Pending Dispatch'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
