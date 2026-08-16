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
  Navigation,
  Activity,
  Shield,
  ExternalLink,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getWeather, getBroadcastAlerts, getRiskZones } from "../../lib/api";

export default function CitizenLayout({ children }) {
  const pathname = usePathname();
  const [weather, setWeather] = useState({ condition: "Showers", rainfall_intensity_mm: 18.5, temperature: 28 });
  const [hasSevereAlerts, setHasSevereAlerts] = useState(false);
  const [severeZoneCount, setSevereZoneCount] = useState(0);
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

    getRiskZones()
      .then((data) => {
        if (Array.isArray(data)) {
          const severe = data.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75)).length;
          setSevereZoneCount(severe);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/map", label: "Live Map", icon: MapPin },
    { href: "/route", label: "Safe Routes", icon: Navigation },
    { href: "/report", label: "Report Hazard", icon: Camera, isHighlight: true },
    { href: "/alerts", label: "Alerts", icon: Bell, badge: hasSevereAlerts },
    { href: "/profile", label: "Helplines & Safety", icon: User },
  ];

  const mobileNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/map", label: "Map", icon: MapPin },
    { href: "/report", label: "Report", icon: Camera, isPrimaryAction: true },
    { href: "/alerts", label: "Alerts", icon: Bell, badge: hasSevereAlerts },
    { href: "/profile", label: "Help", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Application Header / Navbar */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-b border-[#1E293B] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-slate-950 p-1 flex items-center justify-center shadow-md border border-teal-500/40 group-hover:scale-105 group-hover:border-teal-400 transition-all">
              <Image
                src="/brand/nagdrishti-logo.png"
                alt="NagDrishti AI"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-white group-hover:text-teal-400 transition-colors">
                  NagDrishti
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Nagpur Urban Crisis & Safety Shield
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (item.isHighlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/30 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all relative ${
                    isActive
                      ? "bg-[#1E293B] text-teal-400 border border-teal-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-4 h-4" />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0F172A] animate-ping" />
                    )}
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Status Indicators & Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Live Weather Ticker (Desktop/Tablet) */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#131B2A] border border-[#1E293B] text-xs font-semibold text-slate-300">
              <CloudRain className="w-4 h-4 text-teal-400 animate-pulse" />
              <span>{weather.rainfall_intensity_mm ?? 0} mm/h</span>
              <span className="text-slate-600">|</span>
              <span className="text-teal-400 font-bold">{weather.condition || "Live Radar"}</span>
            </div>

            {/* Citywide Risk Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#131B2A] border border-[#1E293B] text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${severeZoneCount > 0 ? "bg-red-400" : "bg-emerald-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${severeZoneCount > 0 ? "bg-red-500" : "bg-emerald-500"}`}></span>
              </span>
              <span className="text-slate-400">Nagpur:</span>
              <span className={severeZoneCount > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                {severeZoneCount > 0 ? `${severeZoneCount} Severe Wards` : "Normal Flow"}
              </span>
            </div>

            {/* Emergency SOS Button */}
            <button
              onClick={() => setSosModalOpen(true)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 active:scale-95 transition-all animate-pulse"
              title="Nagpur 24/7 Disaster Helpline"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>SOS</span>
            </button>

            {/* Admin Link (Desktop subtle) */}
            <Link
              href="/admin/login"
              className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#131B2A] hover:bg-[#1E293B] border border-[#1E293B] text-slate-400 hover:text-white text-xs font-semibold transition"
              title="Municipal Officer Portal"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Officer</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area (Proper responsive max-width on Desktop, fluid on Mobile) */}
      <main className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-28 md:pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Professional Desktop & Tablet Footer */}
      <footer className="hidden md:block bg-[#090D14] border-t border-[#1E293B] py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Column 1: Brand & Purpose */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-950 p-1 flex items-center justify-center border border-teal-500/30">
                  <Image
                    src="/brand/nagdrishti-logo.png"
                    alt="NagDrishti AI"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="font-black text-sm text-white">NagDrishti AI</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Nagpur's AI-driven civic safety and urban flood resilience platform. Real-time predictive risk modeling, safe route calculation, and verified hazard reporting.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>GIS & AI Vision Engines Operational</span>
              </div>
            </div>

            {/* Column 2: Citizen Portals */}
            <div className="space-y-2.5">
              <h4 className="font-black text-slate-200 uppercase tracking-wider text-[11px]">
                Citizen Safety
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/map" className="hover:text-teal-400 transition">
                    Live Nagpur Flood Map
                  </Link>
                </li>
                <li>
                  <Link href="/route" className="hover:text-teal-400 transition">
                    A* Safe Route Navigation
                  </Link>
                </li>
                <li>
                  <Link href="/report" className="hover:text-teal-400 transition">
                    Report Hazard / Waterlogging
                  </Link>
                </li>
                <li>
                  <Link href="/alerts" className="hover:text-teal-400 transition">
                    Emergency Broadcast Alerts
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Emergency Helplines */}
            <div className="space-y-2.5">
              <h4 className="font-black text-slate-200 uppercase tracking-wider text-[11px]">
                Nagpur Helplines (24/7)
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="tel:07122567035" className="text-red-400 hover:underline font-bold flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>NMC Flood Control: 0712-2567035</span>
                  </a>
                </li>
                <li>
                  <a href="tel:112" className="hover:text-white transition flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                    <span>Emergency Police: 112</span>
                  </a>
                </li>
                <li>
                  <a href="tel:101" className="hover:text-white transition flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                    <span>Fire & Disaster Rescue: 101</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Technology & Governance */}
            <div className="space-y-2.5">
              <h4 className="font-black text-slate-200 uppercase tracking-wider text-[11px]">
                Technology & Portal
              </h4>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Powered by OSMnx Road Graph, Hugging Face Vision AI, Django REST Framework, and OpenStreetMap.
              </p>
              <div className="pt-1">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131B2A] hover:bg-[#1E293B] border border-[#1E293B] text-teal-400 font-bold text-xs transition"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Municipal Officer Portal ↗</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} NagDrishti AI. Civic crisis awareness initiative for Nagpur Municipal Corporation wards.
            </div>
            <div className="flex items-center gap-4">
              <span>All 10 Administrative Zones</span>
              <span>•</span>
              <span>Zero Mile Central Hub</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Fixed Mobile Bottom Navigation Bar (Visible only on < md screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-lg border-t border-[#1E293B] shadow-2xl">
        <div className="max-w-lg mx-auto px-4 h-18 flex items-center justify-around relative">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.isPrimaryAction) {
              return (
                <div key={item.href} className="relative -top-4 flex flex-col items-center">
                  <Link
                    href={item.href}
                    className={`w-13 h-13 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-90 ${
                      isActive
                        ? "bg-teal-500 ring-4 ring-teal-500/30 shadow-teal-500/40"
                        : "bg-teal-600 hover:bg-teal-500 shadow-teal-600/30"
                    }`}
                    title="Report Hazard or Waterlogging"
                  >
                    <Icon className="w-6 h-6" />
                  </Link>
                  <span className="text-[10px] font-black text-teal-400 mt-1">
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
                    ? "text-teal-400 font-black"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-[#0F172A] animate-ping" />
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#131B2A] border border-red-900/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-[#1E293B] pb-3">
              <div className="w-12 h-12 rounded-2xl bg-red-950/60 text-red-500 flex items-center justify-center border border-red-800/40">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Nagpur Emergency Helplines</h3>
                <p className="text-xs text-slate-400">24/7 Municipal Disaster & Crisis Response</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                href="tel:07122567035"
                className="w-full p-3.5 rounded-2xl bg-red-950/40 border border-red-900/50 flex items-center justify-between text-red-300 font-bold hover:bg-red-900/40 transition"
              >
                <div>
                  <div className="text-[10px] text-red-400 uppercase tracking-wider font-black">NMC Flood Control Room</div>
                  <div className="text-base font-black text-white">0712-2567035</div>
                </div>
                <div className="p-2 rounded-xl bg-red-600 text-white">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>

              <a
                href="tel:112"
                className="w-full p-3.5 rounded-2xl bg-[#1E293B] border border-[#334155] flex items-center justify-between text-slate-200 font-bold hover:bg-[#243044] transition"
              >
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Police / Emergency Response</div>
                  <div className="text-base font-black text-white">112</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-700 text-teal-400">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>

              <a
                href="tel:101"
                className="w-full p-3.5 rounded-2xl bg-[#1E293B] border border-[#334155] flex items-center justify-between text-slate-200 font-bold hover:bg-[#243044] transition"
              >
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Fire & Flood Rescue</div>
                  <div className="text-base font-black text-white">101</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-700 text-teal-400">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>
            </div>

            <button
              onClick={() => setSosModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-[#1E293B] hover:bg-[#243044] text-slate-300 font-bold text-xs transition"
            >
              Close Helplines Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
