"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  Camera,
  Bell,
  User,
  AlertTriangle,
  CloudRain,
  PhoneCall,
  ShieldAlert,
  Navigation,
  Activity,
  Shield,
  ExternalLink,
  CheckCircle2,
  Lock,
  Sun,
  Moon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getWeather, getBroadcastAlerts, getRiskZones } from "../../lib/api";
import { useTheme } from "../ThemeProvider";

export default function CitizenLayout({ children }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [weather, setWeather] = useState({ condition: "Showers", rainfall_intensity_mm: 18.5, temperature: 28 });
  const [hasSevereAlerts, setHasSevereAlerts] = useState(false);
  const [severeZoneCount, setSevereZoneCount] = useState(0);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  useEffect(() => {
    getWeather()
      .then((data) => {
        if (data) setWeather(data);
      })
      .catch(() => {});

    getBroadcastAlerts()
      .then((data) => {
        const severe = Array.isArray(data) && data.some((a) => a.severity === "Severe" || a.severity === "High");
        setHasSevereAlerts(severe);
      })
      .catch(() => {});

    getRiskZones()
      .then((data) => {
        if (Array.isArray(data)) {
          const severe = data.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75)).length;
          setSevereZoneCount(severe);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/map", label: "Live Map", icon: MapPin },
    { href: "/route", label: "Safe Routes", icon: Navigation },
    { href: "/report", label: "Report Hazard", icon: Camera, isHighlight: true },
    { href: "/alerts", label: "Alerts", icon: Bell, badge: hasSevereAlerts },
    { href: "/profile", label: "Help & Safety", icon: HelpCircle },
  ];

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "City Crisis Dashboard";
    if (pathname === "/map") return "Live Flood & Hazard Map";
    if (pathname === "/route") return "Flood-Safe Route Navigation";
    if (pathname === "/report") return "Report Road Hazard";
    if (pathname === "/alerts") return "Civic Emergency Alerts";
    if (pathname === "/profile") return "Helplines & Safety Guide";
    return "NagDrishti AI";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased selection:bg-teal-500 selection:text-white">
      {/* ========================================================================= */}
      {/* DESKTOP / TABLET FIXED LEFT SIDEBAR */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col justify-between border-r border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] z-40 sticky top-0 h-screen transition-all duration-300 shadow-sm ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 lg:h-20 px-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 p-1 flex items-center justify-center border border-teal-500/40 shadow-sm shrink-0">
                <Image
                  src="/brand/nagdrishti-logo.png"
                  alt="NagDrishti AI"
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                      NagDrishti
                    </span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                      AI
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    Nagpur Safety Shield
                  </p>
                </div>
              )}
            </Link>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] transition hidden lg:block"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {!sidebarCollapsed && (
              <div className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 px-3 py-1.5 tracking-wider">
                Application
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs transition-all relative ${
                    isActive
                      ? "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Icon className={`w-5 h-5 ${isActive ? "text-teal-600 dark:text-teal-400" : ""}`} />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0F172A] animate-ping" />
                    )}
                  </div>
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}

            {!sidebarCollapsed && (
              <div className="pt-4">
                <div className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 px-3 py-1.5 tracking-wider">
                  Public & Admin
                </div>
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B] hover:text-slate-900 dark:hover:text-white transition"
                >
                  <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">Public Website ↗</span>
                </Link>
                <Link
                  href="/admin/login"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B] hover:text-slate-900 dark:hover:text-white transition"
                >
                  <Lock className="w-4 h-4 text-teal-500 shrink-0" />
                  <span className="truncate">Officer Command ↗</span>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-[#1E293B]">
          {!sidebarCollapsed ? (
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>GIS & AI Engine Active</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                10 Administrative Wards • Zero Mile Hub
              </div>
            </div>
          ) : (
            <div className="flex justify-center p-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Systems Online" />
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN APPLICATION CONTAINER (Top Bar + Main Body) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Application Bar */}
        <header className="sticky top-0 z-30 h-16 lg:h-20 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E293B] px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
          {/* Left: Mobile Menu Trigger + Page Title / Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] md:hidden"
              aria-label="Toggle navigation drawer"
            >
              {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                <Link href="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition">
                  NagDrishti
                </Link>
                <span>/</span>
                <span className="text-teal-700 dark:text-teal-400 font-bold">{getPageTitle()}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right Top Bar Actions (Status, Weather, Theme Toggle, SOS) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live Weather Ticker */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-xs font-semibold text-slate-700 dark:text-slate-300">
              <CloudRain className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-pulse" />
              <span>{weather.rainfall_intensity_mm ?? 0} mm/h</span>
              <span className="text-slate-400">|</span>
              <span className="text-teal-700 dark:text-teal-400 font-bold">{weather.condition || "Live Radar"}</span>
            </div>

            {/* Citywide Risk Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${severeZoneCount > 0 ? "bg-red-400" : "bg-emerald-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${severeZoneCount > 0 ? "bg-red-500" : "bg-emerald-500"}`}></span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Nagpur:</span>
              <span className={severeZoneCount > 0 ? "text-red-600 dark:text-red-400 font-bold" : "text-emerald-600 dark:text-emerald-400 font-bold"}>
                {severeZoneCount > 0 ? `${severeZoneCount} Severe` : "Normal Flow"}
              </span>
            </div>

            {/* THEME TOGGLE BUTTON (Prominent in upper navbar as required) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#131B2A] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1E293B] transition-colors shadow-sm"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
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
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 active:scale-95 transition-all animate-pulse"
              title="Emergency Helplines"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>SOS</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE RESPONSIVE DRAWER */}
      {/* ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex">
          <div className="w-72 bg-white dark:bg-[#0F172A] h-full p-5 flex flex-col justify-between border-r border-slate-200 dark:border-[#1E293B] shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E293B]">
                <Link href="/" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 p-1 flex items-center justify-center border border-teal-500/40">
                    <Image
                      src="/brand/nagdrishti-logo.png"
                      alt="NagDrishti AI"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-black text-base text-slate-900 dark:text-white">NagDrishti AI</span>
                </Link>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-sm transition ${
                        isActive
                          ? "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-[#1E293B]">
              <Link
                href="/"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4 text-teal-500" />
                <span>Public Website</span>
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Officer Portal</span>
              </Link>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
        </div>
      )}

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
