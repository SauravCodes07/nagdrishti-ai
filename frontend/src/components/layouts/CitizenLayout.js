"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  MapPin,
  Camera,
  Bell,
  User,
  AlertTriangle,
  CloudRain,
  PhoneCall,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getWeather, getBroadcastAlerts } from "../../lib/api";

export default function CitizenLayout({ children }) {
  const pathname = usePathname();
  const [weather, setWeather] = useState({ condition: "Moderate Showers", rainfall_intensity_mm: 18.5, temperature: 28 });
  const [hasSevereAlerts, setHasSevereAlerts] = useState(false);
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
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/map", label: "Map", icon: MapPin },
    { href: "/report", label: "Report", icon: Camera, isPrimaryAction: true },
    { href: "/alerts", label: "Alerts", icon: Bell, badge: hasSevereAlerts },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#131B2A]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-900 dark:bg-slate-950 p-1 flex items-center justify-center shadow-md border border-teal-500/30 group-hover:scale-105 transition-transform">
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
                <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  NagDrishti
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Nagpur City Shield
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Live Weather Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 dark:bg-teal-950/40 border border-teal-500/20 text-[11px] font-semibold text-teal-700 dark:text-teal-300">
              <CloudRain className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 animate-pulse" />
              <span>{weather.rainfall_intensity_mm ?? 0} mm/h</span>
            </div>

            {/* Emergency SOS Button (Always Strong Red) */}
            <button
              onClick={() => setSosModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-600/20 flex items-center gap-1.5 active:scale-95 transition-transform animate-pulse"
              title="Emergency SOS & Helpline"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>SOS</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-lg mx-auto w-full flex-1 px-4 py-4 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Fixed Bottom Navigation Bar (5 tabs with elevated circular action) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#131B2A]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/80 shadow-2xl">
        <div className="max-w-lg mx-auto px-4 h-20 flex items-center justify-around relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.isPrimaryAction) {
              return (
                <div key={item.href} className="relative -top-5 flex flex-col items-center">
                  <Link
                    href={item.href}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-90 ${
                      isActive
                        ? "bg-teal-500 ring-4 ring-teal-500/30 shadow-teal-500/40"
                        : "bg-teal-600 hover:bg-teal-500 shadow-teal-600/30"
                    }`}
                    title="Report Waterlogging or Road Hazard"
                  >
                    <Icon className="w-7 h-7" />
                  </Link>
                  <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 mt-1">
                    {item.label}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                  isActive
                    ? "text-teal-600 dark:text-teal-400 font-extrabold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#131B2A] animate-ping" />
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Emergency SOS Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B2A] border border-red-200 dark:border-red-950 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Emergency Helplines</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nagpur 24/7 Response Services</p>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href="tel:07122567035"
                className="w-full p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center justify-between text-red-700 dark:text-red-300 font-bold hover:bg-red-100 transition"
              >
                <div>
                  <div className="text-xs text-red-500 uppercase">NMC Flood Control Room</div>
                  <div className="text-sm">0712-2567035</div>
                </div>
                <PhoneCall className="w-5 h-5 text-red-600" />
              </a>

              <a
                href="tel:112"
                className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-200 transition"
              >
                <div>
                  <div className="text-xs text-slate-500 uppercase">Police / All Emergency</div>
                  <div className="text-sm">112</div>
                </div>
                <PhoneCall className="w-5 h-5 text-slate-600" />
              </a>

              <a
                href="tel:101"
                className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-200 transition"
              >
                <div>
                  <div className="text-xs text-slate-500 uppercase">Fire & Disaster Rescue</div>
                  <div className="text-sm">101</div>
                </div>
                <PhoneCall className="w-5 h-5 text-slate-600" />
              </a>
            </div>

            <button
              onClick={() => setSosModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
