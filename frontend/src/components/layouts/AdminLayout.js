"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  AlertOctagon,
  FileCheck2,
  Radio,
  Sliders,
  LogOut,
  MapPin,
  Sun,
  Moon,
  Monitor,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { logoutAdmin, getCurrentUser } from "../../lib/api";
import { useTheme } from "../ThemeProvider";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState({ username: "Officer", is_staff: true });
  const [lastHeartbeat, setLastHeartbeat] = useState("Just now");

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        if (data && data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    const interval = setInterval(() => {
      setLastHeartbeat(new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (_) {}
    router.push("/admin/login");
  };

  const navItems = [
    { href: "/admin", label: "Command Center", icon: LayoutDashboard },
    { href: "/admin/queue", label: "Priority Queue", icon: AlertOctagon },
    { href: "/admin/reports", label: "Hazard Reports", icon: FileCheck2 },
    { href: "/admin/alerts", label: "Alert Dispatch Log", icon: Radio },
    { href: "/admin/simulate", label: "Rainfall Simulator", icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#131B2A] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 p-1 flex items-center justify-center shadow-md border border-teal-500/30 group-hover:scale-105 transition-transform">
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
                  <span className="font-black text-sm text-slate-900 dark:text-white">NagDrishti</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-600 dark:text-teal-400">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                  Crisis Control Center
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 px-3 py-1.5 tracking-wider">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isActive
                      ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-3">
              <div className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 px-3 py-1.5 tracking-wider">
                Public Portals
              </div>
              <Link
                href="/map"
                target="_blank"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition"
              >
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Live Citizen Map ↗</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom Sidebar: Theme switch & Officer profile */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Theme switcher */}
          <div className="bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 py-1 flex items-center justify-center gap-1 rounded-lg font-bold transition ${
                theme === "light"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="text-[10px]">Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 py-1 flex items-center justify-center gap-1 rounded-lg font-bold transition ${
                theme === "dark"
                  ? "bg-slate-800 text-teal-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="text-[10px]">Dark</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex-1 py-1 flex items-center justify-center gap-1 rounded-lg font-bold transition ${
                theme === "system"
                  ? "bg-teal-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="System Preference"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[10px]">Auto</span>
            </button>
          </div>

          {/* User badge and logout */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 font-black text-xs flex items-center justify-center border border-teal-500/30">
                {currentUser.username ? currentUser.username[0].toUpperCase() : "A"}
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[90px]">
                  {currentUser.username || "Admin"}
                </div>
                <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">Officer Active</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Command Bar */}
        <header className="h-16 bg-white/80 dark:bg-[#131B2A]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>GIS & AI Engine Online</span>
            </div>
            <div className="hidden sm:block text-xs text-slate-600 dark:text-slate-400 font-medium">
              30s Polling Heartbeat: {lastHeartbeat}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/simulate"
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulate Scenario</span>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6 max-w-7xl w-full mx-auto flex-1">{children}</main>
      </div>
    </div>
  );
}
