"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Radio,
  Share2,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Clock,
  MapPin,
  RefreshCw,
  Copy,
} from "lucide-react";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { getBroadcastAlerts } from "../../lib/api";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getBroadcastAlerts();
      if (Array.isArray(data)) {
        setAlerts(data);
      }
    } catch (err) {
      console.error("Alerts load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === "all") return true;
    return (a.severity || "Severe").toLowerCase() === filterSeverity.toLowerCase();
  });

  const handleCopyAlert = (alert) => {
    const text = `🚨 *NagDrishti Alert — ${alert.zone_name || "Nagpur"}*\n${alert.message}\nSeverity: ${alert.severity || "Severe"}\nSource: Nagpur Municipal Corporation (NMC)`;
    navigator.clipboard.writeText(text);
    setCopiedId(alert.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleWhatsAppShare = (alert) => {
    const text = `🚨 *NagDrishti Alert — ${alert.zone_name || "Nagpur"}*\n${alert.message}\nSeverity: ${alert.severity || "Severe"}\nOfficial NMC Civic Intelligence`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Civic Emergency Alerts
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
              Official Nagpur Municipal Corporation flood advisories, waterlogging warnings, and evacuation notices
            </p>
          </div>

          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#EA580C] dark:text-[#FF8A00]" : ""}`} />
            <span>Sync Alerts</span>
          </button>
        </div>

        {/* Severity Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "all", label: `All Advisories (${alerts.length})` },
            { id: "severe", label: "Severe" },
            { id: "high", label: "High" },
            { id: "medium", label: "Medium" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterSeverity(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterSeverity === f.id
                  ? "bg-[#EA580C] dark:bg-[#FF8A00] text-white dark:text-slate-950 shadow-md shadow-[#FF8A00]/20"
                  : "bg-white dark:bg-[#131B2A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#1E293B]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Alerts Grid */}
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#EA580C] dark:text-[#FF8A00]" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Retrieving Official Broadcast Dispatches...
            </p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              No Active Flood Alerts in Filter
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All monitored drainage basins and major transport routes are currently within acceptable flow parameters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlerts.map((alert) => {
              const isSevere = alert.severity === "Severe" || alert.severity === "High";
              return (
                <div
                  key={alert.id}
                  className={`bg-white dark:bg-[#131B2A] border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 transition hover:shadow-md ${
                    isSevere
                      ? "border-red-200 dark:border-red-900/50 hover:border-red-500/50"
                      : "border-slate-200 dark:border-[#1E293B] hover:border-[#FF8A00]/40"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                          isSevere
                            ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30"
                            : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                        }`}
                      >
                        {alert.severity || "Advisory"}
                      </span>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : "Live"}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#EA580C] dark:text-[#FF8A00] shrink-0" />
                        <span>{alert.zone_name || "Nagpur Citywide"}</span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyAlert(alert)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-[#0B0F17] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedId === alert.id ? "Copied!" : "Copy"}</span>
                    </button>

                    <button
                      onClick={() => handleWhatsAppShare(alert)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CitizenLayout>
  );
}
