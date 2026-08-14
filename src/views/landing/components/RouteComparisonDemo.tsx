import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Clock, Car, Navigation, Sparkles, CheckCircle2, Droplets, HardHat, Compass } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Link } from 'react-router';

interface DemoRoute {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  distance: string;
  time: string;
  safetyScore: number;
  safetyRating: string;
  avoids: string[];
  hazards: string[];
  aiReasoning: string;
  polylineType: 'elevated' | 'submerged' | 'ring';
}

const DEMO_ROUTES: DemoRoute[] = [
  {
    id: 'safe',
    name: 'AI Recommended Safe Route (Elevated Corridor)',
    badge: '🟢 RECOMMENDED SAFE',
    badgeColor: 'bg-[#22A447] text-white',
    distance: '12.8 km',
    time: '22 min',
    safetyScore: 96,
    safetyRating: 'EXCELLENT',
    avoids: [
      'Bypasses 3.2 ft submerged Gokulpeth underpass',
      'Avoids Metro Phase 2 Kamptee Road lane closure',
      'Continuous elevated flyover with active storm drainage'
    ],
    hazards: [
      'Maintain wet weather 40 km/h speed across expansion joints'
    ],
    aiReasoning: 'Recommended because this route utilizes the continuous elevated flyover system, bypassing the low-elevation waterlogged basin at Dharampeth and the active Metro pier excavation on Kamptee Road.',
    polylineType: 'elevated'
  },
  {
    id: 'fastest',
    name: 'Direct / Shortest Distance Route (High Hazard Risk)',
    badge: '⚠️ SHORTEST (HAZARDOUS)',
    badgeColor: 'bg-[#E53935] text-white',
    distance: '9.6 km',
    time: '48 min (Delayed)',
    safetyScore: 35,
    safetyRating: 'HAZARDOUS',
    avoids: [
      'Physically 3.2 km shorter distance in dry conditions'
    ],
    hazards: [
      'CRITICAL: 3.2 ft standing water at Gokulpeth Railway Underpass',
      'High vehicle engine hydro-lock stall risk',
      'Severe 8 km/h traffic gridlock at Sitabuldi intersection',
      'Concealed deep potholes under standing surface water'
    ],
    aiReasoning: 'NOT RECOMMENDED: Although physically 3.2 km shorter, this corridor passes through a 295m low-elevation basin experiencing 3.2 ft waterlogging and active construction bottlenecks, causing an estimated 30+ min delay and vehicle damage risk.',
    polylineType: 'submerged'
  },
  {
    id: 'alt',
    name: 'Outer Ring Road Expressway Bypass',
    badge: '🟠 BALANCED ALTERNATIVE',
    badgeColor: 'bg-[#FFC107] text-[#111111]',
    distance: '16.4 km',
    time: '28 min',
    safetyScore: 72,
    safetyRating: 'GOOD',
    avoids: [
      'Bypasses central city traffic bottlenecks',
      'Open multi-lane divided highway'
    ],
    hazards: [
      'Single lane merge near Kalamna Nala pier work'
    ],
    aiReasoning: 'Good alternative for freight and commercial vehicles avoiding inner city congestion, with open highway lanes and moderate road surface quality.',
    polylineType: 'ring'
  }
];

export const RouteComparisonDemo: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('safe');

  const activeRoute = DEMO_ROUTES.find(r => r.id === selectedRouteId) || DEMO_ROUTES[0];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF8A00]/10 border border-[#FF8A00]/30 text-[#FF8A00] text-xs font-mono font-bold">
          <Navigation className="size-3.5" /> PREDICTIVE SAFE ROUTING
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] dark:text-white tracking-tight font-outfit">
          The Shortest Route Isn't Always the Safest.
        </h2>
        <p className="text-sm sm:text-base text-[#666666] dark:text-gray-300">
          Standard navigation apps push drivers through flooded underpasses and active construction zones just to save 200 meters. <strong>NagDrishti calculates a real-time Safety Score (0–100)</strong> to keep you out of harm's way.
        </p>
      </div>

      {/* Interactive Demonstration Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-[#111C2E] p-4 sm:p-8 rounded-3xl border border-[#E5E5E5] dark:border-white/10 shadow-lg">
        {/* Left Route Selector Cards */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#666666] dark:text-gray-400 uppercase tracking-wider">
            <span>Calculated Route Options (3)</span>
            <span className="font-mono text-[#FF8A00]">Nagpur Airport → Civil Lines</span>
          </div>

          {DEMO_ROUTES.map(route => {
            const isSelected = selectedRouteId === route.id;
            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5",
                  isSelected
                    ? "border-[#FF8A00] bg-gradient-to-r from-[#FFF8E1] to-white dark:from-[#FFC107]/10 dark:to-[#0B1320] shadow-md ring-2 ring-[#FF8A00]/20"
                    : "border-[#E5E5E5] dark:border-white/10 bg-[#F7F7F7] dark:bg-[#0B1320] hover:border-[#FFC107]"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded", route.badgeColor)}>
                    {route.badge}
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-[#111111] dark:text-white">
                      {route.safetyScore}
                    </span>
                    <span className="text-[10px] text-[#666666] dark:text-gray-400">/100</span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-[#111111] dark:text-white">
                  {route.name}
                </h3>

                <div className="flex items-center gap-4 text-xs text-[#666666] dark:text-gray-300 font-semibold pt-1 border-t border-[#E5E5E5] dark:border-white/5">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5 text-[#FF8A00]" /> {route.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Car className="size-3.5 text-[#666666] dark:text-gray-400" /> {route.distance}
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold ml-auto">
                    {route.safetyRating}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Active Route Deep Dive & AI Explanation */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10 space-y-4">
            {/* Visual Route Path Map SVG Preview */}
            <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#070D18] border border-white/10 p-3 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 400 150">
                {/* Background Grid */}
                <path d="M 20,20 L 380,20 M 20,75 L 380,75 M 20,130 L 380,130" stroke="#ffffff10" strokeWidth="1" strokeDasharray="3,3" />

                {/* Direct Unsafe Polyline (passing through flood node) */}
                <path
                  d="M 40,120 L 160,80 L 250,75 L 360,30"
                  fill="none"
                  stroke={activeRoute.id === 'fastest' ? "#E53935" : "#ffffff20"}
                  strokeWidth={activeRoute.id === 'fastest' ? "5" : "2"}
                  strokeDasharray={activeRoute.id === 'fastest' ? "none" : "4,4"}
                />

                {/* Safe Elevated Polyline (curving away from flood basin) */}
                <path
                  d="M 40,120 L 140,130 L 290,110 L 360,30"
                  fill="none"
                  stroke={activeRoute.id === 'safe' ? "#22A447" : "#ffffff20"}
                  strokeWidth={activeRoute.id === 'safe' ? "6" : "2"}
                />

                {/* Ring Road Polyline */}
                <path
                  d="M 40,120 L 50,40 L 240,20 L 360,30"
                  fill="none"
                  stroke={activeRoute.id === 'alt' ? "#FFC107" : "#ffffff20"}
                  strokeWidth={activeRoute.id === 'alt' ? "5" : "2"}
                  strokeDasharray={activeRoute.id === 'alt' ? "none" : "4,4"}
                />

                {/* Submerged Hazard Node */}
                <circle cx="200" cy="78" r="14" fill="#E53935" fillOpacity="0.4" stroke="#E53935" strokeWidth="2" className="animate-pulse" />
                <text x="200" y="82" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">💧 3.2ft</text>

                {/* Construction Hazard Node */}
                <circle cx="250" cy="45" r="12" fill="#FF8A00" fillOpacity="0.4" stroke="#FF8A00" strokeWidth="2" />
                <text x="250" y="49" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">🚧</text>

                {/* Origin Marker */}
                <circle cx="40" cy="120" r="7" fill="#00E676" stroke="#ffffff" strokeWidth="2" />
                <text x="40" y="142" textAnchor="middle" fill="#00E676" fontSize="9" fontWeight="bold">Airport</text>

                {/* Destination Marker */}
                <circle cx="360" cy="30" r="7" fill="#FF8A00" stroke="#ffffff" strokeWidth="2" />
                <text x="360" y="18" textAnchor="middle" fill="#FF8A00" fontSize="9" fontWeight="bold">Civil Lines</text>
              </svg>
            </div>

            {/* AI Reasoning Box */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#FFF8E1] to-white dark:from-[#FFC107]/10 dark:to-transparent border border-[#FFC107]/30 text-xs">
              <div className="flex items-center gap-1.5 text-[#FF8A00] font-bold mb-1">
                <Sparkles className="size-4" />
                <span>Explainable AI Routing Rationale:</span>
              </div>
              <p className="text-xs text-[#111111] dark:text-gray-200 leading-relaxed font-medium">
                {activeRoute.aiReasoning}
              </p>
            </div>

            {/* Highlights & Hazards */}
            <div className="space-y-2">
              {activeRoute.avoids.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}

              {activeRoute.hazards.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* CTA Button to Try Safe Routing */}
            <Link
              to="/citizen/route"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Compass className="size-4" /> Plan Live Safe Route in Citizen App
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
