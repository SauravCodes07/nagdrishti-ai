"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListOrdered,
  FileText,
  BellRing,
  CloudRain,
  ShieldAlert,
  LogOut,
  ExternalLink,
  ChevronRight,
  Radio,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    // Check local storage token for basic admin presence
    const token = typeof window !== "undefined" ? localStorage.getItem("nagdrishti_token") : null;
    const user = typeof window !== "undefined" ? localStorage.getItem("nagdrishti_user") : null;
    if (user) {
      try {
        setAdminUser(JSON.parse(user));
      } catch (e) {
        setAdminUser({ username: user });
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("nagdrishti_token");
      localStorage.removeItem("nagdrishti_user");
    }
    router.push("/admin/login");
  };

  const navItems = [
    { label: "Command Center", href: "/admin", icon: LayoutDashboard },
    { label: "Priority Queue", href: "/admin/queue", icon: ListOrdered },
    { label: "Hazard Reports", href: "/admin/reports", icon: FileText },
    { label: "Alert Dispatch Log", href: "/admin/alerts", icon: BellRing },
    { label: "Rainfall Simulator", href: "/admin/simulate", icon: CloudRain },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#111111] flex flex-col antialiased">
      {/* Top Admin App Bar */}
      <header className="sticky top-0 z-40 bg-[#111111] text-white px-6 py-3 border-b border-neutral-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFC107] text-[#111111] flex items-center justify-center font-black text-sm">
              ND
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white">
                NagDrishti <span className="text-[#FF8A00]">Admin</span>
              </span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-[#FFC107] border border-neutral-700">
                Command Console
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#22A447] animate-pulse"></span>
            <span className="font-mono text-[11px]">System Live (30s Polling)</span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition"
          >
            <span>Citizen App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-900/60 transition"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body with Left Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Left Sidebar */}
        <aside className="w-64 bg-white border-r border-[#E5E5E5] flex flex-col justify-between hidden md:flex shrink-0">
          <div className="p-4 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#666666] px-3 mb-2">
              Municipal Operations
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#FFC107] text-[#111111] shadow-xs"
                      : "text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#111111]" : "text-[#666666]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-[#111111]" />}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-4 border-t border-[#E5E5E5] bg-[#F7F7F7]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                {adminUser?.username ? adminUser.username.slice(0, 2).toUpperCase() : "AD"}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-[#111111] truncate">
                  {adminUser?.username || "Municipal Officer"}
                </div>
                <div className="text-[10px] text-[#666666] flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-[#22A447]" />
                  <span>Authenticated</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 bg-[#F7F7F7] overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
