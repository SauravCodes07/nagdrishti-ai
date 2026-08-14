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
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#FFC107] text-[#111111] font-mono text-[10px] font-black">
              TRAFFIC TELEMETRY
            </Badge>
            <span className="text-xs text-[#666666] dark:text-gray-400">• Nagpur Traffic Police Control Room</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Traffic Congestion & Corridor Monitor
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Real-time congestion bottlenecks caused by standing rainwater and flyover gridlocks.
          </p>
        </div>

        <Button variant="default" render={<Link to="/safe-route" />} className="bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold text-xs gap-1.5">
          <Navigation className="size-4" /> Open Safe Route Planner
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {zones.map(z => (
          <div key={z.id} className="bg-white dark:bg-[#111C2E] p-4 rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#111111] dark:text-white">{z.name} Corridor</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                z.trafficCongestion >= 80 ? 'bg-[#E53935] text-white' : 'bg-[#FFC107] text-[#111111]'
              }`}>
                {z.trafficCongestion}% Congested
              </span>
            </div>

            <div className="w-full bg-[#F7F7F7] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${z.trafficCongestion >= 80 ? 'bg-[#E53935]' : 'bg-[#FFC107]'}`}
                style={{ width: `${z.trafficCongestion}%` }}
              />
            </div>

            <p className="text-xs text-[#666666] dark:text-gray-400">
              Water Depth: {(z.waterloggingProb * 3.5).toFixed(1)} ft • Active Incidents: {z.activeIncidents}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrafficPage;
