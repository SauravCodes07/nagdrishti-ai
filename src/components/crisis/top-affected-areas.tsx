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
        return 'bg-rose-500 text-white font-bold';
      case 'HIGH':
        return 'bg-orange-500 text-white font-bold';
      case 'MEDIUM':
        return 'bg-amber-500 text-white font-bold';
      default:
        return 'bg-emerald-500 text-white font-bold';
    }
  };

  return (
    <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
            <MapPin className="size-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground tracking-tight">
              Top Affected Zones
            </h3>
            <p className="text-xs text-muted-foreground">
              Highest urban flood risk areas in Nagpur
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {sortedZones.map((zone, idx) => (
          <div
            key={zone.id}
            className="p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/60 transition-all flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-6 rounded-full bg-bhagwa/10 text-bhagwa font-bold text-xs flex items-center justify-center font-mono">
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {zone.name} <span className="text-[10px] text-muted-foreground font-normal">({zone.marathiName})</span>
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Elev: {zone.elevation}m • Pop: {(zone.population / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>

              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${getRiskBadge(zone.baselineRisk)}`}>
                {zone.baselineRisk} ({zone.currentRiskScore}%)
              </span>
            </div>

            {/* Progress Bar for Risk */}
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  zone.baselineRisk === 'SEVERE' ? 'bg-rose-500' : zone.baselineRisk === 'HIGH' ? 'bg-orange-500' : 'bg-amber-500'
                }`}
                style={{ width: `${zone.currentRiskScore}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
              <span>🌧️ {zone.rainfallMm} mm</span>
              <span>🚨 {zone.activeIncidents} Incidents</span>
              <span className="font-semibold text-bhagwa">
                Drainage: {zone.drainageCapacity}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
