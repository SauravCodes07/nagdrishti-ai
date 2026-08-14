import React from 'react';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { Navigation } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router';

const TrafficPage: React.FC = () => {
  const { zones } = useDemoSimulation();

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-amber-500 text-white font-mono text-[10px]">
              TRAFFIC TELEMETRY
            </Badge>
            <span className="text-xs text-muted-foreground">• Nagpur Traffic Police Control Room</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Traffic Congestion & Corridor Monitor
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time congestion bottlenecks caused by standing rainwater and flyover gridlocks.
          </p>
        </div>

        <Button variant="default" render={<Link to="/safe-route" />} className="bg-bhagwa text-white font-bold text-xs gap-1.5">
          <Navigation className="size-4" /> Open Safe Route Planner
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {zones.map(z => (
          <div key={z.id} className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">{z.name} Corridor</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                z.trafficCongestion >= 80 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {z.trafficCongestion}% Congested
              </span>
            </div>

            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${z.trafficCongestion >= 80 ? 'bg-rose-500' : 'bg-amber-500'}`}
                style={{ width: `${z.trafficCongestion}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Water Depth: {(z.waterloggingProb * 3.5).toFixed(1)} ft • Active Incidents: {z.activeIncidents}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrafficPage;
