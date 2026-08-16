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
  PhoneCall,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Bot,
  BrainCircuit,
  Compass,
  FileCheck2,
  Share2,
  ExternalLink,
  Lock,
  Sun,
  Moon,
  LayoutDashboard,
} from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useTheme } from "../components/ThemeProvider";

const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] rounded-2xl bg-slate-100 dark:bg-[#131B2A] flex items-center justify-center text-xs font-bold text-slate-400">
      Loading GIS Map Layer...
    </div>
  ),
});
import {
  getRiskZones,
  getReports,
  getBroadcastAlerts,
  getWeather,
} from "../lib/api";

const NAGPUR_HELPLINES = [
  {
    service: "NMC 24/7 Flood Control Room",
    phone: "0712-2567035",
    desc: "Nagpur Municipal Corporation emergency waterlogging and drainage helpline.",
    badge: "Official Municipal Desk",
  },
  {
    service: "Police Emergency Response",
    phone: "112",
    desc: "National emergency dialer for road blockages, accidents, and life safety.",
    badge: "24/7 National Dispatch",
  },
  {
    service: "Fire & Disaster Rescue",
    phone: "101",
    desc: "Rapid deployment for deep water rescue, fallen trees, and flash evacuations.",
    badge: "Disaster Response",
  },
];

export default function PublicLandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState({ condition: "Showers", rainfall_intensity_mm: 18.5, temperature: 28 });
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeZoneFilter, setActiveZoneFilter] = useState("all");
  const [copiedAlertId, setCopiedAlertId] = useState(null);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  useEffect(() => {
    async function loadLandingData() {
      try {
        setLoading(true);
        const [zData, rData, aData, wData] = await Promise.allSettled([
          getRiskZones(),
          getReports(),
          getBroadcastAlerts(),
          getWeather(),
        ]);

        if (zData.status === "fulfilled" && Array.isArray(zData.value)) {
          setZones(zData.value);
          const sorted = [...zData.value].sort(
            (a, b) => (b.latest_risk_score ?? b.risk_score ?? 0) - (a.latest_risk_score ?? a.risk_score ?? 0)
          );
          if (sorted.length > 0) setSelectedZone(sorted[0]);
        }
        if (rData.status === "fulfilled" && Array.isArray(rData.value)) {
          setReports(rData.value);
        }
        if (aData.status === "fulfilled" && Array.isArray(aData.value)) {
          setAlerts(aData.value);
        }
        if (wData.status === "fulfilled" && wData.value) {
          setWeather(wData.value);
        }
      } catch (err) {
        console.error("Landing data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLandingData();
  }, []);

  // Compute live aggregates from real data
  const severeZones = zones.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75));
  const highZones = zones.filter((z) => (z.risk_category === "High" || ((z.latest_risk_score ?? z.risk_score) >= 50 && (z.latest_risk_score ?? z.risk_score) < 75)));

  const highestRiskScore = zones.reduce((max, z) => Math.max(max, z.latest_risk_score ?? z.risk_score ?? 0), 0);
  const averageRiskScore = zones.length ? Math.round(zones.reduce((sum, z) => sum + (z.latest_risk_score ?? z.risk_score ?? 0), 0) / zones.length) : 24;

  const filteredZones = activeZoneFilter === "all"
    ? zones
    : activeZoneFilter === "severe"
    ? severeZones
    : activeZoneFilter === "high"
    ? highZones
    : zones.filter((z) => (z.latest_risk_score ?? z.risk_score ?? 0) < 50);

  const handleCopyAlert = (alert) => {
    const text = `🚨 *NagDrishti Alert — ${alert.zone_name || "Nagpur"}*\n${alert.message}\nSeverity: ${alert.severity || "Severe"}\nSource: Nagpur Municipal Corporation (NMC)`;
    navigator.clipboard.writeText(text);
    setCopiedAlertId(alert.id);
    setTimeout(() => setCopiedAlertId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 antialiased selection:bg-teal-500 selection:text-white transition-colors duration-200">
      {/* ========================================================================= */}
      {/* TOP PUBLIC NAVBAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E293B] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 p-1 flex items-center justify-center border border-teal-500/40 shadow-sm">
              <Image
                src="/brand/nagdrishti-logo.png"
                alt="NagDrishti AI"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">NagDrishti</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Civic Safety & Flood Awareness • Nagpur
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 transition"
            >
              Home
            </Link>
            <Link
              href="/map"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
            >
              Live Map
            </Link>
            <Link
              href="/route"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
            >
              Safe Routes
            </Link>
            <Link
              href="/report"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
            >
              Report Hazard
            </Link>
            <Link
              href="/alerts"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
            >
              Alerts
            </Link>
            <Link
              href="#about"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
            >
              About
            </Link>
          </nav>

          {/* Right Action Cluster (Theme Toggle, SOS, Launch App Button) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* THEME TOGGLE BUTTON (Prominently in upper navbar) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#131B2A] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1E293B] transition-colors shadow-sm"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Light/Dark Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-teal-600" />
              )}
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={() => setSosModalOpen(true)}
              className="px-3 py-2 sm:px-3.5 sm:py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
              title="24/7 Helplines"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Emergency SOS</span>
            </button>

            {/* Launch App / Dashboard Primary CTA */}
            <Link
              href="/dashboard"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-teal-600/30 flex items-center gap-2 active:scale-95 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Launch App</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200 dark:border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-black">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Nagpur Municipal Crisis Intelligence</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                AI-Powered Urban Safety & Real-Time Crisis Awareness for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 dark:from-teal-400 dark:via-teal-300 dark:to-emerald-300">
                  Nagpur
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                Intelligent flood risk forecasting, photo-verified road hazard detection,
                and risk-penalized safe route navigation built for Nagpur's citizens, commuters, and emergency responders.
              </p>

              {/* Primary & Secondary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/map"
                  className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-sm shadow-xl shadow-teal-600/30 flex items-center gap-2.5 transition active:scale-95"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Explore Live Map</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/report"
                  className="px-6 py-3.5 rounded-2xl bg-white dark:bg-[#131B2A] hover:bg-slate-100 dark:hover:bg-[#1E293B] border border-slate-300 dark:border-[#334155] text-slate-900 dark:text-white font-black text-sm shadow-sm flex items-center gap-2.5 transition active:scale-95"
                >
                  <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Report a Hazard</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#243044] text-slate-800 dark:text-slate-200 font-bold text-sm transition flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-teal-500" />
                  <span>Open Citizen Dashboard</span>
                </Link>
              </div>

              {/* Real-time trust signals */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>10 Administrative Wards Modelled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Hugging Face Vision AI Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>OSMnx Graph Safe Routing</span>
                </div>
              </div>
            </div>

            {/* Right: Live City Status Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      Citywide Telemetry
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Live Crisis Index
                    </h3>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${highestRiskScore >= 75 ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" : highestRiskScore >= 50 ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"}`}>
                    {highestRiskScore >= 75 ? "Severe Alert" : highestRiskScore >= 50 ? "High Watch" : "Normal Flow"}
                  </div>
                </div>

                {/* Score Gauge */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Peak Ward Threat</span>
                      <div className="text-3xl font-black text-slate-900 dark:text-white">
                        {highestRiskScore.toFixed(0)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Nagpur Average</span>
                      <div className="text-xl font-black text-teal-600 dark:text-teal-400">
                        {averageRiskScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-[#1E293B] overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(12, highestRiskScore))}%` }}
                    />
                  </div>
                </div>

                {/* Real-time stats grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Rainfall</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {weather.rainfall_intensity_mm ?? 0} mm/h
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Flooded Wards</span>
                    <span className="text-base font-black text-red-600 dark:text-red-400">
                      {severeZones.length} Severe / {zones.length || 10}
                    </span>
                  </div>
                </div>

                <Link
                  href="/map"
                  className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 transition active:scale-95"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Inspect Ward Details On Live Map</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: LIVE SAFETY PREVIEW STATS */}
      {/* ========================================================================= */}
      <section className="py-12 border-b border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase">IMD Rainfall Feed</span>
                <CloudRain className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {weather.rainfall_intensity_mm ?? 0} <span className="text-sm font-normal text-slate-400">mm/h</span>
              </div>
              <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold">{weather.condition || "Live Telemetry"}</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase">Flooded Wards</span>
                <Droplets className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {severeZones.length} <span className="text-sm font-normal text-slate-400">/ {zones.length || 10}</span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">Immediate attention needed</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase">Safe Road Network</span>
                <Car className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {zones.length > 0 ? Math.round((1 - (severeZones.length / zones.length)) * 100) : 92}%
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Safe bypass routes available</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase">Citizen Reports</span>
                <Activity className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {reports.length}
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Crowdsourced ground intel</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: FEATURES */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-slate-200 dark:border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Complete Civic Intelligence Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Purpose-Built for Monsoon Resilience in Nagpur
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Integrating Doppler radar rainfall feeds, PostGIS geospatial polygons, AI Vision classification,
              and graph-theoretic routing to protect citizens and enable rapid civic response.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-teal-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Real-Time Risk Monitoring
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Dynamic risk scoring across all 10 Nagpur administrative wards: <code className="text-teal-600 dark:text-teal-400 font-mono">0.45·Rain + 0.35·(1-Elev) + 0.20·(1-Drain) + Photo Boost</code>.
              </p>
              <Link href="/map" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline pt-2">
                <span>View Risk Zones</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-teal-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Flood-Penalized Safe Routing
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                A* graph pathfinding over Nagpur's OpenStreetMap road network that dynamically penalizes flooded low-lying corridors.
              </p>
              <Link href="/route" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline pt-2">
                <span>Calculate Safe Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-teal-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                AI Vision Hazard Verification
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Crowdsourced photo submissions are instantly analyzed by Hugging Face Vision Transformers to verify waterlogging depth and pothole severity.
              </p>
              <Link href="/report" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline pt-2">
                <span>Submit Ground Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: INTERACTIVE MAP PREVIEW */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Live Geographic Information System
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Nagpur Real-Time Risk Topology
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/map"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <span>Launch Fullscreen Map</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="h-[480px] sm:h-[540px] w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-[#1E293B] shadow-2xl relative">
            <MapComponent zones={zones} reports={reports} />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: HOW IT WORKS */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-slate-200 dark:border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Citizen Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              5 Steps to Safer Travel in Nagpur
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { step: "01", title: "Check Conditions", desc: "View real-time IMD radar rainfall across Nagpur before departing.", icon: CloudRain },
              { step: "02", title: "Understand Risk", desc: "Review severe and high flood danger wards along your commute.", icon: Activity },
              { step: "03", title: "Find Safe Routes", desc: "Calculate risk-penalized A* paths avoiding submerged underpasses.", icon: Navigation },
              { step: "04", title: "Report Hazards", desc: "Upload road photo evidence to verify ground truth with AI Vision.", icon: Camera },
              { step: "05", title: "Receive Alerts", desc: "Get automated WhatsApp & SMS alerts if danger escalates in your ward.", icon: Bell },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="p-6 rounded-3xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] space-y-3 hover:border-teal-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-700">{s.step}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{s.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: 24/7 HELPLINES */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A]" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
              Emergency Response Network
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Nagpur Emergency Helplines
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Immediate municipal and emergency numbers for flash flood rescue, vehicle inundation, and life safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {NAGPUR_HELPLINES.map((h) => (
              <div
                key={h.service}
                className="p-6 sm:p-7 rounded-3xl bg-slate-50 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] space-y-4 hover:border-red-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    {h.badge}
                  </span>
                  <PhoneCall className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{h.service}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{h.desc}</p>
                </div>
                <a
                  href={`tel:${h.phone.replace(/[^0-9]/g, "")}`}
                  className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-red-600/30 transition active:scale-95"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call {h.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: FINAL CTA */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-teal-950/20 to-slate-950/40 border-b border-slate-200 dark:border-[#1E293B]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Make Nagpur safer with intelligent urban awareness.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Stay informed of waterlogged intersections, navigate around active flash floods, and protect fellow citizens with real-time hazard reporting.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-sm shadow-xl shadow-teal-600/30 flex items-center gap-2 transition active:scale-95"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Launch Citizen Dashboard</span>
            </Link>
            <Link
              href="/map"
              className="px-8 py-4 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-300 dark:border-[#334155] text-slate-900 dark:text-white font-black text-sm hover:bg-slate-100 dark:hover:bg-[#1E293B] transition active:scale-95"
            >
              <span>Explore Live Flood Map</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-white dark:bg-[#0B0F17] border-t border-slate-200 dark:border-[#1E293B] py-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-950 p-1 flex items-center justify-center border border-teal-500/40">
                <Image
                  src="/brand/nagdrishti-logo.png"
                  alt="NagDrishti AI"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className="font-black text-sm text-slate-900 dark:text-white">NagDrishti AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time urban crisis intelligence and safe navigation for the city of Nagpur.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Navigation
            </div>
            <ul className="space-y-1.5 font-medium">
              <li><Link href="/dashboard" className="hover:text-teal-600 dark:hover:text-teal-400">Citizen Dashboard</Link></li>
              <li><Link href="/map" className="hover:text-teal-600 dark:hover:text-teal-400">Live Ward Map</Link></li>
              <li><Link href="/route" className="hover:text-teal-600 dark:hover:text-teal-400">Safe Route Planner</Link></li>
              <li><Link href="/report" className="hover:text-teal-600 dark:hover:text-teal-400">Report Road Hazard</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Emergency
            </div>
            <ul className="space-y-1.5 font-medium">
              <li><span>NMC Flood Desk: 0712-2567035</span></li>
              <li><span>National Emergency: 112</span></li>
              <li><span>Fire & Rescue: 101</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Municipal Portal
            </div>
            <p className="text-xs text-slate-500">
              Authorized municipal officers and quick response units:
            </p>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#1E293B] text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-[#243044] transition"
            >
              <Lock className="w-3.5 h-3.5 text-teal-500" />
              <span>Officer Command Login</span>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-200 dark:border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <span>© {new Date().getFullYear()} NagDrishti AI • Nagpur Municipal Urban Crisis System</span>
          <span>Powered by Django, PostGIS & OSMnx Graph Neural Routing</span>
        </div>
      </footer>

      {/* Emergency SOS Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B2A] border border-red-200 dark:border-red-900/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-[#1E293B] pb-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800/40">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Nagpur Emergency Helplines</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">24/7 Municipal Disaster & Crisis Response</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                href="tel:07122567035"
                className="w-full p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-between text-red-700 dark:text-red-300 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition"
              >
                <div>
                  <div className="text-[10px] text-red-500 dark:text-red-400 uppercase tracking-wider font-black">NMC Flood Control Room</div>
                  <div className="text-base font-black text-slate-900 dark:text-white">0712-2567035</div>
                </div>
                <div className="p-2 rounded-xl bg-red-600 text-white">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>

              <a
                href="tel:112"
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-[#243044] transition"
              >
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-black">Police / Emergency Response</div>
                  <div className="text-base font-black text-slate-900 dark:text-white">112</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-teal-600 dark:text-teal-400">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>

              <a
                href="tel:101"
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-[#243044] transition"
              >
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-black">Fire & Flood Rescue</div>
                  <div className="text-base font-black text-slate-900 dark:text-white">101</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-teal-600 dark:text-teal-400">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>
            </div>

            <button
              onClick={() => setSosModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#243044] text-slate-700 dark:text-slate-300 font-bold text-xs transition"
            >
              Close Helplines Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
