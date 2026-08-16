"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, AlertTriangle, Navigation, Bell, Shield, CloudRain, PhoneCall, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CitizenLayout({ children }) {
  const pathname = usePathname();
  const [weatherSnippet, setWeatherSnippet] = useState(null);

  useEffect(() => {
    // Quick fetch for top bar weather status
    async function loadQuickWeather() {
      try {
        const res = await fetch("http://localhost:8000/api/zones/weather/");
        if (res.ok) {
          const data = await res.json();
          setWeatherSnippet(data);
        }
      } catch (err) {
        // Fallback quiet
      }
    }
    loadQuickWeather();
  }, []);

  const navItems = [
    { label: "Live Map", href: "/map", icon: Map },
    { label: "Report", href: "/report", icon: AlertTriangle },
    { label: "Safe Route", href: "/route", icon: Navigation },
    { label: "Alerts", href: "/alerts", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-between items-center text-[#111111] antialiased">
      {/* Mobile-constrained wrapper for desktop centering */}
      <div className="w-full max-w-lg min-h-screen bg-white shadow-sm flex flex-col relative border-x border-[#E5E5E5]">
        
        {/* Top Citizen Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#E5E5E5] px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFC107] flex items-center justify-center font-bold text-[#111111] shadow-xs">
              ND
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-[#111111] leading-none">
                NagDrishti <span className="text-[#FF8A00]">AI</span>
              </div>
              <div className="text-[10px] text-[#666666] font-medium leading-tight">
                Nagpur Flood & Crisis Shield
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {weatherSnippet ? (
              <div className="flex items-center gap-1.5 bg-[#F7F7F7] px-2.5 py-1 rounded-full border border-[#E5E5E5] text-[11px] font-semibold text-[#111111]">
                <CloudRain className="w-3.5 h-3.5 text-[#FF8A00]" />
                <span>{weatherSnippet.nagpur_city_average_rain_mm?.toFixed(1) || 0} mm/h</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-[#F7F7F7] px-2 py-1 rounded-full border border-[#E5E5E5] text-[10px] font-medium text-[#666666]">
                <span className="w-2 h-2 rounded-full bg-[#22A447] animate-pulse"></span>
                <span>Live Feed</span>
              </div>
            )}

            <Link
              href="/admin/login"
              className="text-[11px] text-[#666666] hover:text-[#111111] font-semibold px-2 py-1 rounded bg-[#F7F7F7] border border-[#E5E5E5]"
              title="Admin Portal"
            >
              Staff
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-20 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Citizen Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E5E5] py-2 px-3 flex justify-around items-center max-w-lg mx-auto shadow-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/map" && pathname === "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
                  isActive
                    ? "text-[#111111] font-bold"
                    : "text-[#666666] hover:text-[#111111] font-medium"
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-9 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-[#FFC107] text-[#111111] shadow-xs"
                        : "text-[#666666]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-[10px] mt-1 tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
