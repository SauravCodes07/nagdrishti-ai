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
    <div className="w-full h-full min-h-[480px] rounded-3xl bg-slate-100 dark:bg-[#131B2A] flex items-center justify-center text-xs font-bold text-slate-400">
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

  const severeZones = zones.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75));
  const highZones = zones.filter((z) => (z.risk_category === "High" || ((z.latest_risk_score ?? z.risk_score) >= 50 && (z.latest_risk_score ?? z.risk_score) < 75)));

  const handleCopyAlert = (alert) => {
    const text = `🚨 *NagDrishti Alert — ${alert.zone_name || "Nagpur"}*\n${alert.message}\nSeverity: ${alert.severity || "Severe"}\nSource: Nagpur Municipal Corporation (NMC)`;
    navigator.clipboard.writeText(text);
    setCopiedAlertId(alert.id);
    setTimeout(() => setCopiedAlertId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 antialiased selection:bg-[#FF8A00] selection:text-white transition-colors duration-200">
      {/* ========================================================================= */}
      {/* TOP PUBLIC NAVBAR (Launch App removed as requested) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E293B] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 p-1 flex items-center justify-center border border-[#FF8A00]/40 shadow-sm">
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
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#FF8A00]/10 dark:bg-[#FF8A00]/20 text-[#EA580C] dark:text-[#FF8A00] border border-[#FF8A00]/30">
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
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#EA580C] dark:text-[#FF8A00] bg-[#FFF7ED] dark:bg-[#FF8A00]/10 transition"
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

          {/* Right Action Cluster (Saffron Theme Toggle, SOS — Launch App removed) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* THEME TOGGLE BUTTON (Prominently in upper navbar) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#131B2A] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1E293B] transition-colors shadow-sm cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[#FFB000]" />
              ) : (
                <Moon className="w-4 h-4 text-[#EA580C]" />
              )}
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={() => setSosModalOpen(true)}
              className="px-3.5 sm:px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
              <span>SOS Help</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-slate-200 dark:border-[#1E293B]">
        {/* Saffron Glow Effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#FF8A00]/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Civic Status Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7ED] dark:bg-[#FF8A00]/10 border border-[#FF8A00]/30 text-xs font-bold text-[#EA580C] dark:text-[#FF8A00] shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#FF8A00]" />
                <span>Nagpur Urban Safety & Real-Time Crisis Intelligence</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Navigate Nagpur Safely.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A00] to-[#EA580C]">
                  Avoid Flood Zones in Real Time.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                NagDrishti AI combines live IMD radar rainfall feeds, elevation topology, drainage capacity models, and crowdsourced photo verification to predict street-level waterlogging and steer citizens through flood-safe corridors.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/map"
                  className="px-6 sm:px-8 py-4 rounded-2xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-[#FF8A00]/25 flex items-center gap-2 transition active:scale-95"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Explore Live Flood Map</span>
                </Link>

                <Link
                  href="/report"
                  className="px-6 sm:px-7 py-4 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-300 dark:border-[#334155] text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-[#1E293B] shadow-sm flex items-center gap-2 transition active:scale-95"
                >
                  <Camera className="w-4 h-4 text-[#EA580C] dark:text-[#FF8A00]" />
                  <span>Report a Hazard</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="px-6 sm:px-7 py-4 rounded-2xl bg-[#FFF7ED] dark:bg-[#FF8A00]/15 border border-[#FF8A00]/30 text-[#EA580C] dark:text-[#FF8A00] font-black text-xs sm:text-sm hover:bg-[#FFEDD5] dark:hover:bg-[#FF8A00]/25 shadow-sm flex items-center gap-2 transition active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Citizen Dashboard</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200 dark:border-[#1E293B] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>10 NMC Wards Monitored</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>OSMnx Risk-Penalized Routing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Vision AI Hazard Verification</span>
                </div>
              </div>
            </div>

            {/* Right Hero Live Telemetry Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-5 relative">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF8A00] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF8A00]"></span>
                    </span>
                    <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Live Nagpur Telemetry
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Live Feed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">IMD Rainfall</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                      {weather.rainfall_intensity_mm ?? 18.5} mm/h
                    </span>
                    <span className="text-[10px] text-[#EA580C] dark:text-[#FF8A00] font-semibold">{weather.condition || "Moderate Rain"}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Severe Wards</span>
                    <span className="text-xl font-black text-red-600 dark:text-red-400 mt-0.5 block">
                      {severeZones.length} Wards
                    </span>
                    <span className="text-[10px] text-red-500 font-semibold">High Inundation</span>
                  </div>
                </div>

                {/* Highest Risk Ward Breakdown */}
                <div className="p-4 rounded-2xl bg-[#FFF7ED] dark:bg-[#FF8A00]/10 border border-[#FF8A00]/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#EA580C] dark:text-[#FF8A00] uppercase tracking-wider">
                      Highest Risk Basin (NMC Zone)
                    </span>
                    <span className="font-black px-2 py-0.5 rounded text-[10px] bg-red-500 text-white">
                      {selectedZone?.risk_category || "Severe"}
                    </span>
                  </div>
                  <div className="font-black text-base text-slate-900 dark:text-white">
                    {selectedZone?.zone_name || "Sitabuldi & Narendra Nagar Basin"}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Drainage capacity overwhelmed. Avoid low-lying underpasses along Wardha Road.
                  </p>
                </div>

                {/* Quick Ward Navigation Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Safe Roads</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {zones.length > 0 ? Math.round((1 - (severeZones.length / zones.length)) * 100) : 90}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Monitored Zones</span>
                    <span className="text-base font-black text-[#EA580C] dark:text-[#FF8A00]">
                      {zones.length || 10} Wards
                    </span>
                  </div>
                </div>

                <Link
                  href="/map"
                  className="w-full py-3.5 rounded-2xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF8A00]/25 transition active:scale-95"
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
                <CloudRain className="w-5 h-5 text-[#EA580C] dark:text-[#FF8A00]" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {weather.rainfall_intensity_mm ?? 0} <span className="text-sm font-normal text-slate-400">mm/h</span>
              </div>
              <p className="text-xs text-[#EA580C] dark:text-[#FF8A00] font-semibold">{weather.condition || "Live Telemetry"}</p>
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
      {/* SECTION 3: KEY PLATFORM CAPABILITIES */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-slate-200 dark:border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-[#EA580C] dark:text-[#FF8A00]">
              Intelligence Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Three Pillars of Nagpur Civic Safety
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Integrating meteorological data, topological hydrology, and computer vision for predictive response.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] space-y-4 hover:border-[#FF8A00]/40 transition shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] dark:bg-[#FF8A00]/10 text-[#EA580C] dark:text-[#FF8A00] flex items-center justify-center border border-[#FF8A00]/20">
                <CloudRain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Real-Time Risk Monitoring</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Aggregates Doppler radar rainfall with Nagpur's digital elevation model and municipal drain capacities to calculate dynamic 0–100 risk scores per ward.
              </p>
              <Link href="/map" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] dark:text-[#FF8A00] hover:underline pt-2">
                <span>View 10-Ward Map</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] space-y-4 hover:border-[#FF8A00]/40 transition shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] dark:bg-[#FF8A00]/10 text-[#EA580C] dark:text-[#FF8A00] flex items-center justify-center border border-[#FF8A00]/20">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Flood-Penalized Safe Routing</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Custom A* routing engine built on OpenStreetMap graph that dynamically penalizes waterlogged intersections, guiding citizens through dry corridors.
              </p>
              <Link href="/route" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] dark:text-[#FF8A00] hover:underline pt-2">
                <span>Plan Safe Journey</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] space-y-4 hover:border-[#FF8A00]/40 transition shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] dark:bg-[#FF8A00]/10 text-[#EA580C] dark:text-[#FF8A00] flex items-center justify-center border border-[#FF8A00]/20">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">AI Vision Hazard Verification</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Citizens upload roadside photos which are instantly analyzed by Hugging Face Vision AI to confirm waterlogging depth and pothole hazards.
              </p>
              <Link href="/report" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] dark:text-[#FF8A00] hover:underline pt-2">
                <span>Submit Incident Photo</span>
                <ChevronRight className="w-4 h-4" />
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
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#EA580C] dark:text-[#FF8A00]">
                Live Catchment GIS
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Nagpur City Ward Map Preview
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Explore real ward polygons color-coded by waterlogging severity. Click any zone to view rainfall telemetry.
              </p>
            </div>

            <Link
              href="/map"
              className="px-5 py-3 rounded-2xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-black text-xs flex items-center gap-2 self-start md:self-auto shadow-md transition"
            >
              <MapPin className="w-4 h-4" />
              <span>Full Screen GIS Command View</span>
            </Link>
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
            <span className="text-xs font-black uppercase tracking-wider text-[#EA580C] dark:text-[#FF8A00]">
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
                  className="p-6 rounded-3xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] space-y-3 hover:border-[#FF8A00]/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] dark:bg-[#FF8A00]/10 text-[#EA580C] dark:text-[#FF8A00] flex items-center justify-center">
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
      <section className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-[#FF8A00]/10 to-slate-950/40 border-b border-slate-200 dark:border-[#1E293B]">
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
              className="px-8 py-4 rounded-2xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-black text-sm shadow-xl shadow-[#FF8A00]/25 flex items-center gap-2 transition active:scale-95"
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
              <div className="w-8 h-8 rounded-lg bg-slate-950 p-1 flex items-center justify-center border border-[#FF8A00]/40">
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
              <li><Link href="/dashboard" className="hover:text-[#EA580C] dark:hover:text-[#FF8A00]">Citizen Dashboard</Link></li>
              <li><Link href="/map" className="hover:text-[#EA580C] dark:hover:text-[#FF8A00]">Live Ward Map</Link></li>
              <li><Link href="/route" className="hover:text-[#EA580C] dark:hover:text-[#FF8A00]">Safe Route Planner</Link></li>
              <li><Link href="/report" className="hover:text-[#EA580C] dark:hover:text-[#FF8A00]">Report Road Hazard</Link></li>
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
              <Lock className="w-3.5 h-3.5 text-[#EA580C] dark:text-[#FF8A00]" />
              <span>Officer Command Login</span>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-200 dark:border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <span>© {new Date().getFullYear()} NagDrishti AI • Nagpur Municipal Urban Crisis System</span>
          <span>Powered by Django, PostGIS & OSMnx Graph Routing</span>
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
                <h3 className="text-base font-black text-slate-900 dark:text-white">Emergency Assistance (Nagpur)</h3>
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold">Immediate 24/7 Municipal & Police Help</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                href="tel:07122567035"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">NMC 24/7 Flood Control</div>
                  <div className="text-[11px] text-red-600 dark:text-red-400 font-bold">0712-2567035</div>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-black text-xs">Call Now</span>
              </a>

              <a
                href="tel:112"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Police Emergency</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">112 (National Toll-Free)</div>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-[#1E293B] text-slate-900 dark:text-white font-bold text-xs">Dial 112</span>
              </a>
            </div>

            <button
              onClick={() => setSosModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-[#0B0F17] text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-[#1E293B] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
