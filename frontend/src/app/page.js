"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldAlert,
  AlertTriangle,
  Camera,
  Navigation,
  MapPin,
  CloudRain,
  Activity,
  ArrowRight,
  Droplets,
  Car,
  Bell,
  CheckCircle2,
  RefreshCw,
  PhoneCall,
  Sparkles,
  Bot,
  Layers,
  Search,
  Radio,
  Eye,
  ShieldCheck,
  Compass,
  Cpu,
  ChevronRight,
  Share2,
} from "lucide-react";
import { motion } from "framer-motion";
import CitizenLayout from "../components/layouts/CitizenLayout";
import MapComponent from "../components/MapComponent";
import { getRiskZones, getReports, getBroadcastAlerts, getWeather, getSafeRoute } from "../lib/api";

export default function CitizenHomePage() {
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState({ condition: "Showers", rainfall_intensity_mm: 18.5, temperature: 28 });
  const [selectedZone, setSelectedZone] = useState(null);

  // Quick route preview state in Section 6
  const [quickRouteResult, setQuickRouteResult] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [zData, rData, aData, wData] = await Promise.allSettled([
          getRiskZones(),
          getReports(),
          getBroadcastAlerts(),
          getWeather(),
        ]);

        if (zData.status === "fulfilled" && Array.isArray(zData.value)) setZones(zData.value);
        if (rData.status === "fulfilled" && Array.isArray(rData.value)) setReports(rData.value);
        if (aData.status === "fulfilled" && Array.isArray(aData.value)) setAlerts(aData.value);
        if (wData.status === "fulfilled" && wData.value) setWeather(wData.value);
      } catch (err) {
        console.error("Home data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute live aggregates from real backend data
  const severeZonesCount = zones.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75)).length;
  const highZonesCount = zones.filter((z) => (z.risk_category === "High" || ((z.latest_risk_score ?? z.risk_score) >= 50 && (z.latest_risk_score ?? z.risk_score) < 75))).length;
  const mediumZonesCount = zones.filter((z) => (z.risk_category === "Medium" || ((z.latest_risk_score ?? z.risk_score) >= 25 && (z.latest_risk_score ?? z.risk_score) < 50))).length;
  const lowZonesCount = zones.filter((z) => (z.risk_category === "Low" || (z.latest_risk_score ?? z.risk_score) < 25)).length;

  const highestRiskScore = zones.reduce((max, z) => Math.max(max, z.latest_risk_score ?? z.risk_score ?? 0), 0);
  const averageRiskScore = zones.length ? Math.round(zones.reduce((sum, z) => sum + (z.latest_risk_score ?? z.risk_score ?? 0), 0) / zones.length) : 24;

  const overallThreat = highestRiskScore >= 75 ? "Severe Flood Risk" : highestRiskScore >= 50 ? "High Risk Alert" : highestRiskScore >= 25 ? "Moderate Waterlogging" : "Low Risk (Normal)";
  const threatBadgeColor = highestRiskScore >= 75 ? "bg-red-500/20 text-red-400 border-red-500/30" : highestRiskScore >= 50 ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : highestRiskScore >= 25 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

  // Trigger sample safe route calculation for demo section
  const handleQuickRouteDemo = async () => {
    try {
      setCalculatingRoute(true);
      // Dharampeth to Lakadganj
      const data = await getSafeRoute(21.1472, 79.0664, 21.1550, 79.1300);
      setQuickRouteResult(data);
    } catch (e) {
      console.error("Demo route error:", e);
    } finally {
      setCalculatingRoute(false);
    }
  };

  return (
    <CitizenLayout>
      <div className="space-y-16 sm:space-y-24">
        {/* ========================================================================= */}
        {/* SECTION 1: HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D3834] via-[#0F1D2F] to-[#0B0F17] p-6 sm:p-10 lg:p-14 border border-teal-500/30 shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                <span>Nagpur Municipal AI Crisis Shield</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                AI-Powered Urban Safety & Real-Time Crisis Awareness for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-300 to-cyan-400">
                  Nagpur
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-normal max-w-2xl">
                Understand local flood and road risks across 10 municipal zones, discover flood-safe navigation routes, report hazardous waterlogging with instant Vision AI validation, and receive official emergency broadcasts.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/map"
                  className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-sm shadow-xl shadow-teal-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Explore Live Map</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/report"
                  className="px-6 py-3.5 rounded-2xl bg-[#131B2A] hover:bg-[#1E293B] border border-teal-500/40 text-teal-300 font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Camera className="w-4 h-4 text-teal-400" />
                  <span>Report a Hazard</span>
                </Link>

                <Link
                  href="/route"
                  className="px-5 py-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700 text-slate-300 font-semibold text-sm transition flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4 text-slate-400" />
                  <span>Safe Routes</span>
                </Link>
              </div>

              {/* Verified Trust Stats */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/60 max-w-lg text-xs">
                <div>
                  <div className="text-xl font-black text-white">10 Wards</div>
                  <div className="text-slate-400 text-[11px]">Monitored Real-time</div>
                </div>
                <div>
                  <div className="text-xl font-black text-teal-400">OSMnx A*</div>
                  <div className="text-slate-400 text-[11px]">Risk-Aware Routing</div>
                </div>
                <div>
                  <div className="text-xl font-black text-emerald-400">Vision AI</div>
                  <div className="text-slate-400 text-[11px]">Instant Verification</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#131B2A]/90 border border-teal-500/30 rounded-3xl p-6 shadow-2xl space-y-5 backdrop-blur-md">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">Nagpur Crisis Gauge</h3>
                      <p className="text-[10px] text-slate-400">Real-Time Risk Index</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${threatBadgeColor}`}>
                    {overallThreat}
                  </span>
                </div>

                {/* Score Big Display */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-4xl font-black text-white flex items-baseline gap-1.5">
                      {highestRiskScore.toFixed(0)}
                      <span className="text-xs font-bold text-slate-400">/ 100 max risk</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {severeZonesCount > 0
                        ? `${severeZonesCount} ward(s) experiencing severe waterlogging.`
                        : "Drainage networks operating normally across city."}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-400">City Average</div>
                    <div className="text-xl font-black text-teal-400">{averageRiskScore}/100</div>
                  </div>
                </div>

                {/* Gradient Risk Meter */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full rounded-full bg-[#1E293B] overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(12, highestRiskScore))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>Low (0)</span>
                    <span>Moderate (50)</span>
                    <span>Severe (100)</span>
                  </div>
                </div>

                {/* Quick Interactive Map Launcher */}
                <Link
                  href="/map"
                  className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Launch Interactive Ward GIS Map</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: TRUST / LIVE STATUS METRICS (Real Data) */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-teal-400">
                Citywide Live Telemetry
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Current Nagpur Environmental & Road Status
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Synchronized with IMD Radar & Citizen GIS Reports
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Rainfall */}
            <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-teal-500/40 transition">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">IMD Rainfall</span>
                <CloudRain className="w-5 h-5 text-teal-400" />
              </div>
              <div className="text-3xl font-black text-white flex items-baseline gap-1">
                {weather.rainfall_intensity_mm ?? 0}
                <span className="text-xs font-normal text-slate-400">mm/h</span>
              </div>
              <div className="text-xs text-teal-400 font-semibold truncate">
                {weather.condition || "Live Radar Stream"}
              </div>
            </div>

            {/* Metric 2: Flooded Wards */}
            <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-teal-500/40 transition">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Flooded Wards</span>
                <Droplets className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-3xl font-black text-white flex items-baseline gap-1">
                {severeZonesCount + highZonesCount}
                <span className="text-xs font-normal text-slate-400">/ {zones.length || 10} Total</span>
              </div>
              <div className="text-xs text-red-400 font-semibold">
                {severeZonesCount} Severe, {highZonesCount} High Risk
              </div>
            </div>

            {/* Metric 3: Safe Roads */}
            <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-teal-500/40 transition">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Safe Road Corridors</span>
                <Car className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white flex items-baseline gap-1">
                {zones.length > 0 ? Math.round((1 - (severeZonesCount / zones.length)) * 100) : 92}%
                <span className="text-xs font-normal text-slate-400">Clear</span>
              </div>
              <div className="text-xs text-emerald-400 font-semibold">
                Bypassing Critical Basins
              </div>
            </div>

            {/* Metric 4: Citizen Reports */}
            <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-teal-500/40 transition">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Citizen Reports</span>
                <Camera className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white flex items-baseline gap-1">
                {reports.length}
                <span className="text-xs font-normal text-slate-400">Submitted</span>
              </div>
              <div className="text-xs text-amber-400 font-semibold">
                {reports.filter((r) => r.verification_status === "Pending").length} Pending Review
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: HOW NAGDRISHTI AI HELPS (4 Feature Cards) */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-teal-400">
              Platform Capabilities
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              How NagDrishti AI Protects Nagpur
            </h2>
            <p className="text-slate-400 text-sm">
              Integrated geospatial AI and community reporting engineered for real urban flood management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Real-Time Risk */}
            <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-6 shadow-sm space-y-4 hover:border-teal-500/50 transition group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-white group-hover:text-teal-400 transition-colors">
                  Real-Time Risk
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Understand ward-by-ward risk index calculated via multi-variable formula combining rainfall intensity, elevation factors, and drainage saturation.
                </p>
              </div>
              <Link href="/map" className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:underline pt-2">
                <span>View Risk Zones</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Smart Routing */}
            <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-6 shadow-sm space-y-4 hover:border-teal-500/50 transition group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Navigation className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-white group-hover:text-teal-400 transition-colors">
                  Smart Routing
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Compute flood-safe routes across the OpenStreetMap road graph with A* pathfinding that actively avoids waterlogged corridors.
                </p>
              </div>
              <Link href="/route" className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:underline pt-2">
                <span>Calculate Route</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3: Report Hazards */}
            <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-6 shadow-sm space-y-4 hover:border-teal-500/50 transition group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-white group-hover:text-teal-400 transition-colors">
                  Report Hazards
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Snap and upload evidence photos. Hugging Face Vision AI instantly validates waterlogging and prioritizes emergency municipal dispatch.
                </p>
              </div>
              <Link href="/report" className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:underline pt-2">
                <span>Submit Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4: Live Alerts */}
            <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-6 shadow-sm space-y-4 hover:border-teal-500/50 transition group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bell className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-white group-hover:text-teal-400 transition-colors">
                  Live Alerts
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Stay updated with official municipal disaster cell broadcasts delivered directly and easily shareable via WhatsApp & SMS.
                </p>
              </div>
              <Link href="/alerts" className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:underline pt-2">
                <span>View Active Alerts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: INTERACTIVE MAP PREVIEW (Actual Leaflet Implementation) */}
        {/* ========================================================================= */}
        <section className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-teal-400">
                Geospatial Intelligence
              </div>
              <h2 className="text-2xl font-black text-white">
                Interactive Nagpur Ward & Hazard Map
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click on any ward polygon or hazard marker to inspect live drainage capacity and rainfall metrics.
              </p>
            </div>

            <Link
              href="/map"
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 flex items-center gap-2 self-start sm:self-auto transition active:scale-95"
            >
              <MapPin className="w-4 h-4" />
              <span>Full Screen Map ↗</span>
            </Link>
          </div>

          {/* Interactive Map Component */}
          <div className="h-[460px] sm:h-[520px] w-full rounded-2xl overflow-hidden border border-[#1E293B] shadow-inner relative">
            <MapComponent
              zones={zones}
              reports={reports}
              onZoneClick={(zone) => setSelectedZone(zone)}
            />
          </div>

          {/* Selected Ward Info Banner */}
          {selectedZone && (
            <div className="p-4 rounded-2xl bg-[#1E293B] border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">{selectedZone.name}</h4>
                  <p className="text-xs text-slate-400">
                    Rainfall: {(selectedZone.rainfall_mm ?? 0).toFixed(1)} mm/h • Drainage: {Math.round((selectedZone.drainage_capacity || 0.5) * 100)}% • Elevation Factor: {selectedZone.elevation_factor || 0.4}
                  </p>
                </div>
              </div>

              <Link
                href={`/route?destination=${encodeURIComponent(selectedZone.name)}`}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition"
              >
                Safe Route to {selectedZone.name}
              </Link>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: FOR CITIZENS — 5-STEP WORKFLOW */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-teal-400">
              Citizen Journey
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              5 Steps to Safer Urban Mobility
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              How citizens use NagDrishti AI before and during monsoon journeys.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                title: "Check Conditions",
                desc: "Review live Nagpur flood crisis index and IMD rainfall intensity.",
                icon: CloudRain,
              },
              {
                step: "02",
                title: "Understand Risk",
                desc: "Identify low, medium, and severe risk zones across your journey path.",
                icon: Activity,
              },
              {
                step: "03",
                title: "Find Safe Route",
                desc: "Calculate flood-avoidant navigation bypasses to reach your destination safely.",
                icon: Navigation,
              },
              {
                step: "04",
                title: "Report Hazards",
                desc: "Snap photos of waterlogged underpasses to trigger AI verification and dispatch.",
                icon: Camera,
              },
              {
                step: "05",
                title: "Receive Alerts",
                desc: "Get instant civic advisories issued by the municipal disaster response desk.",
                icon: Bell,
              },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-3 relative hover:border-teal-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-teal-500/40 font-mono">
                      {st.step}
                    </span>
                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-black text-white">{st.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: SAFER ROUTES (OSMnx A* Navigation Showcase) */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-br from-[#131B2A] to-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left explanation */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-black uppercase">
                <Compass className="w-3.5 h-3.5" />
                <span>OSMnx Risk-Penalized Pathfinding</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Never Get Stranded in Submerged Underpasses
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                Standard GPS maps suggest routes purely by speed, frequently directing commuters through deeply flooded basins. NagDrishti AI overlays real-time ward severity scores onto the Nagpur road network, actively penalizing flooded edges so you always take the safest path.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1E293B]/70 border border-[#334155]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <strong className="text-white">Active Risk Avoidance:</strong> Automatically penalizes roads in severe catchments by up to 10× weight.
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1E293B]/70 border border-[#334155]">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  <div className="text-xs">
                    <strong className="text-white">Zero Mile Hub Integration:</strong> Pre-mapped navigation hubs covering Sitabuldi, Dharampeth, Sadar, and Lakadganj.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Link
                  href="/route"
                  className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 transition active:scale-95 flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open Safe Route Finder</span>
                </Link>

                <button
                  onClick={handleQuickRouteDemo}
                  disabled={calculatingRoute}
                  className="px-4 py-3 rounded-2xl bg-[#1E293B] hover:bg-[#243044] text-slate-200 font-bold text-xs border border-[#334155] transition flex items-center gap-1.5"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-teal-400 ${calculatingRoute ? "animate-spin" : ""}`} />
                  <span>{calculatingRoute ? "Computing..." : "Test Dharampeth → Lakadganj"}</span>
                </button>
              </div>
            </div>

            {/* Right Interactive/Sample Route Preview */}
            <div className="lg:col-span-6">
              <div className="bg-[#0B0F17] border border-[#1E293B] rounded-3xl p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                  <div className="flex items-center gap-2 text-xs font-black text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Safe Route Preview</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    A* Safe Path
                  </span>
                </div>

                <div className="h-56 w-full rounded-2xl overflow-hidden border border-[#1E293B] relative">
                  <MapComponent routeData={quickRouteResult} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#131B2A] border border-[#1E293B]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Start</div>
                    <div className="font-black text-white truncate">Dharampeth Sq</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#131B2A] border border-[#1E293B]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Destination</div>
                    <div className="font-black text-white truncate">Lakadganj Sq</div>
                  </div>
                </div>

                {quickRouteResult && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                    {quickRouteResult.safety_explanation || "Path computed successfully avoiding severe flood zones."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7: REPORTING (Citizen Hazard Reporting Workflow) */}
        {/* ========================================================================= */}
        <section className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual step card preview */}
            <div className="lg:col-span-5 order-2 lg:order-1 space-y-3">
              <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#1E293B] space-y-3">
                <div className="flex items-center justify-between text-xs font-black text-white">
                  <span>Supported Hazard Categories</span>
                  <Camera className="w-4 h-4 text-teal-400" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#131B2A] border border-[#1E293B] flex items-center gap-2">
                    <span className="text-base">🌊</span>
                    <span className="font-bold text-slate-200">Waterlogging</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#131B2A] border border-[#1E293B] flex items-center gap-2">
                    <span className="text-base">🕳️</span>
                    <span className="font-bold text-slate-200">Potholes</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#131B2A] border border-[#1E293B] flex items-center gap-2">
                    <span className="text-base">🚗</span>
                    <span className="font-bold text-slate-200">Underpass</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#131B2A] border border-[#1E293B] flex items-center gap-2">
                    <span className="text-base">🚧</span>
                    <span className="font-bold text-slate-200">Drain Block</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 font-semibold flex items-center gap-2">
                  <Bot className="w-4 h-4 shrink-0 text-teal-400" />
                  <span>Hugging Face AI Vision scans evidence photo in &lt;2 seconds</span>
                </div>
              </div>
            </div>

            {/* Explanation & CTA */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-black uppercase">
                <Camera className="w-3.5 h-3.5" />
                <span>Crowdsourced Civic Reporting</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Help City Authorities Spot Waterlogging Faster
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                Every citizen report strengthens the Nagpur crisis shield. When you upload a photo of a flooded street or open storm drain, our vision model analyzes flood severity and automatically routes the incident to the municipal response queue for quick dewatering dispatch.
              </p>

              <div className="pt-2">
                <Link
                  href="/report"
                  className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-sm shadow-xl shadow-teal-600/30 inline-flex items-center gap-2 active:scale-95 transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>Report a Hazard Now</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8: ALERTS (Live Broadcasts with Semantic Colors) */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-teal-400">
                Official Broadcasts
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Live Nagpur Civic Alerts
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Real-time advisories issued by Nagpur Municipal Disaster Management Cell.
              </p>
            </div>

            <Link
              href="/alerts"
              className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All Alerts ({alerts.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.slice(0, 3).map((alert) => {
              const isSevere = alert.severity === "Severe" || (alert.severity || "").toLowerCase() === "severe";
              const isHigh = alert.severity === "High" || (alert.severity || "").toLowerCase() === "high";

              return (
                <div
                  key={alert.id}
                  className={`bg-[#131B2A] border rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between ${
                    isSevere
                      ? "border-red-500/40"
                      : isHigh
                      ? "border-orange-500/40"
                      : "border-[#1E293B]"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-xl ${
                            isSevere
                              ? "bg-red-500/10 text-red-400"
                              : isHigh
                              ? "bg-orange-500/10 text-orange-400"
                              : "bg-teal-500/10 text-teal-400"
                          }`}
                        >
                          <Radio className="w-4 h-4 animate-pulse" />
                        </div>
                        <span className="text-xs font-black text-white truncate max-w-[150px]">
                          {alert.zone_name || "Nagpur Urban Zone"}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isSevere
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : isHigh
                            ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {alert.severity || "Severe"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-medium line-clamp-3">
                      {alert.message}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
                    <span>{alert.channel || "SMS & WhatsApp"}</span>
                    <span>{alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Live"}</span>
                  </div>
                </div>
              );
            })}

            {alerts.length === 0 && (
              <div className="col-span-full p-8 rounded-3xl bg-[#131B2A] border border-[#1E293B] text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-white">No Critical Weather Alerts Active</h3>
                <p className="text-xs text-slate-400">All Nagpur drainage corridors are currently operating under normal capacity.</p>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9: AI / INTELLIGENCE EXPLAINED */}
        {/* ========================================================================= */}
        <section className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-teal-400">
              Under The Hood
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              What Makes NagDrishti AI Accurate
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Engineered with proven mathematical modeling and computer vision pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tech 1 */}
            <div className="p-5 rounded-2xl bg-[#0B0F17] border border-[#1E293B] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-mono font-bold text-sm">
                01
              </div>
              <h3 className="text-sm font-black text-white">Multi-Variable Risk Formula</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates risk via: <code className="text-teal-400 font-mono">0.45·Rain + 0.35·(1-Elev) + 0.20·(1-Drain)</code> + Photo Validation Boost to accurately quantify localized flooding.
              </p>
            </div>

            {/* Tech 2 */}
            <div className="p-5 rounded-2xl bg-[#0B0F17] border border-[#1E293B] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-mono font-bold text-sm">
                02
              </div>
              <h3 className="text-sm font-black text-white">Hugging Face Vision AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Processes road images through deep learning vision transformers to automatically detect flood pooling depth, pavement distress, and road obstruction.
              </p>
            </div>

            {/* Tech 3 */}
            <div className="p-5 rounded-2xl bg-[#0B0F17] border border-[#1E293B] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-mono font-bold text-sm">
                03
              </div>
              <h3 className="text-sm font-black text-white">OSMnx Graph Optimization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Runs Dijkstra and A* pathfinding on real OpenStreetMap topology with dynamic edge penalties for rapid navigation around submerged catchments.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 10: EMERGENCY HELPLINES */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-red-950/40 via-[#131B2A] to-red-950/30 border border-red-900/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-600/30">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Emergency Services & Disaster Cell</h2>
                <p className="text-xs text-slate-300">Official 24/7 Nagpur Municipal Helplines</p>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-600/30 self-start sm:self-auto">
              24/7 Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="tel:07122567035"
              className="p-4 rounded-2xl bg-[#0B0F17]/90 border border-red-900/50 hover:border-red-500 transition flex items-center justify-between text-red-300 font-bold group"
            >
              <div>
                <div className="text-[10px] text-red-400 uppercase tracking-wider font-black">NMC Flood Control</div>
                <div className="text-base font-black text-white group-hover:text-red-400 transition">0712-2567035</div>
              </div>
              <PhoneCall className="w-4 h-4 text-red-400" />
            </a>

            <a
              href="tel:112"
              className="p-4 rounded-2xl bg-[#0B0F17]/90 border border-[#1E293B] hover:border-teal-500 transition flex items-center justify-between text-slate-200 font-bold group"
            >
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Police / Emergency</div>
                <div className="text-base font-black text-white group-hover:text-teal-400 transition">112</div>
              </div>
              <PhoneCall className="w-4 h-4 text-teal-400" />
            </a>

            <a
              href="tel:101"
              className="p-4 rounded-2xl bg-[#0B0F17]/90 border border-[#1E293B] hover:border-teal-500 transition flex items-center justify-between text-slate-200 font-bold group"
            >
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Fire & Disaster Rescue</div>
                <div className="text-base font-black text-white group-hover:text-teal-400 transition">101</div>
              </div>
              <PhoneCall className="w-4 h-4 text-teal-400" />
            </a>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 11: FINAL CALL TO ACTION */}
        {/* ========================================================================= */}
        <section className="text-center py-12 px-6 rounded-3xl bg-gradient-to-b from-[#131B2A] to-[#0B0F17] border border-teal-500/30 space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Make Every Journey Through Nagpur Safer.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Join thousands of citizens utilizing real-time flood intelligence, verified incident reports, and risk-optimized routing.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/map"
              className="px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-sm shadow-xl shadow-teal-600/30 hover:scale-105 active:scale-95 transition flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Open Live Map</span>
            </Link>

            <Link
              href="/route"
              className="px-8 py-4 rounded-2xl bg-[#1E293B] hover:bg-[#243044] text-teal-300 font-bold text-sm border border-teal-500/30 hover:scale-105 active:scale-95 transition flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-teal-400" />
              <span>Calculate Safe Route</span>
            </Link>

            <Link
              href="/report"
              className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-sm border border-slate-700 hover:scale-105 active:scale-95 transition flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Report a Hazard</span>
            </Link>
          </div>
        </section>
      </div>
    </CitizenLayout>
  );
}
