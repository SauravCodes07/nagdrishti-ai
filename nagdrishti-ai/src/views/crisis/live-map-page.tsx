import React from 'react';
import { LiveCrisisMap } from '../../components/crisis/live-crisis-map';
import { DemoSimulationBar } from '../../components/crisis/demo-simulation-bar';
import { Badge } from '../../components/ui/badge';

const LiveMapPage: React.FC = () => {
  return (
    <div className="space-y-4 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500 text-white font-mono text-[10px]">
              LIVE GIS GRID
            </Badge>
            <span className="text-xs text-muted-foreground">Nagpur Center [21.1458° N, 79.0882° E]</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mt-0.5">
            Nagpur Fullscreen Live Crisis Map
          </h1>
        </div>
      </div>

      <DemoSimulationBar />

      <LiveCrisisMap fullScreenMode={true} />
    </div>
  );
};

export default LiveMapPage;
