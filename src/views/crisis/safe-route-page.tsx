import React, { useState } from 'react';
import { PREDEFINED_LOCATIONS } from '../../data/crisis/safe-routes-data';
import { calculateSafeRoutes } from '../../services/routing/predictiveRoutingService';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { Navigation, AlertTriangle, CheckCircle2, Clock, Car, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';

const SafeRoutePage: React.FC = () => {
  const { currentRainfallMm } = useDemoSimulation();
  const [origin, setOrigin] = useState('airport');
  const [destination, setDestination] = useState('civil_lines');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');

  const routeResult = calculateSafeRoutes(origin, destination, currentRainfallMm);
  const routes = routeResult.routes;

  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#FFC107] text-[#111111] font-mono text-[10px] font-black">
              CIVIC SAFE NAVIGATION
            </Badge>
            <span className="text-xs font-mono font-bold text-emerald-600">
              [SAFETY SCORE ENGINE]
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            AI Safe Route Planner
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Evaluates routes dynamically by factoring waterlogged underpasses, active construction choke points, and pothole severity during rainfall.
          </p>
        </div>

        <div className="text-right text-xs text-[#666666] dark:text-gray-400">
          <span className="font-bold text-[#FF8A00]">Active Rainfall: {currentRainfallMm} mm</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input & Route Options selection */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-4 sm:p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#111111] dark:text-white flex items-center gap-2">
              <Navigation className="size-5 text-[#FF8A00]" /> Route Parameters
            </h3>

            <div>
              <label className="text-xs font-bold text-[#111111] dark:text-white block mb-1">
                Start Location (Origin)
              </label>
              <select
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[#E5E5E5] dark:border-white/10 bg-white dark:bg-[#0B1320] text-xs font-medium text-[#111111] dark:text-white focus:ring-1 focus:ring-[#FF8A00]"
              >
                {PREDEFINED_LOCATIONS.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    📍 {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#111111] dark:text-white block mb-1">
                Destination Location
              </label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[#E5E5E5] dark:border-white/10 bg-white dark:bg-[#0B1320] text-xs font-medium text-[#111111] dark:text-white focus:ring-1 focus:ring-[#FF8A00]"
              >
                {PREDEFINED_LOCATIONS.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    🎯 {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <Button className="w-full bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold h-11 text-xs gap-2 cursor-pointer">
              <Navigation className="size-4" /> Recalculate AI Safe Routes
            </Button>
          </div>

          {/* Route Options List */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#111111] dark:text-white">
              Calculated Route Options ({routes.length})
            </h3>

            {routes.map(r => {
              const isSelected = (selectedRouteId || routes[0].id) === r.id;
              const isRecommended = r.type === 'RECOMMENDED_SAFE';

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRouteId(r.id)}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-[#111C2E] flex flex-col gap-2 shadow-2xs",
                    isSelected ? "border-[#FF8A00] ring-1 ring-[#FF8A00] shadow-xs" : "border-[#E5E5E5] dark:border-white/10 hover:border-[#FFC107]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded border font-bold",
                      isRecommended ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : r.type === 'FASTEST_DIRECT' ? "bg-rose-500/10 text-rose-600 border-rose-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    )}>
                      {isRecommended ? 'RECOMMENDED SAFE' : r.type === 'FASTEST_DIRECT' ? 'DIRECT (HAZARDOUS)' : 'ALTERNATIVE'}
                    </span>
                    <span className="text-xs font-bold text-[#111111] dark:text-white font-mono">
                      Safety: {r.safetyScore}/100
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-[#111111] dark:text-white mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5 text-[#666666] dark:text-gray-400" /> {r.etaMinutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="size-3.5 text-[#666666] dark:text-gray-400" /> {r.distanceKm} km
                    </span>
                    <span className={cn("font-mono", r.waterloggingRiskPct > 40 ? "text-[#E53935]" : "text-emerald-600")}>
                      Flood: {r.waterloggingRiskPct}%
                    </span>
                  </div>

                  <p className="text-[11px] text-[#666666] dark:text-gray-400 line-clamp-1">
                    Via: {r.viaRoads.join(' → ')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Route Detail Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-white/10 pb-3">
              <div>
                <span className={cn(
                  "text-xs font-mono px-2.5 py-1 rounded border font-bold",
                  activeRoute.type === 'RECOMMENDED_SAFE' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                )}>
                  {activeRoute.title}
                </span>
                <h2 className="text-lg font-bold text-[#111111] dark:text-white mt-2">
                  {routeResult.originName} → {routeResult.destinationName}
                </h2>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black text-foreground font-mono">
                  {activeRoute.safetyScore}
                  <span className="text-xs text-muted-foreground font-normal"> /100</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  Safety Index
                </span>
              </div>
            </div>

            {/* AI Explanation Banner */}
            <div className="p-3.5 rounded-xl bg-[#FFF8E1] dark:bg-[#FFC107]/10 border border-[#FFC107]/30 text-xs">
              <div className="flex items-center gap-1.5 text-[#FF8A00] font-bold mb-1">
                <Sparkles className="size-4" />
                <span>AI Safety Analysis & Rationale</span>
              </div>
              <p className="text-xs text-[#111111] dark:text-gray-200 leading-relaxed font-medium">
                {activeRoute.aiReasoning}
              </p>
            </div>

            {/* Risk Breakdown Progress Bars */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-muted/30 text-xs">
              <div>
                <span className="text-muted-foreground text-[10px] block mb-1">Waterlogging Risk</span>
                <span className="font-bold text-rose-600 font-mono text-sm">{activeRoute.waterloggingRiskPct}%</span>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${activeRoute.waterloggingRiskPct}%` }} />
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-[10px] block mb-1">Traffic Congestion</span>
                <span className="font-bold text-amber-600 font-mono text-sm">{activeRoute.trafficCongestionPct}%</span>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${activeRoute.trafficCongestionPct}%` }} />
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-[10px] block mb-1">Pothole Surface Index</span>
                <span className="font-bold text-orange-600 font-mono text-sm">{activeRoute.potholeRiskPct}%</span>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${activeRoute.potholeRiskPct}%` }} />
                </div>
              </div>
            </div>

            {/* Route Highlights */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Route AI Safety Highlights
              </h4>
              {activeRoute.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            {/* Route Warnings */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Hazard Warnings
              </h4>
              {activeRoute.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeRoutePage;
