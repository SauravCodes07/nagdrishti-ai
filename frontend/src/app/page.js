"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CitizenLayout from "../components/layouts/CitizenLayout";
import { getRiskZones, getReports, getBroadcastAlerts, getWeather } from "../lib/api";
import {
  Map,
  AlertTriangle,
  Navigation,
  Bell,
  CloudRain,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  PhoneCall,
  Activity,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [z, r, a, w] = await Promise.all([
          getRiskZones().catch(() => []),
          getReports().catch(() => []),
          getBroadcastAlerts().catch(() => []),
          getWeather().catch(() => null),
        ]);
        if (mounted) {
          setZones(Array.isArray(z) ? z : []);
          setReports(Array.isArray(r) ? r : []);
          setAlerts(Array.isArray(a) ? a : []);
          setWeather(w);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const severeZones = zones.filter((z) => (z.latest_risk_score ?? z.risk_score ?? 0) >= 60);
  const highestRiskZone = [...zones].sort(
    (a, b) => (b.latest_risk_score ?? b.risk_score ?? 0) - (a.latest_risk_score ?? a.risk_score ?? 0)
  )[0];

  const cityRiskLevel =
    severeZones.length >= 2
      ? { label: "CRITICAL FLOOD ALERT", bg: "bg-red-500", text: "text-white", badge: "bg-red-600" }
      : severeZones.length === 1
      ? { label: "LOCALIZED WARNING", bg: "bg-amber-500", text: "text-white", badge: "bg-amber-600" }
      : { label: "NORMAL CONDITIONS", bg: "bg-emerald-500", text: "text-white", badge: "bg-emerald-600" };

  return (
    <CitizenLayout>
      <div className="p-4 space-y-4">
        
        {/* City Flood Status Banner */}
        <div className={`rounded-2xl p-4 ${cityRiskLevel.bg} ${cityRiskLevel.text} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <span className="text-[11px] font-black uppercase tracking-wider">
                {cityRiskLevel.label}
              </span>
            </div>
            <span className="text-[10px] font-semibold bg-black/20 px-2 py-0.5 rounded-full">
              Live Nagpur GIS
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-black tracking-tight">
                {weather?.nagpur_city_average_rain_mm?.toFixed(1) || "0.0"}{" "}
                <span className="text-sm font-bold opacity-90">mm/h rain</span>
              </div>
              <div className="text-xs opacity-90 font-medium">
                {severeZones.length > 0
                  ? `${severeZones.length} ward(s) under high waterlogging risk`
                  : "All monitored drainage corridors flowing normally"}
              </div>
            </div>
            {highestRiskZone && (
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold opacity-75">Max Risk Area</div>
                <div className="text-xs font-bold">{highestRiskZone.name}</div>
              </div>
            )}
          </div>
        </div>

        {/* Hero Card with Primary Action */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-xs space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFC107]/20 border border-[#FFC107]/40 text-[#111111] text-[11px] font-bold mb-2">
              <Activity className="w-3.5 h-3.5 text-[#111111]" />
              <span>Smart Civic Defense</span>
            </div>
            <h1 className="text-xl font-black text-[#111111] tracking-tight leading-tight">
              Nagpur Flood & Waterlogging Shield
            </h1>
            <p className="text-xs text-[#666666] mt-1 font-medium leading-relaxed">
              Real-time AI flood analysis, safe emergency pathfinding, and instant civic hazard reporting for citizens of Nagpur.
            </p>
          </div>

          {/* THE SINGLE PRIMARY ACTION CTA ON THIS SCREEN */}
          <Link
            href="/report"
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-[#FF8A00] hover:bg-[#E67C00] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="leading-tight">Report Waterlogging Hazard</div>
                <div className="text-[10px] text-white/80 font-normal">Photo upload + AI vision check</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white" />
          </Link>
        </div>

        {/* 2 Quick Action Entry Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/map"
            className="p-4 rounded-2xl bg-white border border-[#E5E5E5] hover:border-[#111111] transition flex flex-col justify-between shadow-xs group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFC107] text-[#111111] flex items-center justify-center font-bold mb-3 shadow-2xs">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-[#111111] group-hover:text-[#FF8A00] transition flex items-center justify-between">
                <span>Live Flood Map</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-[10px] text-[#666666] font-medium mt-0.5">
                Ward risks & pumps
              </div>
            </div>
          </Link>

          <Link
            href="/route"
            className="p-4 rounded-2xl bg-white border border-[#E5E5E5] hover:border-[#111111] transition flex flex-col justify-between shadow-xs group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold mb-3 shadow-2xs">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-[#111111] group-hover:text-[#FF8A00] transition flex items-center justify-between">
                <span>Safe Route</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-[10px] text-[#666666] font-medium mt-0.5">
                Avoid flooded roads
              </div>
            </div>
          </Link>
        </div>

        {/* Active Civic Broadcast Alerts Preview */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-[#111111]">Civic Broadcast Alerts</span>
            </div>
            <Link href="/alerts" className="text-[11px] font-bold text-[#666666] hover:text-[#111111]">
              View All ({alerts.length})
            </Link>
          </div>

          {alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.slice(0, 2).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111111]">{alert.zone_name || "Nagpur City"}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      {alert.severity || "Alert"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666666] line-clamp-2">{alert.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#F7F7F7] text-center text-xs text-[#666666]">
              No active emergency broadcast alerts at this time.
            </div>
          )}
        </div>

        {/* Emergency Helplines Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-xs space-y-3">
          <div className="text-xs font-black text-[#111111] flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-[#22A447]" />
            <span>Emergency Helplines (Nagpur)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href="tel:07122567035"
              className="p-2.5 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] hover:bg-neutral-100 transition flex flex-col"
            >
              <span className="text-[10px] text-[#666666] font-medium">NMC Disaster Cell</span>
              <span className="font-extrabold text-[#111111]">0712-2567035</span>
            </a>
            <a
              href="tel:112"
              className="p-2.5 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] hover:bg-neutral-100 transition flex flex-col"
            >
              <span className="text-[10px] text-[#666666] font-medium">National Emergency</span>
              <span className="font-extrabold text-[#111111]">112</span>
            </a>
          </div>
        </div>

      </div>
    </CitizenLayout>
  );
}
