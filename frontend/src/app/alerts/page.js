"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Radio,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
} from "lucide-react";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { getBroadcastAlerts } from "../../lib/api";

export default function CitizenAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [copiedId, setCopiedId] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getBroadcastAlerts();
      if (Array.isArray(data)) {
        setAlerts(data);
      }
    } catch (err) {
      console.error("Alerts fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === "All") return true;
    return (a.severity || "Severe").toLowerCase() === filterSeverity.toLowerCase();
  });

  const handleCopyAlert = (id, text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShareWhatsApp = (msg) => {
    const text = encodeURIComponent(`🚨 *NagDrishti AI Crisis Alert*\n${msg}\n\nStay safe & check live flood routes.`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <CitizenLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Civic Broadcasts
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Official emergency alerts issued by Nagpur Disaster Cell
            </p>
          </div>

          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="p-2 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm active:scale-95 transition"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
          </button>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {["All", "Severe", "High", "Medium"].map((sev) => {
            const isSelected = filterSeverity === sev;
            return (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isSelected
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
                    : "bg-white dark:bg-[#131B2A] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                }`}
              >
                {sev}
              </button>
            );
          })}
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isSevere = alert.severity === "Severe" || (alert.severity || "").toLowerCase() === "severe";
            const isHigh = alert.severity === "High" || (alert.severity || "").toLowerCase() === "high";

            return (
              <div
                key={alert.id}
                className={`bg-white dark:bg-[#131B2A] border rounded-3xl p-4 shadow-sm space-y-3 transition ${
                  isSevere
                    ? "border-red-500/40 dark:border-red-900/50"
                    : isHigh
                    ? "border-orange-500/30 dark:border-orange-900/40"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl ${
                        isSevere
                          ? "bg-red-500/10 text-red-600"
                          : isHigh
                          ? "bg-orange-500/10 text-orange-600"
                          : "bg-teal-500/10 text-teal-600"
                      }`}
                    >
                      <Radio className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white">
                        {alert.zone_name || `Ward Alert #${alert.id}`}
                      </h3>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300">
                        {alert.created_at ? new Date(alert.created_at).toLocaleString() : "Just Now"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isSevere
                        ? "bg-red-500/10 text-red-600 border border-red-500/20"
                        : isHigh
                        ? "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}
                  >
                    {alert.severity || "Severe"}
                  </span>
                </div>

                {/* Message Body */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {alert.message}
                </p>

                {/* Channels & Share Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-teal-500" />
                      <span>{alert.channel || "SMS & WhatsApp"}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyAlert(alert.id, alert.message)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center gap-1 hover:bg-slate-200 transition"
                      title="Copy alert text"
                    >
                      {copiedId === alert.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(alert.message)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition"
                      title="Share to WhatsApp"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAlerts.length === 0 && (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                No Active Emergency Alerts
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                All wards across Nagpur are operating with clear drainage channels.
              </p>
            </div>
          )}
        </div>
      </div>
    </CitizenLayout>
  );
}
