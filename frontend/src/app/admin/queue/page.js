"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
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
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Priority Queue
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
              Ranked by Multi-Variable Crisis Formula: <code className="text-[#0F766E] dark:text-[#14B8A6] font-mono">0.45·Rain + 0.35·(1-Elev) + 0.20·(1-Drain) + Photo Boost</code>
            </p>
          </div>

          <button
            onClick={fetchQueue}
            disabled={loading}
            className="h-10 px-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium text-xs shadow-sm hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0F766E] dark:text-[#14B8A6]" : ""}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["All", "Severe", "High", "Medium", "Low"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterCat === cat
                  ? "bg-[#0F766E] text-white dark:bg-[#14B8A6] dark:text-[#042F2E]"
                  : "bg-[#FFFFFF] dark:bg-[#111C2E] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#243244] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Priority Table Container */}
        <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#243244] bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] font-semibold uppercase text-[11px] tracking-wider">
                  <th className="p-3.5">Rank & Ward</th>
                  <th className="p-3.5">Risk Index</th>
                  <th className="p-3.5">Rainfall (mm/h)</th>
                  <th className="p-3.5">Drainage Capacity</th>
                  <th className="p-3.5">Pending Reports</th>
                  <th className="p-3.5">Dispatch Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243244]">
                {filteredQueue.map((item, idx) => (
                  <tr key={item.zone_id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 transition">
                    <td className="p-3.5 font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#F1F5F9] dark:bg-[#0B0F17] text-[#0F766E] dark:text-[#14B8A6] font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span>{item.zone_name}</span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          item.risk_category === "Severe"
                            ? "bg-[#FEE2E2] text-[#991B1B]"
                            : item.risk_category === "High"
                            ? "bg-[#FFEDD5] text-[#9A3412]"
                            : item.risk_category === "Medium"
                            ? "bg-[#FEF9C3] text-[#854D0E]"
                            : "bg-[#DCFCE7] text-[#166534]"
                        }`}
                      >
                        {item.risk_score?.toFixed(1)} ({item.risk_category})
                      </span>
                    </td>

                    <td className="p-3.5 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {item.rainfall_mm?.toFixed(1)} mm/h
                    </td>

                    <td className="p-3.5 text-[#475569] dark:text-[#CBD5E1]">
                      {Math.round((item.drainage_capacity || 0.5) * 100)}%
                    </td>

                    <td className="p-3.5 text-[#475569] dark:text-[#CBD5E1]">
                      {item.pending_reports_count || 0} Reports
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          item.dispatch_status === "Dispatched"
                            ? "bg-[#FEF3C7] text-[#854D0E]"
                            : item.dispatch_status === "Resolved"
                            ? "bg-[#DCFCE7] text-[#166534]"
                            : "bg-[#F1F5F9] dark:bg-[#0B0F17] text-[#64748B] dark:text-[#94A3B8]"
                        }`}
                      >
                        {item.dispatch_status || "Unassigned"}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.dispatch_status !== "Dispatched" && (
                          <button
                            onClick={() => handleStatusChange(item.zone_id, "Dispatched")}
                            disabled={updatingId === item.zone_id}
                            className="px-2.5 py-1 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-xs transition cursor-pointer"
                          >
                            Dispatch QRT
                          </button>
                        )}
                        {item.dispatch_status !== "Resolved" && (
                          <button
                            onClick={() => handleStatusChange(item.zone_id, "Resolved")}
                            disabled={updatingId === item.zone_id}
                            className="px-2.5 py-1 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-xs transition cursor-pointer"
                          >
                            Resolve
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
