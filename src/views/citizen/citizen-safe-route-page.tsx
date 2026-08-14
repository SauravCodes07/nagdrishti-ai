import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Clock, AlertTriangle, CheckCircle2, Car, Sparkles, Compass } from 'lucide-react';
import { PREDEFINED_LOCATIONS } from '../../data/crisis/safe-routes-data';
import { calculateSafeRoutes } from '../../services/routing/predictiveRoutingService';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

export const CitizenSafeRoutePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialOrigin = searchParams.get('origin') || 'airport';
  const initialDest = searchParams.get('destination') || 'civil_lines';

  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDest);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');

  const routeResult = calculateSafeRoutes(origin, destination, 38);
  const routes = routeResult.routes;

  useEffect(() => {
    if (routes.length > 0) {
      setSelectedRouteId(routes[0].id);
    }
  }, [origin, destination]);

  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111C2E] p-4 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFC107] text-[#111111]">
              AI PREDICTIVE SAFE ROUTING
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Find Your Safest Route
          </h1>
          <p className="text-[11px] text-[#666666] dark:text-gray-400">
            Calculates safety scores by analyzing live rainfall, waterlogging, active construction, and potholes.
          </p>
        </div>

        {/* Origin / Destination Pickers */}
        <div className="grid grid-cols-1 gap-2.5 pt-1">
          <div>
            <label className="text-[10px] font-bold text-[#666666] dark:text-gray-400 uppercase tracking-wider block mb-1">
              Start Location (Origin)
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E5E5E5] dark:border-white/10 bg-[#F7F7F7] dark:bg-[#0B1320] text-xs font-semibold text-[#111111] dark:text-white focus:ring-1 focus:ring-[#FF8A00]"
            >
              {PREDEFINED_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  📍 {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#666666] dark:text-gray-400 uppercase tracking-wider block mb-1">
              Destination Location
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E5E5E5] dark:border-white/10 bg-[#F7F7F7] dark:bg-[#0B1320] text-xs font-semibold text-[#111111] dark:text-white focus:ring-1 focus:ring-[#FF8A00]"
            >
              {PREDEFINED_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  🎯 {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Route Cards Comparison (Fastest vs Safest) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#666666] dark:text-gray-400 uppercase tracking-wider">
          Calculated Routes ({routes.length})
        </h3>

        {routes.map((r) => {
          const isSelected = selectedRouteId === r.id;
          const isRecommended = r.type === 'RECOMMENDED_SAFE';

          return (
            <div
              key={r.id}
              onClick={() => setSelectedRouteId(r.id)}
              className={cn(
                "p-3.5 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-[#111C2E] shadow-2xs relative",
                isSelected
                  ? "border-[#FF8A00] ring-2 ring-[#FF8A00]/20 shadow-md"
                  : "border-[#E5E5E5] dark:border-white/10 hover:border-[#FFC107]"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={cn(
                      "text-[10px] font-mono font-bold px-2 py-0.5 rounded",
                      isRecommended
                        ? "bg-[#22A447] text-white"
                        : r.type === 'FASTEST_DIRECT'
                        ? "bg-[#E53935] text-white"
                        : "bg-[#FFC107] text-[#111111]"
                    )}
                  >
                    {isRecommended ? '🟢 RECOMMENDED' : r.type === 'FASTEST_DIRECT' ? '⚠️ DIRECT (HAZARDS)' : 'ALTERNATIVE'}
                  </span>
                  <span className="font-bold text-xs text-[#111111] dark:text-white">
                    {r.title}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-black font-mono text-[#111111] dark:text-white">
                    {r.safetyScore}
                  </span>
                  <span className="text-[10px] text-[#666666] dark:text-gray-400">/100</span>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2.5 border-t border-[#E5E5E5] dark:border-white/5 text-[11px] font-bold text-[#111111] dark:text-white">
                <div className="flex items-center gap-1">
                  <Clock className="size-3.5 text-[#666666] dark:text-gray-400" />
                  <span>{r.etaMinutes} mins</span>
                </div>
                <div className="flex items-center gap-1">
                  <Car className="size-3.5 text-[#666666] dark:text-gray-400" />
                  <span>{r.distanceKm} km</span>
                </div>
                <div className="text-right">
                  <span className={cn(r.waterloggingRiskPct > 50 ? "text-rose-600" : "text-emerald-600")}>
                    💧 {r.waterloggingRiskPct}% Flood
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-[#666666] dark:text-gray-400 mt-2 line-clamp-1">
                Via: {r.viaRoads.join(' → ')}
              </p>
            </div>
          );
        })}
      </div>

      {/* Selected Route Deep Dive & AI Explanation Banner */}
      {activeRoute && (
        <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-4 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-3.5">
          {/* AI Explanation Box */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#FFF8E1] to-white dark:from-[#FFC107]/10 dark:to-transparent border border-[#FFC107]/30 text-xs">
            <div className="flex items-center gap-1.5 text-[#FF8A00] font-bold mb-1">
              <Sparkles className="size-4" />
              <span>Why NagDrishti Recommends This:</span>
            </div>
            <p className="text-[11px] text-[#111111] dark:text-gray-200 leading-relaxed font-medium">
              {activeRoute.aiReasoning}
            </p>
          </div>

          {/* Risk Factors Breakdown Progress Bars */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[#666666] dark:text-gray-400 uppercase tracking-wider">
              Safety Factor Breakdown
            </h4>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-[#F7F7F7] dark:bg-[#0B1320]">
                <div className="flex justify-between text-[10px] text-[#666666] dark:text-gray-400 mb-1">
                  <span>Flood Submergence</span>
                  <span className="font-bold font-mono">{activeRoute.waterloggingRiskPct}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", activeRoute.waterloggingRiskPct > 40 ? "bg-[#E53935]" : "bg-[#22A447]")}
                    style={{ width: `${activeRoute.waterloggingRiskPct}%` }}
                  />
                </div>
              </div>

              <div className="p-2 rounded-lg bg-[#F7F7F7] dark:bg-[#0B1320]">
                <div className="flex justify-between text-[10px] text-[#666666] dark:text-gray-400 mb-1">
                  <span>Pothole / Surface Risk</span>
                  <span className="font-bold font-mono">{activeRoute.potholeRiskPct}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", activeRoute.potholeRiskPct > 40 ? "bg-[#FF8A00]" : "bg-[#22A447]")}
                    style={{ width: `${activeRoute.potholeRiskPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Highlights & Hazards */}
          <div className="space-y-2">
            {activeRoute.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                <span>{h}</span>
              </div>
            ))}

            {activeRoute.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-rose-700 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>

          {/* Start Safe Turn Navigation Button */}
          <Button className="w-full bg-[#22A447] hover:bg-[#1E8E3E] text-white font-bold h-11 text-xs gap-2 shadow-xs cursor-pointer">
            <Compass className="size-4" /> Start Safe GPS Turn-By-Turn
          </Button>
        </div>
      )}
    </div>
  );
};

export default CitizenSafeRoutePage;
