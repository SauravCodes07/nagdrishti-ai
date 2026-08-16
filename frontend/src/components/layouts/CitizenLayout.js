"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  Navigation,
  Camera,
  Bell,
  HelpCircle,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  X,
  CloudRain,
  ExternalLink,
  PhoneCall,
  Lock,
  Download,
  CheckCircle2,
  Info,
  Smartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../ThemeProvider";
import { getWeather, getRiskZones } from "../../lib/api";

export default function CitizenLayout({ children }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  // Weather & Risk quick ticker
  const [weather, setWeather] = useState({ condition: "Live Doppler", rainfall_intensity_mm: 0 });
  const [severeZoneCount, setSevereZoneCount] = useState(0);

  // PWA install state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    getWeather()
      .then((data) => {
        if (data) setWeather(data);
      })
      .catch(() => {});

    getRiskZones()
      .then((data) => {
        if (Array.isArray(data)) {
          const severe = data.filter(
            (z) => z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75
          ).length;
          setSevereZoneCount(severe);
        }
      })
      .catch(() => {});

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      setInstallModalOpen(true);
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/map", label: "Live Map", icon: MapPin },
    { href: "/route", label: "Safe Routes", icon: Navigation },
    { href: "/report", label: "Report Hazard", icon: Camera },
    { href: "/alerts", label: "Alerts", icon: Bell },
  ];

  const toolItems = [
    { href: "/profile", label: "Help & Safety", icon: HelpCircle },
  ];

  // Mobile Bottom Bar Items (5 essential quick actions)
  const mobileBottomItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/map", label: "Live Map", icon: MapPin },
    { href: "/route", label: "Safe Routes", icon: Navigation },
    { href: "/alerts", label: "Alerts", icon: Bell },
    { href: "/profile", label: "Safety", icon: HelpCircle },
  ];

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "City Crisis Dashboard";
    if (pathname === "/map") return "GIS Live Flood Map";
    if (pathname === "/route") return "Flood-Safe Route Planner";
    if (pathname === "/report") return "Report Road Hazard";
    if (pathname === "/alerts") return "Civic Emergency Alerts";
    if (pathname === "/profile") return "Civic Helplines & Safety";
    return "NagDrishti AI";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased selection:bg-[#FF8A00] selection:text-white transition-colors duration-200">
      {/* ========================================================================= */}
      {/* DESKTOP FIXED LEFT SIDEBAR */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] sticky top-0 h-screen transition-all duration-300 z-40 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          {/* Brand Header */}
          <div>
            <div className="h-16 lg:h-20 px-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 p-1 flex items-center justify-center border border-[#FF8A00]/40 shadow-sm shrink-0">
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
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#FF8A00]/10 dark:bg-[#FF8A00]/20 text-[#EA580C] dark:text-[#FF8A00] border border-[#FF8A00]/30">
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] transition hidden lg:block cursor-pointer"
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
                        ? "bg-[#FFF7ED] dark:bg-[#FF8A00]/15 text-[#EA580C] dark:text-[#FF8A00] border border-[#FF8A00]/30 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B] hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? "text-[#EA580C] dark:text-[#FF8A00] scale-110" : ""
                      }`}
                    />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                    {isActive && !sidebarCollapsed && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A00] ml-auto"></span>
                    )}
                  </Link>
                );
              })}

              {!sidebarCollapsed && (
                <div className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 px-3 pt-3 pb-1 tracking-wider">
                  Tools & Access
                </div>
              )}

              {/* Dedicated Install App Action in Sidebar */}
              <button
                onClick={handleInstallApp}
                title={sidebarCollapsed ? "Install NagDrishti App" : undefined}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-[#FFF7ED] dark:hover:bg-[#FF8A00]/10 hover:text-[#EA580C] dark:hover:text-[#FF8A00] transition cursor-pointer border border-transparent hover:border-[#FF8A00]/20"
              >
                <Download className="w-4 h-4 shrink-0 text-[#EA580C] dark:text-[#FF8A00]" />
                {!sidebarCollapsed && <span>{isInstalled ? "App Installed ✓" : "Install App"}</span>}
              </button>

              {toolItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs transition-all relative ${
                      isActive
                        ? "bg-[#FFF7ED] dark:bg-[#FF8A00]/15 text-[#EA580C] dark:text-[#FF8A00] border border-[#FF8A00]/30 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B] hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-[#EA580C] dark:text-[#FF8A00]" : ""
                      }`}
                    />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Links */}
          <div className="p-3 border-t border-slate-200 dark:border-[#1E293B] space-y-2">
            {!sidebarCollapsed ? (
              <>
                <Link
                  href="/"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-[#FF8A00]" />
                    <span>Public Landing Page</span>
                  </span>
                </Link>

                <Link
                  href="/admin/login"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#EA580C] dark:hover:text-[#FF8A00] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#EA580C] dark:text-[#FF8A00]" />
                    <span>Officer Portal</span>
                  </span>
                </Link>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">GIS Feed</span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Live Radar
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">Nagpur 10-Ward Basin Mesh</div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Link
                  href="/"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  title="Public Landing"
                >
                  <ExternalLink className="w-4 h-4 text-[#FF8A00]" />
                </Link>
                <Link
                  href="/admin/login"
                  className="p-2 rounded-xl text-slate-400 hover:text-[#FF8A00]"
                  title="Officer Portal"
                >
                  <Lock className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT CONTAINER */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Application Bar */}
        <header className="sticky top-0 z-30 h-16 lg:h-20 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E293B] px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
          {/* Left: Mobile Menu Trigger + Page Title / Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] md:hidden cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                <Link href="/" className="hover:text-[#EA580C] dark:hover:text-[#FF8A00] transition">
                  NagDrishti
                </Link>
                <span>/</span>
                <span className="text-[#EA580C] dark:text-[#FF8A00] font-bold">{getPageTitle()}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right Top Bar Actions (Weather, Status, Saffron Theme Toggle, SOS) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Weather Ticker */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-xs font-semibold text-slate-700 dark:text-slate-300">
              <CloudRain className="w-4 h-4 text-[#EA580C] dark:text-[#FF8A00] animate-pulse" />
              <span>{weather.rainfall_intensity_mm ?? 0} mm/h</span>
              <span className="text-slate-400">|</span>
              <span className="text-[#EA580C] dark:text-[#FF8A00] font-bold">{weather.condition || "Live Radar"}</span>
            </div>

            {/* Citywide Risk Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    severeZoneCount > 0 ? "bg-red-400" : "bg-emerald-400"
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    severeZoneCount > 0 ? "bg-red-500" : "bg-emerald-500"
                  }`}
                ></span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Nagpur:</span>
              <span
                className={
                  severeZoneCount > 0
                    ? "text-red-600 dark:text-red-400 font-bold"
                    : "text-emerald-600 dark:text-emerald-400 font-bold"
                }
              >
                {severeZoneCount > 0 ? `${severeZoneCount} Severe` : "Normal Flow"}
              </span>
            </div>

            {/* THEME TOGGLE BUTTON (Prominent in upper navbar) */}
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
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
              <span>SOS</span>
            </button>
          </div>
        </header>

        {/* Main Body Content with bottom padding for mobile quick nav */}
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
      {/* MOBILE BOTTOM QUICK-ACCESS NAVIGATION (Fixed & Safe-Area Aware) */}
      {/* ========================================================================= */}
      <nav
        aria-label="Mobile quick navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-lg border-t border-slate-200 dark:border-[#1E293B] px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {mobileBottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                  isActive
                    ? "text-[#EA580C] dark:text-[#FF8A00] font-black"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive ? "bg-[#FFF7ED] dark:bg-[#FF8A00]/20" : ""
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#EA580C] dark:text-[#FF8A00]" : ""}`} />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* MOBILE FULL DRAWER NAVIGATION */}
      {/* ========================================================================= */}
      {mobileDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-72 bg-white dark:bg-[#0F172A] h-full p-5 flex flex-col justify-between border-r border-slate-200 dark:border-[#1E293B] shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E293B]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-950 p-1 flex items-center justify-center border border-[#FF8A00]/40">
                    <Image
                      src="/brand/nagdrishti-logo.png"
                      alt="NagDrishti AI"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-black text-base text-slate-900 dark:text-white">NagDrishti AI</span>
                </div>

                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-400 px-3 py-1 tracking-wider">
                  Menu
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                        isActive
                          ? "bg-[#FFF7ED] dark:bg-[#FF8A00]/15 text-[#EA580C] dark:text-[#FF8A00] border border-[#FF8A00]/30"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B]"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#EA580C] dark:text-[#FF8A00]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <div className="text-[10px] font-black uppercase text-slate-400 px-3 pt-3 pb-1 tracking-wider">
                  Tools & Emergency
                </div>

                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    handleInstallApp();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-[#FFF7ED] dark:hover:bg-[#FF8A00]/10 hover:text-[#EA580C] dark:hover:text-[#FF8A00] transition text-left"
                >
                  <Download className="w-4 h-4 text-[#EA580C] dark:text-[#FF8A00]" />
                  <span>{isInstalled ? "App Installed ✓" : "Install App"}</span>
                </button>

                {toolItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                        isActive
                          ? "bg-[#FFF7ED] dark:bg-[#FF8A00]/15 text-[#EA580C] dark:text-[#FF8A00] border border-[#FF8A00]/30"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B]"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#EA580C] dark:text-[#FF8A00]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-[#1E293B] space-y-2">
              <Link
                href="/"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B]"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#FF8A00]" />
                <span>Public Landing</span>
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#EA580C] dark:hover:text-[#FF8A00]"
              >
                <Lock className="w-3.5 h-3.5 text-[#EA580C] dark:text-[#FF8A00]" />
                <span>Officer Desk</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Guidance Modal */}
      {installModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-[#1E293B] pb-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] dark:bg-[#FF8A00]/15 text-[#EA580C] dark:text-[#FF8A00] flex items-center justify-center border border-[#FF8A00]/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Install NagDrishti AI</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Offline-capable civic safety PWA</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">To install on Mobile or Desktop:</p>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-600 dark:text-slate-400">
                  <li><strong>Chrome / Android:</strong> Tap the three dots (⋮) in your browser and select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.</li>
                  <li><strong>Safari / iOS:</strong> Tap the <strong>Share</strong> button and choose <strong>"Add to Home Screen"</strong>.</li>
                  <li><strong>Desktop:</strong> Click the install icon in your browser's address bar.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setInstallModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-black text-xs shadow-md transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Emergency SOS Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B2A] border border-red-200 dark:border-red-900/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-[#1E293B] pb-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800/40">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Emergency Assistance (Nagpur)</h3>
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold">Immediate 24/7 Municipal & Police Dispatch</p>
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
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Police Quick Response</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">112 (National Toll-Free)</div>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-[#1E293B] text-slate-900 dark:text-white font-bold text-xs">Dial 112</span>
              </a>

              <a
                href="tel:101"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Fire & Deep Water Rescue</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">101</div>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-[#1E293B] text-slate-900 dark:text-white font-bold text-xs">Dial 101</span>
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
