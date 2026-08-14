import React from 'react';
import { useDemoSimulation, SIMULATION_STAGES, SimulationStage } from '../../context/DemoSimulationContext';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Sparkles, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

export const DemoSimulationBar: React.FC = () => {
  const {
    stage,
    setStage,
    isPlaying,
    togglePlay,
    nextStage,
    prevStage,
    resetSimulation,
    stageInfo,
    currentRainfallMm
  } = useDemoSimulation();

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-3 sm:p-4 shadow-xl border border-slate-700/60 mb-6 transition-all">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Left Title & Status */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-bhagwa to-amber-500 flex items-center justify-center text-white font-bold shadow-md shrink-0">
            <Sparkles className="size-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-bold text-bhagwa font-mono">
                HACKATHON DEMO SIMULATOR
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] flex items-center gap-1 font-mono">
                <Activity className="size-3 animate-ping" /> LIVE CRISIS SIMULATION
              </Badge>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                🌧️ {currentRainfallMm} mm/hr
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white leading-snug mt-0.5">
              {stageInfo.title}
            </h4>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-lg border border-slate-700">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevStage}
              className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700"
              title="Previous Stage"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={togglePlay}
              className={cn(
                "h-8 px-3 text-xs font-bold gap-1 transition-all",
                isPlaying ? "bg-amber-500 hover:bg-amber-600 text-slate-950" : "bg-bhagwa hover:bg-bhagwa-dark text-white"
              )}
            >
              {isPlaying ? (
                <>
                  <Pause className="size-3.5 fill-current" /> Pause
                </>
              ) : (
                <>
                  <Play className="size-3.5 fill-current" /> Play Simulation
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextStage}
              className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700"
              title="Next Stage"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={resetSimulation}
            className="h-8 px-2 text-xs border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
            title="Reset to Normal"
          >
            <RotateCcw className="size-3.5 mr-1" /> Reset
          </Button>
        </div>
      </div>

      {/* 8-Stage Selection Buttons Carousel / Grid */}
      <div className="mt-3 pt-3 border-t border-slate-800">
        <p className="text-[11px] text-slate-400 mb-2 font-medium">
          Select Crisis Lifecycle Stage (1 to 8):
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {SIMULATION_STAGES.map(s => {
            const isCurrent = stage === s.stage;
            return (
              <button
                key={s.stage}
                onClick={() => setStage(s.stage as SimulationStage)}
                className={cn(
                  "py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all text-center flex flex-col items-center justify-center border min-h-[44px]",
                  isCurrent
                    ? "bg-bhagwa text-white border-bhagwa font-bold shadow-md shadow-bhagwa/30 scale-105"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                )}
              >
                <span className="text-[10px] opacity-75 font-mono">Stage {s.stage}</span>
                <span className="truncate w-full text-[10px] leading-tight mt-0.5">
                  {s.subtitle.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
