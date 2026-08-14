import { ShieldCheck, Activity } from 'lucide-react';

export function NavSecondary() {
  return (
    <div className="-mx-4 border-t border-b border-[#E5E5E5] dark:border-white/10 px-4 py-4 bg-[#F7F7F7] dark:bg-[#0B1320]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22A447] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22A447]"></span>
            </span>
            <span className="font-bold text-xs text-[#111111] dark:text-white tracking-wide">
              All Systems Operational
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-[#666666] dark:text-gray-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-3 text-[#FF8A00]" /> AI Telemetry
          </span>
          <span className="font-mono text-[10px] bg-[#22A447]/10 text-[#22A447] px-1.5 py-0.5 rounded font-bold">
            99.8% ACCURACY
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-[#666666] dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Activity className="size-3 text-[#FF8A00]" /> NMC GIS Grid
          </span>
          <span className="font-mono text-[10px] text-[#666666] dark:text-gray-400">
            21.1458° N, 79.0882° E
          </span>
        </div>
      </div>
    </div>
  );
}
