"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  ChevronRight,
  Sliders,
} from "lucide-react";
import dynamic from "next/dynamic";
import AdminLayout from "../../components/layouts/AdminLayout";

const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] rounded-2xl bg-[#F1F5F9] dark:bg-[#162235] flex items-center justify-center text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
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
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6]">
                Command Desk
              </span>
              <span className="px-2 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] dark:bg-red-500/20 dark:text-[#F87171] border border-red-200 dark:border-red-500/30 text-[10px] font-semibold">
                {severeCount} Severe Inundations Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight mt-1">
              City Risk Overview
            </h1>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={loadData}
              disabled={loading}
              className="h-10 px-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0F766E] dark:text-[#14B8A6]" : ""}`} />
              <span>Sync Network</span>
            </button>

            <Link
              href="/admin/simulate"
              className="h-10 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulate Scenario</span>
            </Link>
          </div>
        </div>

        {/* 4 Top KPI Command Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-1">
            <span className="text-xs uppercase font-medium text-[#64748B] dark:text-[#94A3B8]">Critical Priority Basins</span>
            <div className="text-3xl sm:text-4xl font-bold text-[#DC2626] dark:text-[#F87171] mt-1">
              {severeCount}
            </div>
            <p className="text-xs text-[#DC2626] dark:text-[#F87171] font-medium">Immediate pump dispatch required</p>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-1">
            <span className="text-xs uppercase font-medium text-[#64748B] dark:text-[#94A3B8]">Pending Citizen Reports</span>
            <div className="text-3xl sm:text-4xl font-bold text-[#D97706] dark:text-[#FDE047] mt-1">
              {pendingReports}
            </div>
            <p className="text-xs text-[#D97706] dark:text-[#FDE047] font-medium">Awaiting officer moderation</p>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-1">
            <span className="text-xs uppercase font-medium text-[#64748B] dark:text-[#94A3B8]">Active Dispatches</span>
            <div className="text-3xl sm:text-4xl font-bold text-[#0F766E] dark:text-[#14B8A6] mt-1">
              {dispatchedUnits}
            </div>
            <p className="text-xs text-[#0F766E] dark:text-[#14B8A6] font-medium">Dewatering units in field</p>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-1">
            <span className="text-xs uppercase font-medium text-[#64748B] dark:text-[#94A3B8]">IMD Radar Live</span>
            <div className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1">
              {weather.rainfall_intensity_mm ?? 18.5} <span className="text-xs font-normal text-[#64748B]">mm/h</span>
            </div>
            <p className="text-xs text-[#475569] dark:text-[#CBD5E1] font-medium">{weather.condition || "Live Radar Stream"}</p>
          </div>
        </div>

        {/* 2-Column Responsive Officer Command Suite */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Priority Dispatch Queue Overview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#243244] pb-3">
                <div>
                  <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    Priority Queue
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Calculated by multi-variable flood formula
                  </p>
                </div>
                <Link
                  href="/admin/queue"
                  className="text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline flex items-center gap-1"
                >
                  <span>Full Queue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-[#E2E8F0] dark:divide-[#243244]">
                {queue.slice(0, 5).map((item, idx) => (
                  <div key={item.zone_id || idx} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-[#F1F5F9] dark:bg-[#0B0F17] text-[#0F766E] dark:text-[#14B8A6] font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                          <span>{item.zone_name}</span>
                          <span
                            className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                              item.risk_category === "Severe"
                                ? "bg-[#FEE2E2] text-[#991B1B]"
                                : item.risk_category === "High"
                                ? "bg-[#FFEDD5] text-[#9A3412]"
                                : "bg-[#DCFCE7] text-[#166534]"
                            }`}
                          >
                            {item.risk_score?.toFixed(1) || 10}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          Rain: {item.rainfall_mm?.toFixed(1) || 0} mm/h | Status: {item.dispatch_status || "Unassigned"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.dispatch_status !== "Dispatched" && (
                        <button
                          onClick={() => handleQuickDispatch(item.zone_id)}
                          className="px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-xs transition cursor-pointer"
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
            <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                  PostGIS Topology
                </span>
                <span className="text-[11px] font-medium text-[#0F766E] dark:text-[#14B8A6]">
                  10 Zones Connected
                </span>
              </div>

              <div className="h-[360px] w-full rounded-xl overflow-hidden relative border border-[#E2E8F0] dark:border-[#243244]">
                <MapComponent zones={zones} reports={reports} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
