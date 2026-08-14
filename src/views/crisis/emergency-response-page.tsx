import React from 'react';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { Siren } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const EmergencyResponsePage: React.FC = () => {
  const { incidents, kpis } = useDemoSimulation();

  const handleDispatch = (id: string) => {
    toast.success('Emergency squad dispatched!', {
      description: `Rapid response unit assigned to incident #${id}`
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#E53935] text-white font-mono text-[10px] font-bold">
              NMC EMERGENCY DISPATCH
            </Badge>
            <span className="text-xs text-[#666666] dark:text-gray-400">• Rapid Action Squads & Rescue Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Emergency Response Command
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Active emergency incidents, squad assignments, and real-time dispatch management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-[#E53935] text-white font-mono text-xs px-3 py-1 font-bold">
            {kpis.activeIncidentsCount} Active Emergencies
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {incidents.map(inc => (
          <div key={inc.id} className="bg-white dark:bg-[#111C2E] rounded-2xl p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-2.5 py-1 rounded font-mono ${
                inc.severity === 'SEVERE' ? 'bg-[#E53935] text-white' : 'bg-[#FF8A00] text-white'
              }`}>
                {inc.severity} ({inc.riskScore}%)
              </span>
              <span className="text-xs font-mono text-[#666666] dark:text-gray-400">{inc.reportedTime}</span>
            </div>

            <h3 className="font-bold text-base text-[#111111] dark:text-white">{inc.title}</h3>
            <p className="text-xs text-[#666666] dark:text-gray-400">📍 {inc.locationName}</p>

            <div className="p-3 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10 text-xs space-y-1">
              <span className="font-bold text-[#FF8A00] block">AI Action Priority:</span>
              <span className="text-[#111111] dark:text-white font-medium">{inc.recommendedAction}</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-[#666666] dark:text-gray-400 font-mono">
                Squad: <strong className="text-[#111111] dark:text-white">{inc.assignedTeam || 'Unassigned'}</strong>
              </span>

              <Button
                size="sm"
                onClick={() => handleDispatch(inc.id)}
                className="bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold text-xs"
              >
                <Siren className="size-3.5 mr-1" /> Re-Dispatch Unit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmergencyResponsePage;
