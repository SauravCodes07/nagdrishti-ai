"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Truck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { getPriorityQueue, updateDispatchStatus } from "../../../lib/api";
import { RiskPulse, HoverLiftCard } from "../../../components/motion";

const DEFAULT_PRIORITY_QUEUE = [
  { zone_id: 2, zone_name: "Sitabuldi Interchange", risk_category: "Severe", risk_score: 88.4, rainfall_mm: 36.5, drainage_capacity: 0.35, pending_reports_count: 5, dispatch_status: "Dispatched" },
  { zone_id: 6, zone_name: "Lakadganj Industrial", risk_category: "Severe", risk_score: 79.2, rainfall_mm: 31.0, drainage_capacity: 0.40, pending_reports_count: 4, dispatch_status: "Dispatched" },
  { zone_id: 3, zone_name: "Gandhibagh Basin", risk_category: "High", risk_score: 68.0, rainfall_mm: 24.0, drainage_capacity: 0.45, pending_reports_count: 3, dispatch_status: "Dispatched" },
  { zone_id: 5, zone_name: "Nehru Nagar Arterial", risk_category: "High", risk_score: 62.5, rainfall_mm: 22.5, drainage_capacity: 0.50, pending_reports_count: 2, dispatch_status: "Unassigned" },
  { zone_id: 9, zone_name: "Satranjipura Corridor", risk_category: "Medium", risk_score: 45.0, rainfall_mm: 16.5, drainage_capacity: 0.60, pending_reports_count: 1, dispatch_status: "Unassigned" },
];

export default function AdminPriorityQueuePage() {
  const [queue, setQueue] = useState(DEFAULT_PRIORITY_QUEUE);
  const [loading, setLoading] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await getPriorityQueue();
      if (data?.priority_queue && Array.isArray(data.priority_queue)) {
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

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={fetchQueue}
            disabled={loading}
            className="h-10 px-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium text-xs shadow-sm hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0F766E] dark:text-[#14B8A6]" : ""}`} />
            <span>Refresh Queue</span>
          </motion.button>
        </div>

        {/* Filter Bar with layoutId Sliding Indicator */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["All", "Severe", "High", "Medium", "Low"].map((cat) => {
            const isSelected = filterCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`relative h-8 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? "text-white dark:text-[#042F2E]"
                    : "text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="active-queue-filter"
                    className="absolute inset-0 bg-[#0F766E] dark:bg-[#14B8A6] rounded-lg -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {!isSelected && (
                  <span className="absolute inset-0 bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-lg -z-20" />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Priority Table Container with FLIP Layout Animations */}
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
                <AnimatePresence mode="popLayout">
                  {filteredQueue.map((item, idx) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      key={item.zone_id}
                      className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 transition-colors"
                    >
                      <td className="p-3.5 font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#F1F5F9] dark:bg-[#0B0F17] text-[#0F766E] dark:text-[#14B8A6] font-bold text-xs flex items-center justify-center font-mono">
                          #{idx + 1}
                        </span>
                        <span>{item.zone_name}</span>
                      </td>

                      <td className="p-3.5">
                        <RiskPulse category={item.risk_category}>
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                              item.risk_category === "Severe"
                                ? "bg-[#FEE2E2] text-[#991B1B] dark:bg-red-500/20 dark:text-[#F87171]"
                                : item.risk_category === "High"
                                ? "bg-[#FFEDD5] text-[#9A3412] dark:bg-orange-500/20 dark:text-[#FB923C]"
                                : item.risk_category === "Medium"
                                ? "bg-[#FEF9C3] text-[#854D0E] dark:bg-amber-500/20 dark:text-[#FDE047]"
                                : "bg-[#DCFCE7] text-[#166534] dark:bg-emerald-500/20 dark:text-[#4ADE80]"
                            }`}
                          >
                            {item.risk_score?.toFixed(1)} ({item.risk_category})
                          </span>
                        </RiskPulse>
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
                              ? "bg-[#FEF3C7] text-[#854D0E] dark:bg-amber-500/20 dark:text-[#FDE68A]"
                              : item.dispatch_status === "Resolved"
                              ? "bg-[#DCFCE7] text-[#166534] dark:bg-emerald-500/20 dark:text-[#4ADE80]"
                              : "bg-[#F1F5F9] dark:bg-[#0B0F17] text-[#64748B] dark:text-[#94A3B8]"
                          }`}
                        >
                          {item.dispatch_status || "Unassigned"}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.dispatch_status !== "Dispatched" && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleStatusChange(item.zone_id, "Dispatched")}
                              disabled={updatingId === item.zone_id}
                              className="px-2.5 py-1 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-xs transition cursor-pointer shadow-sm"
                            >
                              Dispatch QRT
                            </motion.button>
                          )}
                          {item.dispatch_status !== "Resolved" && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleStatusChange(item.zone_id, "Resolved")}
                              disabled={updatingId === item.zone_id}
                              className="px-2.5 py-1 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-xs transition cursor-pointer shadow-sm"
                            >
                              Resolve
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
