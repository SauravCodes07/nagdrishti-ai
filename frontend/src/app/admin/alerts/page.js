"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  Radio,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { getAlertLogs } from "../../../lib/api";
import { RiskPulse, HoverLiftCard } from "../../../components/motion";

export default function AdminAlertLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAlertLogs();
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (err) {
      console.error("Alert logs fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (l.zone_name || "").toLowerCase().includes(term) ||
      (l.message || "").toLowerCase().includes(term) ||
      (l.channel || "").toLowerCase().includes(term)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Emergency Broadcast Logs
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
              Auditable dispatch ledger of all automated SMS, WhatsApp, and siren emergency dispatches
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={fetchLogs}
            disabled={loading}
            className="h-10 px-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0F766E] dark:text-[#14B8A6]" : ""}`} />
            <span>Sync Logs</span>
          </motion.button>
        </div>

        {/* Search Filter */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ward name, dispatch message, or channel..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-normal focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6] transition-colors"
          />
        </div>

        {/* Logs Table Container */}
        <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#243244] bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] font-semibold uppercase text-[11px] tracking-wider">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Target Ward</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Broadcast Content</th>
                  <th className="p-3.5 text-right">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243244]">
                <AnimatePresence>
                  {filteredLogs.map((log) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={log.id}
                      className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 transition-colors"
                    >
                      <td className="p-3.5 font-mono text-[#64748B] dark:text-[#94A3B8] whitespace-nowrap">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : "Live"}
                      </td>

                      <td className="p-3.5 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        {log.zone_name || "Nagpur Citywide"}
                      </td>

                      <td className="p-3.5">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E] dark:bg-teal-500/20 dark:text-[#5EEAD4] border border-[#0F766E]/20">
                          {log.channel || "SMS Gateway"}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <RiskPulse category={log.severity}>
                          <span
                            className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                              log.severity === "Severe"
                                ? "bg-[#FEE2E2] text-[#991B1B] dark:bg-red-500/20 dark:text-[#F87171]"
                                : log.severity === "High"
                                ? "bg-[#FFEDD5] text-[#9A3412] dark:bg-orange-500/20 dark:text-[#FB923C]"
                                : "bg-[#FEF9C3] text-[#854D0E] dark:bg-amber-500/20 dark:text-[#FDE68A]"
                            }`}
                          >
                            {log.severity || "Severe"}
                          </span>
                        </RiskPulse>
                      </td>

                      <td className="p-3.5 text-[#334155] dark:text-[#CBD5E1] max-w-sm">
                        <p className="line-clamp-2 leading-relaxed">{log.message}</p>
                      </td>

                      <td className="p-3.5 text-right">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534] dark:bg-emerald-500/20 dark:text-[#4ADE80]">
                          {log.status || "Delivered"}
                        </span>
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
