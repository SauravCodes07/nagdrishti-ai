import React from 'react';
import { Link } from 'react-router';
import { LandingNavbar } from './components/LandingNavbar';
import { LandingFooter } from './components/LandingFooter';
import { NagpurHero3D } from './components/NagpurHero3D';
import { RouteComparisonDemo } from './components/RouteComparisonDemo';
import { DataPipelineFlow } from './components/DataPipelineFlow';
import { YearRoundTimeline } from './components/YearRoundTimeline';
import { CitizenAdminComparison } from './components/CitizenAdminComparison';
import { Sparkles, ShieldCheck, ArrowRight, Navigation, Satellite, Cpu, Database, CloudRain, HardHat, Car, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#070D18] text-[#111111] dark:text-white font-sans selection:bg-[#FF8A00] selection:text-white">
      {/* Sticky Header Navbar */}
      <LandingNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Hero Title & Value Proposition */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF8E1] dark:bg-[#FFC107]/15 border border-[#FFC107]/40 text-[#111111] dark:text-[#FFC107] text-xs font-mono font-bold shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF8A00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF8A00]"></span>
            </span>
            <span>NAGPUR URBAN INTELLIGENCE PLATFORM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-outfit text-[#111111] dark:text-white leading-[1.1]">
            SEE THE RISK <br />
            <span className="bg-gradient-to-r from-[#FF8A00] via-[#FFC107] to-[#FF8A00] bg-clip-text text-transparent">
              BEFORE YOU REACH IT.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-[#666666] dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            AI-powered urban intelligence that combines real-world weather data, Copernicus satellite radar, civil construction monitoring, and predictive safe routing to help citizens navigate safely and authorities respond earlier.
          </p>

          {/* Hero CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/citizen"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#FF8A00] hover:bg-[#E07A00] text-white font-extrabold text-sm shadow-btn-shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Navigation className="size-4" /> EXPLORE NAGDRISHTI
            </Link>

            <Link
              to="/admin"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#F7F7F7] dark:bg-white/10 hover:bg-[#E5E5E5] dark:hover:bg-white/15 border border-[#E5E5E5] dark:border-white/15 text-[#111111] dark:text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="size-4 text-[#FF8A00]" /> OPEN COMMAND CENTER <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* 3D-Perspective Interactive Hero Visual */}
        <NagpurHero3D />
      </section>

      {/* 2. "NOT JUST A MAP" HIGHLIGHT SECTION */}
      <section id="how-it-works" className="py-12 sm:py-16 bg-[#F7F7F7] dark:bg-[#0B1320] border-y border-[#E5E5E5] dark:border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-[#FF8A00] uppercase tracking-wider">
              BEYOND STANDARD NAVIGATION
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] dark:text-white tracking-tight font-outfit">
              Not Just a Map. An Urban Safety Engine.
            </h2>
            <p className="text-sm sm:text-base text-[#666666] dark:text-gray-300">
              Cities change every single day. Monsoon cloudbursts submerge low railway underpasses. Maha Metro Phase 2 excavates new piers. Potholes deepen after torrential downpours. NagDrishti continuously combines every available signal to understand how city changes impact human safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-2">
              <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <CloudRain className="size-5" />
              </div>
              <h4 className="font-bold text-sm text-[#111111] dark:text-white">Live Open-Meteo Weather</h4>
              <p className="text-xs text-[#666666] dark:text-gray-400">
                Real-time rainfall telemetry, precipitation probability, and wind metrics mapped directly to Nagpur wards.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-2">
              <div className="size-10 rounded-xl bg-[#FFF8E1] dark:bg-[#FFC107]/20 text-[#FF8A00] flex items-center justify-center">
                <HardHat className="size-5" />
              </div>
              <h4 className="font-bold text-sm text-[#111111] dark:text-white">Year-Round Construction</h4>
              <p className="text-xs text-[#666666] dark:text-gray-400">
                Continuous tracking of Maha Metro Phase 2, Pardi Flyover, and Wardha Road drainage culverts.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-2">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Satellite className="size-5" />
              </div>
              <h4 className="font-bold text-sm text-[#111111] dark:text-white">Sentinel Radar Satellite</h4>
              <p className="text-xs text-[#666666] dark:text-gray-400">
                Copernicus C-band Synthetic Aperture Radar (SAR) penetrates storm clouds to detect lake basin flooding.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-2">
              <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Cpu className="size-5" />
              </div>
              <h4 className="font-bold text-sm text-[#111111] dark:text-white">Prithvi GeoAI Models</h4>
              <p className="text-xs text-[#666666] dark:text-gray-400">
                IBM/NASA Earth Observation foundation models segment surface water anomalies into PostGIS polygons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "FASTEST VS SAFEST ROUTE" INTERACTIVE DEMONSTRATION */}
      <section id="route-intelligence" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <RouteComparisonDemo />
      </section>

      {/* 4. "DATA → GEOAI → PREDICTION → ACTION" PIPELINE */}
      <section className="py-12 sm:py-16 bg-[#F7F7F7] dark:bg-[#0B1320] border-y border-[#E5E5E5] dark:border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <DataPipelineFlow />
        </div>
      </section>

      {/* 5. "SEE BEYOND THE ROAD" — SATELLITE INTELLIGENCE */}
      <section id="geoai-satellite" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold">
            <Satellite className="size-3.5" /> EARTH OBSERVATION & RADAR
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] dark:text-white tracking-tight font-outfit">
            See Beyond the Road with Copernicus SAR.
          </h2>
          <p className="text-sm sm:text-base text-[#666666] dark:text-gray-300">
            During peak monsoon cloudbursts, optical satellites and street cameras are blinded by torrential rainfall. NagDrishti utilizes <strong>Copernicus Sentinel-1 Synthetic Aperture Radar (SAR)</strong> to penetrate dense overcast skies and detect standing water pooling across Nagpur.
          </p>
        </div>

        {/* Satellite Feature Card Visual */}
        <div className="bg-gradient-to-r from-[#0B1320] to-[#111C2E] text-white p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#FFC107]">
              <span>INSTRUMENT: C-SAR (10m RESOLUTION)</span>
              <span>•</span>
              <span>ORBIT: DESCENDING PASS</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold font-outfit">
              Cloud-Penetrating Synthetic Aperture Radar
            </h3>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              When radar microwaves hit standing water, specular reflection directs energy away from the sensor, causing a sharp drop (&lt; -16 dB in VV+VH bands). The Hugging Face <strong>IBM/NASA Prithvi EO-100M</strong> foundation model segments these backscatter anomalies into geometric polygons stored directly in PostGIS.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-gray-400 font-mono">LAKE BASIN MONITORING</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">Ambazari & Futala</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-gray-400 font-mono">GEOAI BACKBONE</span>
                <p className="text-sm font-bold text-[#FFC107] mt-0.5">Prithvi ViT 100M</p>
              </div>
            </div>

            <Link
              to="/admin/satellite"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold text-xs shadow-xs transition-all"
            >
              <Satellite className="size-4" /> View Satellite Intelligence in Command Center
            </Link>
          </div>

          {/* Visual Radar vs Map Layer Card */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#070D18] p-4 h-64 sm:h-80 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0f_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 text-center space-y-3">
              <div className="size-16 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center mx-auto shadow-lg animate-pulse">
                <Satellite className="size-8" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-[#FF8A00]">
                  COPERNICUS SENTINEL-1 INUNDATION LAYER
                </span>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                  Scene S1A_IW_GRDH_1SDV_Nagpur processed via Google Earth Engine & Hugging Face GeoAI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. "NOT JUST FOR THE RAIN" — YEAR-ROUND TIMELINE */}
      <section id="year-round" className="py-12 sm:py-16 bg-[#F7F7F7] dark:bg-[#0B1320] border-y border-[#E5E5E5] dark:border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <YearRoundTimeline />
        </div>
      </section>

      {/* 7. CITIZEN VS ADMIN — TWO-SIDED PLATFORM SHOWCASE */}
      <section id="two-sided" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <CitizenAdminComparison />
      </section>

      {/* 8. FINAL CALL TO ACTION SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-[#111111] dark:text-white tracking-tight font-outfit">
            The City is Always Changing. <br />
            <span className="text-[#FF8A00]">Now You Can See What's Ahead.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#666666] dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            NagDrishti AI brings real-world weather data, geospatial intelligence, and predictive risk analysis together for a safer, smarter Nagpur.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/citizen"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FF8A00] hover:bg-[#E07A00] text-white font-extrabold text-sm shadow-btn-shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Navigation className="size-4" /> EXPLORE NAGDRISHTI CITIZEN
            </Link>

            <Link
              to="/admin"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#F7F7F7] dark:bg-white/10 hover:bg-[#E5E5E5] dark:hover:bg-white/15 border border-[#E5E5E5] dark:border-white/15 text-[#111111] dark:text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="size-4 text-[#FF8A00]" /> OPEN CRISIS COMMAND CENTER <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
