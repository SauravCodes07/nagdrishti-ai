"use client";

import { useEffect, useState } from "react";
import {
  AlertOctagon,
  CheckCircle2,
  Truck,
  RefreshCw,
  Droplets,
  Filter,
  ChevronDown,
} from "lucide-react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { getPriorityQueue, updateDispatchStatus } from "../../../lib/api";

export default function AdminPriorityQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await getPriorityQueue();
      if (data?.priority_queue) {
        setQueue(data.priority_queue);
      }
    } catch (err) {
      console.error("Queue fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleStatusChange = async (zoneId, newStatus) => {
    try {
      setUpdatingId(zoneId);
      await updateDispatchStatus(zoneId, newStatus);
      await fetchQueue();
    } catch (err) {
      alert("Failed to update dispatch status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredQueue = queue.filter((q) => {
    if (filterCat === "All") return true;
    return q.risk_category === filterCat;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Priority Dispatch Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              Ranked by Multi-Variable Crisis Formula: <code className="text-[#EA580C] dark:text-[#FF8A00] font-mono">0.45·Rain + 0.35·(1-Elev) + 0.20·(1-Drain) + Photo Boost</code>
            </p>
          </div>

          <button
            onClick={fetchQueue}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs shadow-sm hover:bg-slate-100 dark:hover:bg-[#1E293B] active:scale-95 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#EA580C] dark:text-[#FF8A00]" : ""}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["All", "Severe", "High", "Medium", "Low"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterCat === cat
                  ? "bg-[#EA580C] dark:bg-[#FF8A00] text-white dark:text-slate-950 shadow-md shadow-[#FF8A00]/20"
                  : "bg-white dark:bg-[#131B2A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#1E293B]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Priority Table Container */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0B0F17] text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-4">Rank & Ward</th>
                  <th className="p-4">Risk Index</th>
                  <th className="p-4">Rainfall (mm/h)</th>
                  <th className="p-4">Drainage Capacity</th>
                  <th className="p-4">Pending Reports</th>
                  <th className="p-4">Dispatch Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                {filteredQueue.map((item, idx) => (
                  <tr key={item.zone_id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-xl bg-slate-100 dark:bg-[#0B0F17] text-[#EA580C] dark:text-[#FF8A00] font-black text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span>{item.zone_name}</span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`font-black px-2.5 py-1 rounded text-[11px] ${
                          item.risk_category === "Severe"
                            ? "bg-red-500 text-white"
                            : item.risk_category === "High"
                            ? "bg-orange-500 text-white"
                            : item.risk_category === "Medium"
                            ? "bg-amber-500 text-white"
                            : "bg-emerald-500 text-white"
                        }`}
                      >
                        {item.risk_score?.toFixed(1)} ({item.risk_category})
                      </span>
                    </td>

                    <td className="p-4 font-black text-slate-900 dark:text-white">
                      {item.rainfall_mm?.toFixed(1)} mm/h
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">
                      {Math.round((item.drainage_capacity || 0.5) * 100)}%
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {item.pending_reports_count || 0} Reports
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          item.dispatch_status === "Dispatched"
                            ? "bg-[#FFF7ED] dark:bg-[#FF8A00]/20 text-[#EA580C] dark:text-[#FF8A00] border border-[#FF8A00]/30"
                            : item.dispatch_status === "Resolved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-[#0B0F17] text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {item.dispatch_status || "Unassigned"}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.dispatch_status !== "Dispatched" && (
                          <button
                            onClick={() => handleStatusChange(item.zone_id, "Dispatched")}
                            disabled={updatingId === item.zone_id}
                            className="px-3 py-1.5 rounded-xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-bold text-[11px] transition shadow-sm cursor-pointer"
                          >
                            Dispatch QRT
                          </button>
                        )}
                        {item.dispatch_status !== "Resolved" && (
                          <button
                            onClick={() => handleStatusChange(item.zone_id, "Resolved")}
                            disabled={updatingId === item.zone_id}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-sm cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
