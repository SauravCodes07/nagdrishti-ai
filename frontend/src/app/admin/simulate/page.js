"use client";

import { useState } from "react";
import {
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  CloudRain,
  Radio,
  Truck,
  Layers,
  Terminal,
} from "lucide-react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { simulateRainfall } from "../../../lib/api";

const SCENARIO_STAGES = [
  { id: "baseline", label: "1. Baseline", desc: "Clear weather, low risk (0mm)", icon: "☀️" },
  { id: "onset", label: "2. Rain Onset", desc: "Light showers (15mm)", icon: "🌦️" },
  { id: "downpour", label: "3. Downpour", desc: "Cloudburst in basin (75mm)", icon: "🌧️" },
  { id: "escalation", label: "4. Escalation", desc: "High/Severe crisis triggered", icon: "🚨" },
  { id: "waterlogging", label: "5. Waterlogging", desc: "Photo-confirmed hazard", icon: "📸" },
  { id: "alert", label: "6. Alert Dispatch", desc: "Twilio SMS & WhatsApp out", icon: "📢" },
  { id: "dispatch", label: "7. Civic Action", desc: "Dewatering pumps deployed", icon: "🚒" },
  { id: "resolve", label: "8. Resolution", desc: "Drainage cleared & normal", icon: "🟢" },
];

export default function AdminSimulatePage() {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [customRainfall, setCustomRainfall] = useState("65");
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const handleRunStage = async (stageKey, index) => {
    try {
      setRunning(true);
      setCurrentStageIdx(index);
      addLog(`Executing simulation stage: '${stageKey}'...`);

      const res = await simulateRainfall({ stage: stageKey });
      setLastResult(res);
      addLog(`Success: ${res.description || res.message}`);
    } catch (err) {
      console.error("Simulation error:", err);
      addLog(`Error: ${err.message}`);
      alert("Simulation error: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  const handleCustomRainfall = async () => {
    const val = parseFloat(customRainfall);
    if (isNaN(val)) return;

    try {
      setRunning(true);
      addLog(`Injecting custom rainfall intensity: ${val} mm/h across Nagpur...`);
      const res = await simulateRainfall({ rainfall_intensity_mm: val });
      setLastResult(res);
      addLog(`Success: Custom scenario updated ${res.affected_zones_count || 10} zones.`);
    } catch (err) {
      addLog(`Error: ${err.message}`);
      alert("Custom simulation failed: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Crisis Scenario Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              Inject synthetic rainfall patterns, trigger automated alert dispatches, and validate crisis progression
            </p>
          </div>
        </div>

        {/* 8-Stage Scenario Stepper Grid */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#EA580C] dark:text-[#FF8A00]">
              8-Stage Monsoon Demonstration Cycle
            </h2>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#FFF7ED] dark:bg-[#FF8A00]/15 text-[#EA580C] dark:text-[#FF8A00] border border-[#FF8A00]/30">
              Interactive Runner
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SCENARIO_STAGES.map((st, idx) => (
              <button
                key={st.id}
                onClick={() => handleRunStage(st.id, idx)}
                disabled={running}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 cursor-pointer active:scale-95 ${
                  currentStageIdx === idx
                    ? "bg-[#FFF7ED] dark:bg-[#FF8A00]/15 border-[#FF8A00] text-slate-900 dark:text-white shadow-sm"
                    : "bg-slate-50 dark:bg-[#0B0F17] border-slate-200 dark:border-[#1E293B] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-[#334155]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{st.icon}</span>
                  <Play className="w-3.5 h-3.5 text-[#EA580C] dark:text-[#FF8A00]" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">{st.label}</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{st.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Rainfall Injector & Live Terminal Output */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Custom Parameter Injector */}
          <div className="lg:col-span-5 bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Custom Rainfall Injection
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Precipitation Intensity (mm/hour)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={customRainfall}
                  onChange={(e) => setCustomRainfall(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#FF8A00]"
                />
                <button
                  onClick={handleCustomRainfall}
                  disabled={running}
                  className="px-5 py-3 rounded-2xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
                >
                  Inject
                </button>
              </div>
            </div>

            {lastResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{lastResult.description || lastResult.message}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Real-Time Scenario Console Log */}
          <div className="lg:col-span-7 bg-[#0B0F17] border border-[#1E293B] rounded-3xl p-6 shadow-xl space-y-3 font-mono text-xs text-slate-300">
            <div className="flex items-center gap-2 text-[#FF8A00] pb-2 border-b border-[#1E293B]">
              <Terminal className="w-4 h-4" />
              <span className="font-bold text-[11px] uppercase tracking-wider">
                Crisis Engine Event Stream
              </span>
            </div>

            <div className="h-44 overflow-y-auto space-y-1.5 text-[11px] text-slate-400">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">Ready to run scenario stages...</div>
              ) : (
                logs.map((lg, i) => (
                  <div key={i} className="leading-relaxed">
                    <span className="text-[#FF8A00]">{">"}</span> {lg}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
