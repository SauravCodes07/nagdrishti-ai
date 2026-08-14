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
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-rose-600 text-white font-mono text-[10px]">
              NMC EMERGENCY DISPATCH
            </Badge>
            <span className="text-xs text-muted-foreground">• Rapid Action Squads & Rescue Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Emergency Response Command
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Active emergency incidents, squad assignments, and real-time dispatch management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-rose-500 text-white font-mono text-xs px-3 py-1 font-bold">
            {kpis.activeIncidentsCount} Active Emergencies
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {incidents.map(inc => (
          <div key={inc.id} className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-2.5 py-1 rounded font-mono ${
                inc.severity === 'SEVERE' ? 'bg-rose-500 text-white' : 'bg-orange-500 text-white'
              }`}>
                {inc.severity} ({inc.riskScore}%)
              </span>
              <span className="text-xs font-mono text-muted-foreground">{inc.reportedTime}</span>
            </div>

            <h3 className="font-bold text-base text-foreground">{inc.title}</h3>
            <p className="text-xs text-muted-foreground">📍 {inc.locationName}</p>

            <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
              <span className="font-bold text-bhagwa block">AI Action Priority:</span>
              <span className="text-foreground font-medium">{inc.recommendedAction}</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">
                Squad: <strong className="text-foreground">{inc.assignedTeam || 'Unassigned'}</strong>
              </span>

              <Button
                size="sm"
                onClick={() => handleDispatch(inc.id)}
                className="bg-bhagwa hover:bg-bhagwa-dark text-white font-bold text-xs"
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
