"use client";

import { useState } from "react";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { simulateRainfall } from "../../../lib/api";

const SIMULATION_STAGES = [
  {
    id: "baseline",
    title: "Stage 1: Dry Baseline",
    desc: "Nagpur rainfall 0 mm/h. All 10 wards operating under standard green parameters.",
  },
  {
    id: "onset",
    title: "Stage 2: Rainfall Onset",
    desc: "15 mm/h downpour begins across Dharampeth and West Nagpur basins.",
  },
  {
    id: "downpour",
    title: "Stage 3: Torrential Cloudburst",
    desc: "75 mm/h torrential rain. Narendra Nagar and Sitabuldi enter Severe alert.",
  },
  {
    id: "escalation",
    title: "Stage 4: Urban Flood Escalation",
    desc: "Culverts reach 100% capacity. Safe routes automatically recalculate around basins.",
  },
  {
    id: "waterlogging",
    title: "Stage 5: Crowdsourced Photo Influx",
    desc: "AI Vision verifies citizen waterlogging photos and elevates severity weights.",
  },
  {
    id: "alert",
    title: "Stage 6: Multi-Channel Broadcast",
    desc: "System triggers automated SMS and WhatsApp evacuation alerts to citizens.",
  },
  {
    id: "dispatch",
    title: "Stage 7: Quick Response Dispatch",
    desc: "Priority queue assigns high-capacity dewatering pumps to Narendra Nagar.",
  },
  {
    id: "resolve",
    title: "Stage 8: Recovery & Resolution",
    desc: "Rainfall subsides. Drain clearance confirmed. System resets to normal operations.",
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

        {/* 8-Stage Scenario Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SIMULATION_STAGES.map((st, idx) => (
            <div
              key={st.id}
              className={`bg-[#FFFFFF] dark:bg-[#111C2E] border rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col justify-between space-y-4 transition ${
                activeStage === st.id
                  ? "border-[#0F766E] dark:border-[#14B8A6] ring-1 ring-[#0F766E] dark:ring-[#14B8A6]"
                  : "border-[#E2E8F0] dark:border-[#243244]"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-[#F1F5F9] dark:bg-[#0B0F17] text-[#0F766E] dark:text-[#14B8A6] text-xs font-bold flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-[#64748B] dark:text-[#94A3B8]">
                    Step {idx + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{st.title}</h3>
                <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed font-normal">{st.desc}</p>
              </div>

              <button
                onClick={() => handleRunStage(st.id)}
                disabled={loading}
                className={`w-full h-10 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeStage === st.id
                    ? "bg-[#0F766E] text-white dark:bg-[#14B8A6] dark:text-[#042F2E]"
                    : "bg-[#F8FAFC] dark:bg-[#0B0F17] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1]"
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{loading && activeStage === st.id ? "Injecting..." : "Execute Stage"}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Execution Feedback Result Card */}
        {logResponse && (
          <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Scenario Injected Successfully
              </h3>
            </div>
            <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed pl-7.5">
              {logResponse.message || logResponse.description || "Database rainfall and telemetry models updated."}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
