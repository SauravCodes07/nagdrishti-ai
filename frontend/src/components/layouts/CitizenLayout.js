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
  Smartphone,
  AlertTriangle,
  User,
  LogIn,
  LogOut,
} from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { getWeather, getRiskZones, getCurrentUser, logoutUser } from "../../lib/api";

export default function CitizenLayout({ children }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Weather & Risk quick ticker
  const [weather, setWeather] = useState({ condition: "Live Doppler", rainfall_intensity_mm: 0 });
  const [severeZoneCount, setSevereZoneCount] = useState(0);

  // PWA install state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        if (data && data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));

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

    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      console.warn("Logout error:", err);
    }
  };

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

  // Mobile Bottom Bar Items
  const mobileBottomItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/map", label: "Live Map", icon: MapPin },
    { href: "/report", label: "Report", icon: Camera, isPrimary: true },
    { href: "/route", label: "Routes", icon: Navigation },
    { href: "/alerts", label: "Alerts", icon: Bell },
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col md:flex-row antialiased">
      {/* ========================================================================= */}
      {/* DESKTOP FIXED LEFT SIDEBAR */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-[#E2E8F0] dark:border-[#243244] bg-[#FFFFFF] dark:bg-[#0F172A] sticky top-0 h-screen transition-all duration-200 z-40 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          {/* Brand Header */}
          <div>
            <div className="h-16 px-4 border-b border-[#E2E8F0] dark:border-[#243244] flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#0F172A] p-1 flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155] shrink-0">
                  <Image
                    src="/brand/nagdrishti-logo.png"
                    alt="NagDrishti AI"
                    width={32}
                    height={32}
                    className="object-contain"
                    priority
                  />
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-base text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                        NagDrishti
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#CCFBF1] dark:bg-teal-500/20 text-[#0F766E] dark:text-[#5EEAD4] border border-[#0F766E]/20">
                        AI
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal truncate">
                      Nagpur Civic Safety
                    </p>
                  </div>
                )}
              </Link>

              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition hidden lg:block cursor-pointer"
                title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-3 space-y-1">
              {!sidebarCollapsed && (
                <div className="text-[11px] font-medium uppercase text-[#64748B] dark:text-[#94A3B8] px-3 py-1.5 tracking-wider">
                  Platform
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
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors relative ${
                      isActive
                        ? "bg-[#CCFBF1] text-[#0F766E] font-semibold dark:bg-teal-500/15 dark:text-[#5EEAD4]"
                        : "text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                    {isActive && !sidebarCollapsed && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] dark:bg-[#14B8A6] ml-auto"></span>
                    )}
                  </Link>
                );
              })}

              {!sidebarCollapsed && (
                <div className="text-[11px] font-medium uppercase text-[#64748B] dark:text-[#94A3B8] px-3 pt-3 pb-1 tracking-wider">
                  Tools & Resources
                </div>
              )}

              <button
                onClick={handleInstallApp}
                title={sidebarCollapsed ? "Install NagDrishti App" : undefined}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium transition cursor-pointer text-left"
              >
                <Download className="w-4 h-4 shrink-0 text-[#0F766E] dark:text-[#14B8A6]" />
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
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors relative ${
                      isActive
                        ? "bg-[#CCFBF1] text-[#0F766E] font-semibold dark:bg-teal-500/15 dark:text-[#5EEAD4]"
                        : "text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-[#E2E8F0] dark:border-[#243244] space-y-2">
            {!sidebarCollapsed ? (
              <>
                {user ? (
                  <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#162235] border border-[#E2E8F0] dark:border-[#243244] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#CCFBF1] dark:bg-teal-500/20 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center font-bold text-xs shrink-0">
                          {(user.name || user.username || "C")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                            {user.name || user.username}
                          </p>
                          <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] block capitalize">
                            {user.role || (user.is_staff ? "Officer" : "Citizen")}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#DC2626] dark:hover:text-[#F87171] hover:bg-[#FEE2E2] dark:hover:bg-red-500/10 transition cursor-pointer"
                        title="Sign Out"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#F1F5F9] dark:bg-[#162235] border border-[#E2E8F0] dark:border-[#243244] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Citizen Account</span>
                      <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-[#CCFBF1] dark:bg-teal-500/20 text-[#0F766E] dark:text-[#5EEAD4]">
                        Auth
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Sign in to manage verified hazard reports
                    </p>
                    <Link
                      href="/login"
                      className="w-full py-2 px-3 rounded-lg bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-medium text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In / Register</span>
                    </Link>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-[#243244] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#64748B] dark:text-[#94A3B8]">
                    <Lock className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                    <span className="text-[11px] font-medium">Officer Desk</span>
                  </div>
                  <Link
                    href="/admin/login"
                    className="text-[11px] font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline"
                  >
                    Portal →
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#162235] text-[#64748B] hover:text-[#DC2626] flex justify-center hover:bg-[#FEE2E2] dark:hover:bg-red-500/10 cursor-pointer transition"
                    title={`Signed in as ${user.username} (Click to logout)`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#162235] text-[#475569] dark:text-[#CBD5E1] flex justify-center hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B]"
                    title="Sign In / Register"
                  >
                    <LogIn className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                  </Link>
                )}
                <Link
                  href="/admin/login"
                  className="w-full p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#162235] text-[#475569] dark:text-[#CBD5E1] flex justify-center hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B]"
                  title="Officer Portal"
                >
                  <Lock className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={toggleTheme}
                className="w-full py-2 px-3 rounded-lg bg-[#F8FAFC] dark:bg-[#111C2E] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#243244] text-[#475569] dark:text-[#CBD5E1] font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
                    {!sidebarCollapsed && <span>Light Theme</span>}
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#0F766E]" />
                    {!sidebarCollapsed && <span>Dark Theme</span>}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#FFFFFF] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#243244] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-2 rounded-lg text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] md:hidden cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-base sm:text-lg text-[#0F172A] dark:text-[#F8FAFC] tracking-tight truncate">
                {getPageTitle()}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F5F9] dark:bg-[#162235] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#243244]">
                Nagpur City
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live IMD Weather Ticker */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">
              <CloudRain className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
              <span>
                Rainfall: <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold">{weather.rainfall_intensity_mm ?? 0} mm/h</strong>
              </span>
            </div>

            {/* Severe Zones Count Indicator */}
            {severeZoneCount > 0 && (
              <Link
                href="/alerts"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FEE2E2] dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 text-xs font-semibold text-[#991B1B] dark:text-[#F87171] hover:bg-red-100 dark:hover:bg-red-500/25 transition"
              >
                <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
                <span>{severeZoneCount} Severe {severeZoneCount === 1 ? "Ward" : "Wards"}</span>
              </Link>
            )}

            {/* User Account Quick Pill */}
            {user ? (
              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#162235] border border-[#E2E8F0] dark:border-[#243244] text-xs">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate max-w-[120px]">
                  {user.name || user.username}
                </span>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F1F5F9] dark:bg-[#162235] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] text-[#0F766E] dark:text-[#14B8A6] border border-[#E2E8F0] dark:border-[#243244] transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Theme Toggle (Mobile/Tablet view) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#111C2E] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#243244] transition cursor-pointer md:hidden"
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#0F766E]" />}
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={() => setSosModalOpen(true)}
              className="h-10 px-3.5 sm:px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-[#FFFFFF] font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>
          </div>
        </header>

        {/* Main Body Content */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
          <div key={pathname}>
            {children}
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM QUICK-ACCESS NAVIGATION */}
      {/* ========================================================================= */}
      <nav
        aria-label="Mobile quick navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF] dark:bg-[#0F172A] border-t border-[#E2E8F0] dark:border-[#243244] px-2 py-1 shadow-[0_-2px_8px_rgba(15,23,42,0.06)]"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {mobileBottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.isPrimary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white flex items-center justify-center shadow-md border-2 border-[#FFFFFF] dark:border-[#0F172A]">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#0F766E] dark:text-[#14B8A6] mt-0.5">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
                  isActive
                    ? "text-[#0F766E] dark:text-[#14B8A6] font-semibold"
                    : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium"
                }`}
              >
                <Icon className="w-5 h-5" />
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
          className="md:hidden fixed inset-0 z-50 bg-slate-950/60 flex"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-72 bg-[#FFFFFF] dark:bg-[#0F172A] h-full p-5 flex flex-col justify-between border-r border-[#E2E8F0] dark:border-[#243244] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#243244]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0F172A] p-1 flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155]">
                    <Image
                      src="/brand/nagdrishti-logo.png"
                      alt="NagDrishti AI"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-bold text-base text-[#0F172A] dark:text-[#F8FAFC]">NagDrishti AI</span>
                </div>

                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-medium uppercase text-[#64748B] dark:text-[#94A3B8] px-3 py-1 tracking-wider">
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
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                        isActive
                          ? "bg-[#CCFBF1] text-[#0F766E] font-semibold dark:bg-teal-500/15 dark:text-[#5EEAD4]"
                          : "text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] font-medium"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <div className="text-[11px] font-medium uppercase text-[#64748B] dark:text-[#94A3B8] px-3 pt-3 pb-1 tracking-wider">
                  Tools & Helplines
                </div>

                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    handleInstallApp();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] font-medium transition text-left"
                >
                  <Download className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
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
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                        isActive
                          ? "bg-[#CCFBF1] text-[#0F766E] font-semibold dark:bg-teal-500/15 dark:text-[#5EEAD4]"
                          : "text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] font-medium"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#243244] space-y-2">
              <Link
                href="/"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>Public Landing</span>
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F766E] dark:hover:text-[#14B8A6]"
              >
                <Lock className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>Officer Desk</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Guidance Modal */}
      {installModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] dark:border-[#243244] pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center border border-[#0F766E]/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Install NagDrishti AI</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Offline-capable civic safety application</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#334155] dark:text-[#CBD5E1]">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#243244] space-y-2">
                <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Installation Instructions:</p>
                <ul className="space-y-1.5 text-xs list-disc list-inside text-[#475569] dark:text-[#CBD5E1]">
                  <li><strong>Chrome / Android:</strong> Tap menu (⋮) and select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.</li>
                  <li><strong>Safari / iOS:</strong> Tap <strong>Share</strong> and choose <strong>"Add to Home Screen"</strong>.</li>
                  <li><strong>Desktop:</strong> Click the install icon in your browser address bar.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setInstallModalOpen(false)}
              className="w-full h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-sm transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}

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
                <p className="text-xs text-[#DC2626] dark:text-[#F87171] font-medium">24/7 Municipal & Rescue Dispatch</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                href="tel:07122567035"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#FEF2F2] dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
              >
                <div>
                  <div className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">NMC 24/7 Flood Control Room</div>
                  <div className="text-xs text-[#DC2626] dark:text-[#F87171] font-bold">0712-2567035</div>
                </div>
                <span className="h-8 px-3 rounded-lg bg-[#DC2626] text-white font-semibold text-xs flex items-center">Call Now</span>
              </a>

              <a
                href="tel:112"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#243244] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition"
              >
                <div>
                  <div className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">Police Quick Response</div>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">112 (National Emergency)</div>
                </div>
                <span className="h-8 px-3 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs flex items-center border border-[#CBD5E1] dark:border-[#334155]">Dial 112</span>
              </a>

              <a
                href="tel:101"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#243244] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition"
              >
                <div>
                  <div className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">Fire & Deep Water Rescue</div>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">101</div>
                </div>
                <span className="h-8 px-3 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs flex items-center border border-[#CBD5E1] dark:border-[#334155]">Dial 101</span>
              </a>
            </div>

            <button
              onClick={() => setSosModalOpen(false)}
              className="w-full h-10 rounded-xl bg-[#F1F5F9] dark:bg-[#0F172A] text-[#334155] dark:text-[#CBD5E1] font-medium text-xs hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
