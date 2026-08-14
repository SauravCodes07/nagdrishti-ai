import React from 'react';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { MapPin } from 'lucide-react';

export const TopAffectedAreas: React.FC = () => {
  const { zones } = useDemoSimulation();

  // Sort zones by currentRiskScore descending
  const sortedZones = [...zones].sort((a, b) => b.currentRiskScore - a.currentRiskScore).slice(0, 5);

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'SEVERE':
        return 'bg-[#E53935] text-white font-bold';
      case 'HIGH':
        return 'bg-[#FF8A00] text-white font-bold';
      case 'MEDIUM':
        return 'bg-[#FFC107] text-[#111111] font-bold';
      default:
        return 'bg-[#22A447] text-white font-bold';
    }
  };

  return (
    <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-4 sm:p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#E53935]/10 text-[#E53935]">
            <MapPin className="size-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#111111] dark:text-white tracking-tight">
              Top Affected Zones
            </h3>
            <p className="text-xs text-[#666666] dark:text-gray-400">
              Highest urban flood risk areas in Nagpur
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {sortedZones.map((zone, idx) => (
          <div
            key={zone.id}
            className="p-3 rounded-xl border border-[#E5E5E5] dark:border-white/10 bg-white dark:bg-[#0B1320] hover:border-[#FFC107] transition-all flex flex-col gap-2 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-6 rounded-full bg-[#FFF8E1] dark:bg-[#FFC107]/20 text-[#111111] dark:text-[#FFC107] border border-[#FFC107] font-bold text-xs flex items-center justify-center font-mono">
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#111111] dark:text-white">
                    {zone.name} <span className="text-[10px] text-[#666666] dark:text-gray-400 font-normal">({zone.marathiName})</span>
                  </h4>
                  <p className="text-[10px] text-[#666666] dark:text-gray-400">
                    Elev: {zone.elevation}m • Pop: {(zone.population / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>

              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${getRiskBadge(zone.baselineRisk)}`}>
                {zone.baselineRisk} ({zone.currentRiskScore}%)
              </span>
            </div>

            {/* Progress Bar for Risk */}
            <div className="w-full bg-[#F7F7F7] dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  zone.baselineRisk === 'SEVERE' ? 'bg-[#E53935]' : zone.baselineRisk === 'HIGH' ? 'bg-[#FF8A00]' : 'bg-[#FFC107]'
                }`}
                style={{ width: `${zone.currentRiskScore}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#666666] dark:text-gray-400 pt-1 border-t border-[#E5E5E5] dark:border-white/10">
              <span>🌧️ {zone.rainfallMm} mm</span>
              <span>🚨 {zone.activeIncidents} Incidents</span>
              <span className="font-semibold text-[#FF8A00]">
                Drainage: {zone.drainageCapacity}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
