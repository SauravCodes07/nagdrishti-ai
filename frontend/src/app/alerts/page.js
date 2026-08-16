"use client";

import React, { useState, useEffect } from "react";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { getBroadcastAlerts } from "../../lib/api";
import {
  Bell,
  AlertTriangle,
  Radio,
  Clock,
  MapPin,
  RefreshCw,
  Share2,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CitizenAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getBroadcastAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Alerts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = (alert) => {
    if (navigator.share) {
      navigator.share({
        title: `NagDrishti Alert: ${alert.zone_name || "Nagpur"}`,
        text: alert.message,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`[NagDrishti Alert] ${alert.message}`);
      setCopiedId(alert.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getSeverityStyle = (severity) => {
    const s = (severity || "").toLowerCase();
    if (s.includes("critical") || s.includes("severe") || s.includes("emergency")) {
      return {
        badge: "bg-red-100 text-red-700 border-red-200",
        border: "border-red-200",
        icon: ShieldAlert,
        iconColor: "text-red-600",
      };
    }
    if (s.includes("warning") || s.includes("high")) {
      return {
        badge: "bg-amber-100 text-amber-700 border-amber-200",
        border: "border-amber-200",
        icon: AlertTriangle,
        iconColor: "text-amber-600",
      };
    }
    if (s.includes("resolved") || s.includes("clear")) {
      return {
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
        border: "border-emerald-200",
        icon: ShieldCheck,
        iconColor: "text-emerald-600",
      };
    }
    return {
      badge: "bg-neutral-100 text-neutral-700 border-neutral-200",
      border: "border-neutral-200",
      icon: Bell,
      iconColor: "text-neutral-600",
    };
  };

  return (
    <CitizenLayout>
      <div className="p-4 space-y-4">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-[#111111] tracking-tight">
              Emergency Alerts & Advisories
            </h1>
            <p className="text-xs text-[#666666] font-medium">
              Live broadcast messages issued by Nagpur Municipal Disaster Cell
            </p>
          </div>

          <button
            onClick={loadAlerts}
            className="p-2 rounded-full bg-white border border-[#E5E5E5] text-[#111111] hover:bg-neutral-100 transition active:rotate-180"
            title="Refresh Alerts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Live Broadcast Ticker Banner */}
        <div className="p-3.5 rounded-2xl bg-neutral-900 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFC107] animate-ping"></span>
            <div>
              <div className="text-xs font-black tracking-tight">
                SMS & WhatsApp Broadcast Gateway
              </div>
              <div className="text-[10px] text-neutral-400">
                Automated Twilio Dispatch & Public Cell Broadcaster
              </div>
            </div>
          </div>
          <Radio className="w-4 h-4 text-[#FFC107] animate-pulse" />
        </div>

        {/* Alerts List */}
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const style = getSeverityStyle(alert.severity);
              const Icon = style.icon;

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-2xl p-4 border ${style.border} shadow-xs space-y-3`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center bg-neutral-100 ${style.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#111111]">
                          {alert.zone_name || "Nagpur Citywide"}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#666666] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {alert.created_at
                              ? new Date(alert.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Just now"}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{alert.channel || "Broadcast"}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${style.badge}`}>
                      {alert.severity || "Alert"}
                    </span>
                  </div>

                  <p className="text-xs text-[#111111] leading-relaxed font-medium bg-[#F7F7F7] p-3 rounded-xl border border-[#E5E5E5]">
                    {alert.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#666666] pt-1">
                    <span>Target: {alert.recipient || "Public Advisory Feed"}</span>
                    <button
                      onClick={() => handleShare(alert)}
                      className="flex items-center gap-1 font-bold text-[#111111] hover:text-[#FF8A00] transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedId === alert.id ? "Copied!" : "Share"}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-[#E5E5E5] text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-[#111111]">
              No Active Emergency Alerts
            </h3>
            <p className="text-xs text-[#666666] max-w-xs mx-auto">
              Weather conditions and drainage corridors across Nagpur are currently operating within normal safety limits.
            </p>
          </div>
        )}

      </div>
    </CitizenLayout>
  );
}
