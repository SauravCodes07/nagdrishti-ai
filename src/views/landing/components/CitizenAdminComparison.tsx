import React from 'react';
import { User, ShieldCheck, Smartphone, Laptop, Navigation, BellRing, Camera, Layers, Cpu, Siren, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export const CitizenAdminComparison: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
          <ShieldCheck className="size-3.5" /> TWO-SIDED PLATFORM
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] dark:text-white tracking-tight font-outfit">
          Tailored Experiences for Citizens & Civic Authorities.
        </h2>
        <p className="text-sm sm:text-base text-[#666666] dark:text-gray-300">
          A single real-time data engine powering two distinct user experiences: a mobile-first app for daily commuters and a high-density command center for civic crisis managers.
        </p>
      </div>

      {/* Side-by-Side Dual Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. CITIZEN MOBILE EXPERIENCE CARD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/10 shadow-lg space-y-6 flex flex-col justify-between relative overflow-hidden group hover:border-[#FF8A00] transition-all">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF8A00]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-[#FFF8E1] dark:bg-[#FFC107]/20 text-[#FF8A00] flex items-center justify-center shadow-xs">
                  <Smartphone className="size-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#FF8A00] uppercase tracking-wider">
                    MOBILE FIRST • CITIZEN APP
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111] dark:text-white">
                    For Citizens & Daily Commuters
                  </h3>
                </div>
              </div>
              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-[#22A447]/10 text-[#22A447] border border-[#22A447]/20">
                320px–430px
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-300 leading-relaxed">
              Designed for high-speed mobile ergonomics when walking, riding two-wheelers, or driving across Nagpur. Focuses on safe navigation, instant hazard awareness, and friction-free reporting.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-[#111111] dark:text-gray-200">
                <Navigation className="size-4 text-[#FF8A00] shrink-0 mt-0.5" />
                <span><strong>Predictive Safe Routing:</strong> Dynamic Safety Scores (0–100) that automatically detour around flooded underpasses and deep potholes.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#111111] dark:text-gray-200">
                <BellRing className="size-4 text-[#E53935] shrink-0 mt-0.5" />
                <span><strong>Proximity Hazard Alerts:</strong> Receive warnings when approaching active waterlogging or Maha Metro construction zones.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#111111] dark:text-gray-200">
                <Camera className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>1-Minute Photo Pinning:</strong> Geotag potholes or stalled vehicles directly to the NMC command center.</span>
              </div>
            </div>
          </div>

          <Link
            to="/citizen"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#FF8A00] hover:bg-[#E07A00] text-white font-extrabold text-xs shadow-btn-shadow transition-all"
          >
            <User className="size-4" /> Launch Citizen Experience <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* 2. ADMIN COMMAND CENTER CARD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/10 shadow-lg space-y-6 flex flex-col justify-between relative overflow-hidden group hover:border-[#FFC107] transition-all">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                  <Laptop className="size-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    LAPTOP FIRST • COMMAND CENTER
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111] dark:text-white">
                    For NMC & Emergency Responders
                  </h3>
                </div>
              </div>
              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-[#FFC107]/15 text-[#111111] dark:text-[#FFC107] border border-[#FFC107]/30">
                1280px–1920px
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-300 leading-relaxed">
              Engineered for civic crisis managers, traffic police controllers, and disaster response teams. Offers high-density geospatial analytics, multi-layer GIS, and resource dispatching.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-[#111111] dark:text-gray-200">
                <Layers className="size-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>12-Layer Command GIS:</strong> Toggle heatmap polygons, radar satellite flood extents, civil construction, and real-time drainage deficits.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#111111] dark:text-gray-200">
                <Cpu className="size-4 text-[#FF8A00] shrink-0 mt-0.5" />
                <span><strong>Copernicus Satellite Intelligence:</strong> Sentinel-1 SAR cloud-penetrating radar observations paired with Prithvi GeoAI segmentation.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#111111] dark:text-gray-200">
                <Siren className="size-4 text-[#E53935] shrink-0 mt-0.5" />
                <span><strong>AI Action Priorities:</strong> Automated dispatch suggestions for dewatering diesel pumps, police barricades, and rescue boats.</span>
              </div>
            </div>
          </div>

          <Link
            to="/admin"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white font-extrabold text-xs shadow-md hover:bg-slate-700 transition-all"
          >
            <ShieldCheck className="size-4 text-[#FFC107]" /> Open Command Center <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
