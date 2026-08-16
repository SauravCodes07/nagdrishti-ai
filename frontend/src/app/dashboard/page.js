"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldAlert,
  AlertTriangle,
  Camera,
  Navigation,
  MapPin,
  CloudRain,
  Activity,
  ArrowRight,
  Droplets,
  Car,
  Bell,
  CheckCircle2,
  RefreshCw,
  PhoneCall,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import CitizenLayout from "../../components/layouts/CitizenLayout";

const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[440px] rounded-2xl bg-slate-100 dark:bg-[#131B2A] flex items-center justify-center text-xs font-bold text-slate-400">
      Loading GIS Map Layer...
    </div>
  ),
});
import { getRiskZones, getReports, getBroadcastAlerts, getWeather } from "../../lib/api";

export default function AppDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState({ condition: "Showers", rainfall_intensity_mm: 18.5 });
  const [selectedZone, setSelectedZone] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [zData, rData, aData, wData] = await Promise.allSettled([
        getRiskZones(),
        getReports(),
        getBroadcastAlerts(),
        getWeather(),
      ]);

      if (zData.status === "fulfilled" && Array.isArray(zData.value)) {
        setZones(zData.value);
        if (!selectedZone && zData.value.length > 0) {
          const sorted = [...zData.value].sort(
            (a, b) => (b.latest_risk_score ?? b.risk_score ?? 0) - (a.latest_risk_score ?? a.risk_score ?? 0)
          );
          setSelectedZone(sorted[0]);
        }
      }
      if (rData.status === "fulfilled" && Array.isArray(rData.value)) setReports(rData.value);
      if (aData.status === "fulfilled" && Array.isArray(aData.value)) setAlerts(aData.value);
      if (wData.status === "fulfilled" && wData.value) setWeather(wData.value);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute live aggregates from real backend data
  const severeZonesCount = zones.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75)).length;
  const highZonesCount = zones.filter((z) => (z.risk_category === "High" || ((z.latest_risk_score ?? z.risk_score) >= 50 && (z.latest_risk_score ?? z.risk_score) < 75))).length;

  const highestRiskScore = zones.reduce((max, z) => Math.max(max, z.latest_risk_score ?? z.risk_score ?? 0), 0);
  const averageRiskScore = zones.length ? Math.round(zones.reduce((sum, z) => sum + (z.latest_risk_score ?? z.risk_score ?? 0), 0) / zones.length) : 24;

  const overallThreat = highestRiskScore >= 75 ? "Severe Flood Risk" : highestRiskScore >= 50 ? "High Risk Alert" : highestRiskScore >= 25 ? "Moderate Waterlogging" : "Low Risk (Normal)";
  const threatBg = highestRiskScore >= 75 ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" : highestRiskScore >= 50 ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30" : highestRiskScore >= 25 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {/* Top Header & Sync Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Citywide Command Overview
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 text-[10px] font-bold">
                10 Administrative Wards
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              Nagpur Flood & Road Safety Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs shadow-sm active:scale-95 transition flex items-center gap-1.5"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600 dark:text-teal-400" : ""}`} />
              <span>Sync Feeds</span>
            </button>

            <Link
              href="/report"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 flex items-center gap-1.5 transition active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Report Hazard</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Live Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Rainfall */}
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-teal-500/40 transition">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">IMD Rainfall</span>
              <CloudRain className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              {weather.rainfall_intensity_mm ?? 0}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">mm/h</span>
            </div>
            <div className="text-xs text-teal-700 dark:text-teal-400 font-semibold truncate">
              {weather.condition || "Live Doppler Radar"}
            </div>
          </div>

          {/* Card 2: Flooded Wards */}
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-teal-500/40 transition">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Flooded Wards</span>
              <Droplets className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              {severeZonesCount + highZonesCount}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ {zones.length || 10} Total</span>
            </div>
            <div className="text-xs text-red-600 dark:text-red-400 font-semibold">
              {severeZonesCount} Severe, {highZonesCount} High Risk
            </div>
          </div>

          {/* Card 3: Safe Roads */}
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-teal-500/40 transition">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Safe Roads</span>
              <Car className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              {zones.length > 0 ? Math.round((1 - (severeZonesCount / zones.length)) * 100) : 92}%
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Clear</span>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              OSMnx A* Bypasses Active
            </div>
          </div>

          {/* Card 4: Citizen Reports */}
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-teal-500/40 transition">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Citizen Reports</span>
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              {reports.length}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Submitted</span>
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              {reports.filter((r) => r.verification_status === "Pending").length} Awaiting Moderation
            </div>
          </div>
        </div>

        {/* Main Dashboard Layout (Side-by-Side on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live GIS Map */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Live Nagpur Catchment Map
                  </span>
                </div>
                <Link
                  href="/map"
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <span>Full Map Screen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="h-[440px] sm:h-[500px] w-full rounded-2xl overflow-hidden relative border border-slate-200 dark:border-[#1E293B]">
                <MapComponent
                  zones={zones}
                  reports={reports}
                  onZoneClick={(zone) => setSelectedZone(zone)}
                />
              </div>
            </div>

            {/* Quick Action Navigation Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/route"
                className="p-4 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] hover:border-teal-500/40 shadow-sm flex items-center gap-3 transition active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                    Safe Route Finder
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Bypass flooded wards</div>
                </div>
              </Link>

              <Link
                href="/report"
                className="p-4 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] hover:border-teal-500/40 shadow-sm flex items-center gap-3 transition active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                    Report Incident
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Vision AI auto-verification</div>
                </div>
              </Link>

              <Link
                href="/alerts"
                className="p-4 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] hover:border-teal-500/40 shadow-sm flex items-center gap-3 transition active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                    Emergency Broadcasts
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Official NMC alerts</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column: Ward Inspector & Emergency Feed */}
          <div className="lg:col-span-4 space-y-4">
            {/* Citywide Crisis Gauge Card */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Crisis Index
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Nagpur Threat Level
                  </h3>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${threatBg}`}>
                  {overallThreat}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                    {highestRiskScore.toFixed(0)}
                    <span className="text-xs font-normal text-slate-500">/ 100 max</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">City Avg</span>
                    <span className="font-black text-sm text-teal-600 dark:text-teal-400">{averageRiskScore}/100</span>
                  </div>
                </div>

                <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-[#1E293B] overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(12, highestRiskScore))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Selected Ward Inspector */}
            {selectedZone ? (
              <div className="bg-white dark:bg-[#131B2A] border border-teal-500/30 rounded-3xl p-5 shadow-sm space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-2.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="font-black text-sm text-slate-900 dark:text-white">{selectedZone.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300">
                    Ward #{selectedZone.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Rainfall</div>
                    <div className="font-black text-slate-900 dark:text-white mt-0.5">
                      {(selectedZone.rainfall_mm ?? 0).toFixed(1)} mm/h
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Drainage Cap</div>
                    <div className="font-black text-slate-900 dark:text-white mt-0.5">
                      {Math.round((selectedZone.drainage_capacity || 0.5) * 100)}%
                    </div>
                  </div>
                </div>

                <Link
                  href={`/route?destination=${encodeURIComponent(selectedZone.name)}`}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 transition active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Route to {selectedZone.name}</span>
                </Link>
              </div>
            ) : null}

            {/* Live Alerts Teaser Feed */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-900 dark:text-white">
                  Active Civic Alerts
                </span>
                <Link href="/alerts" className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline">
                  View All ({alerts.length})
                </Link>
              </div>

              <div className="space-y-2">
                {alerts.slice(0, 2).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-slate-900 dark:text-white truncate max-w-[140px]">
                        {alert.zone_name || "Nagpur Zone"}
                      </span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-red-500/10 text-red-600 dark:text-red-400">
                        {alert.severity || "Severe"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      {alert.message}
                    </p>
                  </div>
                ))}

                {alerts.length === 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>No critical flood alerts active in city.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
