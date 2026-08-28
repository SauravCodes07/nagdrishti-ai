"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Send,
  X,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { getAlertLogs, createBroadcastAlert, getRiskZones, DEFAULT_RISK_ZONES } from "../../../lib/api";
import {
  RiskPulse,
  HoverLiftCard,
  SpotlightCard,
  ShimmerButton,
  BlurFade,
} from "../../../components/motion";

export default function AdminAlertLogsPage() {
  const [logs, setLogs] = useState([]);
  const [zones, setZones] = useState(DEFAULT_RISK_ZONES);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Broadcast Form State
  const [selectedZoneName, setSelectedZoneName] = useState("Sitabuldi Interchange & Wardha Road");
  const [severity, setSeverity] = useState("Severe");
  const [channel, setChannel] = useState("SMS + WhatsApp Gateway");
  const [message, setMessage] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const [logsData, zonesData] = await Promise.allSettled([
        getAlertLogs(),
        getRiskZones(),
      ]);
      if (logsData.status === "fulfilled" && Array.isArray(logsData.value)) {
        setLogs(logsData.value);
      }
      if (zonesData.status === "fulfilled" && Array.isArray(zonesData.value)) {
        setZones(zonesData.value);
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

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setBroadcasting(true);
    try {
      const newAlert = {
        zone_name: selectedZoneName,
        severity,
        channel,
        message,
        status: "Delivered",
        created_at: new Date().toISOString(),
      };

      const res = await createBroadcastAlert(newAlert);
      setLogs((prev) => [res || newAlert, ...prev]);
      setSuccessMsg(`Emergency alert broadcast sent to ${selectedZoneName} via ${channel}`);
      setIsBroadcastModalOpen(false);
      setMessage("");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      alert("Failed to broadcast alert: " + err.message);
    } finally {
      setBroadcasting(false);
    }
  };

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
          <BlurFade delay={0.05}>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Emergency Broadcast Logs
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
              Auditable dispatch ledger of all automated SMS, WhatsApp, and siren emergency dispatches
            </p>
          </BlurFade>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={fetchLogs}
              disabled={loading}
              className="h-10 px-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0F766E] dark:text-[#14B8A6]" : ""}`} />
              <span>Sync Logs</span>
            </motion.button>

            <ShimmerButton
              onClick={() => setIsBroadcastModalOpen(true)}
              background="var(--primary)"
              className="h-10 px-4 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Broadcast</span>
            </ShimmerButton>
          </div>
        </div>

        {/* Success Feedback Alert */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-xl bg-[#DCFCE7] dark:bg-green-500/15 border border-green-200 dark:border-green-500/30 text-[#166534] dark:text-[#4ADE80] text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* New Broadcast Modal */}
        <AnimatePresence>
          {isBroadcastModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-lg w-full bg-[#FFFFFF] dark:bg-[#111C2E] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#243244] shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#243244]">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-[#DC2626]" />
                    <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      Dispatch Emergency Broadcast
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBroadcastModalOpen(false)}
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateBroadcast} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#475569] dark:text-[#CBD5E1]">
                      Target Ward / Catchment Zone
                    </label>
                    <select
                      value={selectedZoneName}
                      onChange={(e) => setSelectedZoneName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E]"
                    >
                      <option value="Sitabuldi Interchange & Wardha Road">Sitabuldi Interchange & Wardha Road Corridor</option>
                      <option value="Lakadganj Industrial Drainage Arterial">Lakadganj Industrial Drainage Arterial</option>
                      <option value="Gandhibagh & Itwari Market Basin">Gandhibagh & Itwari Market Basin</option>
                      <option value="Dharampeth & West Nagpur Zone">Dharampeth & West Nagpur Zone</option>
                      <option value="Nagpur Metropolitan Citywide">Nagpur Metropolitan Citywide Broadcast</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.name || z.zone_name}>
                          {z.name || z.zone_name} Ward
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#475569] dark:text-[#CBD5E1]">Severity Level</label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E]"
                      >
                        <option value="Severe">Severe (Red Flood Alert)</option>
                        <option value="High">High (Orange Warning)</option>
                        <option value="Medium">Medium (Yellow Watch)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#475569] dark:text-[#CBD5E1]">Broadcast Channel</label>
                      <select
                        value={channel}
                        onChange={(e) => setChannel(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E]"
                      >
                        <option value="SMS + WhatsApp Gateway">SMS + WhatsApp Gateway</option>
                        <option value="Citizen Portal App Banner">Citizen Portal App Banner</option>
                        <option value="All Integrated Multi-Channels">All Integrated Multi-Channels</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#475569] dark:text-[#CBD5E1]">Advisory Message</label>
                    <textarea
                      rows={3}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="E.g., Inundation alert at Sitabuldi flyover underpass (75cm). Dewatering QRT deployed. Avoid underpass."
                      className="w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E] resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#243244]">
                    <button
                      type="button"
                      onClick={() => setIsBroadcastModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#162235] text-[#475569] dark:text-[#CBD5E1] font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={broadcasting}
                      className="px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{broadcasting ? "Broadcasting..." : "Dispatch Emergency Alert"}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
