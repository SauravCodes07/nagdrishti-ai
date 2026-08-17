"use client";

import Link from "next/link";
import { AlertTriangle, Home, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex flex-col items-center justify-center p-4 text-[#0F172A] dark:text-[#F8FAFC] antialiased">
      <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-8 shadow-[0_1px_3px_rgba(15,23,42,0.08)] text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-[#FEF9C3] dark:bg-amber-500/15 text-[#854D0E] dark:text-[#FDE047] flex items-center justify-center mx-auto border border-[#EAB308]/30">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#162235] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#243244]">
            Error 404
          </span>
          <h1 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight mt-2">
            Page Not Found
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            The ward, route, or civic portal requested does not exist in the Nagpur GIS network.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Link
            href="/"
            className="w-full h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <Home className="w-4 h-4" />
            <span>Return to Public Website</span>
          </Link>

          <Link
            href="/map"
            className="w-full h-11 rounded-xl bg-[#FFFFFF] dark:bg-[#162235] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#E2E8F0] font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <MapPin className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Open Live Flood Map</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
