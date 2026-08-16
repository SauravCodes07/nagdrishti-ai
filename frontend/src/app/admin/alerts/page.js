"use client";

import { useEffect, useState } from "react";
import {
  Radio,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
} from "lucide-react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { getAlertLogs } from "../../../lib/api";

export default function AdminAlertLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("All");

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

  const filteredLogs = logs.filter((log) => {
    const matchesChannel = channelFilter === "All" || log.channel === channelFilter;
    const matchesSearch =
      searchTerm === "" ||
      (log.zone_name && log.zone_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.recipient && log.recipient.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.message && log.message.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesChannel && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Alert Dispatch Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              Audit trail of automated Twilio SMS & WhatsApp emergency broadcast messages
            </p>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs shadow-sm hover:bg-slate-100 dark:hover:bg-[#1E293B] active:scale-95 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#EA580C] dark:text-[#FF8A00]" : ""}`} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* Search & Channel Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Ward name, recipient phone, or alert text..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF8A00] placeholder:text-slate-400 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 no-scrollbar">
            {["All", "SMS", "WhatsApp", "Push"].map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`px-4 py-3 rounded-2xl text-xs font-bold transition flex-1 sm:flex-initial whitespace-nowrap cursor-pointer ${
                  channelFilter === ch
                    ? "bg-[#EA580C] dark:bg-[#FF8A00] text-white dark:text-slate-950 shadow-md shadow-[#FF8A00]/20"
                    : "bg-white dark:bg-[#131B2A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#1E293B]"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0B0F17] text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Ward / Target</th>
                  <th className="p-4">Channel</th>
                  <th className="p-4">Broadcast Message</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40 transition">
                    <td className="p-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "Just now"}
                    </td>

                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {log.zone_name || "Nagpur Citywide"}
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFF7ED] dark:bg-[#FF8A00]/15 text-[#EA580C] dark:text-[#FF8A00] border border-[#FF8A00]/30 font-mono">
                        {log.channel || "SMS"}
                      </span>
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium max-w-md truncate">
                      {log.message}
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {log.status || "Delivered"}
                      </span>
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
