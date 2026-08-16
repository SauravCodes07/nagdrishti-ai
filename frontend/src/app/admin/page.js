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
import AdminLayout from "../../components/layouts/AdminLayout";
import MapComponent from "../../components/MapComponent";
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
  const [weather, setWeather] = useState({ rainfall_intensity_mm: 18.5 });
  const [updatingZoneId, setUpdatingZoneId] = useState(null);

  const fetchDashboard = async () => {
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
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceDispatch = async (zoneId, currentStatus) => {
    try {
      setUpdatingZoneId(zoneId);
      const nextStatus =
        currentStatus === "Unassigned"
          ? "Dispatched"
          : currentStatus === "Dispatched"
          ? "Resolved"
          : "Unassigned";

      await updateDispatchStatus(zoneId, nextStatus);
      await fetchDashboard();
    } catch (err) {
      alert("Failed to update dispatch status: " + err.message);
    } finally {
      setUpdatingZoneId(null);
    }
  };

  const severeCount = queue.filter((q) => q.risk_category === "Severe").length;
  const highCount = queue.filter((q) => q.risk_category === "High").length;
  const pendingReportsCount = reports.filter((r) => r.verification_status === "Pending").length;
  const activeDispatchesCount = zones.filter((z) => z.dispatch_status === "Dispatched").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Command Center Dashboard
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Real-time situational awareness & multi-variable crisis prioritization for Nagpur
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#131B2A] border border-[#1E293B] text-slate-300 hover:text-white font-bold text-xs shadow-sm hover:bg-[#1E293B] active:scale-95 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-400" : ""}`} />
            <span>Sync Feeds</span>
          </button>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-teal-500/40 transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Critical Wards</span>
              <AlertOctagon className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {severeCount + highCount}
            </div>
            <div className="text-xs text-red-400 font-semibold">
              {severeCount} Severe, {highCount} High Risk
            </div>
          </div>

          <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-teal-500/40 transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Reports</span>
              <FileCheck2 className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {pendingReportsCount}
            </div>
            <div className="text-xs text-amber-400 font-semibold">
              Awaiting officer moderation
            </div>
          </div>

          <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-teal-500/40 transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Dispatches</span>
              <Truck className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {activeDispatchesCount}
            </div>
            <div className="text-xs text-teal-400 font-semibold">
              Pumps & QRT units deployed
            </div>
          </div>

          <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2 hover:border-teal-500/40 transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Peak Rainfall</span>
              <CloudRain className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {weather.rainfall_intensity_mm ?? 0} <span className="text-sm font-normal text-slate-400">mm/h</span>
            </div>
            <div className="text-xs text-teal-400 font-semibold">
              IMD Doppler radar telemetry
            </div>
          </div>
        </div>

        {/* Side-by-Side: Leaflet GIS Map & Priority Queue Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Column */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-teal-400">
                Citywide Flood Topology
              </h2>
              <Link
                href="/map"
                target="_blank"
                className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>Full Map Screen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-[460px] w-full rounded-3xl overflow-hidden shadow-xl border border-[#1E293B] relative bg-[#131B2A]">
              <MapComponent zones={zones} reports={reports} />
            </div>
          </div>

          {/* Priority Queue Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-teal-400">
                Priority Dispatch Queue
              </h2>
              <Link
                href="/admin/queue"
                className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>Full Queue ({queue.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-4 shadow-sm space-y-2.5 max-h-[460px] overflow-y-auto">
              {queue.slice(0, 6).map((q, idx) => (
                <div
                  key={q.zone_id}
                  className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-between gap-3 hover:border-teal-500/30 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-[#1E293B] font-black text-xs flex items-center justify-center text-teal-400 shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white flex items-center gap-1.5 truncate">
                        <span>{q.zone_name}</span>
                        {q.photo_confirmed && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 shrink-0">
                            📸 Photo
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold truncate">
                        Score: {q.risk_score.toFixed(1)} • {q.rainfall_mm.toFixed(1)} mm/h • {q.dispatch_status}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdvanceDispatch(q.zone_id, q.dispatch_status)}
                    disabled={updatingZoneId === q.zone_id}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] shadow-sm transition flex items-center gap-1 shrink-0"
                  >
                    {updatingZoneId === q.zone_id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <span>Advance</span>
                    )}
                  </button>
                </div>
              ))}

              {queue.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No priority items queued. All drainage operating normally.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
