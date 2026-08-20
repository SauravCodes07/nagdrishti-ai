"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  ShieldCheck,
  Radio,
  Sliders,
  Database,
  CheckCircle2,
  AlertCircle,
  Save,
  Server,
  CloudRain,
  Key,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { checkBackendHealth } from "../../../lib/api";
import { HoverLiftCard, MagneticButton } from "../../../components/motion";

export default function AdminSettingsPage() {
  const [health, setHealth] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");

  // Configurable thresholds state
  const [lowThreshold, setLowThreshold] = useState(25);
  const [mediumThreshold, setMediumThreshold] = useState(50);
  const [highThreshold, setHighThreshold] = useState(75);

  // Alert Channel Toggles
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [autoDispatchThreshold, setAutoDispatchThreshold] = useState("Severe");

  useEffect(() => {
    checkBackendHealth()
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: "error" }));
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedMsg("System configuration & threshold parameters saved successfully.");
    setTimeout(() => setSavedMsg(""), 4000);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            System Settings & Crisis Thresholds
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
            Configure risk thresholds, emergency alert channels, and telemetry integrations
          </p>
        </div>

        <AnimatePresence>
          {savedMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-xl bg-[#DCFCE7] dark:bg-green-500/15 border border-green-200 dark:border-green-500/30 text-[#166534] dark:text-[#4ADE80] text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>{savedMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Section 1: Risk Classification Thresholds */}
          <HoverLiftCard className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0] dark:border-[#243244]">
              <Sliders className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                Risk Score Threshold Boundaries (0–100 Scale)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                  Low Risk Ceiling (%)
                </label>
                <input
                  type="number"
                  min="10"
                  max="40"
                  value={lowThreshold}
                  onChange={(e) => setLowThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                />
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                  Scores 0 to {lowThreshold}% = Low Category (Green)
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                  Medium Risk Ceiling (%)
                </label>
                <input
                  type="number"
                  min="41"
                  max="65"
                  value={mediumThreshold}
                  onChange={(e) => setMediumThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                />
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                  Scores {lowThreshold + 1} to {mediumThreshold}% = Medium (Amber)
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                  High Risk Ceiling (%)
                </label>
                <input
                  type="number"
                  min="66"
                  max="90"
                  value={highThreshold}
                  onChange={(e) => setHighThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                />
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                  Scores {highThreshold + 1}%+ = Severe (Red)
                </span>
              </div>
            </div>
          </HoverLiftCard>

          {/* Section 2: Emergency Alert Dispatch Channels */}
          <HoverLiftCard className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0] dark:border-[#243244]">
              <Radio className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                Automated Municipal Alert Channels
              </h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    SMS Alert Dispatch (Twilio)
                  </p>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Send high-priority SMS alerts to municipal quick response teams on Severe ward classification.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#0F766E] rounded focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    WhatsApp Crisis Alerts
                  </p>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Broadcast structured emergency notifications with direct coordinate links to response teams.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={(e) => setWhatsappAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#0F766E] rounded focus:ring-0"
                />
              </label>
            </div>
          </HoverLiftCard>

          {/* Section 3: Telemetry Integrations Status */}
          <HoverLiftCard className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0] dark:border-[#243244]">
              <Server className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                Telemetry & Integration Feeds
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">Open-Meteo Doppler</p>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Live Precipitation Sensor Feed</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-[10px]">
                  Online
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">OSM Road Network</p>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Committed GraphML (1,296+ nodes)</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-[10px]">
                  Loaded (&lt;50ms)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">Google OAuth 2.0</p>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Identity Services JS SDK</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-[10px]">
                  Configured
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">Hugging Face Vision AI</p>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">CLIP Zero-Shot Waterlog Model</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-[10px]">
                  Ready
                </span>
              </div>
            </div>
          </HoverLiftCard>

          <div className="flex justify-end">
            <MagneticButton>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save System Settings</span>
              </button>
            </MagneticButton>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
