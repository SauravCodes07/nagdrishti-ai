import React from 'react';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { TopAffectedAreas } from '../../components/crisis/top-affected-areas';
import { LiveCrisisMap } from '../../components/crisis/live-crisis-map';
import { Cpu, ArrowRight } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router';

const WaterloggingPage: React.FC = () => {
  const { zones, kpis } = useDemoSimulation();

  const severeZones = zones.filter(z => z.baselineRisk === 'SEVERE');

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-rose-500 text-white font-mono text-[10px]">
              CRITICAL HYDRO-DYNAMICS
            </Badge>
            <span className="text-xs text-muted-foreground">• Nag River & Ambazari Sub-Basin Watch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Waterlogging Risk Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Predictive modeling of street submergence, underpass flooding, and dewatering pump priority.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-rose-500 text-white text-sm font-extrabold font-mono px-3 py-1">
            {kpis.severeZonesCount} Severe Zones
          </Badge>
        </div>
      </div>

      {/* Map + Top Affected Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <LiveCrisisMap />
        </div>
        <div className="lg:col-span-5">
          <TopAffectedAreas />
        </div>
      </div>

      {/* AI Waterlogging Risk Explanations Card */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
            <Cpu className="size-5 text-bhagwa" /> AI HydroRisk Diagnosis & Mitigation Plan
          </h3>
          <Button variant="outline" size="sm" render={<Link to="/ai-predictions" />} className="text-xs font-semibold">
            Full AI Engine <ArrowRight className="size-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {severeZones.map(zone => (
            <div key={zone.id} className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">{zone.name} Zone</span>
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded">
                  Risk Score: {zone.currentRiskScore}/100
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Elevation: {zone.elevation}m • Drainage Blockage: {100 - zone.drainageCapacity}%
              </p>

              <div className="p-2.5 rounded-lg bg-background border border-border text-xs space-y-1">
                <span className="font-bold text-bhagwa block">Recommended Civic Mitigation:</span>
                <ul className="list-disc list-inside space-y-0.5 text-foreground">
                  {zone.recommendedActions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WaterloggingPage;
