"use client";

import { useState } from "react";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  Droplets,
  Radio,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { simulateRainfall } from "../../../lib/api";
import {
  ScrollReveal,
  HoverLiftCard,
  RiskPulse,
  StaggerGrid,
  StaggerItem,
} from "../../../components/motion";

const SIMULATION_STAGES = [
  {
    id: "baseline",
    title: "Stage 1: Dry Baseline",
    desc: "Nagpur rainfall 0 mm/h. All 10 wards operating under standard green parameters.",
    icon: ShieldCheck,
  },
  {
    id: "onset",
    title: "Stage 2: Rainfall Onset",
    desc: "15 mm/h downpour begins across Dharampeth and West Nagpur basins.",
    icon: Droplets,
  },
  {
    id: "downpour",
    title: "Stage 3: Torrential Cloudburst",
    desc: "75 mm/h torrential rain. Narendra Nagar and Sitabuldi enter Severe alert.",
    icon: Activity,
  },
  {
    id: "escalation",
    title: "Stage 4: Urban Flood Escalation",
    desc: "Culverts reach 100% capacity. Safe routes automatically recalculate around basins.",
    icon: AlertTriangle,
  },
  {
    id: "waterlogging",
    title: "Stage 5: Crowdsourced Photo Influx",
    desc: "AI Vision verifies citizen waterlogging photos and elevates severity weights.",
    icon: Zap,
  },
  {
    id: "alert",
    title: "Stage 6: Multi-Channel Broadcast",
    desc: "System triggers automated SMS and WhatsApp evacuation alerts to citizens.",
    icon: Radio,
  },
  {
    id: "dispatch",
    title: "Stage 7: Quick Response Dispatch",
    desc: "Priority queue assigns high-capacity dewatering pumps to Narendra Nagar.",
    icon: Truck,
  },
  {
    id: "resolve",
    title: "Stage 8: Recovery & Resolution",
    desc: "Rainfall subsides. Drain clearance confirmed. System resets to normal operations.",
    icon: CheckCircle2,
  },
];

export default function AdminSimulatePage() {
  const [activeStage, setActiveStage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logResponse, setLogResponse] = useState(null);

  const handleRunStage = async (stageId) => {
    try {
      setLoading(true);
      setActiveStage(stageId);
      const res = await simulateRainfall({ stage: stageId });
      setLogResponse(res);
    } catch (err) {
      alert("Simulation execution error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeIndex = SIMULATION_STAGES.findIndex((s) => s.id === activeStage);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Crisis Scenario Simulator
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
            Test full-cycle municipal emergency protocols across 8 pre-configured monsoon flood stages
          </p>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Crisis Lifecycle Stepper</span>
            <span className="text-[#0F766E] dark:text-[#14B8A6]">
              {activeIndex >= 0 ? `Stage ${activeIndex + 1} of 8 Active` : "Ready to Inject"}
            </span>
          </div>
          <div className="relative h-2 w-full bg-[#F1F5F9] dark:bg-[#0B0F17] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: activeIndex >= 0 ? `${((activeIndex + 1) / 8) * 100}%` : "0%" }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="h-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6] rounded-full shadow-sm"
            />
          </div>
        </div>

        {/* 8-Stage Scenario Grid with StaggerGrid and HoverLiftCards */}
        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SIMULATION_STAGES.map((st, idx) => {
            const Icon = st.icon;
            const isRunning = activeStage === st.id;
            const isPassed = activeIndex >= idx;

            return (
              <StaggerItem key={st.id}>
                <HoverLiftCard
                  className={`p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col justify-between space-y-4 h-full transition ${
                    isRunning
                      ? "border-[#0F766E] dark:border-[#14B8A6] ring-2 ring-[#0F766E]/30 dark:ring-[#14B8A6]/30"
                      : "border-[#E2E8F0] dark:border-[#243244]"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-[#F1F5F9] dark:bg-[#0B0F17] text-[#0F766E] dark:text-[#14B8A6] text-xs font-bold flex items-center justify-center font-mono">
                        0{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <Icon className={`w-4 h-4 ${isRunning ? "text-[#0F766E] dark:text-[#14B8A6] animate-bounce" : "text-[#64748B] dark:text-[#94A3B8]"}`} />
                        <span className="text-[10px] uppercase font-semibold text-[#64748B] dark:text-[#94A3B8]">
                          Step {idx + 1}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{st.title}</h3>
                    <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed font-normal">{st.desc}</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleRunStage(st.id)}
                    disabled={loading}
                    className={`w-full h-10 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                      isRunning
                        ? "bg-[#0F766E] text-white dark:bg-[#14B8A6] dark:text-[#042F2E]"
                        : "bg-[#F8FAFC] dark:bg-[#0B0F17] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1]"
                    }`}
                  >
                    <Play className={`w-3.5 h-3.5 ${loading && isRunning ? "animate-spin" : ""}`} />
                    <span>{loading && isRunning ? "Injecting..." : "Execute Stage"}</span>
                  </motion.button>
                </HoverLiftCard>
              </StaggerItem>
            );
          })}
        </StaggerGrid>

        {/* Execution Feedback Result Card */}
        <AnimatePresence>
          {logResponse && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-3"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Scenario Injected Successfully
                </h3>
              </div>
              <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed pl-7.5">
                {logResponse.message || logResponse.description || "Database rainfall and telemetry models updated."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
