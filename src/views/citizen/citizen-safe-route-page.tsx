import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Clock, Car, AlertTriangle, Sparkles, CheckCircle2, Locate, ArrowUpDown, Compass } from 'lucide-react';
import { searchNagpurLocations, GeocodingResult, getCurrentBrowserPosition, VERIFIED_NAGPUR_LOCATIONS } from '../../services/geocoding/geocodingService';
import { calculateDynamicSafeRoutes, SafeRouteCalculationResult } from '../../services/routing/predictiveRoutingService';
import { getTileUrlForStyle } from '../../services/maps/mapService';
import { useTheme } from '../../context/theme/ThemeContext';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

export const CitizenSafeRoutePage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Search & Geocoding State
  const [originQuery, setOriginQuery] = useState('Nagpur Airport (NAG)');
  const [originResult, setOriginResult] = useState<GeocodingResult>(VERIFIED_NAGPUR_LOCATIONS[1]); // Airport default
  const [originSuggestions, setOriginSuggestions] = useState<GeocodingResult[]>([]);
  const [isOriginSearching, setIsOriginSearching] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  const [destQuery, setDestQuery] = useState('Civil Lines Administrative Complex');
  const [destResult, setDestResult] = useState<GeocodingResult>(VERIFIED_NAGPUR_LOCATIONS[2]); // Civil Lines default
  const [destSuggestions, setDestSuggestions] = useState<GeocodingResult[]>([]);
  const [isDestSearching, setIsDestSearching] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Route Calculation State
  const [routeResult, setRouteResult] = useState<SafeRouteCalculationResult | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [locatingCurrent, setLocatingCurrent] = useState(false);

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // 1. Debounced Origin Search
  useEffect(() => {
    if (!originQuery || originQuery === originResult?.name) return;
    const timer = setTimeout(() => {
      setIsOriginSearching(true);
      searchNagpurLocations(originQuery).then(results => {
        setOriginSuggestions(results);
        setIsOriginSearching(false);
      });
    }, 280);
    return () => clearTimeout(timer);
  }, [originQuery]);

  // 2. Debounced Destination Search
  useEffect(() => {
    if (!destQuery || destQuery === destResult?.name) return;
    const timer = setTimeout(() => {
      setIsDestSearching(true);
      searchNagpurLocations(destQuery).then(results => {
        setDestSuggestions(results);
        setIsDestSearching(false);
      });
    }, 280);
    return () => clearTimeout(timer);
  }, [destQuery]);

  // 3. Calculate Routes when origin & destination are set
  const handleCalculateRoutes = async (orig = originResult, dest = destResult) => {
    if (!orig || !dest) return;
    setIsCalculating(true);
    try {
      const res = await calculateDynamicSafeRoutes(
        { name: orig.name, coordinates: orig.coordinates },
        { name: dest.name, coordinates: dest.coordinates },
        28
      );
      setRouteResult(res);
      if (res.routes.length > 0) {
        setSelectedRouteId(res.routes[0].id);
      }
    } finally {
      setIsCalculating(false);
    }
  };

  // Run initial route calculation
  useEffect(() => {
    handleCalculateRoutes();
  }, []);

  // 4. Initialize Leaflet Map
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

  // 5. Update Map Tiles on theme change
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

  // 6. Draw Routes & Fit Bounds on Map when routeResult or selectedRouteId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !routeLayerGroupRef.current || !markersLayerGroupRef.current || !routeResult) return;

    routeLayerGroupRef.current.clearLayers();
    markersLayerGroupRef.current.clearLayers();

    const activeRoute = routeResult.routes.find(r => r.id === selectedRouteId) || routeResult.routes[0];
    if (!activeRoute) return;

    // Draw non-selected alternative routes faintly
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

    // Draw active selected route
    const routeColor = activeRoute.type === 'RECOMMENDED_SAFE' ? '#22A447' : activeRoute.type === 'FASTEST_DIRECT' ? '#E53935' : '#FF8A00';
    const mainPoly = L.polyline(activeRoute.coordinates, {
      color: routeColor,
      weight: 6,
      opacity: 0.9,
    }).addTo(routeLayerGroupRef.current);

    // Draw Origin Marker
    const originIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `<div style="background:#22A447; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:14px; border:2px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.3);">📍</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    L.marker(routeResult.originCoordinates, { icon: originIcon })
      .bindPopup(`<strong>Origin:</strong> ${routeResult.originName}`)
      .addTo(markersLayerGroupRef.current);

    // Draw Destination Marker
    const destIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `<div style="background:#FF8A00; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:14px; border:2px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.3);">🎯</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    L.marker(routeResult.destinationCoordinates, { icon: destIcon })
      .bindPopup(`<strong>Destination:</strong> ${routeResult.destinationName}`)
      .addTo(markersLayerGroupRef.current);

    // Draw Hazard Markers along route
    activeRoute.hazards.forEach(h => {
      if (h.coordinates) {
        const hazardIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `<div style="background:#E53935; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3);">⚠️</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
        L.marker(h.coordinates, { icon: hazardIcon })
          .bindPopup(`<strong>${h.title}</strong><br/>${h.description}`)
          .addTo(markersLayerGroupRef.current!);
      }
    });

    // Auto fit map bounds with comfortable padding
    try {
      const bounds = mainPoly.getBounds();
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } catch {
      // fallback
    }
  }, [routeResult, selectedRouteId]);

  // Current Geolocation handler
  const handleUseCurrentLocation = async () => {
    setLocatingCurrent(true);
    try {
      const coords = await getCurrentBrowserPosition();
      const newOrigin: GeocodingResult = {
        id: 'user-current-gps',
        name: 'My Current Location (GPS)',
        displayName: `Current Position [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`,
        category: 'LOCALITY',
        coordinates: coords
      };
      setOriginResult(newOrigin);
      setOriginQuery(newOrigin.name);
      setShowOriginDropdown(false);
      handleCalculateRoutes(newOrigin, destResult);
    } catch {
      alert('Could not access device GPS. Defaulting to Nagpur Zero Mile.');
    } finally {
      setLocatingCurrent(false);
    }
  };

  const handleSwapLocations = () => {
    const tempResult = originResult;
    const tempQuery = originQuery;
    setOriginResult(destResult);
    setOriginQuery(destQuery);
    setDestResult(tempResult);
    setDestQuery(tempQuery);
    handleCalculateRoutes(destResult, tempResult);
  };

  const activeRoute = routeResult?.routes.find(r => r.id === selectedRouteId) || routeResult?.routes[0];

  return (
    <div className="space-y-4">
      {/* 1. Dynamic Origin / Destination Search Card */}
      <div className="bg-white dark:bg-[#111C2E] p-4 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFC107] text-[#111111]">
              PREDICTIVE SAFE ROUTING
            </span>
          </div>
          <button
            onClick={handleUseCurrentLocation}
            disabled={locatingCurrent}
            className="flex items-center gap-1 text-[11px] font-bold text-[#FF8A00] hover:underline cursor-pointer"
          >
            <Locate className="size-3.5" />
            <span>{locatingCurrent ? 'Locating...' : 'Use My GPS'}</span>
          </button>
        </div>

        <div className="space-y-2.5 relative">
          {/* FROM INPUT */}
          <div className="relative">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10">
              <span className="size-2 rounded-full bg-[#22A447] shrink-0" />
              <input
                type="text"
                placeholder="Search start location (e.g. Airport, Sitabuldi)..."
                value={originQuery}
                onFocus={() => setShowOriginDropdown(true)}
                onChange={(e) => {
                  setOriginQuery(e.target.value);
                  setShowOriginDropdown(true);
                }}
                className="w-full text-xs font-semibold text-[#111111] dark:text-white bg-transparent focus:outline-none placeholder:text-[#666666]"
              />
              {isOriginSearching && (
                <span className="text-[10px] font-mono font-bold text-[#22A447] animate-pulse shrink-0">
                  Searching...
                </span>
              )}
            </div>

            {/* Origin Auto-suggestions Dropdown */}
            {showOriginDropdown && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/15 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-[#E5E5E5] dark:divide-white/5">
                {isOriginSearching && originSuggestions.length === 0 ? (
                  <div className="p-3 text-center text-xs text-[#666666] dark:text-gray-400 font-medium">
                    🔍 Searching start locations in Nagpur...
                  </div>
                ) : originSuggestions.length > 0 ? (
                  originSuggestions.map(item => (
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
                  ))
                ) : null}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-1">
            <button
              onClick={handleSwapLocations}
              className="size-7 rounded-full bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/10 flex items-center justify-center text-[#666666] hover:text-[#FF8A00] shadow-xs cursor-pointer"
              title="Swap Origin and Destination"
            >
              <ArrowUpDown className="size-3.5" />
            </button>
          </div>

          {/* TO INPUT */}
          <div className="relative">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10">
              <span className="size-2 rounded-full bg-[#FF8A00] shrink-0" />
              <input
                type="text"
                placeholder="Search destination (e.g. Civil Lines, AIIMS, VNIT)..."
                value={destQuery}
                onFocus={() => setShowDestDropdown(true)}
                onChange={(e) => {
                  setDestQuery(e.target.value);
                  setShowDestDropdown(true);
                }}
                className="w-full text-xs font-semibold text-[#111111] dark:text-white bg-transparent focus:outline-none placeholder:text-[#666666]"
              />
              {isDestSearching && (
                <span className="text-[10px] font-mono font-bold text-[#FF8A00] animate-pulse shrink-0">
                  Searching...
                </span>
              )}
            </div>

            {/* Destination Auto-suggestions Dropdown */}
            {showDestDropdown && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/15 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-[#E5E5E5] dark:divide-white/5">
                {isDestSearching && destSuggestions.length === 0 ? (
                  <div className="p-3 text-center text-xs text-[#666666] dark:text-gray-400 font-medium">
                    🔍 Searching destinations in Nagpur...
                  </div>
                ) : destSuggestions.length > 0 ? (
                  destSuggestions.map(item => (
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
                  ))
                ) : null}
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={() => handleCalculateRoutes()}
          disabled={isCalculating}
          className="w-full bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold h-10 text-xs gap-2 shadow-xs cursor-pointer"
        >
          <Navigation className="size-4" />
          {isCalculating ? 'Evaluating Urban Risk Layers...' : 'Calculate AI Safe Route'}
        </Button>
      </div>

      {/* 2. Interactive Map Container with Polyline */}
      <div className="relative rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-white/10 shadow-sm bg-white dark:bg-[#111C2E]">
        <div ref={mapContainerRef} className="w-full h-72 z-0" />
      </div>

      {/* 3. Calculated Routes Comparison Cards */}
      {routeResult && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#666666] dark:text-gray-400 uppercase tracking-wider">
              Evaluated Routes ({routeResult.routes.length})
            </h3>
            <span className="text-[10px] text-[#FF8A00] font-mono font-bold">
              RAIN IMPACT: {routeResult.rainfallMm} mm
            </span>
          </div>

          {routeResult.routes.map(r => {
            const isSelected = selectedRouteId === r.id;
            const isRecommended = r.type === 'RECOMMENDED_SAFE';

            return (
              <div
                key={r.id}
                onClick={() => setSelectedRouteId(r.id)}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-[#111C2E] shadow-2xs space-y-2",
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
                      {isRecommended ? '🟢 RECOMMENDED SAFE' : r.type === 'FASTEST_DIRECT' ? '⚠️ DIRECT (HAZARD RISK)' : 'ALTERNATIVE'}
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

                <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-[#111111] dark:text-white pt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="size-3.5 text-[#FF8A00]" />
                    <span>{r.etaMinutes} mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Car className="size-3.5 text-[#666666] dark:text-gray-400" />
                    <span>{r.distanceKm} km</span>
                  </div>
                  <div className="text-right">
                    <span className={cn(r.waterloggingRiskPct > 40 ? "text-rose-600 font-bold" : "text-emerald-600")}>
                      💧 {r.waterloggingRiskPct}% Flood Risk
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Active Selected Route Deep Dive & AI Reasoning */}
      {activeRoute && (
        <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-4 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#FFF8E1] to-white dark:from-[#FFC107]/10 dark:to-transparent border border-[#FFC107]/30 text-xs">
            <div className="flex items-center gap-1.5 text-[#FF8A00] font-bold mb-1">
              <Sparkles className="size-4" />
              <span>Explainable AI Routing Rationale:</span>
            </div>
            <p className="text-[11px] text-[#111111] dark:text-gray-200 leading-relaxed font-medium">
              {activeRoute.aiReasoning}
            </p>
          </div>

          <div className="space-y-1.5">
            {activeRoute.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{h}</span>
              </div>
            ))}

            {activeRoute.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-rose-800 dark:text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                <AlertTriangle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{w}</span>
              </div>
            ))}
          </div>

          <Button className="w-full bg-[#22A447] hover:bg-[#1E8E3E] text-white font-bold h-11 text-xs gap-2 shadow-xs cursor-pointer">
            <Compass className="size-4" /> Start Safe Turn-By-Turn Navigation
          </Button>
        </div>
      )}
    </div>
  );
};

export default CitizenSafeRoutePage;
