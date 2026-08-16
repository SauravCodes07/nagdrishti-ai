"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  X,
  Shield,
  Navigation,
  AlertTriangle,
  Download,
  Activity,
  Layers,
  CheckCircle2,
  Lock,
  Camera,
  MapPin,
  Bell,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function Navbar({
  activeTab,
  setActiveTab,
  mode,
  setMode,
  zones = [],
  reports = [],
  onOpenReportModal,
}) {
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  // Severe and High risk counts
  const severeCount = zones.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75)).length;
  const highCount = zones.filter((z) => (z.risk_category === "High" || ((z.latest_risk_score ?? z.risk_score) >= 50 && (z.latest_risk_score ?? z.risk_score) < 75))).length;
  const pendingReportsCount = reports.filter((r) => r.verification_status === "Pending").length;

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert("To install NagDrishti on mobile: Open your browser menu (⋮ or Share) and tap 'Add to Home Screen'.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const navItems = [
    { id: "map", label: "Crisis Map", icon: Layers },
    { id: "route", label: "Safe Routing", icon: Navigation },
    { id: "report", label: "Report Hazard", icon: Camera, action: onOpenReportModal },
    { id: "overview", label: "Ward Status", icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab && setActiveTab("map")}>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-teal-500/40 shadow-sm p-1">
              <Image
                src="/brand/nagdrishti-logo.png"
                alt="NagDrishti AI"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">NagDrishti</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Nagpur Urban Crisis Management
              </p>
            </div>
          </div>

          {/* City Live Status Ticker (Desktop) */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-100 dark:bg-[#131B2A] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#1E293B] text-xs">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${severeCount > 0 ? "bg-red-400" : "bg-emerald-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${severeCount > 0 ? "bg-red-500" : "bg-emerald-500"}`}></span>
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">Nagpur Status:</span>
            {severeCount > 0 ? (
              <span className="font-bold text-red-600 dark:text-red-400">{severeCount} Severe Wards</span>
            ) : highCount > 0 ? (
              <span className="font-bold text-amber-600 dark:text-amber-400">{highCount} High Risk Wards</span>
            ) : (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">All Wards Normal</span>
            )}
            {pendingReportsCount > 0 && (
              <span className="text-slate-400 dark:text-slate-500 pl-1">| {pendingReportsCount} Reports</span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && mode === "citizen";
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (setActiveTab && setMode) {
                      setActiveTab(item.id);
                      setMode("citizen");
                    }
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                      : item.id === "report"
                      ? "bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 border border-teal-500/30"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#131B2A] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1E293B] transition shadow-sm cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-teal-600" />}
            </button>

            {/* Admin Command Center Link/Mode */}
            {setMode && (
              <button
                onClick={() => {
                  setMode(mode === "admin" ? "citizen" : "admin");
                  if (mode !== "admin" && setActiveTab) setActiveTab("admin");
                }}
                className={`ml-2 flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  mode === "admin"
                    ? "bg-teal-600 text-white border-teal-400 shadow"
                    : "bg-slate-100 dark:bg-[#131B2A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#1E293B]"
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{mode === "admin" ? "Admin Mode" : "Officer Desk"}</span>
              </button>
            )}
          </nav>

          {/* Mobile Hamburger Button & Controls */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#131B2A] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1E293B]"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-teal-600" />}
            </button>

            {onOpenReportModal && (
              <button
                onClick={() => onOpenReportModal()}
                className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center space-x-1 shadow-md"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            )}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation drawer"
            >
              {drawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#1E293B] p-6 space-y-4 shadow-2xl">
            {/* Status Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${severeCount > 0 ? "bg-red-500" : "bg-emerald-500"}`}></span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Nagpur Crisis Level</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {severeCount > 0 ? `${severeCount} Severe Wards Affected` : "Normal Conditions"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded bg-slate-200 dark:bg-[#0B0F17] text-teal-700 dark:text-teal-400">
                {zones.length || 10} Wards
              </span>
            </div>

            {/* Navigation Items */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id && mode === "citizen";
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setDrawerOpen(false);
                      if (item.action) {
                        item.action();
                      } else if (setActiveTab && setMode) {
                        setActiveTab(item.id);
                        setMode("citizen");
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-teal-600 text-white font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#131B2A]"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}

              {setMode && (
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setMode("admin");
                    if (setActiveTab) setActiveTab("admin");
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/40"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Admin Command Center</span>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                </button>
              )}
            </div>

            {/* PWA Install Button */}
            <div className="pt-3 border-t border-slate-200 dark:border-[#1E293B]">
              <button
                onClick={handleInstallPWA}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md active:scale-98 transition-transform"
              >
                <Download className="w-4 h-4" />
                <span>{installed ? "App Installed ✓" : "Install NagDrishti App"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
