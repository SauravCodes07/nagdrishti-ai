import React, { useState, useEffect, useRef } from 'react';
import { CloudRain, AlertTriangle, ShieldCheck, Compass, Sparkles, Droplets, HardHat, Layers } from 'lucide-react';
import { fetchNagpurWeather, WeatherData } from '../../../services/weather/weatherService';
import { getActiveConstructionProjects } from '../../../services/construction/constructionService';
import { getIncidents } from '../../../services/incidents/incidentService';
import { cn } from '../../../lib/utils';
import { Link } from 'react-router';

type HeroLayer = 'ALL' | 'ROUTES' | 'RISK' | 'CONSTRUCTION' | 'SATELLITE';

export const NagpurHero3D: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [activeLayer, setActiveLayer] = useState<HeroLayer>('ALL');
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'SAFEST' | 'FASTEST'>('SAFEST');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNagpurWeather().then(setWeather);
  }, []);

  const constructions = getActiveConstructionProjects();
  const incidents = getIncidents();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 15, y: y * 15 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#0A111E] text-white rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-8">
      {/* Dynamic Background Ambient Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF8A00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

      {/* Top Controls & Intelligence HUD Bar */}
      <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22A447] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22A447]"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-[#22A447] uppercase">
              NAGPUR URBAN INTELLIGENCE LAYER
            </span>
          </div>

          <span className="hidden sm:inline text-xs text-gray-400 font-mono">
            [21.1458° N, 79.0882° E • Zero Mile]
          </span>
        </div>

        {/* Layer Switcher Pills */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-gray-400 px-2 font-mono flex items-center gap-1">
            <Layers className="size-3 text-[#FF8A00]" /> Layer:
          </span>
          {(['ALL', 'ROUTES', 'RISK', 'CONSTRUCTION', 'SATELLITE'] as const).map(layer => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap",
                activeLayer === layer
                  ? "bg-[#FF8A00] text-white shadow-xs"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* Main Hero Visual Area: 3D-Perspective Geospatial Representation */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative my-4 h-[380px] sm:h-[460px] lg:h-[500px] w-full rounded-2xl overflow-hidden bg-[#070D18] border border-white/10 flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          perspective: '1200px'
        }}
      >
        {/* Transformable 3D Map Grid Surface */}
        <div
          className="relative w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: `rotateX(${24 - mousePos.y * 0.4}deg) rotateZ(${-8 + mousePos.x * 0.4}deg) scale(0.96)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* SVG Road Network & Vector Grid Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
            <defs>
              <linearGradient id="safeRouteGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22A447" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#00E676" stopOpacity="1" />
                <stop offset="100%" stopColor="#22A447" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="riskRouteGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E53935" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#FF8A00" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* City Base Road Polylines (Nagpur Grid) */}
            {/* Outer Ring Road */}
            <path
              d="M 120,480 Q 250,560 500,540 T 880,420 Q 920,240 760,120 T 320,100 Q 140,220 120,480 Z"
              fill="none"
              stroke="#ffffff15"
              strokeWidth="4"
              strokeDasharray="6,6"
            />
            {/* Wardha Road Arterial */}
            <path d="M 220,530 L 480,310 L 510,180" fill="none" stroke="#ffffff25" strokeWidth="6" />
            {/* Central Avenue / Bhandara Road */}
            <path d="M 510,290 L 850,260" fill="none" stroke="#ffffff25" strokeWidth="5" />
            {/* Amravati Road */}
            <path d="M 150,290 L 480,290" fill="none" stroke="#ffffff25" strokeWidth="5" />
            {/* Kamptee Road */}
            <path d="M 510,290 L 620,90" fill="none" stroke="#ffffff25" strokeWidth="5" />
            {/* Hingna Road */}
            <path d="M 180,440 L 420,340" fill="none" stroke="#ffffff18" strokeWidth="4" />

            {/* Satellite Flood Basin Polygons (Copernicus SAR) */}
            {(activeLayer === 'ALL' || activeLayer === 'RISK' || activeLayer === 'SATELLITE') && (
              <g className="transition-opacity duration-500">
                <polygon
                  points="340,320 400,300 420,340 360,370"
                  fill="#E53935"
                  fillOpacity="0.25"
                  stroke="#E53935"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
                <polygon
                  points="450,240 500,230 520,270 470,280"
                  fill="#E53935"
                  fillOpacity="0.3"
                  stroke="#E53935"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* ROUTE VISUALIZATION (Animated) */}
            {(activeLayer === 'ALL' || activeLayer === 'ROUTES') && (
              <>
                {/* 1. Unsafe Route (Dharampeth / Gokulpeth Basin Hazard) */}
                <path
                  d="M 240,510 L 360,350 L 470,260 L 520,180"
                  fill="none"
                  stroke="url(#riskRouteGlow)"
                  strokeWidth={activeTab === 'FASTEST' ? "6" : "3"}
                  strokeOpacity={activeTab === 'FASTEST' ? "1" : "0.4"}
                  strokeDasharray="6,4"
                  filter="url(#glow)"
                />

                {/* 2. Recommended Safe Route (Wardha Road Flyover Elevated Corridor) */}
                <path
                  d="M 240,510 L 480,310 L 540,240 L 520,180"
                  fill="none"
                  stroke="url(#safeRouteGlow)"
                  strokeWidth={activeTab === 'SAFEST' ? "7" : "3"}
                  strokeOpacity={activeTab === 'SAFEST' ? "1" : "0.5"}
                  filter="url(#glow)"
                />
              </>
            )}
          </svg>

          {/* Interactive Geographic Landmarks & Hazard Markers in 3D Space */}
          {/* Zero Mile Stone Marker */}
          <div
            className="absolute top-[280px] left-[500px] -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
            onMouseEnter={() => setHoveredZone('Zero Mile — Center of India')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            <div className="size-8 rounded-full bg-[#FF8A00] flex items-center justify-center text-xs font-black shadow-[0_0_20px_#FF8A00] ring-2 ring-white">
              🏛️
            </div>
            <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-white/10">
              Zero Mile Stone
            </div>
          </div>

          {/* Dr. Babasaheb Ambedkar Deekshabhoomi */}
          <div
            className="absolute top-[370px] left-[430px] -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer"
            onMouseEnter={() => setHoveredZone('Deekshabhoomi Heritage Zone')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            <div className="size-7 rounded-full bg-blue-600/90 flex items-center justify-center text-xs shadow-[0_0_15px_#2563eb] ring-1 ring-white">
              ☸️
            </div>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-gray-300 border border-white/10">
              Deekshabhoomi
            </div>
          </div>

          {/* Ambazari Lake Spillway Basin (Flood Risk) */}
          {(activeLayer === 'ALL' || activeLayer === 'RISK' || activeLayer === 'SATELLITE') && (
            <div
              className="absolute top-[340px] left-[320px] -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer animate-pulse"
              onMouseEnter={() => setHoveredZone('Ambazari Basin: 2.8 ft overflow risk')}
              onMouseLeave={() => setHoveredZone(null)}
            >
              <div className="size-8 rounded-full bg-rose-600 flex items-center justify-center text-xs shadow-[0_0_20px_#e11d48] ring-2 ring-rose-300">
                💧
              </div>
              <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-rose-950/90 text-rose-200 px-2 py-0.5 rounded text-[9px] font-mono font-bold border border-rose-500/40">
                Ambazari Overflow Alert
              </div>
            </div>
          )}

          {/* Maha Metro Phase 2 Construction Choke Point */}
          {(activeLayer === 'ALL' || activeLayer === 'CONSTRUCTION') && (
            <div
              className="absolute top-[160px] left-[610px] -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer"
              onMouseEnter={() => setHoveredZone('Metro Phase 2 Pier Excavation: Single Lane Merge')}
              onMouseLeave={() => setHoveredZone(null)}
            >
              <div className="size-8 rounded-full bg-[#FFC107] text-slate-900 flex items-center justify-center text-xs font-bold shadow-[0_0_20px_#FFC107] ring-2 ring-white">
                🚧
              </div>
              <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-950/90 text-amber-200 px-2 py-0.5 rounded text-[9px] font-mono font-bold border border-amber-500/40">
                Kamptee Metro Work
              </div>
            </div>
          )}

          {/* Nagpur Dr. BR Ambedkar Airport (Origin) */}
          <div className="absolute top-[510px] left-[230px] -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="size-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs shadow-[0_0_15px_#059669] ring-2 ring-white">
              ✈️
            </div>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 font-bold border border-emerald-500/30">
              ORIGIN: Airport
            </div>
          </div>

          {/* Civil Lines Administrative Zone (Destination) */}
          <div className="absolute top-[170px] left-[520px] -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="size-7 rounded-full bg-[#FF8A00] flex items-center justify-center text-xs shadow-[0_0_15px_#FF8A00] ring-2 ring-white">
              🎯
            </div>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-[#FFC107] font-bold border border-[#FF8A00]/30">
              DEST: Civil Lines
            </div>
          </div>
        </div>

        {/* Floating Route Selector Simulator Widget (Top Left) */}
        <div className="absolute top-3 left-3 z-40 bg-[#0B1320]/90 backdrop-blur-md p-3 rounded-2xl border border-white/15 max-w-[260px] sm:max-w-xs space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
            <span>PREDICTIVE ROUTING</span>
            <span className="text-[#FF8A00] font-bold">LIVE COMPARISON</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('SAFEST')}
              className={cn(
                "py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-1",
                activeTab === 'SAFEST'
                  ? "bg-[#22A447] text-white shadow-xs"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <ShieldCheck className="size-3.5" /> Safest (91)
            </button>
            <button
              onClick={() => setActiveTab('FASTEST')}
              className={cn(
                "py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-1",
                activeTab === 'FASTEST'
                  ? "bg-[#E53935] text-white shadow-xs"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <AlertTriangle className="size-3.5" /> Direct (62)
            </button>
          </div>

          {activeTab === 'SAFEST' ? (
            <div className="text-[11px] text-gray-200 space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-emerald-400">🟢 Elevated Flyover Route</span>
                <span className="font-mono">12.8 km • 22 min</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                Bypasses 3.2 ft standing water at Gokulpeth & active Metro construction.
              </p>
            </div>
          ) : (
            <div className="text-[11px] text-gray-200 space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-rose-400">⚠️ Shortest (Hazard Basin)</span>
                <span className="font-mono">9.6 km • 48 min</span>
              </div>
              <p className="text-[10px] text-rose-300 leading-tight">
                High hydro-lock risk in submerged underpass + severe traffic gridlock.
              </p>
            </div>
          )}
        </div>

        {/* Hovered Zone Floating Toast */}
        {hoveredZone && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-black/90 text-white border border-[#FF8A00]/50 px-4 py-2 rounded-xl text-xs font-mono shadow-2xl flex items-center gap-2 pointer-events-none animate-fadeIn">
            <Compass className="size-4 text-[#FF8A00]" />
            <span>{hoveredZone}</span>
          </div>
        )}

        {/* Bottom Floating Telemetry HUD */}
        <div className="absolute bottom-3 right-3 z-40 bg-[#0B1320]/90 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-xs font-mono space-y-1.5 shadow-xl hidden sm:block">
          <div className="flex items-center justify-between gap-4 text-[10px] text-gray-400 border-b border-white/10 pb-1">
            <span>NAGPUR TELEMETRY</span>
            <span className="text-emerald-400 font-bold">ACTIVE</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <div className="text-gray-300 flex items-center gap-1">
              <CloudRain className="size-3 text-[#FF8A00]" />
              <span>Rain: {weather ? `${weather.rainfallMm} mm` : '4.2 mm'}</span>
            </div>
            <div className="text-gray-300 flex items-center gap-1">
              <HardHat className="size-3 text-[#FFC107]" />
              <span>Civil Works: {constructions.length}</span>
            </div>
            <div className="text-gray-300 flex items-center gap-1">
              <AlertTriangle className="size-3 text-rose-400" />
              <span>Active Hazards: {incidents.length}</span>
            </div>
            <div className="text-gray-300 flex items-center gap-1">
              <Droplets className="size-3 text-blue-400" />
              <span>Risk Level: LOW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Hero Call to Action Row */}
      <div className="relative z-20 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <Sparkles className="size-4 text-[#FFC107] shrink-0" />
          <span>
            Powered by <strong>Open-Meteo</strong> real-time telemetry, <strong>Copernicus Sentinel SAR</strong> & <strong>Prithvi GeoAI</strong>.
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/citizen"
            className="flex-1 sm:flex-none text-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#FFC107] text-white font-extrabold text-xs shadow-btn-shadow hover:opacity-95 transition-all"
          >
            EXPLORE NAGDRISHTI CITIZEN
          </Link>
          <Link
            to="/admin"
            className="flex-1 sm:flex-none text-center px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs transition-all"
          >
            OPEN COMMAND CENTER
          </Link>
        </div>
      </div>
    </div>
  );
};
