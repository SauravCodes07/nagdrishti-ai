import React, { useState } from 'react';
import { PREDEFINED_LOCATIONS, DEMO_ROUTE_QUERIES } from '../../data/crisis/safe-routes-data';
import { Navigation, AlertTriangle, CheckCircle2, Clock, Car } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';

const SafeRoutePage: React.FC = () => {
  const [origin, setOrigin] = useState('airport');
  const [destination, setDestination] = useState('civil_lines');
  const [selectedRouteId, setSelectedRouteId] = useState('route-1-recommended');

  const routeData = DEMO_ROUTE_QUERIES['airport-civil_lines'];
  const routes = routeData.routes;

  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-emerald-500 text-white font-mono text-[10px]">
            AI DIJKSTRA RISK ROUTING
          </Badge>
          <span className="text-xs text-muted-foreground">• Real-time Waterlogging & Pothole Avoidance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Nagpur AI Safe Route Planner
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Find safe navigation paths avoiding flooded underpasses, deep potholes, and traffic gridlocks during rainfall.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input & Route Options selection */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-sm space-y-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Navigation className="size-5 text-bhagwa" /> Route Parameters
            </h3>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Start Location (Origin)
              </label>
              <select
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-input bg-background text-xs font-medium focus:ring-1 focus:ring-bhagwa"
              >
                {PREDEFINED_LOCATIONS.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    📍 {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Destination Location
              </label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-input bg-background text-xs font-medium focus:ring-1 focus:ring-bhagwa"
              >
                {PREDEFINED_LOCATIONS.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    🎯 {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <Button className="w-full bg-bhagwa hover:bg-bhagwa-dark text-white font-bold h-11 text-xs gap-2">
              <Navigation className="size-4" /> Recalculate AI Safe Routes
            </Button>
          </div>

          {/* Route Options List */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-foreground">
              Calculated Route Options ({routes.length})
            </h3>

            {routes.map(r => {
              const isSelected = selectedRouteId === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRouteId(r.id)}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer bg-card flex flex-col gap-2",
                    isSelected ? "border-bhagwa ring-1 ring-bhagwa shadow-md" : "border-border hover:border-bhagwa/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border", r.badgeColor)}>
                      {r.name}
                    </span>
                    <span className="text-xs font-bold text-foreground font-mono">
                      Safety: {r.safetyScore}/100
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5 text-muted-foreground" /> {r.etaMinutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="size-3.5 text-muted-foreground" /> {r.distanceKm} km
                    </span>
                    <span className="text-bhagwa font-mono">
                      Flood Risk: {r.waterloggingRiskScore}%
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    Via: {r.viaRoads.join(' → ')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Route Detail Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className={cn("text-xs font-mono px-2.5 py-1 rounded border font-bold", activeRoute.badgeColor)}>
                  {activeRoute.name}
                </span>
                <h2 className="text-lg font-bold text-foreground mt-2">
                  {routeData.originName} → {routeData.destinationName}
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

            {/* Risk Breakdown Progress Bars */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-muted/30 text-xs">
              <div>
                <span className="text-muted-foreground text-[10px] block mb-1">Waterlogging Risk</span>
                <span className="font-bold text-rose-600 font-mono text-sm">{activeRoute.waterloggingRiskScore}%</span>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${activeRoute.waterloggingRiskScore}%` }} />
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-[10px] block mb-1">Traffic Congestion</span>
                <span className="font-bold text-amber-600 font-mono text-sm">{activeRoute.trafficRiskScore}%</span>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${activeRoute.trafficRiskScore}%` }} />
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-[10px] block mb-1">Pothole Surface Index</span>
                <span className="font-bold text-orange-600 font-mono text-sm">{activeRoute.potholeRiskScore}%</span>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${activeRoute.potholeRiskScore}%` }} />
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
