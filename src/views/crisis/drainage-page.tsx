import React from 'react';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { Badge } from '../../components/ui/badge';

const DrainagePage: React.FC = () => {
  const { zones } = useDemoSimulation();

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#0284C7] text-white font-mono text-[10px] font-bold">
              NAG RIVER BASIN TELEMETRY
            </Badge>
            <span className="text-xs text-[#666666] dark:text-gray-400">• Stormwater Sewer Elevation Profiles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Drainage Capacity & Elevation Grid
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Low-elevation catchment analysis and stormwater canal blockage tracking.
          </p>
        </div>

        <Badge className="bg-[#0284C7] text-white font-extrabold text-xs px-3 py-1 font-mono">
          288m Lowest Catchment Elev
        </Badge>
      </div>

      <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-[#111111] dark:text-white">
          Zone Elevation & Storm Sewer Blockage Index
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {zones.map(z => (
            <div key={z.id} className="p-4 rounded-xl border border-[#E5E5E5] dark:border-white/10 bg-[#F7F7F7] dark:bg-[#0B1320] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#111111] dark:text-white">{z.name}</span>
                <span className="text-xs font-mono font-bold text-[#0284C7] bg-[#0284C7]/10 px-2 py-0.5 rounded">
                  {z.elevation}m Elev
                </span>
              </div>

              <div className="text-xs text-[#666666] dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Drainage Capacity:</span>
                  <span className="font-bold text-[#111111] dark:text-white">{z.drainageCapacity}%</span>
                </div>
                <div className="w-full bg-[#E5E5E5] dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0284C7] rounded-full" style={{ width: `${z.drainageCapacity}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DrainagePage;
