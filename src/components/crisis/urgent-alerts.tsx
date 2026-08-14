import React from 'react';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { BellRing, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router';
import { cn } from '../../lib/utils';

export const UrgentAlerts: React.FC = () => {
  const { incidents } = useDemoSimulation();

  // Take top 4 urgent alerts
  const topAlerts = incidents.slice(0, 4);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'SEVERE':
        return { label: 'SEVERE 🔴', class: 'bg-rose-500 text-white font-bold animate-pulse' };
      case 'HIGH':
        return { label: 'HIGH 🟠', class: 'bg-orange-500 text-white font-bold' };
      case 'MEDIUM':
        return { label: 'MEDIUM 🟡', class: 'bg-amber-500 text-white font-bold' };
      default:
        return { label: 'LOW 🟢', class: 'bg-emerald-500 text-white font-bold' };
    }
  };

  return (
    <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
            <BellRing className="size-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground tracking-tight flex items-center gap-2">
              Urgent Alerts
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 font-mono">
                LIVE
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time threat notifications for Nagpur
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          render={<Link to="/alerts" />}
          className="text-xs text-bhagwa hover:text-bhagwa-dark font-semibold gap-1"
        >
          View All <ChevronRight className="size-3.5" />
        </Button>
      </div>

      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {topAlerts.map(alert => {
          const badge = getSeverityBadge(alert.severity);
          return (
            <div
              key={alert.id}
              className="p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 transition-all cursor-pointer group flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn("text-[10px] px-2 py-0.5 rounded font-mono", badge.class)}>
                  {badge.label}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {alert.reportedTime}
                </span>
              </div>

              <h4 className="text-xs font-bold text-foreground group-hover:text-bhagwa transition-colors line-clamp-1">
                {alert.title}
              </h4>

              <p className="text-[11px] text-muted-foreground line-clamp-1">
                📍 {alert.locationName}
              </p>

              <div className="mt-1 pt-1.5 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-bhagwa flex items-center gap-1">
                  AI Rec: {alert.recommendedAction.split('+')[0]}
                </span>
                <span className="text-muted-foreground font-mono text-[10px]">
                  Risk: {alert.riskScore}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
