"use client";

import Link from "next/link";
import { AlertTriangle, Home, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex flex-col items-center justify-center p-4 text-slate-900 dark:text-slate-100 antialiased selection:bg-teal-500 selection:text-white transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-sm border border-teal-500/20">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1E293B] text-teal-700 dark:text-teal-400 border border-teal-500/30">
            Error 404
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
            Ward Route Not Found
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The ward, route, or civic portal you requested does not exist in the Nagpur GIS network.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Link
            href="/"
            className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Return to Public Website</span>
          </Link>

          <Link
            href="/map"
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#243044] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Open Live Flood Map</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
