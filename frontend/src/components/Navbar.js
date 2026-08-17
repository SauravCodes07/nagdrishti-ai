"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  X,
  Navigation,
  Activity,
  Layers,
  Camera,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function Navbar({
  activeTab,
  setActiveTab,
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
    <header className="sticky top-0 z-50 bg-[#FFFFFF] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#243244] text-[#0F172A] dark:text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab && setActiveTab("map")}>
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#0F172A] flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155] p-1">
              <Image
                src="/brand/nagdrishti-logo.png"
                alt="NagDrishti AI"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">NagDrishti</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#CCFBF1] dark:bg-teal-500/20 text-[#0F766E] dark:text-[#5EEAD4] border border-[#0F766E]/20">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal hidden sm:block">
                Nagpur Urban Crisis Management
              </p>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) item.action();
                    else if (setActiveTab) setActiveTab(item.id);
                  }}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#CCFBF1] text-[#0F766E] font-semibold dark:bg-teal-500/15 dark:text-[#5EEAD4]"
                      : "text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Utilities */}
          <div className="flex items-center space-x-2.5">
            {/* Severe Alert Indicator */}
            {severeCount > 0 && (
              <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#FEE2E2] dark:bg-red-500/15 text-[#991B1B] dark:text-[#F87171] border border-red-200 dark:border-red-500/30 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
                <span>{severeCount} Severe {severeCount === 1 ? "Ward" : "Wards"}</span>
              </span>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#111C2E] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#243244] transition cursor-pointer"
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#0F766E]" />}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="p-2 rounded-lg text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] md:hidden cursor-pointer"
            >
              {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] dark:border-[#243244] bg-[#FFFFFF] dark:bg-[#0F172A] p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) item.action();
                  else if (setActiveTab) setActiveTab(item.id);
                  setDrawerOpen(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-sm text-left transition-colors ${
                  isActive
                    ? "bg-[#CCFBF1] text-[#0F766E] font-semibold dark:bg-teal-500/15 dark:text-[#5EEAD4]"
                    : "text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] font-medium"
                }`}
              >
                <Icon className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
