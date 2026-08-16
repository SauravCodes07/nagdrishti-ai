"use client";

import Link from "next/link";
import { AlertTriangle, Home, MapPin, Navigation } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4 text-[#111111] antialiased">
      <div className="w-full max-w-md bg-white border border-[#E5E5E5] rounded-3xl p-8 shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#FFC107] text-[#111111] flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600">
            Error 404
          </span>
          <h1 className="text-2xl font-black tracking-tight text-[#111111]">
            Page Not Found
          </h1>
          <p className="text-xs text-[#666666] leading-relaxed">
            The ward, route, or civic portal you requested does not exist in the Nagpur GIS network.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          {/* THE SINGLE PRIMARY ACTION CTA */}
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-xl bg-[#FF8A00] hover:bg-[#E67C00] text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            <Home className="w-4 h-4" />
            <span>Return to Citizen Home</span>
          </Link>

          <Link
            href="/map"
            className="w-full py-3 px-4 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] hover:bg-neutral-100 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <MapPin className="w-4 h-4 text-[#FF8A00]" />
            <span>Open Live Flood Map</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
