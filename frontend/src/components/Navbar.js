"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
} from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  mode,
  setMode,
  zones = [],
  reports = [],
  onOpenReportModal,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  // Severe and High risk counts
  const severeCount = zones.filter((z) => z.risk_category === "Severe").length;
  const highCount = zones.filter((z) => z.risk_category === "High").length;
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
    { id: "report", label: "Report Hazard", icon: AlertTriangle, action: onOpenReportModal },
    { id: "overview", label: "Ward Status", icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A] border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("map")}>
            <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-amber-400/40 shadow-sm">
              <img
                src="/brand/logoicon.svg"
                alt="NagDrishti Icon"
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/brand/nagdrishti-logo.png";
                }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">NagDrishti</span>
                <span className="text-xs font-black uppercase px-1.5 py-0.5 rounded bg-[#FFC107] text-slate-950">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Nagpur Urban Crisis Management
              </p>
            </div>
          </div>

          {/* City Live Status Ticker (Desktop) */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${severeCount > 0 ? "bg-red-400" : highCount > 0 ? "bg-amber-400" : "bg-emerald-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${severeCount > 0 ? "bg-red-500" : highCount > 0 ? "bg-amber-500" : "bg-emerald-500"}`}></span>
            </span>
            <span className="text-slate-300 font-medium">Nagpur Status:</span>
            {severeCount > 0 ? (
              <span className="font-bold text-red-400">{severeCount} Severe Wards</span>
            ) : highCount > 0 ? (
              <span className="font-bold text-amber-400">{highCount} High Risk Wards</span>
            ) : (
              <span className="font-medium text-emerald-400">All Wards Normal</span>
            )}
            {pendingReportsCount > 0 && (
              <span className="text-slate-400 pl-1">| {pendingReportsCount} Reports</span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && mode === "citizen";
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setActiveTab(item.id);
                      setMode("citizen");
                    }
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#FFC107] text-slate-950 shadow-sm"
                      : item.id === "report"
                      ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin Command Center Mode Toggle */}
            <button
              onClick={() => {
                setMode(mode === "admin" ? "citizen" : "admin");
                if (mode !== "admin") setActiveTab("admin");
              }}
              className={`ml-2 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                mode === "admin"
                  ? "bg-indigo-600 text-white border-indigo-400 shadow"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{mode === "admin" ? "Admin Mode Active" : "Admin Center"}</span>
            </button>
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => onOpenReportModal()}
              className="px-2.5 py-1 rounded-lg bg-[#FF8A00] text-slate-950 text-xs font-bold flex items-center space-x-1 shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation drawer"
            >
              {drawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Only place where PWA Install button appears!) */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0F172A] border-b border-slate-800 p-6 space-y-4 shadow-xl">
            {/* Status Summary Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${severeCount > 0 ? "bg-red-500" : highCount > 0 ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                <div>
                  <p className="text-xs font-bold text-white">Nagpur Crisis Level</p>
                  <p className="text-[11px] text-slate-400">
                    {severeCount > 0 ? `${severeCount} Severe Wards Affected` : highCount > 0 ? `${highCount} Wards on High Alert` : "Normal Conditions"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded bg-slate-800 text-slate-300">
                {zones.length} Wards
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
                      } else {
                        setActiveTab(item.id);
                        setMode("citizen");
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[#FFC107] text-slate-950 font-bold"
                        : "text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}

              {/* Switch to Admin Mode Button */}
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setMode("admin");
                  setActiveTab("admin");
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 hover:bg-indigo-900/40"
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Admin Command Center</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>

            {/* PWA INSTALL BUTTON (Strictly inside open mobile drawer as required) */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={handleInstallPWA}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-md active:scale-98 transition-transform"
              >
                <Download className="w-4 h-4" />
                <span>{installed ? "App Installed ✓" : "Install NagDrishti App"}</span>
              </button>
              <p className="text-center text-[10px] text-slate-500 mt-1.5">
                Fast offline access & emergency citizen reporting
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
