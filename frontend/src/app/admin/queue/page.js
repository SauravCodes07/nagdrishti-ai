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
              Ranked by Multi-Variable Crisis Formula: <code className="text-teal-600 dark:text-teal-400 font-mono">0.45·Rain + 0.35·(1-Elev) + 0.20·(1-Drain) + Photo Boost</code>
            </p>
          </div>

          <button
            onClick={fetchQueue}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs shadow-sm hover:bg-slate-100 dark:hover:bg-[#1E293B] active:scale-95 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600 dark:text-teal-400" : ""}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["All", "Severe", "High", "Medium", "Low"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterCat === cat
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
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
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#1E293B] text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider text-[10px]">
                  <th className="p-4">Rank & Ward</th>
                  <th className="p-4">Severity Score</th>
                  <th className="p-4">Rainfall (mm/h)</th>
                  <th className="p-4">Drainage Cap</th>
                  <th className="p-4">Reports</th>
                  <th className="p-4">Dispatch Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1E293B] font-medium">
                {filteredQueue.map((item, idx) => {
                  const isSevere = item.risk_category === "Severe";
                  const isHigh = item.risk_category === "High";

                  return (
                    <tr
                      key={item.zone_id}
                      className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition"
                    >
                      {/* Rank & Ward */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-[#0B0F17] flex items-center justify-center font-black text-xs text-teal-700 dark:text-teal-400">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-black text-sm text-slate-900 dark:text-white">
                              {item.zone_name}
                            </div>
                            <div className="text-[10px] text-slate-400">Ward ID #{item.zone_id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Score Badge */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              isSevere
                                ? "bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/30"
                                : isHigh
                                ? "bg-orange-500/10 text-orange-600 dark:text-orange-300 border border-orange-500/30"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {item.risk_category} ({item.risk_score.toFixed(1)})
                          </span>

                          {item.photo_confirmed && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
                              📸 Photo Boost
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rainfall */}
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {item.rainfall_mm.toFixed(1)} mm/h
                      </td>

                      {/* Drainage */}
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {Math.round(item.drainage_capacity * 100)}%
                      </td>

                      {/* Reports */}
                      <td className="p-4">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.pending_reports_count} Pending
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {item.verified_reports_count} Verified
                        </span>
                      </td>

                      {/* Dispatch Action Dropdown */}
                      <td className="p-4">
                        <select
                          value={item.dispatch_status || "Unassigned"}
                          disabled={updatingId === item.zone_id}
                          onChange={(e) => handleStatusChange(item.zone_id, e.target.value)}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                        >
                          <option value="Unassigned">⚪ Unassigned</option>
                          <option value="Dispatched">🚒 Dispatched (QRT/Pump)</option>
                          <option value="Resolved">🟢 Resolved</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
