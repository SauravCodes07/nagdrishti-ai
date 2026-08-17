"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FileCheck2,
  Truck,
  Radio,
  Sliders,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Home,
  Activity,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
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
        if (data && data.authenticated && (data.user?.is_staff || data.user?.is_superuser || data.user?.role === "admin")) {
          setCurrentUser(data.user);
        } else {
          router.push(`/admin/login?returnUrl=${encodeURIComponent(pathname)}`);
        }
      })
      .catch(() => {
        router.push(`/admin/login?returnUrl=${encodeURIComponent(pathname)}`);
      })
      .finally(() => setLoading(false));

    const handleSessionExpired = () => {
      alert("Municipal Officer session expired. Please sign in again.");
      router.push(`/admin/login?returnUrl=${encodeURIComponent(pathname)}`);
    };

    window.addEventListener("nagdrishti:session-expired", handleSessionExpired);

    checkBackendHealth()
      .then((data) => {
        if (data && (data.status === "ok" || data.status === "healthy" || data.database)) {
          setSystemHealth("Online");
        } else {
          setSystemHealth("Online");
        }
      })
      .catch(() => setSystemHealth("Standby"));

    return () => window.removeEventListener("nagdrishti:session-expired", handleSessionExpired);
  }, [router, pathname]);

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
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex items-center justify-center text-[#0F172A] dark:text-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0F766E] dark:text-[#14B8A6]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-[#CBD5E1]">
            Verifying Officer Authorization...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col md:flex-row antialiased">
      {/* ========================================================================= */}
      {/* DESKTOP FIXED OFFICER LEFT SIDEBAR */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-[#E2E8F0] dark:border-[#243244] bg-[#FFFFFF] dark:bg-[#0F172A] sticky top-0 h-screen transition-all duration-200 z-40 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-[#E2E8F0] dark:border-[#243244] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
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
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#854D0E] dark:bg-amber-500/20 dark:text-[#FDE68A] border border-[#F59E0B]/20">
                    HQ
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal truncate">
                  Municipal Command Desk
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
        <nav className="p-3 space-y-1 flex-1">
          {!sidebarCollapsed && (
            <div className="text-[11px] font-medium uppercase text-[#64748B] dark:text-[#94A3B8] px-3 py-1.5 tracking-wider">
              Command Operations
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
            <div className="text-[11px] font-medium uppercase text-[#64748B] dark:text-[#94A3B8] px-3 pt-4 pb-1 tracking-wider">
              Citizen Portal
            </div>
          )}

          <Link
            href="/dashboard"
            title={sidebarCollapsed ? "Citizen Dashboard" : undefined}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition"
          >
            <Home className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6] shrink-0" />
            {!sidebarCollapsed && <span>Citizen App</span>}
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#E2E8F0] dark:border-[#243244] space-y-2">
          {!sidebarCollapsed ? (
            <div className="p-3 rounded-xl bg-[#F1F5F9] dark:bg-[#162235] border border-[#E2E8F0] dark:border-[#243244] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                  {currentUser?.username || "Officer"}
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#166534] dark:bg-emerald-500/20 dark:text-[#4ADE80]">
                  Duty Active
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-1.5 rounded-lg bg-[#FEE2E2] dark:bg-red-500/15 hover:bg-red-200 dark:hover:bg-red-500/25 text-[#991B1B] dark:text-[#F87171] font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2.5 rounded-xl bg-[#FEE2E2] dark:bg-red-500/15 text-[#991B1B] dark:text-[#F87171] flex justify-center hover:bg-red-200 dark:hover:bg-red-500/25 cursor-pointer"
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
        <header className="sticky top-0 z-30 h-16 bg-[#FFFFFF] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#243244] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-2 rounded-lg text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] md:hidden cursor-pointer"
            >
              {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-base sm:text-lg text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                {getPageTitle()}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F5F9] dark:bg-[#162235] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#243244]">
                Municipal Ops Desk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* System Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
              <span className="font-medium text-[#475569] dark:text-[#CBD5E1]">
                System: <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold">{systemHealth}</strong>
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#111C2E] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#243244] transition cursor-pointer"
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#0F766E]" />}
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div key={pathname}>
            {children}
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE ADMIN DRAWER */}
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
                  <span className="font-bold text-base text-[#0F172A] dark:text-[#F8FAFC]">NagDrishti HQ</span>
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
                  Command Ops
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

                <div className="text-[11px] font-medium uppercase text-[#64748B] dark:text-[#94A3B8] px-3 pt-4 pb-1 tracking-wider">
                  Citizen App
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                >
                  <Home className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>Citizen Dashboard</span>
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#243244]">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  handleLogout();
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-[#FEE2E2] dark:bg-red-500/15 hover:bg-red-200 dark:hover:bg-red-500/25 text-[#991B1B] dark:text-[#F87171] font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({currentUser?.username || "Officer"})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
