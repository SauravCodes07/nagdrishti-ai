"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import AdminLayout from "../../components/layouts/AdminLayout";
import {
  getRiskZones,
  getReports,
  getPriorityQueue,
  getAlertLogs,
  getWeather,
  updateDispatchStatus,
} from "../../lib/api";
import {
  ShieldAlert,
  FileText,
  Truck,
  CloudRain,
  RefreshCw,
  Play,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  MapPin,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] bg-neutral-100 rounded-2xl flex flex-col items-center justify-center text-neutral-500 text-xs">
      <div className="w-8 h-8 border-3 border-[#FFC107] border-t-transparent rounded-full animate-spin mb-2"></div>
      <span className="font-bold text-[#111111]">Loading Command GIS Map...</span>
    </div>
  ),
});

export default function AdminDashboardPage() {
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);

  const loadData = async () => {
    try {
      const [z, r, q, a, w] = await Promise.all([
        getRiskZones().catch(() => []),
        getReports().catch(() => []),
        getPriorityQueue().catch(() => ({ priority_queue: [] })),
        getAlertLogs().catch(() => []),
        getWeather().catch(() => null),
      ]);
      setZones(Array.isArray(z) ? z : []);
      setReports(Array.isArray(r) ? r : []);
      setPriorityQueue(q.priority_queue || []);
      setAlerts(Array.isArray(a) ? a : []);
      setWeather(w);
    } catch (err) {
      console.error("Admin dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickDispatch = async (zoneId, currentStatus) => {
    const nextState =
      currentStatus === "Unassigned"
        ? "Assigned"
        : currentStatus === "Assigned"
        ? "En Route"
        : currentStatus === "En Route"
        ? "On Site"
        : "Resolved";

    try {
      await updateDispatchStatus(zoneId, nextState);
      loadData();
    } catch (e) {
      console.error("Quick dispatch error:", e);
    }
  };

  const severeZones = zones.filter((z) => (z.latest_risk_score ?? z.risk_score ?? 0) >= 60);
  const activeDispatches = zones.filter(
    (z) => z.dispatch_status && z.dispatch_status !== "Unassigned" && z.dispatch_status !== "Resolved"
  );
  const pendingReports = reports.filter((r) => r.verification_status === "pending");

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Dashboard Title & Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#111111] tracking-tight">
              Disaster Response Command Center
            </h1>
            <p className="text-xs text-[#666666] font-medium mt-0.5">
              Live monitoring of 10 administrative zones & civic flood mitigation units across Nagpur
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="px-3 py-2 rounded-xl bg-white border border-[#E5E5E5] text-xs font-bold text-[#111111] hover:bg-neutral-50 shadow-2xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            {/* THE SINGLE PRIMARY ACTION CTA ON THIS SCREEN */}
            <Link
              href="/admin/simulate"
              className="px-4 py-2 rounded-xl bg-[#FF8A00] hover:bg-[#E67C00] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Rainfall Simulation</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Red Wards */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#666666] uppercase">Critical Wards</span>
              <div className="w-7 h-7 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#111111]">
              {severeZones.length} <span className="text-xs font-semibold text-[#666666]">/ {zones.length}</span>
            </div>
            <div className="text-[10px] text-[#666666] font-medium">
              {severeZones.length > 0
                ? `${severeZones.map((z) => z.name).join(", ")}`
                : "All wards in safe thresholds"}
            </div>
          </div>

          {/* KPI 2: Open Reports */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#666666] uppercase">Pending Reports</span>
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#111111]">
              {pendingReports.length} <span className="text-xs font-semibold text-[#666666]">open</span>
            </div>
            <Link href="/admin/reports" className="text-[10px] font-bold text-[#FF8A00] hover:underline flex items-center gap-0.5">
              <span>Moderate reports</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* KPI 3: Dispatches */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#666666] uppercase">Active Dispatches</span>
              <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#111111]">
              {activeDispatches.length} <span className="text-xs font-semibold text-[#666666]">deployed</span>
            </div>
            <Link href="/admin/queue" className="text-[10px] font-bold text-[#FF8A00] hover:underline flex items-center gap-0.5">
              <span>View Priority Queue</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* KPI 4: Live Rainfall */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#666666] uppercase">IMD Rainfall</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CloudRain className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#111111]">
              {weather?.nagpur_city_average_rain_mm?.toFixed(1) || "0.0"}{" "}
              <span className="text-xs font-semibold text-[#666666]">mm/h</span>
            </div>
            <div className="text-[10px] text-[#666666] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22A447]"></span>
              <span>Source: {weather?.source || "Open-Meteo IMD API"}</span>
            </div>
          </div>

        </div>

        {/* Main Side-by-Side: Map + Live Queue Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Live Leaflet GIS Map */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-4 border border-[#E5E5E5] shadow-xs space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22A447] animate-ping"></span>
                <h3 className="font-extrabold text-sm text-[#111111]">
                  Live Nagpur Flood Risk GIS Topology
                </h3>
              </div>
              <span className="text-[11px] text-[#666666] font-medium">
                Tap ward polygon to inspect
              </span>
            </div>

            <div className="flex-1 min-h-[460px] rounded-2xl overflow-hidden border border-[#E5E5E5]">
              <MapComponent
                zones={zones}
                reports={reports}
                selectedZone={selectedZone}
                onZoneClick={(z) => setSelectedZone(z)}
              />
            </div>
          </div>

          {/* Right 1 Col: Top Priority Wards & Quick Dispatch */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E5E5] shadow-xs space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#111111]">
                Top Priority Wards
              </h3>
              <Link href="/admin/queue" className="text-xs font-bold text-[#FF8A00] hover:underline">
                All Wards ({zones.length})
              </Link>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1">
              {priorityQueue.slice(0, 5).map((item, idx) => (
                <div
                  key={item.zone_id}
                  className="p-3.5 rounded-2xl bg-[#F7F7F7] border border-[#E5E5E5] space-y-2 hover:border-[#111111] transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-neutral-900 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                        #{idx + 1}
                      </span>
                      <span className="font-black text-xs text-[#111111]">{item.zone_name}</span>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.risk_category === "Severe"
                          ? "bg-red-100 text-red-700"
                          : item.risk_category === "High"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      Score {item.risk_score?.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#666666]">
                    <span>Rain: {item.rainfall_mm?.toFixed(1)} mm/h</span>
                    <span>Reports: {item.active_reports_count || 0}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold uppercase text-neutral-500">
                      Status: <span className="text-[#111111]">{item.dispatch_status}</span>
                    </span>
                    <button
                      onClick={() => handleQuickDispatch(item.zone_id, item.dispatch_status)}
                      className="px-2.5 py-1 rounded-lg bg-[#111111] hover:bg-neutral-800 text-white text-[10px] font-bold transition"
                    >
                      Advance Unit &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
