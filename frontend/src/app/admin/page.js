"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  FileCheck2,
  Truck,
  CloudRain,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Layers,
  Activity,
} from "lucide-react";
import dynamic from "next/dynamic";
import AdminLayout from "../../components/layouts/AdminLayout";

const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[460px] rounded-2xl bg-slate-100 dark:bg-[#131B2A] flex items-center justify-center text-xs font-bold text-slate-400">
      Loading GIS Map Layer...
    </div>
  ),
});
import {
  getPriorityQueue,
  getRiskZones,
  getReports,
  getWeather,
  updateDispatchStatus,
} from "../../lib/api";

export default function AdminCommandCenterPage() {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [weather, setWeather] = useState({ condition: "Showers", rainfall_intensity_mm: 18.5 });

  const loadData = async () => {
    try {
      setLoading(true);
      const [qData, zData, rData, wData] = await Promise.allSettled([
        getPriorityQueue(),
        getRiskZones(),
        getReports(),
        getWeather(),
      ]);

      if (qData.status === "fulfilled" && qData.value?.priority_queue) {
        setQueue(qData.value.priority_queue);
      }
      if (zData.status === "fulfilled" && Array.isArray(zData.value)) {
        setZones(zData.value);
      }
      if (rData.status === "fulfilled" && Array.isArray(rData.value)) {
        setReports(rData.value);
      }
      if (wData.status === "fulfilled" && wData.value) {
        setWeather(wData.value);
      }
    } catch (err) {
      console.error("Admin dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickDispatch = async (zoneId) => {
    try {
      await updateDispatchStatus(zoneId, "Dispatched");
      await loadData();
    } catch (err) {
      alert("Failed to dispatch unit: " + err.message);
    }
  };

  const severeCount = queue.filter((z) => (z.risk_category === "Severe" || z.risk_score >= 75)).length;
  const pendingReports = reports.filter((r) => r.verification_status === "Pending").length;
  const dispatchedUnits = queue.filter((z) => z.dispatch_status === "Dispatched").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#EA580C] dark:text-[#FF8A00]">
                Emergency Management Desk
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-bold">
                {severeCount} Severe Inundations Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              Nagpur Emergency Dispatch HQ
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs shadow-sm active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#EA580C] dark:text-[#FF8A00]" : ""}`} />
              <span>Sync Network</span>
            </button>

            <Link
              href="/admin/simulate"
              className="px-4 py-2 rounded-xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-[#FF8A00]/25 flex items-center gap-1.5 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Scenario</span>
            </Link>
          </div>
        </div>

        {/* 4 Top KPI Command Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Critical Priority Basins</span>
            <div className="text-3xl font-black text-red-600 dark:text-red-400 mt-1">
              {severeCount}
            </div>
            <p className="text-xs text-red-500 font-semibold">Immediate pump dispatch required</p>
          </div>

          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pending Citizen Reports</span>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {pendingReports}
            </div>
            <p className="text-xs text-amber-500 font-semibold">Awaiting officer moderation</p>
          </div>

          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Active Dispatches</span>
            <div className="text-3xl font-black text-[#EA580C] dark:text-[#FF8A00] mt-1">
              {dispatchedUnits}
            </div>
            <p className="text-xs text-[#EA580C] dark:text-[#FF8A00] font-semibold">Dewatering units in field</p>
          </div>

          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">IMD Radar Live</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {weather.rainfall_intensity_mm ?? 18.5} <span className="text-xs font-normal text-slate-400">mm/h</span>
            </div>
            <p className="text-xs text-slate-500 font-semibold">{weather.condition || "Live Radar Stream"}</p>
          </div>
        </div>

        {/* 2-Column Responsive Officer Command Suite */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Priority Dispatch Queue Overview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Multi-Variable Dispatch Queue
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Calculated by: <code className="text-[#EA580C] dark:text-[#FF8A00] font-mono">0.45·Rain + 0.35·(1-Elev) + 0.20·(1-Drain) + Boost</code>
                  </p>
                </div>
                <Link
                  href="/admin/queue"
                  className="text-xs font-bold text-[#EA580C] dark:text-[#FF8A00] hover:underline flex items-center gap-1"
                >
                  <span>Full Queue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                {queue.slice(0, 5).map((item, idx) => (
                  <div key={item.zone_id || idx} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-xl bg-slate-100 dark:bg-[#0B0F17] text-slate-900 dark:text-white font-black text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{item.zone_name}</span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                              item.risk_category === "Severe"
                                ? "bg-red-500 text-white"
                                : item.risk_category === "High"
                                ? "bg-orange-500 text-white"
                                : "bg-emerald-500 text-white"
                            }`}
                          >
                            {item.risk_score?.toFixed(1) || 10}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Rain: {item.rainfall_mm?.toFixed(1) || 0} mm/h | Status: {item.dispatch_status || "Unassigned"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.dispatch_status !== "Dispatched" && (
                        <button
                          onClick={() => handleQuickDispatch(item.zone_id)}
                          className="px-3 py-1.5 rounded-xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-bold text-[11px] transition cursor-pointer"
                        >
                          Dispatch QRT
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live GIS Catchment Map */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  PostGIS Catchment Topology
                </span>
                <span className="text-[10px] font-bold text-[#EA580C] dark:text-[#FF8A00]">
                  10 Zones Connected
                </span>
              </div>

              <div className="h-[360px] w-full rounded-2xl overflow-hidden relative border border-slate-200 dark:border-[#1E293B]">
                <MapComponent zones={zones} reports={reports} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
