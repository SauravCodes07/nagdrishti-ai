import { ShieldCheck, Activity } from 'lucide-react';

export function NavSecondary() {
  return (
    <div className="-mx-4 border-t border-b border-border px-4 py-4 bg-muted/30">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-xs text-foreground tracking-wide">
              All Systems Operational
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-3 text-bhagwa" /> AI Telemetry
          </span>
          <span className="font-mono text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-bold">
            99.8% ACCURACY
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Activity className="size-3 text-blue-500" /> NMC GIS Grid
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            21.1458° N, 79.0882° E
          </span>
        </div>
      </div>
    </div>
  );
}
