import React, { useState } from 'react';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { Badge } from '../../components/ui/badge';

const AlertsPage: React.FC = () => {
  const { incidents } = useDemoSimulation();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filtered = filterSeverity === 'ALL'
    ? incidents
    : incidents.filter(i => i.severity === filterSeverity);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-rose-500 text-white font-mono text-[10px]">
              CRISIS ALERT CENTER
            </Badge>
            <span className="text-xs text-muted-foreground">• NMC Emergency Dispatch Notifications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            System Alerts & Threat Notifications
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Active waterlogging alerts, road damage warnings, and traffic diversion notices across Nagpur.
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
          {['ALL', 'SEVERE', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterSeverity === sev ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(item => (
          <div key={item.id} className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-2 hover:border-bhagwa/40 transition-colors">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded font-mono ${
                  item.severity === 'SEVERE' ? 'bg-rose-500 text-white' : item.severity === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {item.severity} ({item.riskScore}%)
                </span>
                <h3 className="font-bold text-base text-foreground">{item.title}</h3>
              </div>
              <span className="text-xs text-muted-foreground font-mono">{item.reportedTime}</span>
            </div>

            <p className="text-xs text-muted-foreground">📍 Location: {item.locationName}</p>

            <p className="text-xs text-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50">
              {item.description}
            </p>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-border">
              <span className="font-bold text-bhagwa">
                🤖 Recommended Dispatch: {item.recommendedAction}
              </span>
              <span className="text-muted-foreground font-mono">Assigned: {item.assignedTeam || 'Pending Dispatch'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
