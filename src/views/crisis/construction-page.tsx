import React, { useState } from 'react';
import { NAGPUR_CONSTRUCTION_PROJECTS } from '../../services/construction/constructionService';
import { MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ConstructionPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredProjects = NAGPUR_CONSTRUCTION_PROJECTS.filter(p => {
    if (filterStatus === 'ALL') return true;
    return p.status === filterStatus;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFC107] text-[#111111]">
              YEAR-ROUND URBAN INTELLIGENCE
            </span>
            <span className="text-xs font-bold text-[#FF8A00] font-mono">
              [CIVIL WORKS & METRO EXPANSIONS]
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Year-Round Construction & Infrastructure Registry
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            24/7 continuous monitoring of Maha Metro Phase 2, NHAI flyovers, and PWD road widening projects across Nagpur.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#F7F7F7] dark:bg-[#0B1320] p-1.5 rounded-xl border border-[#E5E5E5] dark:border-white/10">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              filterStatus === 'ALL' ? "bg-[#FF8A00] text-white shadow-xs" : "text-[#666666] dark:text-gray-400"
            )}
          >
            All ({NAGPUR_CONSTRUCTION_PROJECTS.length})
          </button>
          <button
            onClick={() => setFilterStatus('ACTIVE')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              filterStatus === 'ACTIVE' ? "bg-[#FF8A00] text-white shadow-xs" : "text-[#666666] dark:text-gray-400"
            )}
          >
            Active (4)
          </button>
          <button
            onClick={() => setFilterStatus('PLANNED')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              filterStatus === 'PLANNED' ? "bg-[#FF8A00] text-white shadow-xs" : "text-[#666666] dark:text-gray-400"
            )}
          >
            Planned (1)
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-3 hover:border-[#FFC107] transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFF8E1] dark:bg-[#FFC107]/20 text-[#111111] dark:text-white border border-[#FFC107]/40">
                {p.type.replace('_', ' ')}
              </span>

              <span
                className={cn(
                  "text-[9px] font-mono font-bold px-2 py-0.5 rounded",
                  p.trafficImpact === 'SEVERE'
                    ? "bg-[#E53935] text-white"
                    : p.trafficImpact === 'HIGH'
                    ? "bg-[#FF8A00] text-white"
                    : "bg-[#22A447] text-white"
                )}
              >
                {p.trafficImpact} TRAFFIC IMPACT
              </span>
            </div>

            <h3 className="font-bold text-base text-[#111111] dark:text-white leading-snug">
              {p.projectName}
            </h3>

            <p className="text-xs text-[#666666] dark:text-gray-300 flex items-center gap-1">
              <MapPin className="size-3.5 text-[#FF8A00] shrink-0" />
              <span>{p.locationName}</span>
            </p>

            <div className="p-3 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] text-xs space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#666666] dark:text-gray-400">Executing Agency:</span>
                <span className="font-bold text-[#111111] dark:text-white">{p.executingAgency}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#666666] dark:text-gray-400">Lane Status:</span>
                <span className="font-bold text-[#FF8A00]">{p.laneClosures}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#666666] dark:text-gray-400">Timeline:</span>
                <span className="font-mono text-[#111111] dark:text-white">{p.startDate} → {p.expectedEndDate}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-medium">
              💡 <strong>Detour Advice:</strong> {p.detourAdvice}
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#666666] dark:text-gray-400 pt-1 border-t border-[#E5E5E5] dark:border-white/5">
              <span>Source: {p.source} ({p.confidenceScorePct}%)</span>
              <span>Updated: {p.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConstructionPage;
