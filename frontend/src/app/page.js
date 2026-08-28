"use client";

import { useEffect, useState, useRef } from "react";
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
  Crosshair,
  Compass,
  Zap,
  Shield,
  Radio,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../components/ThemeProvider";
import OnboardingModal from "../components/OnboardingModal";
import {
  ScrollReveal,
  AnimatedCounter,
  MagneticButton,
  HoverLiftCard,
  RiskPulse,
  StaggerGrid,
  StaggerItem,
  AnimatedIcon,
  SpotlightCard,
  Card3DContainer,
  Card3DBody,
  Card3DItem,
  BorderBeam,
  ShimmerButton,
  AnimatedShinyText,
  BackgroundGrid,
  BlurFade,
  BentoGrid,
  BentoCard,
} from "../components/motion";

const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-[#0B1220] flex items-center justify-center text-xs font-semibold text-[#94A3B8]">
      Initializing Nagpur GIS PostGIS Map Layer...
    </div>
  ),
});

import {
  getRiskZones,
  getReports,
  getBroadcastAlerts,
  getWeather,
  DEFAULT_RISK_ZONES,
  DEFAULT_WEATHER,
} from "../lib/api";

const NAGPUR_HELPLINES = [
  {
    service: "NMC 24/7 Flood Control Room",
    phone: "0712-2567035",
    desc: "Nagpur Municipal Corporation emergency waterlogging and drainage helpline.",
    badge: "Official Municipal Desk",
    isPrimary: true,
  },
  {
    service: "Police Emergency Response",
    phone: "112",
    desc: "National emergency dialer for road blockages, accidents, and life safety.",
    badge: "24/7 National Dispatch",
    isPrimary: false,
  },
  {
    service: "Fire & Disaster Rescue",
    phone: "101",
    desc: "Rapid deployment for deep water rescue, fallen trees, and flash evacuations.",
    badge: "Disaster Response",
    isPrimary: false,
  },
];

export default function PublicLandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [zones, setZones] = useState(DEFAULT_RISK_ZONES);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(DEFAULT_WEATHER);
  const [selectedZone, setSelectedZone] = useState(() => DEFAULT_RISK_ZONES[1] || DEFAULT_RISK_ZONES[0]);
  const [heroMapLayer, setHeroMapLayer] = useState("satellite");
  const [loading, setLoading] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  // Stable Geographic Coordinate State (Default: Nagpur Zero Mile Center, auto-updated if GPS permitted)
  const [gpsCoords, setGpsCoords] = useState({
    lat: "21.1458° N",
    lng: "79.0882° E",
    elevation: "312m",
    isDeviceGps: false,
  });

  // Intercept any OAuth callback parameters reaching root and auto-forward to /auth/callback
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

    if (typeof window !== "undefined") {
      const search = window.location.search;
      const hash = window.location.hash;
      if (
        search.includes("code=") ||
        search.includes("error_description=") ||
        hash.includes("access_token=")
      ) {
        window.location.replace(`/auth/callback${search}${hash}`);
      }

      // Check device GPS once on mount if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const currentLat = pos.coords.latitude.toFixed(4);
            const currentLng = pos.coords.longitude.toFixed(4);
            const elev = pos.coords.altitude ? `${Math.round(pos.coords.altitude)}m` : "312m";
            setGpsCoords({
              lat: `${currentLat}° N`,
              lng: `${currentLng}° E`,
              elevation: elev,
              isDeviceGps: true,
            });
          },
          () => {},
          { timeout: 6000, maximumAge: 0, enableHighAccuracy: true }
        );
      }
    }
  }, []);

  const severeZones = zones.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75));
  const highZones = zones.filter((z) => (z.risk_category === "High" || ((z.latest_risk_score ?? z.risk_score) >= 50 && (z.latest_risk_score ?? z.risk_score) < 75)));

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] text-[#0F172A] dark:text-[#F8FAFC] antialiased">
      {/* First-Launch Onboarding Carousel */}
      <OnboardingModal />

      {/* ========================================================================= */}
      {/* TOP PUBLIC NAVBAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF]/85 dark:bg-[#0F172A]/85 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-[#243244] shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-[#0F172A] p-1 flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155] shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
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
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-[#0F766E] dark:text-[#5EEAD4] bg-[#CCFBF1]/80 dark:bg-teal-500/15"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-all"
            >
              Dashboard
            </Link>
            <Link
              href="/map"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-all"
            >
              Live Map
            </Link>
            <Link
              href="/route"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-all"
            >
              Safe Routes
            </Link>
            <Link
              href="/report"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-all"
            >
              Report Hazard
            </Link>
            <Link
              href="/alerts"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-all"
            >
              Alerts
            </Link>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle with Rotation Animation */}
            <button
              onClick={(e) => toggleTheme(e)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111C2E] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#243244] transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, scale: 0.85 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-1.5"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4 text-[#F59E0B]" />
                    <span className="hidden sm:inline text-xs font-semibold text-[#CBD5E1]">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-[#0F766E]" />
                    <span className="hidden sm:inline text-xs font-semibold text-[#475569]">Dark</span>
                  </>
                )}
              </motion.div>
            </button>

            {/* Emergency SOS Button */}
            <MagneticButton>
              <button
                onClick={() => setSosModalOpen(true)}
                className="h-10 px-3.5 sm:px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>SOS Help</span>
              </button>
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SECTION 1: RESPONSIVE MOTION-DESIGNED MAP BACKGROUND HERO */}
      {/* ========================================================================= */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden border-b border-[#E2E8F0] dark:border-[#243244]">
        {/* Responsive Live Map Background Layer */}
        <div className="absolute inset-0 z-0 scale-105 pointer-events-auto">
          <MapComponent
            zones={zones}
            reports={reports}
            isHeroBackground={true}
            initialLayer={heroMapLayer}
          />
        </div>

        {/* Ambient Floating Radar Glyphs */}
        <div className="absolute top-16 right-20 w-32 h-32 rounded-full border border-teal-500/20 pointer-events-none z-10 hidden xl:block animate-float-slow" />
        <div className="absolute bottom-20 left-12 w-24 h-24 rounded-full border border-teal-400/15 pointer-events-none z-10 hidden xl:block animate-float-slow" />

        {/* Theme-Aware Gradient Overlays for High Map Clarity and Crisp Text Readability */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#FFFFFF]/85 via-[#FFFFFF]/40 to-transparent dark:from-[#0B1220]/90 dark:via-[#0B1220]/50 dark:to-transparent" />
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#FFFFFF]/60 via-transparent to-transparent dark:from-[#0B1220]/70 dark:via-transparent dark:to-transparent" />

        {/* Interactive Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Status Pill with Animated Shiny Text & Dynamic Map Imagery Toggle */}
              <BlurFade delay={0.05} className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CCFBF1]/90 dark:bg-[#0F766E]/30 backdrop-blur-md border border-[#0F766E]/25 dark:border-[#14B8A6]/40 text-xs font-semibold text-[#0F766E] dark:text-[#5EEAD4] shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#14B8A6] animate-ping"></span>
                  <AnimatedShinyText className="font-semibold text-xs text-[#0F766E] dark:text-[#5EEAD4]">
                    Live Geospatial Intelligence • Nagpur Wards
                  </AnimatedShinyText>
                </div>

                <button
                  onClick={() => setHeroMapLayer(heroMapLayer === "satellite" ? "street" : "satellite")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/85 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 backdrop-blur-md border border-[#CBD5E1] dark:border-white/20 text-xs font-medium text-[#0F172A] dark:text-white transition cursor-pointer shadow-2xs hover:border-[#0F766E] dark:hover:border-[#14B8A6]/60"
                  title="Toggle background map imagery"
                >
                  {heroMapLayer === "satellite" ? (
                    <>
                      <Globe className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4]" />
                      <span>Satellite Backdrop</span>
                    </>
                  ) : (
                    <>
                      <MapIcon className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4]" />
                      <span>Street Backdrop</span>
                    </>
                  )}
                </button>
              </BlurFade>

              {/* Main Headline with Word-by-Word Stagger */}
              <motion.h1
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 },
                  },
                }}
                className="text-3xl sm:text-5xl lg:text-[56px] font-bold text-[#0F172A] dark:text-white tracking-tight leading-[1.06]"
              >
                <motion.span
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  className="inline-block mr-2"
                >
                  Smarter
                </motion.span>
                <motion.span
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  className="inline-block"
                >
                  Nagpur.
                </motion.span>
                <br />
                <motion.span
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  className="inline-block mr-2 text-[#0F766E] dark:text-[#2DD4BF]"
                >
                  Safer
                </motion.span>
                <motion.span
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  className="inline-block text-[#0F766E] dark:text-[#2DD4BF]"
                >
                  Tomorrow.
                </motion.span>
              </motion.h1>

              {/* Subtitle */}
              <BlurFade delay={0.15}>
                <p className="text-sm sm:text-base text-[#475569] dark:text-slate-200 max-w-xl leading-relaxed font-normal">
                  NagDrishti AI combines live IMD Doppler radar rainfall feeds, elevation hydrology, and citizen photo verification to predict street-level inundation and steer citizens through flood-safe corridors.
                </p>
              </BlurFade>

              {/* Primary Action Buttons with ShimmerButton and MagneticButton */}
              <BlurFade delay={0.22} className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/map">
                  <ShimmerButton
                    background="var(--primary)"
                    className="h-11 px-5 shadow-lg shadow-teal-900/20 text-sm font-bold"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Explore Live Risk Map</span>
                  </ShimmerButton>
                </Link>

                <MagneticButton>
                  <Link
                    href="/report"
                    className="h-11 px-5 rounded-xl bg-white/90 hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900 border border-[#CBD5E1] dark:border-slate-700 hover:border-[#0F766E] dark:hover:border-[#14B8A6]/60 text-[#0F172A] dark:text-white font-semibold text-sm backdrop-blur-md flex items-center gap-2 transition shadow-2xs"
                  >
                    <Camera className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
                    <span>Report a Hazard</span>
                  </Link>
                </MagneticButton>

                <MagneticButton>
                  <Link
                    href="/route"
                    className="h-11 px-5 rounded-xl bg-white/80 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/80 border border-[#CBD5E1] dark:border-slate-700 hover:border-[#0F766E] dark:hover:border-[#14B8A6]/60 text-[#0F172A] dark:text-white font-semibold text-sm backdrop-blur-md flex items-center gap-2 transition shadow-2xs"
                  >
                    <Navigation className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
                    <span>Safe Routes</span>
                  </Link>
                </MagneticButton>
              </BlurFade>

              {/* Civic Center / GPS Location Badge */}
              <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-950/75 border border-[#CBD5E1] dark:border-slate-800 backdrop-blur-md inline-flex items-center gap-3 text-[11px] font-medium text-[#475569] dark:text-slate-300 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[#0F766E] dark:text-[#5EEAD4] font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>{gpsCoords.isDeviceGps ? "Current GPS Location:" : "Nagpur Center (Zero Mile):"}</span>
                </div>
                <span className="font-mono text-[#0F172A] dark:text-white font-semibold">
                  {gpsCoords.lat}, {gpsCoords.lng}
                </span>
                <span className="hidden sm:inline text-[#64748B] dark:text-slate-400 font-mono">
                  • {gpsCoords.elevation} MSL
                </span>
              </div>

              {/* Trust Badges */}
              <BlurFade delay={0.3} className="pt-2 flex flex-wrap items-center gap-5 text-xs text-[#475569] dark:text-slate-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-[#4ADE80]" />
                  <span>10 NMC Wards Monitored</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-[#4ADE80]" />
                  <span>Risk-Penalized Safe Routing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-[#4ADE80]" />
                  <span>Vision AI Hazard Verification</span>
                </div>
              </BlurFade>
            </div>

            {/* Right Hero Telemetry 3D Glass HUD Card */}
            <div className="lg:col-span-5">
              <Card3DContainer maxTilt={10}>
                <Card3DBody>
                  <SpotlightCard
                    spotlightColor="rgba(20, 184, 166, 0.2)"
                    className="bg-white/95 dark:bg-slate-900/90 border border-[#E2E8F0] dark:border-slate-700/80 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl space-y-4 text-[#0F172A] dark:text-white"
                  >
                    <BorderBeam size={160} duration={10} colorFrom="#14B8A6" colorTo="#0F766E" />
                    
                    <Card3DItem translateZ={15} className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-700/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping"></span>
                        <span className="font-semibold text-xs text-[#0F172A] dark:text-white uppercase tracking-wider">
                          Live Telemetry HUD
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-[#0F766E] dark:text-[#5EEAD4] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#F59E0B]" />
                        <span>PostGIS Streaming</span>
                      </span>
                    </Card3DItem>

                    <Card3DItem translateZ={25} className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950/70 border border-[#E2E8F0] dark:border-slate-800">
                        <span className="text-[11px] uppercase font-medium text-[#64748B] dark:text-slate-400 block">IMD Doppler Radar</span>
                        <span className="text-2xl font-bold text-[#0F172A] dark:text-white mt-0.5 block">
                          <AnimatedCounter value={weather.rainfall_intensity_mm ?? 18.5} decimals={1} suffix=" mm/h" />
                        </span>
                        <span className="text-[11px] text-[#0F766E] dark:text-[#2DD4BF] font-medium">{weather.condition || "Moderate Rain"}</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950/70 border border-[#E2E8F0] dark:border-slate-800">
                        <span className="text-[11px] uppercase font-medium text-[#64748B] dark:text-slate-400 block">Severe Wards</span>
                        <span className="text-2xl font-bold text-[#DC2626] dark:text-[#F87171] mt-0.5 block">
                          <AnimatedCounter value={severeZones.length} suffix=" Wards" />
                        </span>
                        <span className="text-[11px] text-[#DC2626] dark:text-[#F87171] font-medium">Critical Inundation</span>
                      </div>
                    </Card3DItem>

                    {/* Highest Risk Ward Breakdown */}
                    <Card3DItem translateZ={30} className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950/80 border border-[#E2E8F0] dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#0F172A] dark:text-white">
                          Highest Threat Basin
                        </span>
                        <RiskPulse category={selectedZone?.risk_category || "Severe"}>
                          <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-red-500/15 dark:bg-red-500/25 text-[#DC2626] dark:text-[#F87171] border border-red-500/30 dark:border-red-500/40">
                            {selectedZone?.risk_category || "Severe"}
                          </span>
                        </RiskPulse>
                      </div>
                      <div className="font-semibold text-sm text-[#0F766E] dark:text-[#2DD4BF]">
                        {selectedZone?.zone_name || "Sitabuldi & Narendra Nagar Basin"}
                      </div>
                      <p className="text-xs text-[#64748B] dark:text-slate-300">
                        Drainage capacity strained. Underpass bypass routes recommended.
                      </p>
                    </Card3DItem>

                    <Card3DItem translateZ={20} className="flex items-center gap-2 pt-1">
                      <Link
                        href="/route"
                        className="flex-1 h-10 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Plan Safe Route</span>
                      </Link>

                      <Link
                        href="/map"
                        className="flex-1 h-10 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-[#CBD5E1] dark:border-slate-700 transition"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
                        <span>Full Map View</span>
                      </Link>
                    </Card3DItem>
                  </SpotlightCard>
                </Card3DBody>
              </Card3DContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: LIVE SAFETY STATS STRIP WITH SPOTLIGHT CARDS */}
      {/* ========================================================================= */}
      <section className="py-12 border-b border-[#E2E8F0] dark:border-[#243244] bg-[#FFFFFF]/70 dark:bg-[#0F172A]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StaggerItem>
              <SpotlightCard className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-1.5">
                <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                  <span className="text-xs font-medium uppercase tracking-wider">IMD Rainfall Feed</span>
                  <AnimatedIcon icon={CloudRain} type="wiggle" className="text-[#0F766E] dark:text-[#14B8A6]" />
                </div>
                <div className="text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  <AnimatedCounter value={weather.rainfall_intensity_mm ?? 0} decimals={1} suffix=" mm/h" />
                </div>
                <p className="text-xs font-medium text-[#0F766E] dark:text-[#14B8A6]">{weather.condition || "Live Doppler Radar"}</p>
              </SpotlightCard>
            </StaggerItem>

            <StaggerItem>
              <SpotlightCard riskCategory="Severe" className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-1.5">
                <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                  <span className="text-xs font-medium uppercase tracking-wider">Flooded Wards</span>
                  <AnimatedIcon icon={Droplets} type="pulse" className="text-[#DC2626]" />
                </div>
                <div className="text-3xl font-bold text-[#DC2626] dark:text-[#F87171]">
                  <AnimatedCounter value={severeZones.length} suffix={` / ${zones.length || 10}`} />
                </div>
                <p className="text-xs font-medium text-[#DC2626] dark:text-[#F87171]">Critical attention needed</p>
              </SpotlightCard>
            </StaggerItem>

            <StaggerItem>
              <SpotlightCard className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-1.5">
                <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                  <span className="text-xs font-medium uppercase tracking-wider">Safe Road Network</span>
                  <AnimatedIcon icon={Car} type="scale" className="text-[#16A34A]" />
                </div>
                <div className="text-3xl font-bold text-[#16A34A] dark:text-[#4ADE80]">
                  <AnimatedCounter value={zones.length > 0 ? Math.round((1 - (severeZones.length / zones.length)) * 100) : 92} suffix="%" />
                </div>
                <p className="text-xs font-medium text-[#16A34A] dark:text-[#4ADE80]">Accessible bypass corridors</p>
              </SpotlightCard>
            </StaggerItem>

            <StaggerItem>
              <SpotlightCard className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-1.5">
                <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                  <span className="text-xs font-medium uppercase tracking-wider">Citizen Reports</span>
                  <AnimatedIcon icon={Activity} type="pulse" className="text-[#F59E0B]" />
                </div>
                <div className="text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  <AnimatedCounter value={reports.length} />
                </div>
                <p className="text-xs font-medium text-[#854D0E] dark:text-[#FDE68A]">Crowdsourced ground intel</p>
              </SpotlightCard>
            </StaggerItem>
          </StaggerGrid>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: BENTO GRID PLATFORM CAPABILITIES */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 border-b border-[#E2E8F0] dark:border-[#243244]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <BlurFade direction="up" className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6]">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Understand Risk Before It Becomes a Crisis
            </h2>
            <p className="text-sm text-[#475569] dark:text-[#CBD5E1]">
              Integrating meteorological data, topological hydrology, and computer vision for predictive response.
            </p>
          </BlurFade>

          <BentoGrid className="grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1 */}
            <BentoCard
              title="Real-Time Risk Monitoring"
              description="Aggregates Doppler radar rainfall with Nagpur's digital elevation model and municipal drain capacities to calculate dynamic 0–100 risk scores per ward."
              icon={CloudRain}
              badge="PostGIS Live"
              spotlightColor="rgba(20, 184, 166, 0.2)"
            >
              <Link href="/map" className="hover-link inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] pt-2">
                <span>View 10-Ward Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </BentoCard>

            {/* Bento Card 2 */}
            <BentoCard
              title="Flood-Penalized Safe Routing"
              description="Custom A* routing engine built on OpenStreetMap graph that dynamically penalizes waterlogged intersections, guiding citizens through dry corridors."
              icon={Navigation}
              badge="A* Engine"
              spotlightColor="rgba(37, 99, 235, 0.2)"
            >
              <Link href="/route" className="hover-link inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] pt-2">
                <span>Plan Safe Route</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </BentoCard>

            {/* Bento Card 3 */}
            <BentoCard
              title="AI Vision Hazard Verification"
              description="Citizens upload roadside photos which are automatically analyzed by Vision AI to confirm waterlogging depth, open drains, and pothole hazards."
              icon={Camera}
              badge="Vision AI"
              spotlightColor="rgba(245, 158, 11, 0.2)"
            >
              <Link href="/report" className="hover-link inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] pt-2">
                <span>Report Road Hazard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </BentoCard>
          </BentoGrid>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: CITIZEN WORKFLOW WITH STAGGERED REVEALS */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 border-b border-[#E2E8F0] dark:border-[#243244]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <BlurFade direction="up" className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6]">
              Citizen Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Five Steps to Safer Travel in Nagpur
            </h2>
          </BlurFade>

          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { step: "01", title: "Check Conditions", desc: "View real-time IMD radar rainfall across Nagpur before departing.", icon: CloudRain },
              { step: "02", title: "Understand Risk", desc: "Review severe and high flood danger wards along your commute.", icon: Activity },
              { step: "03", title: "Find Safe Routes", desc: "Calculate risk-penalized A* paths avoiding submerged underpasses.", icon: Navigation },
              { step: "04", title: "Report Hazards", desc: "Upload road photo evidence to verify ground truth with AI Vision.", icon: Camera },
              { step: "05", title: "Receive Alerts", desc: "Get automated WhatsApp & SMS alerts if danger escalates in your ward.", icon: Bell },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <StaggerItem key={s.step}>
                  <SpotlightCard className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-2.5 h-full">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center">
                        <AnimatedIcon icon={Icon} type="wiggle" size={16} />
                      </div>
                      <span className="text-lg font-bold text-[#94A3B8] dark:text-[#64748B] font-mono">{s.step}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{s.title}</h4>
                    <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">{s.desc}</p>
                  </SpotlightCard>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: 24/7 HELPLINES */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 border-b border-[#E2E8F0] dark:border-[#243244] bg-[#FFFFFF]/70 dark:bg-[#0F172A]/70 backdrop-blur-sm" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <BlurFade direction="up" className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#DC2626] dark:text-[#F87171]">
              Emergency Response Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Nagpur Emergency Helplines
            </h2>
            <p className="text-sm text-[#475569] dark:text-[#CBD5E1]">
              Immediate municipal and emergency numbers for flash flood rescue, vehicle inundation, and life safety.
            </p>
          </BlurFade>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {NAGPUR_HELPLINES.map((h) => (
              <StaggerItem key={h.service}>
                <SpotlightCard
                  riskCategory="Severe"
                  className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#111C2E] border border-red-200 dark:border-red-900/40 space-y-3 h-full flex flex-col justify-between"
                >
                  {h.isPrimary && <BorderBeam size={140} duration={8} colorFrom="#DC2626" colorTo="#F87171" />}
                  <div className="space-y-2">
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
                  </div>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    href={`tel:${h.phone.replace(/[^0-9]/g, "")}`}
                    className="w-full h-10 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call {h.phone}</span>
                  </motion.a>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: FINAL CTA */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 border-b border-[#E2E8F0] dark:border-[#243244] bg-[#F1F5F9]/80 dark:bg-[#0B1220]/80">
        <BlurFade direction="up" className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl sm:text-4xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            One Dashboard for Faster Civic Response
          </h2>
          <p className="text-sm sm:text-base text-[#475569] dark:text-[#CBD5E1] max-w-xl mx-auto leading-relaxed">
            Stay informed of waterlogged intersections, navigate around active flash floods, and protect fellow citizens with real-time hazard reporting.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/dashboard">
              <ShimmerButton background="var(--primary)" className="h-11 px-6 text-sm font-semibold shadow-md">
                <LayoutDashboard className="w-4 h-4" />
                <span>Launch Citizen Dashboard</span>
              </ShimmerButton>
            </Link>
            <MagneticButton>
              <Link
                href="/map"
                className="h-11 px-6 rounded-xl bg-[#FFFFFF] dark:bg-[#162235] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-sm hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition shadow-sm flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>Open Live Flood Map</span>
              </Link>
            </MagneticButton>
          </div>
        </BlurFade>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#FFFFFF]/90 dark:bg-[#0B1220]/90 border-t border-[#E2E8F0] dark:border-[#243244] py-10 text-xs text-[#64748B] dark:text-[#94A3B8]">
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
              <li><Link href="/dashboard" className="hover:text-[#0F766E] dark:hover:text-[#14B8A6] transition-colors">Citizen Dashboard</Link></li>
              <li><Link href="/map" className="hover:text-[#0F766E] dark:hover:text-[#14B8A6] transition-colors">Live Ward Map</Link></li>
              <li><Link href="/route" className="hover:text-[#0F766E] dark:hover:text-[#14B8A6] transition-colors">Safe Route Planner</Link></li>
              <li><Link href="/report" className="hover:text-[#0F766E] dark:hover:text-[#14B8A6] transition-colors">Report Hazard</Link></li>
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
      <AnimatePresence>
        {sosModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-[#FFFFFF] dark:bg-[#111C2E] border-2 border-red-500 dark:border-red-600 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative overflow-hidden"
            >
              <BorderBeam size={180} duration={6} colorFrom="#DC2626" colorTo="#F87171" />
              
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
                <motion.a
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  href="tel:07122567035"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#FEF2F2] dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/40 transition cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">NMC 24/7 Flood Control</div>
                    <div className="text-xs text-[#DC2626] dark:text-[#F87171] font-bold">0712-2567035</div>
                  </div>
                  <span className="h-8 px-3 rounded-lg bg-[#DC2626] text-white font-semibold text-xs flex items-center">Call Now</span>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  href="tel:112"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#243244] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">Police Emergency</div>
                    <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">112 (National Toll-Free)</div>
                  </div>
                  <span className="h-8 px-3 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs flex items-center border border-[#CBD5E1] dark:border-[#334155]">Dial 112</span>
                </motion.a>
              </div>

              <button
                onClick={() => setSosModalOpen(false)}
                className="w-full h-10 rounded-xl bg-[#F1F5F9] dark:bg-[#0F172A] text-[#334155] dark:text-[#CBD5E1] font-medium text-xs hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] transition cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
