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
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Crisis Scenario Simulator
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Inject synthetic rainfall patterns, trigger automated alert dispatches, and validate crisis progression
            </p>
          </div>
        </div>

        {/* 8-Stage Scenario Stepper Grid */}
        <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-teal-400">
              8-Stage Monsoon Demonstration Cycle
            </h2>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Interactive Runner
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SCENARIO_STAGES.map((stage, idx) => {
              const isActive = currentStageIdx === idx;
              return (
                <button
                  key={stage.id}
                  onClick={() => handleRunStage(stage.id, idx)}
                  disabled={running}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition active:scale-95 ${
                    isActive
                      ? "bg-teal-500/10 border-teal-500 text-teal-300 shadow-md ring-1 ring-teal-500/30"
                      : "bg-[#0B0F17] border-[#1E293B] text-slate-300 hover:bg-[#1E293B]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{stage.icon}</span>
                    <span className="text-[9px] font-black uppercase text-slate-500">Step {idx + 1}</span>
                  </div>
                  <div>
                    <div className="font-black text-xs text-white">{stage.label}</div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      {stage.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Injection & Console Output */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Custom Injection Controls */}
          <div className="lg:col-span-5 bg-[#131B2A] border border-[#1E293B] rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-teal-400">
              Custom Rainfall Injection
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Rainfall Intensity (mm/h)</span>
                <span className="text-teal-400 font-mono">{customRainfall} mm/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={customRainfall}
                onChange={(e) => setCustomRainfall(e.target.value)}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 mm (Dry)</span>
                <span>45 mm (Moderate)</span>
                <span>120 mm (Extreme Flood)</span>
              </div>
            </div>

            <button
              onClick={handleCustomRainfall}
              disabled={running}
              className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-lg shadow-teal-600/30 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <CloudRain className="w-4 h-4" />
              <span>Inject Custom Rainfall</span>
            </button>

            {lastResult && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{lastResult.description || "Simulation Finished"}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Affected Wards: {lastResult.affected_zones_count || (lastResult.results ? lastResult.results.length : 10)}
                </div>
              </div>
            )}
          </div>

          {/* Live Telemetry Console Log */}
          <div className="lg:col-span-7 bg-[#0B0F17] border border-[#1E293B] rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-black text-teal-400">
                <Terminal className="w-4 h-4" />
                <span>Simulation Event Console</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Live DRF Simulation Stream</span>
            </div>

            <div className="h-56 overflow-y-auto space-y-1 font-mono text-xs text-slate-300">
              {logs.length > 0 ? (
                logs.map((lg, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="text-teal-400">&gt;</span> {lg}
                  </div>
                ))
              ) : (
                <div className="text-slate-600 py-8 text-center">
                  Simulation console initialized. Click a scenario step above to run.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#1E293B] flex justify-end">
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300 underline font-mono"
              >
                Clear Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
