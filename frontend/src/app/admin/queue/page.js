"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { getPriorityQueue, updateDispatchStatus } from "../../../lib/api";
import {
  ListOrdered,
  Truck,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Clock,
  Filter,
  ArrowUpDown,
  Send,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const DISPATCH_OPTIONS = ["Unassigned", "Assigned", "En Route", "On Site", "Resolved"];

export default function AdminPriorityQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await getPriorityQueue();
      setQueue(res.priority_queue || []);
    } catch (err) {
      console.error("Priority queue error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (zoneId, newStatus) => {
    setUpdatingId(zoneId);
    try {
      await updateDispatchStatus(zoneId, newStatus);
      // Optimistically update
      setQueue((prev) =>
        prev.map((item) => (item.zone_id === zoneId ? { ...item, dispatch_status: newStatus } : item))
      );
    } catch (err) {
      console.error("Update dispatch status error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBatchDispatchCritical = async () => {
    const severeUnassigned = queue.filter(
      (z) => z.risk_category === "Severe" && z.dispatch_status === "Unassigned"
    );
    for (const z of severeUnassigned) {
      await handleStatusChange(z.zone_id, "Assigned");
    }
    loadQueue();
  };

  const filteredQueue = filterCategory === "All"
    ? queue
    : queue.filter((item) => item.risk_category === filterCategory);

  const severeCount = queue.filter((z) => z.risk_category === "Severe").length;
  const activeUnits = queue.filter((z) => z.dispatch_status && z.dispatch_status !== "Unassigned" && z.dispatch_status !== "Resolved").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header & Batch Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#111111] tracking-tight">
              Priority Dispatch Queue
            </h1>
            <p className="text-xs text-[#666666] font-medium mt-0.5">
              Ranked civic response queue ordered by multi-variable crisis algorithm (Rain + Elevation + Drainage)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadQueue}
              className="px-3 py-2 rounded-xl bg-white border border-[#E5E5E5] text-xs font-bold text-[#111111] hover:bg-neutral-50 shadow-2xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            {/* THE SINGLE PRIMARY ACTION CTA ON THIS SCREEN */}
            <button
              onClick={handleBatchDispatchCritical}
              className="px-4 py-2 rounded-xl bg-[#FF8A00] hover:bg-[#E67C00] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition active:scale-[0.99]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Auto-Dispatch Critical Units</span>
            </button>
          </div>
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E5] text-center shadow-xs">
            <div className="text-[10px] text-[#666666] font-bold uppercase">Total Wards</div>
            <div className="text-xl font-black text-[#111111] mt-0.5">{queue.length}</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-red-200 text-center shadow-xs bg-red-50/30">
            <div className="text-[10px] text-red-700 font-bold uppercase">Critical Priority</div>
            <div className="text-xl font-black text-red-700 mt-0.5">{severeCount}</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-blue-200 text-center shadow-xs bg-blue-50/30">
            <div className="text-[10px] text-blue-700 font-bold uppercase">Units Deployed</div>
            <div className="text-xl font-black text-blue-700 mt-0.5">{activeUnits}</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E5] text-center shadow-xs">
            <div className="text-[10px] text-[#666666] font-bold uppercase">Resolved Corridors</div>
            <div className="text-xl font-black text-[#22A447] mt-0.5">
              {queue.filter((z) => z.dispatch_status === "Resolved").length}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          {["All", "Severe", "High", "Medium", "Low"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
                filterCategory === cat
                  ? "bg-[#111111] text-white"
                  : "bg-white text-[#666666] border border-[#E5E5E5] hover:bg-neutral-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Priority Table Card */}
        <div className="bg-white rounded-3xl border border-[#E5E5E5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F7] text-[#666666] uppercase text-[10px] font-bold border-b border-[#E5E5E5]">
                <tr>
                  <th className="px-5 py-3.5">Rank & Ward</th>
                  <th className="px-4 py-3.5">Crisis Risk</th>
                  <th className="px-4 py-3.5">Rainfall</th>
                  <th className="px-4 py-3.5">Drainage</th>
                  <th className="px-4 py-3.5">Elevation</th>
                  <th className="px-4 py-3.5">Citizen Reports</th>
                  <th className="px-5 py-3.5 text-right">Dispatch Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredQueue.map((item, idx) => (
                  <tr key={item.zone_id} className="hover:bg-neutral-50/60 transition">
                    
                    {/* Rank & Ward Name */}
                    <td className="px-5 py-3.5 font-bold text-[#111111]">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-mono text-xs font-black shrink-0">
                          #{item.rank || idx + 1}
                        </span>
                        <div>
                          <div className="font-extrabold text-sm">{item.zone_name}</div>
                          <div className="text-[10px] text-[#666666] font-medium">Zone ID #{item.zone_id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            item.risk_category === "Severe"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : item.risk_category === "High"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {item.risk_score?.toFixed(1)} • {item.risk_category}
                        </span>
                      </div>
                    </td>

                    {/* Rainfall */}
                    <td className="px-4 py-3.5 font-bold text-[#111111]">
                      {item.rainfall_mm?.toFixed(1)} mm/h
                    </td>

                    {/* Drainage */}
                    <td className="px-4 py-3.5 text-[#666666] font-medium">
                      {(item.drainage_capacity * 100).toFixed(0)}%
                    </td>

                    {/* Elevation */}
                    <td className="px-4 py-3.5 text-[#666666] font-medium">
                      {item.elevation_factor?.toFixed(2)}
                    </td>

                    {/* Citizen Reports */}
                    <td className="px-4 py-3.5 font-bold text-[#111111]">
                      {item.active_reports_count || 0} active
                    </td>

                    {/* Dispatch Dropdown */}
                    <td className="px-5 py-3.5 text-right">
                      <select
                        value={item.dispatch_status || "Unassigned"}
                        disabled={updatingId === item.zone_id}
                        onChange={(e) => handleStatusChange(item.zone_id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition focus:outline-hidden ${
                          item.dispatch_status === "On Site"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : item.dispatch_status === "En Route"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : item.dispatch_status === "Assigned"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : item.dispatch_status === "Resolved"
                            ? "bg-neutral-100 text-neutral-600 border-neutral-200"
                            : "bg-neutral-900 text-white border-neutral-800"
                        }`}
                      >
                        {DISPATCH_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
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
