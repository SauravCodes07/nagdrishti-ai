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
} from "lucide-react";
import { motion } from "framer-motion";
import CitizenLayout from "../components/layouts/CitizenLayout";
import { getRiskZones, getReports, getBroadcastAlerts, getWeather } from "../lib/api";

export default function CitizenHomePage() {
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState({ condition: "Showers", rainfall_intensity_mm: 18.5 });

  useEffect(() => {
    async function loadData() {
      try {
        const [zData, rData, aData, wData] = await Promise.allSettled([
          getRiskZones(),
          getReports(),
          getBroadcastAlerts(),
          getWeather(),
        ]);

        if (zData.status === "fulfilled" && Array.isArray(zData.value)) setZones(zData.value);
        if (rData.status === "fulfilled" && Array.isArray(rData.value)) setReports(rData.value);
        if (aData.status === "fulfilled" && Array.isArray(aData.value)) setAlerts(aData.value);
        if (wData.status === "fulfilled" && wData.value) setWeather(wData.value);
      } catch (err) {
        console.error("Home data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute live aggregates from real backend data
  const severeZonesCount = zones.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75)).length;
  const highZonesCount = zones.filter((z) => (z.risk_category === "High" || ((z.latest_risk_score ?? z.risk_score) >= 50 && (z.latest_risk_score ?? z.risk_score) < 75))).length;

  const highestRiskScore = zones.reduce((max, z) => Math.max(max, z.latest_risk_score ?? z.risk_score ?? 0), 0);
  const averageRiskScore = zones.length ? Math.round(zones.reduce((sum, z) => sum + (z.latest_risk_score ?? z.risk_score ?? 0), 0) / zones.length) : 24;

  const overallThreat = highestRiskScore >= 75 ? "Severe" : highestRiskScore >= 50 ? "High" : highestRiskScore >= 25 ? "Moderate" : "Low Risk";
  const threatColor = highestRiskScore >= 75 ? "text-red-500" : highestRiskScore >= 50 ? "text-orange-500" : highestRiskScore >= 25 ? "text-amber-500" : "text-emerald-500";
  const threatBg = highestRiskScore >= 75 ? "bg-red-500/10 border-red-500/30" : highestRiskScore >= 50 ? "bg-orange-500/10 border-orange-500/30" : highestRiskScore >= 25 ? "bg-amber-500/10 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/30";

  return (
    <CitizenLayout>
      <div className="space-y-4">
        {/* Hero Banner with Logo & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 p-5 text-white shadow-xl border border-teal-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-950/80 p-1 flex items-center justify-center border border-teal-400/40 shadow-lg flex-shrink-0">
              <Image
                src="/brand/nagdrishti-logo.png"
                alt="NagDrishti AI"
                width={60}
                height={60}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  Nagpur Municipal AI
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Shield
                </span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-white mt-1">
                NagDrishti AI
              </h1>
              <p className="text-xs text-slate-300">
                Urban flood prevention & real-time safe routing.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Overall Risk Gauge Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Citywide Crisis Index
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Nagpur Risk Level
              </h2>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${threatBg} ${threatColor}`}>
              {overallThreat}
            </div>
          </div>

          {/* Gauge Meter Display */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
            <div className="space-y-1">
              <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1">
                {highestRiskScore.toFixed(0)}
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">/ 100 max</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {severeZonesCount > 0
                  ? `${severeZonesCount} ward(s) currently experiencing severe flooding.`
                  : "All drainage corridors operating normally."}
              </p>
            </div>

            {/* Visual Risk Bar */}
            <div className="w-28 space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300">
                <span>Avg</span>
                <span>{averageRiskScore}/100</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(10, highestRiskScore))}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Conditions 4-Grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-1"
          >
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="text-[11px] font-bold">Rainfall (IMD)</span>
              <CloudRain className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {weather.rainfall_intensity_mm ?? 0} <span className="text-xs font-normal text-slate-600 dark:text-slate-300">mm/h</span>
            </div>
            <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold truncate">
              {weather.condition || "Live Radar"}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-1"
          >
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="text-[11px] font-bold">Flooded Wards</span>
              <Droplets className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {severeZonesCount + highZonesCount} <span className="text-xs font-normal text-slate-600 dark:text-slate-300">/ {zones.length || 10}</span>
            </div>
            <div className="text-[10px] text-red-500 font-semibold">
              {severeZonesCount} Severe, {highZonesCount} High
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-1"
          >
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="text-[11px] font-bold">Safe Roads</span>
              <Car className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {zones.length > 0 ? Math.round((1 - (severeZonesCount / zones.length)) * 100) : 92}%
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              OSMnx A* Active
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-1"
          >
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="text-[11px] font-bold">Citizen Reports</span>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {reports.length}
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              {reports.filter((r) => r.verification_status === "Pending").length} Pending Review
            </div>
          </motion.div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 px-1">
            Quick Actions
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Primary Action Button: Report Waterlogging Hazard */}
            <Link
              href="/report"
              className="col-span-2 p-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/20 font-black text-sm flex items-center justify-between active:scale-[0.98] transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div>Report Waterlogging Hazard</div>
                  <div className="text-[11px] font-normal text-teal-100">Upload photo for instant Vision AI detection</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/route"
              className="p-3.5 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 shadow-sm font-bold text-xs flex items-center gap-2.5 transition active:scale-95"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-900 dark:text-white">Find Safe Route</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-300">Bypass flooded wards</div>
              </div>
            </Link>

            <Link
              href="/map"
              className="p-3.5 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 shadow-sm font-bold text-xs flex items-center gap-2.5 transition active:scale-95"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-900 dark:text-white">Live Ward Map</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-300">Explore risk zones</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Civic Broadcasts Teaser */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Live Emergency Alerts
            </span>
            <Link href="/alerts" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
              View All ({alerts.length})
            </Link>
          </div>

          <div className="space-y-2">
            {alerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {alert.zone_name || alert.title || "Civic Advisory"}
                    </span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 border border-red-500/20">
                      {alert.severity || "Severe"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>No active critical alerts. City drainage flowing normally.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
