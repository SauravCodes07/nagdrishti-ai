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
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Alert Dispatch Logs
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Audit trail of automated Twilio SMS & WhatsApp emergency broadcast messages
            </p>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#131B2A] border border-[#1E293B] text-slate-300 hover:text-white font-bold text-xs shadow-sm hover:bg-[#1E293B] active:scale-95 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-400" : ""}`} />
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
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#131B2A] border border-[#1E293B] text-xs font-semibold text-white focus:outline-none focus:border-teal-500 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 no-scrollbar">
            {["All", "SMS", "WhatsApp", "Push"].map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`px-4 py-3 rounded-2xl text-xs font-bold transition flex-1 sm:flex-initial whitespace-nowrap ${
                  channelFilter === ch
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                    : "bg-[#131B2A] text-slate-300 border border-[#1E293B] hover:bg-[#1E293B]"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0F172A] border-b border-[#1E293B] text-slate-400 uppercase font-black tracking-wider text-[10px]">
                  <th className="p-4">Dispatch ID & Ward</th>
                  <th className="p-4">Channel & Recipient</th>
                  <th className="p-4">Broadcast Message</th>
                  <th className="p-4">Delivery Status</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] font-medium">
                {filteredLogs.map((log) => {
                  const isDelivered = log.status === "sent" || log.status === "delivered";
                  const isLoggedOnly = log.status === "logged_only" || log.status === "pending";

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-[#1E293B]/50 transition"
                    >
                      {/* ID & Ward */}
                      <td className="p-4">
                        <div className="font-black text-sm text-white">
                          {log.zone_name || `Ward #${log.zone || "NMC"}`}
                        </div>
                        <div className="text-[10px] text-slate-400">Dispatch #{log.id}</div>
                      </td>

                      {/* Channel & Recipient */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          {log.channel === "WhatsApp" ? (
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Phone className="w-3.5 h-3.5 text-teal-400" />
                          )}
                          <span>{log.channel || "SMS"}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{log.recipient || "+91-Municipal-Desk"}</div>
                      </td>

                      {/* Message Body */}
                      <td className="p-4 max-w-md">
                        <p className="line-clamp-2 text-slate-300">
                          {log.message}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            isDelivered
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : isLoggedOnly
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {log.status || "Logged"}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {log.sent_at || log.created_at
                          ? new Date(log.sent_at || log.created_at).toLocaleString()
                          : "Just now"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredLogs.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                No alert dispatches matching criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
