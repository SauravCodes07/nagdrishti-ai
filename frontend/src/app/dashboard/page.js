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
        const sorted = [...zData.value].sort(
          (a, b) => (b.latest_risk_score ?? b.risk_score ?? 0) - (a.latest_risk_score ?? a.risk_score ?? 0)
        );
        if (sorted.length > 0) setSelectedZone(sorted[0]);
      }
      if (rData.status === "fulfilled" && Array.isArray(rData.value)) {
        setReports(rData.value);
      }
      if (aData.status === "fulfilled" && Array.isArray(aData.value)) {
        setAlerts(aData.value);
      }
      if (wData.status === "fulfilled" && wData.value) {
        setWeather(wData.value);
      }
    } catch (err) {
      console.error("Dashboard feed error:", err);
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
              <span className="text-[11px] font-black uppercase tracking-wider text-[#EA580C] dark:text-[#FF8A00]">
                Citywide Command Overview
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFF7ED] dark:bg-[#FF8A00]/10 text-[#EA580C] dark:text-[#FF8A00] border border-[#FF8A00]/20 text-[10px] font-bold">
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
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs shadow-sm active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#EA580C] dark:text-[#FF8A00]" : ""}`} />
              <span>Sync Feeds</span>
            </button>

            <Link
              href="/report"
              className="px-4 py-2 rounded-xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-[#FF8A00]/25 flex items-center gap-1.5 transition active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Report Hazard</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Live Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Rainfall */}
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-[#FF8A00]/40 transition">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">IMD Rainfall</span>
              <CloudRain className="w-5 h-5 text-[#EA580C] dark:text-[#FF8A00]" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              {weather.rainfall_intensity_mm ?? 0}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">mm/h</span>
            </div>
            <div className="text-xs text-[#EA580C] dark:text-[#FF8A00] font-semibold truncate">
              {weather.condition || "Live Doppler Radar"}
            </div>
          </div>

          {/* Card 2: Flooded Wards */}
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-[#FF8A00]/40 transition">
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
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-[#FF8A00]/40 transition">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Safe Road Index</span>
              <Car className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              {zones.length > 0 ? Math.round((1 - (severeZonesCount / zones.length)) * 100) : 92}%
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              OSM Graph Accessible
            </div>
          </div>

          {/* Card 4: Reports */}
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-[#FF8A00]/40 transition">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Citizen Reports</span>
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              {reports.length}
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              Crowdsourced Ground Intel
            </div>
          </div>
        </div>

        {/* City Threat Index Alert Bar */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${threatBg}`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-slate-400">Nagpur Crisis Assessment:</span>
                <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${threatBg}`}>
                  {overallThreat}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Citywide Average Risk Score: <strong className="text-slate-900 dark:text-white">{averageRiskScore}/100</strong>. Highest Basin Threat: <strong className="text-red-500">{highestRiskScore}/100</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/route"
              className="px-4 py-2.5 rounded-xl bg-[#FFF7ED] dark:bg-[#FF8A00]/15 text-[#EA580C] dark:text-[#FF8A00] hover:bg-[#FFEDD5] dark:hover:bg-[#FF8A00]/25 border border-[#FF8A00]/30 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Find Safe Route</span>
            </Link>
            <Link
              href="/alerts"
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0B0F17] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Broadcast Alerts</span>
            </Link>
          </div>
        </div>

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Column: Live Catchment Map Screen */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Live GIS Catchment & Ward Polygons
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time risk categories across 10 municipal wards
                  </p>
                </div>

                <Link
                  href="/map"
                  className="text-xs font-bold text-[#EA580C] dark:text-[#FF8A00] hover:underline flex items-center gap-1"
                >
                  <span>Full Map View</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="h-[440px] w-full rounded-2xl overflow-hidden relative border border-slate-200 dark:border-[#1E293B]">
                <MapComponent
                  zones={zones}
                  reports={reports}
                  selectedZone={selectedZone}
                  onZoneClick={(z) => setSelectedZone(z)}
                />
              </div>

              {/* Severity Legend */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-[#1E293B]">
                <span className="font-bold">Risk Legend:</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Low (&lt;25)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Medium (25–49)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span>High (50–74)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                    <span className="font-bold text-red-600 dark:text-red-400">Severe (75+)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Ward Telemetry Inspector & Quick Actions */}
          <div className="lg:col-span-4 space-y-4">
            {/* Selected Ward Telemetry Card */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Ward Telemetry Inspector
                </span>
                {selectedZone && (
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      selectedZone.risk_category === "Severe"
                        ? "bg-red-500 text-white"
                        : selectedZone.risk_category === "High"
                        ? "bg-orange-500 text-white"
                        : selectedZone.risk_category === "Medium"
                        ? "bg-amber-500 text-white"
                        : "bg-emerald-500 text-white"
                    }`}
                  >
                    {selectedZone.risk_category || "Low"}
                  </span>
                )}
              </div>

              {selectedZone ? (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedZone.zone_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      NMC Zone ID: {selectedZone.id || selectedZone.zone_id || "WZ-01"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Risk Score</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                        {(selectedZone.latest_risk_score ?? selectedZone.risk_score ?? 15).toFixed(1)}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Rainfall</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                        {(selectedZone.rainfall_mm ?? selectedZone.rainfall_intensity_mm ?? 18).toFixed(1)}
                        <span className="text-[10px] font-normal text-slate-400"> mm/h</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1E293B]">
                      <span>Drainage Capacity:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {Math.round((selectedZone.drainage_capacity || 0.6) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1E293B]">
                      <span>Elevation Factor:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {selectedZone.elevation_m ? `${selectedZone.elevation_m}m` : "Low-lying basin"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Dispatch Status:</span>
                      <span className="font-bold text-[#EA580C] dark:text-[#FF8A00]">
                        {selectedZone.dispatch_status || "Standard Monitoring"}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/route?destination=${encodeURIComponent(selectedZone.zone_name)}`}
                    className="w-full py-3 rounded-2xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#FF8A00]/25 transition active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Route Safely to {selectedZone.zone_name}</span>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Click any ward polygon on the map to inspect live metrics.
                </div>
              )}
            </div>

            {/* Quick Action Shortcuts */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                Quick Shortcuts
              </span>

              <Link
                href="/route"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] hover:bg-[#FFF7ED] dark:hover:bg-[#FF8A00]/10 border border-slate-200 dark:border-[#1E293B] hover:border-[#FF8A00]/30 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] dark:bg-[#FF8A00]/10 text-[#EA580C] dark:text-[#FF8A00] flex items-center justify-center">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#EA580C] dark:group-hover:text-[#FF8A00]">
                      Safe Route Planner
                    </div>
                    <div className="text-[10px] text-slate-400">A* flood-avoidance routing</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                href="/report"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] hover:bg-[#FFF7ED] dark:hover:bg-[#FF8A00]/10 border border-slate-200 dark:border-[#1E293B] hover:border-[#FF8A00]/30 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] dark:bg-[#FF8A00]/10 text-[#EA580C] dark:text-[#FF8A00] flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#EA580C] dark:group-hover:text-[#FF8A00]">
                      Report Incident Photo
                    </div>
                    <div className="text-[10px] text-slate-400">Vision AI auto-verification</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                href="/alerts"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] hover:bg-[#FFF7ED] dark:hover:bg-[#FF8A00]/10 border border-slate-200 dark:border-[#1E293B] hover:border-[#FF8A00]/30 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] dark:bg-[#FF8A00]/10 text-[#EA580C] dark:text-[#FF8A00] flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#EA580C] dark:group-hover:text-[#FF8A00]">
                      Civic Emergency Advisories
                    </div>
                    <div className="text-[10px] text-slate-400">NMC official broadcasts</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
