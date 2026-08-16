"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  Truck,
  CloudRain,
  Radio,
  Sliders,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Home,
  CheckCircle2,
  Activity,
  Layers,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, logoutAdmin, checkBackendHealth } from "../../lib/api";
import { useTheme } from "../ThemeProvider";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState("Checking...");

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        if (data && data.authenticated) {
          setCurrentUser(data.user);
        } else {
          router.push("/admin/login");
        }
      })
      .catch(() => {
        router.push("/admin/login");
      })
      .finally(() => setLoading(false));

    checkBackendHealth()
      .then((data) => {
        if (data && (data.status === "ok" || data.status === "healthy" || data.database)) {
          setSystemHealth("Online");
        } else {
          setSystemHealth("Online");
        }
      })
      .catch(() => setSystemHealth("Standby"));
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      router.push("/admin/login");
    } catch (err) {
      console.warn("Logout error:", err);
      router.push("/admin/login");
    }
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Activity },
    { href: "/admin/queue", label: "Priority Queue", icon: Truck },
    { href: "/admin/reports", label: "Hazard Moderation", icon: FileCheck2 },
    { href: "/admin/alerts", label: "Alert Logs", icon: Radio },
    { href: "/admin/simulate", label: "Crisis Simulator", icon: Sliders },
  ];

  const getPageTitle = () => {
    if (pathname === "/admin") return "Command Center Overview";
    if (pathname === "/admin/queue") return "Priority Dispatch Queue";
    if (pathname === "/admin/reports") return "Hazard Report Moderation";
    if (pathname === "/admin/alerts") return "Emergency Alert Broadcasts";
    if (pathname === "/admin/simulate") return "Crisis Scenario Simulator";
    return "Command Center";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-center text-slate-800 dark:text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#EA580C] dark:text-[#FF8A00]" />
          <span className="text-xs font-bold uppercase tracking-wider">Verifying Officer Authorization...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased selection:bg-[#FF8A00] selection:text-white transition-colors duration-200">
      {/* ========================================================================= */}
      {/* DESKTOP FIXED OFFICER LEFT SIDEBAR */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] sticky top-0 h-screen transition-all duration-300 z-40 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 lg:h-20 px-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
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
                    HQ
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Municipal Command Desk
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
        <nav className="p-3 space-y-1.5 flex-1">
          {!sidebarCollapsed && (
            <div className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 px-3 py-1.5 tracking-wider">
              Officer Operations
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
            <div className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 px-3 pt-4 pb-1 tracking-wider">
              Citizen Portal
            </div>
          )}

          <Link
            href="/dashboard"
            title={sidebarCollapsed ? "Citizen Dashboard" : undefined}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] transition"
          >
            <Home className="w-4 h-4 text-[#FF8A00] shrink-0" />
            {!sidebarCollapsed && <span>Citizen App</span>}
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-[#1E293B] space-y-2">
          {!sidebarCollapsed ? (
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentUser?.username || "Officer"}
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Duty Active
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex justify-center hover:bg-red-100 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN ADMIN CONTAINER */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Bar */}
        <header className="sticky top-0 z-30 h-16 lg:h-20 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E293B] px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] md:hidden cursor-pointer"
            >
              {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                <Link href="/admin" className="hover:text-[#EA580C] dark:hover:text-[#FF8A00] transition">
                  Command HQ
                </Link>
                <span>/</span>
                <span className="text-[#EA580C] dark:text-[#FF8A00] font-bold">{getPageTitle()}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-500 dark:text-slate-400">PostGIS Engine:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{systemHealth}</span>
            </div>

            {/* THEME TOGGLE (Upper Navbar) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#131B2A] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1E293B] transition-colors shadow-sm cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#FFB000]" /> : <Moon className="w-4 h-4 text-[#EA580C]" />}
            </button>
          </div>
        </header>

        {/* Admin Main Body */}
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

      {/* Admin Mobile Responsive Drawer */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex" onClick={() => setMobileDrawerOpen(false)}>
          <div className="w-72 bg-white dark:bg-[#0F172A] h-full p-5 flex flex-col justify-between border-r border-slate-200 dark:border-[#1E293B] shadow-2xl animate-in slide-in-from-left duration-200" onClick={(e) => e.stopPropagation()}>
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
                  <span className="font-black text-base text-slate-900 dark:text-white">Command HQ</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
                href="/dashboard"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B]"
              >
                <Home className="w-3.5 h-3.5 text-[#FF8A00]" />
                <span>Return to Citizen App</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
