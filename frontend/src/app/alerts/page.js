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
  Sparkles,
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-teal-400 tracking-wider">
              <Radio className="w-3.5 h-3.5" />
              <span>Official Municipal Broadcast Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              Live Civic Emergency Alerts
            </h1>
          </div>

          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#131B2A] border border-[#1E293B] text-slate-300 hover:text-white font-bold text-xs shadow-sm active:scale-95 transition flex items-center gap-1.5 self-start sm:self-auto"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-400" : ""}`} />
            <span>Sync Alerts</span>
          </button>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["All", "Severe", "High", "Medium"].map((sev) => {
            const isSelected = filterSeverity === sev;
            return (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isSelected
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                    : "bg-[#131B2A] text-slate-300 border border-[#1E293B] hover:bg-[#1E293B]"
                }`}
              >
                {sev}
              </button>
            );
          })}
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAlerts.map((alert) => {
            const isSevere = alert.severity === "Severe" || (alert.severity || "").toLowerCase() === "severe";
            const isHigh = alert.severity === "High" || (alert.severity || "").toLowerCase() === "high";

            return (
              <div
                key={alert.id}
                className={`bg-[#131B2A] border rounded-3xl p-5 shadow-sm space-y-4 transition flex flex-col justify-between ${
                  isSevere
                    ? "border-red-500/40 shadow-red-950/20"
                    : isHigh
                    ? "border-orange-500/40 shadow-orange-950/20"
                    : "border-[#1E293B]"
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2.5 rounded-xl ${
                          isSevere
                            ? "bg-red-500/10 text-red-400"
                            : isHigh
                            ? "bg-orange-500/10 text-orange-400"
                            : "bg-teal-500/10 text-teal-400"
                        }`}
                      >
                        <Radio className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-white truncate max-w-[170px]">
                          {alert.zone_name || `Ward Alert #${alert.id}`}
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          {alert.created_at ? new Date(alert.created_at).toLocaleString() : "Just Now"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                        isSevere
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : isHigh
                          ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {alert.severity || "Severe"}
                    </span>
                  </div>

                  {/* Message Body */}
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {alert.message}
                  </p>
                </div>

                {/* Channels & Share Actions */}
                <div className="flex items-center justify-between border-t border-[#1E293B] pt-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                    <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                    <span>{alert.channel || "SMS & WhatsApp"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyAlert(alert.id, alert.message)}
                      className="px-3 py-1.5 rounded-xl bg-[#0B0F17] hover:bg-[#1E293B] text-slate-300 font-bold text-[11px] flex items-center gap-1.5 border border-[#1E293B] transition"
                      title="Copy alert text"
                    >
                      {copiedId === alert.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(alert.message)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                      title="Share to WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAlerts.length === 0 && (
            <div className="col-span-full p-12 rounded-3xl bg-[#131B2A] border border-[#1E293B] text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white">
                No Active Emergency Alerts
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All wards across Nagpur are currently operating with clear drainage channels and normal traffic flow.
              </p>
            </div>
          )}
        </div>
      </div>
    </CitizenLayout>
  );
}
