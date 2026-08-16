"use client";

import React, { useState } from "react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { simulateRainfall } from "../../../lib/api";
import {
  CloudRain,
  Play,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Truck,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Terminal,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";

const SIMULATION_STAGES = [
  {
    id: 1,
    name: "Baseline",
    stageKey: "baseline",
    rainfall: 0,
    desc: "Clear skies across Nagpur. Normal traffic flow and low risk scores (0-15).",
    icon: ShieldCheck,
  },
  {
    id: 2,
    name: "Rainfall Onset",
    stageKey: "onset",
    rainfall: 15,
    desc: "Scattered light showers across western & central wards. Minor surface runoff.",
    icon: CloudRain,
  },
  {
    id: 3,
    name: "Downpour",
    stageKey: "downpour",
    rainfall: 75,
    desc: "Heavy downpour over low-lying basins (Sitabuldi, Mahal). Runoff exceeds drainage capacity.",
    icon: CloudRain,
  },
  {
    id: 4,
    name: "Risk Escalation",
    stageKey: "escalation",
    rainfall: 85,
    desc: "Crisis risk scores surge above 75 (Severe Red alert state).",
    icon: ShieldAlert,
  },
  {
    id: 5,
    name: "Waterlogging Emergence",
    stageKey: "waterlogging",
    rainfall: 90,
    desc: "Citizen incident report logged with photo confirmation of severe waterlogging.",
    icon: AlertTriangle,
  },
  {
    id: 6,
    name: "Emergency Alert Dispatch",
    stageKey: "alert",
    rainfall: 90,
    desc: "Automated Twilio SMS / WhatsApp triggered to municipal QRT units and ward supervisors.",
    icon: Radio,
  },
  {
    id: 7,
    name: "Civic Response",
    stageKey: "response",
    rainfall: 40,
    desc: "Dewatering pumps and municipal emergency squads deployed on site.",
    icon: Truck,
  },
  {
    id: 8,
    name: "Hazard Resolution",
    stageKey: "resolution",
    rainfall: 5,
    desc: "Dewatering pumps clear water. Traffic safely restored and ward risk normalized.",
    icon: CheckCircle2,
  },
];

export default function AdminSimulatePage() {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [simLog, setSimLog] = useState(null);
  const [customRain, setCustomRain] = useState(65);

  const handleRunStage = async (stageObj) => {
    setRunning(true);
    setSimLog(null);

    try {
      const payload = {
        stage: stageObj.id,
        stage_name: stageObj.name,
        rainfall_mm: stageObj.rainfall,
      };

      const res = await simulateRainfall(payload);
      setSimLog(res);
      setCurrentStageIndex(stageObj.id - 1);
    } catch (err) {
      setSimLog({ error: err.message || "Simulation stage failed." });
    } finally {
      setRunning(false);
    }
  };

  const handleNextStage = () => {
    const nextIdx = (currentStageIndex + 1) % SIMULATION_STAGES.length;
    handleRunStage(SIMULATION_STAGES[nextIdx]);
  };

  const handleResetSimulation = () => {
    handleRunStage(SIMULATION_STAGES[0]);
  };

  const activeStage = SIMULATION_STAGES[currentStageIndex];

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#111111] tracking-tight">
              Rainfall & Emergency Scenario Simulator
            </h1>
            <p className="text-xs text-[#666666] font-medium mt-0.5">
              8-stage interactive demonstration of live weather onset, AI risk escalation, automated Twilio alerts, and civic dewatering
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetSimulation}
              disabled={running}
              className="px-3 py-2 rounded-xl bg-white border border-[#E5E5E5] text-xs font-bold text-[#111111] hover:bg-neutral-50 shadow-2xs flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Baseline</span>
            </button>

            {/* THE SINGLE PRIMARY ACTION CTA ON THIS SCREEN */}
            <button
              onClick={handleNextStage}
              disabled={running}
              className="px-4 py-2 rounded-xl bg-[#FF8A00] hover:bg-[#E67C00] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition active:scale-[0.99] disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{running ? "Simulating Stage..." : `Advance to Stage #${((currentStageIndex + 1) % SIMULATION_STAGES.length) + 1}`}</span>
            </button>
          </div>
        </div>

        {/* 8-Stage Pipeline Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {SIMULATION_STAGES.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = currentStageIndex === idx;
            const isPassed = currentStageIndex > idx;

            return (
              <button
                key={s.id}
                onClick={() => handleRunStage(s)}
                disabled={running}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between h-32 ${
                  isCurrent
                    ? "bg-[#FFC107] border-[#FFC107] text-[#111111] shadow-sm font-bold"
                    : isPassed
                    ? "bg-white border-[#111111] text-[#111111]"
                    : "bg-white border-[#E5E5E5] text-[#666666] hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-black">0{s.id}</span>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold line-clamp-1">{s.name}</div>
                  <div className="text-[10px] font-semibold mt-0.5 opacity-80">
                    {s.rainfall} mm/h
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Details & Live Console */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 1 Col: Active Stage Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E5E5] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase text-[#FF8A00]">
                  Active Simulation Stage
                </span>
                <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-neutral-100 text-[#111111]">
                  Stage #{activeStage.id} / 8
                </span>
              </div>

              <h3 className="text-lg font-black text-[#111111]">
                {activeStage.name}
              </h3>

              <p className="text-xs text-[#666666] leading-relaxed">
                {activeStage.desc}
              </p>

              <div className="p-3.5 rounded-2xl bg-[#F7F7F7] border border-[#E5E5E5] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#666666]">Simulated Rainfall Rate:</span>
                  <span className="font-extrabold text-[#111111]">{activeStage.rainfall} mm/h</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#666666]">Target Corridor:</span>
                  <span className="font-extrabold text-[#111111]">Sitabuldi Basin</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleRunStage(activeStage)}
              disabled={running}
              className="w-full py-2.5 rounded-xl bg-[#111111] hover:bg-neutral-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Re-run This Stage</span>
            </button>
          </div>

          {/* Right 2 Cols: Live Scenario Output Console */}
          <div className="lg:col-span-2 bg-[#111111] text-white rounded-3xl p-5 shadow-lg space-y-3 flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#FFC107]" />
                <span className="font-bold text-neutral-300">
                  NagDrishti Scenario Engine Output
                </span>
              </div>
              <span className="text-[10px] text-neutral-500">
                POST /api/simulate-rainfall/
              </span>
            </div>

            <div className="flex-1 min-h-[320px] bg-black/50 rounded-2xl p-4 overflow-y-auto space-y-2 text-neutral-300 text-[11px] leading-relaxed border border-neutral-800/80">
              {running && (
                <div className="flex items-center gap-2 text-[#FFC107]">
                  <div className="w-3 h-3 border-2 border-[#FFC107] border-t-transparent rounded-full animate-spin"></div>
                  <span>Executing Stage #{activeStage.id} ({activeStage.name}) across database & risk models...</span>
                </div>
              )}

              {simLog ? (
                <div className="space-y-3">
                  <div className="text-emerald-400 font-bold">
                    ✓ Stage #{activeStage.id} executed successfully.
                  </div>
                  <pre className="text-neutral-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(simLog, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-neutral-500 italic">
                  Tap &apos;Advance to Stage&apos; or select any stage chip above to trigger a simulated rainfall event and observe live system reactions.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
