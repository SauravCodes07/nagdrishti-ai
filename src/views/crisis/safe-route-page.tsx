import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { searchNagpurLocations, GeocodingResult, VERIFIED_NAGPUR_LOCATIONS } from '../../services/geocoding/geocodingService';
import { calculateDynamicSafeRoutes, SafeRouteCalculationResult } from '../../services/routing/predictiveRoutingService';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { getTileUrlForStyle } from '../../services/maps/mapService';
import { useTheme } from '../../context/theme/ThemeContext';
import { Navigation, AlertTriangle, CheckCircle2, Clock, Car, Sparkles, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';

const SafeRoutePage: React.FC = () => {
  const { currentRainfallMm } = useDemoSimulation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Search State
  const [originQuery, setOriginQuery] = useState('Nagpur Airport (NAG)');
  const [originResult, setOriginResult] = useState<GeocodingResult>(VERIFIED_NAGPUR_LOCATIONS[1]);
  const [originSuggestions, setOriginSuggestions] = useState<GeocodingResult[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  const [destQuery, setDestQuery] = useState('Civil Lines Administrative Complex');
  const [destResult, setDestResult] = useState<GeocodingResult>(VERIFIED_NAGPUR_LOCATIONS[2]);
  const [destSuggestions, setDestSuggestions] = useState<GeocodingResult[]>([]);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Route State
  const [routeResult, setRouteResult] = useState<SafeRouteCalculationResult | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Debounced Origin Search
  useEffect(() => {
    if (!originQuery || originQuery === originResult?.name) return;
    const timer = setTimeout(() => {
      searchNagpurLocations(originQuery).then(setOriginSuggestions);
    }, 280);
    return () => clearTimeout(timer);
  }, [originQuery]);

  // Debounced Destination Search
  useEffect(() => {
    if (!destQuery || destQuery === destResult?.name) return;
    const timer = setTimeout(() => {
      searchNagpurLocations(destQuery).then(setDestSuggestions);
    }, 280);
    return () => clearTimeout(timer);
  }, [destQuery]);

  // Dynamic Route Calculation
  const handleCalculateRoutes = async (orig = originResult, dest = destResult) => {
    if (!orig || !dest) return;
    setIsCalculating(true);
    try {
      const res = await calculateDynamicSafeRoutes(
        { name: orig.name, coordinates: orig.coordinates },
        { name: dest.name, coordinates: dest.coordinates },
        currentRainfallMm
      );
      setRouteResult(res);
      if (res.routes.length > 0) {
        setSelectedRouteId(res.routes[0].id);
      }
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    handleCalculateRoutes();
  }, [currentRainfallMm]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.1458, 79.0882],
      zoom: 13,
      zoomControl: false,
    });

    const tileInfo = getTileUrlForStyle('VECTOR_DAY', isDark);
    tileLayerRef.current = L.tileLayer(tileInfo.url, {
      attribution: tileInfo.attribution,
      subdomains: tileInfo.subdomains || ['a', 'b', 'c', 'd'],
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    routeLayerGroupRef.current = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Map Tile Style update on Dark Theme
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;
    map.removeLayer(tileLayerRef.current);
    const tileInfo = getTileUrlForStyle('VECTOR_DAY', isDark);
    tileLayerRef.current = L.tileLayer(tileInfo.url, {
      attribution: tileInfo.attribution,
      subdomains: tileInfo.subdomains || ['a', 'b', 'c', 'd'],
      maxZoom: 19,
    }).addTo(map);
  }, [isDark]);

  // Draw Polylines & Fit Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !routeLayerGroupRef.current || !markersLayerGroupRef.current || !routeResult) return;

    routeLayerGroupRef.current.clearLayers();
    markersLayerGroupRef.current.clearLayers();

    const activeRoute = routeResult.routes.find(r => r.id === selectedRouteId) || routeResult.routes[0];
    if (!activeRoute) return;

    // Draw non-selected alternative routes
    routeResult.routes.forEach(r => {
      if (r.id !== activeRoute.id) {
        L.polyline(r.coordinates, {
          color: '#94a3b8',
          weight: 4,
          opacity: 0.5,
          dashArray: '6, 6'
        }).addTo(routeLayerGroupRef.current!);
      }
    });

    // Draw active route polyline
    const routeColor = activeRoute.type === 'RECOMMENDED_SAFE' ? '#22A447' : activeRoute.type === 'FASTEST_DIRECT' ? '#E53935' : '#FF8A00';
    const mainPoly = L.polyline(activeRoute.coordinates, {
      color: routeColor,
      weight: 6,
      opacity: 0.9,
    }).addTo(routeLayerGroupRef.current);

    // Origin Marker
    const originIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `<div style="background:#22A447; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:14px; border:2px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.3);">📍</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    L.marker(routeResult.originCoordinates, { icon: originIcon })
      .bindPopup(`<strong>Origin:</strong> ${routeResult.originName}`)
      .addTo(markersLayerGroupRef.current);

    // Destination Marker
    const destIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `<div style="background:#FF8A00; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:14px; border:2px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.3);">🎯</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    L.marker(routeResult.destinationCoordinates, { icon: destIcon })
      .bindPopup(`<strong>Destination:</strong> ${routeResult.destinationName}`)
      .addTo(markersLayerGroupRef.current);

    try {
      map.fitBounds(mainPoly.getBounds(), { padding: [40, 40], maxZoom: 15 });
    } catch {
      // fallback
    }
  }, [routeResult, selectedRouteId]);

  const activeRoute = routeResult?.routes.find(r => r.id === selectedRouteId) || routeResult?.routes[0];

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
              [DYNAMIC SPATIAL RISK SCORING]
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            AI Safe Route Planner & Corridor Analysis
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Evaluates arbitrary origin and destination routes across Nagpur by factoring waterlogged underpasses, active construction choke points, and pothole severity during rainfall.
          </p>
        </div>

        <div className="text-right text-xs text-[#666666] dark:text-gray-400">
          <span className="font-bold text-[#FF8A00]">Active Simulation Rainfall: {currentRainfallMm} mm</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input & Route Options selection */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-4 sm:p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-3.5">
            <h3 className="font-bold text-sm text-[#111111] dark:text-white flex items-center gap-2">
              <Navigation className="size-4 text-[#FF8A00]" /> Dynamic Route Search
            </h3>

            {/* Origin Input */}
            <div className="relative">
              <label className="text-[11px] font-bold text-[#666666] dark:text-gray-400 uppercase tracking-wider block mb-1">
                From Location (Origin)
              </label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10">
                <MapPin className="size-4 text-[#22A447] shrink-0" />
                <input
                  type="text"
                  value={originQuery}
                  onFocus={() => setShowOriginDropdown(true)}
                  onChange={e => {
                    setOriginQuery(e.target.value);
                    setShowOriginDropdown(true);
                  }}
                  className="w-full text-xs font-semibold text-[#111111] dark:text-white bg-transparent focus:outline-none placeholder:text-[#666666]"
                />
              </div>

              {showOriginDropdown && originSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/15 rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-[#E5E5E5] dark:divide-white/5">
                  {originSuggestions.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setOriginResult(item);
                        setOriginQuery(item.name);
                        setShowOriginDropdown(false);
                        handleCalculateRoutes(item, destResult);
                      }}
                      className="w-full p-2.5 text-left text-xs hover:bg-[#FFF8E1] dark:hover:bg-white/5 flex items-start gap-2 cursor-pointer transition-colors"
                    >
                      <MapPin className="size-3.5 text-[#22A447] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#111111] dark:text-white">{item.name}</div>
                        <div className="text-[10px] text-[#666666] dark:text-gray-400 line-clamp-1">{item.displayName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Input */}
            <div className="relative">
              <label className="text-[11px] font-bold text-[#666666] dark:text-gray-400 uppercase tracking-wider block mb-1">
                To Destination
              </label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10">
                <MapPin className="size-4 text-[#FF8A00] shrink-0" />
                <input
                  type="text"
                  value={destQuery}
                  onFocus={() => setShowDestDropdown(true)}
                  onChange={e => {
                    setDestQuery(e.target.value);
                    setShowDestDropdown(true);
                  }}
                  className="w-full text-xs font-semibold text-[#111111] dark:text-white bg-transparent focus:outline-none placeholder:text-[#666666]"
                />
              </div>

              {showDestDropdown && destSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/15 rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-[#E5E5E5] dark:divide-white/5">
                  {destSuggestions.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setDestResult(item);
                        setDestQuery(item.name);
                        setShowDestDropdown(false);
                        handleCalculateRoutes(originResult, item);
                      }}
                      className="w-full p-2.5 text-left text-xs hover:bg-[#FFF8E1] dark:hover:bg-white/5 flex items-start gap-2 cursor-pointer transition-colors"
                    >
                      <MapPin className="size-3.5 text-[#FF8A00] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#111111] dark:text-white">{item.name}</div>
                        <div className="text-[10px] text-[#666666] dark:text-gray-400 line-clamp-1">{item.displayName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => handleCalculateRoutes()}
              disabled={isCalculating}
              className="w-full bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold h-10 text-xs gap-2 cursor-pointer"
            >
              <Navigation className="size-4" /> {isCalculating ? 'Computing Spatial Risks...' : 'Recalculate Dynamic Safe Routes'}
            </Button>
          </div>

          {/* Route Options List */}
          {routeResult && (
            <div className="space-y-2.5">
              <h3 className="font-bold text-sm text-[#111111] dark:text-white">
                Evaluated Routes ({routeResult.routes.length})
              </h3>

              {routeResult.routes.map(r => {
                const isSelected = (selectedRouteId || routeResult.routes[0].id) === r.id;
                const isRecommended = r.type === 'RECOMMENDED_SAFE';

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRouteId(r.id)}
                    className={cn(
                      "p-3.5 rounded-xl border transition-all cursor-pointer bg-white dark:bg-[#111C2E] flex flex-col gap-2 shadow-2xs",
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

                    <div className="flex items-center justify-between text-xs font-bold text-[#111111] dark:text-white">
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Active Route Detail Breakdown & GIS Map */}
        <div className="lg:col-span-7 space-y-4">
          {/* Map Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-white/10 shadow-sm bg-white dark:bg-[#111C2E]">
            <div ref={mapContainerRef} className="w-full h-80 z-0" />
          </div>

          {activeRoute && (
            <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-white/10 pb-3">
                <div>
                  <span className={cn(
                    "text-xs font-mono px-2.5 py-1 rounded border font-bold",
                    activeRoute.type === 'RECOMMENDED_SAFE' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                  )}>
                    {activeRoute.title}
                  </span>
                  <h2 className="text-base font-bold text-[#111111] dark:text-white mt-1.5">
                    {routeResult?.originName} → {routeResult?.destinationName}
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

              {/* Highlights & Hazards */}
              <div className="space-y-2">
                {activeRoute.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
                {activeRoute.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafeRoutePage;
