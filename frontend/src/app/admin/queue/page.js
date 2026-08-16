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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Priority Dispatch Queue
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Ranked by Multi-Variable Crisis Formula: 0.45·Rain + 0.35·(1-Elev) + 0.20·(1-Drain) + Photo Boost
            </p>
          </div>

          <button
            onClick={fetchQueue}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-sm hover:bg-slate-50 active:scale-95 transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          {["All", "Severe", "High", "Medium", "Low"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filterCat === cat
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white dark:bg-[#131B2A] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Priority Table Container */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider text-[10px]">
                  <th className="p-4">Rank & Ward</th>
                  <th className="p-4">Severity Score</th>
                  <th className="p-4">Rainfall (mm/h)</th>
                  <th className="p-4">Drainage Cap</th>
                  <th className="p-4">Reports</th>
                  <th className="p-4">Dispatch Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredQueue.map((item, idx) => {
                  const isSevere = item.risk_category === "Severe";
                  const isHigh = item.risk_category === "High";

                  return (
                    <tr
                      key={item.zone_id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition"
                    >
                      {/* Rank & Ward */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-600 dark:text-slate-300">
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
                                ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                : isHigh
                                ? "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            }`}
                          >
                            {item.risk_category} ({item.risk_score.toFixed(1)})
                          </span>

                          {item.photo_confirmed && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-500">
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
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 cursor-pointer"
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
