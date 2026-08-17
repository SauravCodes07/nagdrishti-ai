"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Camera,
  CloudRain,
  Activity,
  Droplets,
  Car,
  Bell,
  CheckCircle2,
  PhoneCall,
  Navigation,
  ChevronRight,
  Lock,
  Sun,
  Moon,
  LayoutDashboard,
  AlertTriangle,
  Globe,
  Map as MapIcon,
  Shield,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useTheme } from "../components/ThemeProvider";

const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-[#0F172A] flex items-center justify-center text-xs font-semibold text-[#94A3B8]">
      Initializing Nagpur GIS Map Layer...
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
  const [heroMapLayer, setHeroMapLayer] = useState("satellite");
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] text-[#0F172A] dark:text-[#F8FAFC] antialiased">
      {/* ========================================================================= */}
      {/* TOP PUBLIC NAVBAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF]/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#243244] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-[#0F172A] p-1 flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155] shrink-0">
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
                <span className="font-bold text-base sm:text-lg text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">NagDrishti</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#CCFBF1] dark:bg-teal-500/20 text-[#0F766E] dark:text-[#5EEAD4] border border-[#0F766E]/20">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal hidden sm:block">
                Nagpur Urban Crisis Management & Safety
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-[#0F766E] dark:text-[#5EEAD4] bg-[#CCFBF1] dark:bg-teal-500/15"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition"
            >
              Dashboard
            </Link>
            <Link
              href="/map"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition"
            >
              Live Map
            </Link>
            <Link
              href="/route"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition"
            >
              Safe Routes
            </Link>
            <Link
              href="/report"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition"
            >
              Report Hazard
            </Link>
            <Link
              href="/alerts"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition"
            >
              Alerts
            </Link>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111C2E] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#243244] transition cursor-pointer"
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[#F59E0B]" />
              ) : (
                <Moon className="w-4 h-4 text-[#0F766E]" />
              )}
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={() => setSosModalOpen(true)}
              className="h-10 px-3.5 sm:px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS Help</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SECTION 1: RESPONSIVE MOTION-DESIGNED MAP BACKGROUND HERO */}
      {/* ========================================================================= */}
      <section className="relative min-h-[620px] lg:min-h-[680px] flex items-center overflow-hidden border-b border-[#E2E8F0] dark:border-[#243244]">
        {/* Responsive Live Map Background Layer */}
        <div className="absolute inset-0 z-0">
          <MapComponent
            zones={zones}
            reports={reports}
            isHeroBackground={true}
            initialLayer={heroMapLayer}
          />
        </div>

        {/* Ambient Dark Gradient Overlays for High Text Contrast */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#0B1220]/95 via-[#0B1220]/80 to-[#0B1220]/45 dark:from-[#0B1220]/95 dark:via-[#0B1220]/85 dark:to-[#0B1220]/50" />
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#0B1220] via-transparent to-[#0B1220]/40" />

        {/* Interactive Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Status Pill & Layer Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F766E]/20 backdrop-blur-md border border-[#14B8A6]/30 text-xs font-semibold text-[#5EEAD4]">
                  <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse"></span>
                  <span>Live Geospatial Intelligence • Nagpur Wards</span>
                </div>

                {/* Satellite / Street toggle directly in Hero */}
                <button
                  onClick={() => setHeroMapLayer(heroMapLayer === "satellite" ? "street" : "satellite")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-xs font-medium text-white transition cursor-pointer"
                  title="Toggle background map imagery"
                >
                  {heroMapLayer === "satellite" ? (
                    <>
                      <Globe className="w-3.5 h-3.5 text-[#5EEAD4]" />
                      <span>Satellite Backdrop</span>
                    </>
                  ) : (
                    <>
                      <MapIcon className="w-3.5 h-3.5 text-[#5EEAD4]" />
                      <span>Street Backdrop</span>
                    </>
                  )}
                </button>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-bold text-white tracking-tight leading-[1.08]">
                Smarter Nagpur. <br />
                <span className="text-[#2DD4BF]">Safer Tomorrow.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-200 max-w-xl leading-relaxed font-normal">
                NagDrishti AI combines live IMD Doppler radar rainfall feeds, elevation hydrology, and citizen photo verification to predict street-level inundation and steer citizens through flood-safe corridors.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/map"
                  className="h-11 px-5 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#042F2E] font-semibold text-sm flex items-center gap-2 transition shadow-lg shadow-teal-950/40"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Explore Live Risk Map</span>
                </Link>

                <Link
                  href="/report"
                  className="h-11 px-5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-white font-semibold text-sm backdrop-blur-md flex items-center gap-2 transition"
                >
                  <Camera className="w-4 h-4 text-[#2DD4BF]" />
                  <span>Report a Hazard</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="h-11 px-5 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 border border-slate-700 text-white font-semibold text-sm backdrop-blur-md flex items-center gap-2 transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Citizen Dashboard</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-3 flex flex-wrap items-center gap-5 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
                  <span>10 NMC Wards Monitored</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
                  <span>Risk-Penalized Safe Routing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
                  <span>Vision AI Hazard Verification</span>
                </div>
              </div>
            </div>

            {/* Right Hero Telemetry Glass HUD Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/80 border border-slate-700/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl space-y-4 text-white">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping"></span>
                    <span className="font-semibold text-xs text-white uppercase tracking-wider">
                      Live Telemetry HUD
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    PostGIS Real-Time Stream
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] uppercase font-medium text-slate-400 block">IMD Doppler Radar</span>
                    <span className="text-2xl font-bold text-white mt-0.5 block">
                      {weather.rainfall_intensity_mm ?? 18.5} <span className="text-xs font-normal text-slate-400">mm/h</span>
                    </span>
                    <span className="text-[11px] text-[#2DD4BF] font-medium">{weather.condition || "Moderate Rain"}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] uppercase font-medium text-slate-400 block">Severe Wards</span>
                    <span className="text-2xl font-bold text-[#F87171] mt-0.5 block">
                      {severeZones.length} Wards
                    </span>
                    <span className="text-[11px] text-[#F87171] font-medium">Critical Inundation</span>
                  </div>
                </div>

                {/* Highest Risk Ward Breakdown */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">
                      Highest Threat Basin
                    </span>
                    <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-[#F87171] border border-red-500/30">
                      {selectedZone?.risk_category || "Severe"}
                    </span>
                  </div>
                  <div className="font-semibold text-sm text-[#2DD4BF]">
                    {selectedZone?.zone_name || "Sitabuldi & Narendra Nagar Basin"}
                  </div>
                  <p className="text-xs text-slate-300">
                    Drainage capacity strained. Underpass bypass routes recommended.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/route"
                    className="flex-1 h-10 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#042F2E] font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Plan Safe Route</span>
                  </Link>

                  <Link
                    href="/map"
                    className="flex-1 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    <span>Full Map View</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: LIVE SAFETY STATS */}
      {/* ========================================================================= */}
      <section className="py-12 border-b border-[#E2E8F0] dark:border-[#243244] bg-[#FFFFFF] dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-medium uppercase tracking-wider">IMD Rainfall Feed</span>
                <CloudRain className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
              </div>
              <div className="text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {weather.rainfall_intensity_mm ?? 0} <span className="text-xs font-normal text-[#64748B]">mm/h</span>
              </div>
              <p className="text-xs text-[#0F766E] dark:text-[#14B8A6] font-medium">{weather.condition || "Live Doppler Radar"}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-medium uppercase tracking-wider">Flooded Wards</span>
                <Droplets className="w-4 h-4 text-[#DC2626]" />
              </div>
              <div className="text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {severeZones.length} <span className="text-xs font-normal text-[#64748B]">/ {zones.length || 10}</span>
              </div>
              <p className="text-xs text-[#DC2626] dark:text-[#F87171] font-medium">Critical attention needed</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-medium uppercase tracking-wider">Safe Road Network</span>
                <Car className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div className="text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {zones.length > 0 ? Math.round((1 - (severeZones.length / zones.length)) * 100) : 92}%
              </div>
              <p className="text-xs text-[#16A34A] dark:text-[#4ADE80] font-medium">Accessible bypass corridors</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-medium uppercase tracking-wider">Citizen Reports</span>
                <Activity className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div className="text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {reports.length}
              </div>
              <p className="text-xs text-[#854D0E] dark:text-[#FDE68A] font-medium">Crowdsourced ground intel</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: KEY PLATFORM CAPABILITIES */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 border-b border-[#E2E8F0] dark:border-[#243244]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6]">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Understand Risk Before It Becomes a Crisis
            </h2>
            <p className="text-sm text-[#475569] dark:text-[#CBD5E1]">
              Integrating meteorological data, topological hydrology, and computer vision for predictive response.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:border-[#0F766E]/40 transition">
              <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center border border-[#0F766E]/20">
                <CloudRain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Real-Time Risk Monitoring</h3>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                Aggregates Doppler radar rainfall with Nagpur's digital elevation model and municipal drain capacities to calculate dynamic 0–100 risk scores per ward.
              </p>
              <Link href="/map" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline pt-1">
                <span>View 10-Ward Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:border-[#0F766E]/40 transition">
              <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center border border-[#0F766E]/20">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Flood-Penalized Safe Routing</h3>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                Custom A* routing engine built on OpenStreetMap graph that dynamically penalizes waterlogged intersections, guiding citizens through dry corridors.
              </p>
              <Link href="/route" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline pt-1">
                <span>Plan Safe Route</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:border-[#0F766E]/40 transition">
              <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center border border-[#0F766E]/20">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">AI Vision Hazard Verification</h3>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                Citizens upload roadside photos which are automatically analyzed by Hugging Face Vision AI to confirm waterlogging depth and pothole hazards.
              </p>
              <Link href="/report" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline pt-1">
                <span>Report Road Hazard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: CITIZEN WORKFLOW */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 border-b border-[#E2E8F0] dark:border-[#243244]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6]">
              Citizen Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Five Steps to Safer Travel in Nagpur
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
                  className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-2.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-lg font-bold text-[#94A3B8] dark:text-[#64748B]">{s.step}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{s.title}</h4>
                  <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: 24/7 HELPLINES */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 border-b border-[#E2E8F0] dark:border-[#243244] bg-[#FFFFFF] dark:bg-[#0F172A]" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#DC2626] dark:text-[#F87171]">
              Emergency Response Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Nagpur Emergency Helplines
            </h2>
            <p className="text-sm text-[#475569] dark:text-[#CBD5E1]">
              Immediate municipal and emergency numbers for flash flood rescue, vehicle inundation, and life safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {NAGPUR_HELPLINES.map((h) => (
              <div
                key={h.service}
                className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#111C2E] border border-red-200 dark:border-red-900/40 space-y-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] dark:bg-red-500/20 dark:text-[#F87171]">
                    {h.badge}
                  </span>
                  <PhoneCall className="w-4 h-4 text-[#DC2626]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{h.service}</h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">{h.desc}</p>
                </div>
                <a
                  href={`tel:${h.phone.replace(/[^0-9]/g, "")}`}
                  className="w-full h-10 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {h.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: FINAL CTA */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 border-b border-[#E2E8F0] dark:border-[#243244] bg-[#F1F5F9] dark:bg-[#0B1220]">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl sm:text-4xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            One Dashboard for Faster Civic Response
          </h2>
          <p className="text-sm sm:text-base text-[#475569] dark:text-[#CBD5E1] max-w-xl mx-auto leading-relaxed">
            Stay informed of waterlogged intersections, navigate around active flash floods, and protect fellow citizens with real-time hazard reporting.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="h-11 px-6 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-sm flex items-center gap-2 transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Launch Citizen Dashboard</span>
            </Link>
            <Link
              href="/map"
              className="h-11 px-6 rounded-xl bg-[#FFFFFF] dark:bg-[#162235] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-sm hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition"
            >
              <MapPin className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
              <span>Open Live Flood Map</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#FFFFFF] dark:bg-[#0B1220] border-t border-[#E2E8F0] dark:border-[#243244] py-10 text-xs text-[#64748B] dark:text-[#94A3B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0F172A] p-1 flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155]">
                <Image
                  src="/brand/nagdrishti-logo.png"
                  alt="NagDrishti AI"
                  width={22}
                  height={22}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">NagDrishti AI</span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              AI-powered urban crisis management and safety platform for Nagpur.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider text-[11px]">
              Platform Navigation
            </div>
            <ul className="space-y-1 font-normal">
              <li><Link href="/dashboard" className="hover:text-[#0F766E] dark:hover:text-[#14B8A6]">Citizen Dashboard</Link></li>
              <li><Link href="/map" className="hover:text-[#0F766E] dark:hover:text-[#14B8A6]">Live Ward Map</Link></li>
              <li><Link href="/route" className="hover:text-[#0F766E] dark:hover:text-[#14B8A6]">Safe Route Planner</Link></li>
              <li><Link href="/report" className="hover:text-[#0F766E] dark:hover:text-[#14B8A6]">Report Hazard</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider text-[11px]">
              Emergency Dispatch
            </div>
            <ul className="space-y-1 font-normal">
              <li><span>NMC Flood Control: 0712-2567035</span></li>
              <li><span>Police Emergency: 112</span></li>
              <li><span>Fire & Rescue: 101</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider text-[11px]">
              Municipal Portal
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Authorized municipal officers and quick response units:
            </p>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#162235] text-[#334155] dark:text-[#E2E8F0] font-medium text-xs hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] transition"
            >
              <Lock className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
              <span>Officer Command Login</span>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mt-6 border-t border-[#E2E8F0] dark:border-[#243244] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <span>© {new Date().getFullYear()} NagDrishti AI • Nagpur Municipal Urban Crisis System</span>
          <span>Powered by PostGIS & OSMnx Graph Routing</span>
        </div>
      </footer>

      {/* Emergency SOS Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-red-200 dark:border-red-900/60 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] dark:border-[#243244] pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] dark:bg-red-500/15 text-[#DC2626] dark:text-[#F87171] flex items-center justify-center border border-red-200 dark:border-red-800/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Emergency Helplines (Nagpur)</h3>
                <p className="text-xs text-[#DC2626] dark:text-[#F87171] font-medium">Immediate Municipal & Police Assistance</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                href="tel:07122567035"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#FEF2F2] dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
              >
                <div>
                  <div className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">NMC 24/7 Flood Control</div>
                  <div className="text-xs text-[#DC2626] dark:text-[#F87171] font-bold">0712-2567035</div>
                </div>
                <span className="h-8 px-3 rounded-lg bg-[#DC2626] text-white font-semibold text-xs flex items-center">Call Now</span>
              </a>

              <a
                href="tel:112"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#243244] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition"
              >
                <div>
                  <div className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">Police Emergency</div>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">112 (National Toll-Free)</div>
                </div>
                <span className="h-8 px-3 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs flex items-center border border-[#CBD5E1] dark:border-[#334155]">Dial 112</span>
              </a>
            </div>

            <button
              onClick={() => setSosModalOpen(false)}
              className="w-full h-10 rounded-xl bg-[#F1F5F9] dark:bg-[#0F172A] text-[#334155] dark:text-[#CBD5E1] font-medium text-xs hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
