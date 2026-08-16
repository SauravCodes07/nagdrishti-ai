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
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600 dark:text-teal-400" : ""}`} />
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
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterSeverity === f.id
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                  : "bg-white dark:bg-[#131B2A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#1E293B]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAlerts.map((alert) => {
            const isSevere = alert.severity === "Severe";
            const isHigh = alert.severity === "High";

            return (
              <div
                key={alert.id}
                className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-teal-500/40 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>{alert.zone_name || "Nagpur Citywide"}</span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {alert.zone_name ? `Advisory: ${alert.zone_name}` : "Monsoon Crisis Warning"}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${
                        isSevere
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                          : isHigh
                          ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {alert.severity || "Severe"}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {alert.message}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {alert.sent_at || alert.created_at
                        ? new Date(alert.sent_at || alert.created_at).toLocaleTimeString()
                        : "Active Broadcast"}
                    </span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyAlert(alert)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-[#0B0F17] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 transition text-xs flex items-center gap-1"
                      title="Copy Advisory Text"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{copiedId === alert.id ? "Copied!" : "Copy"}</span>
                    </button>

                    <button
                      onClick={() => handleWhatsAppShare(alert)}
                      className="px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition text-xs font-bold flex items-center gap-1"
                      title="Share to WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="text-[10px]">WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAlerts.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-500 text-xs bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-800 dark:text-slate-200">No active alerts matching this filter.</p>
              <p className="text-[11px] text-slate-400">Normal drainage conditions reported across Nagpur wards.</p>
            </div>
          )}
        </div>
      </div>
    </CitizenLayout>
  );
}
