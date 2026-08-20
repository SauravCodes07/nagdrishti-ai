"use client";

import { useEffect, useState } from "react";
import {
  Share2,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Copy,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { getBroadcastAlerts } from "../../lib/api";
import {
  ScrollReveal,
  HoverLiftCard,
  RiskPulse,
  StaggerGrid,
  StaggerItem,
} from "../../components/motion";

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
    const text = `🚨 *NagDrishti Alert — ${alert.zone_name || "Nagpur"}*\n${alert.message}\nSeverity: ${alert.severity || "Severe"}\nOfficial NMC Civic Advisory`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Recent Alerts
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
              Official Nagpur Municipal Corporation flood advisories, waterlogging warnings, and evacuation notices
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={fetchAlerts}
            disabled={loading}
            className="h-10 px-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0F766E] dark:text-[#14B8A6]" : ""}`} />
            <span>Sync Alerts</span>
          </motion.button>
        </div>

        {/* Severity Filter Chips with layoutId Animated Sliding Pill */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "all", label: `All Advisories (${alerts.length})` },
            { id: "severe", label: "Severe" },
            { id: "high", label: "High" },
            { id: "medium", label: "Medium" },
          ].map((f) => {
            const isSelected = filterSeverity === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilterSeverity(f.id)}
                className={`relative h-8 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? "text-white dark:text-[#042F2E]"
                    : "text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="active-alert-filter"
                    className="absolute inset-0 bg-[#0F766E] dark:bg-[#14B8A6] rounded-lg -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {!isSelected && (
                  <span className="absolute inset-0 bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-lg -z-20" />
                )}
                <span className="relative z-10">{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Alerts Grid */}
        {loading ? (
          <div className="text-center py-16 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0F766E] dark:text-[#14B8A6]" />
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
              Retrieving Official Broadcast Dispatches...
            </p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <ScrollReveal direction="up">
            <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-12 text-center space-y-2 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
              <CheckCircle2 className="w-10 h-10 text-[#16A34A] mx-auto" />
              <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                No Active Flood Alerts in Filter
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
                All monitored drainage basins and major transport routes are currently within acceptable flow parameters.
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlerts.map((alert) => {
              const isSevere = alert.severity === "Severe" || alert.severity === "High";
              return (
                <StaggerItem key={alert.id}>
                  <HoverLiftCard
                    riskCategory={alert.severity}
                    className={`p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col justify-between space-y-4 h-full ${
                      isSevere
                        ? "border-red-200 dark:border-red-900/50"
                        : "border-[#E2E8F0] dark:border-[#243244]"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <RiskPulse category={alert.severity}>
                          <span
                            className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                              isSevere
                                ? "bg-[#FEE2E2] text-[#991B1B] dark:bg-red-500/20 dark:text-[#F87171]"
                                : "bg-[#FEF9C3] text-[#854D0E] dark:bg-amber-500/20 dark:text-[#FDE047]"
                            }`}
                          >
                            {alert.severity || "Advisory"}
                          </span>
                        </RiskPulse>

                        <div className="flex items-center gap-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : "Live"}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6] shrink-0" />
                          <span>{alert.zone_name || "Nagpur Citywide"}</span>
                        </h3>
                        <p className="text-xs text-[#475569] dark:text-[#CBD5E1] mt-1.5 leading-relaxed font-normal">
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#243244] flex items-center justify-between gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCopyAlert(alert)}
                        className="flex-1 h-9 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F17] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedId === alert.id ? "Copied! ✓" : "Copy"}</span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleWhatsAppShare(alert)}
                        className="flex-1 h-9 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </motion.button>
                    </div>
                  </HoverLiftCard>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        )}
      </div>
    </CitizenLayout>
  );
}
