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
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#E53935] text-white font-mono text-[10px] font-bold">
              CRITICAL HYDRO-DYNAMICS
            </Badge>
            <span className="text-xs text-[#666666] dark:text-gray-400">• Nag River & Ambazari Sub-Basin Watch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Waterlogging Risk Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Predictive modeling of street submergence, underpass flooding, and dewatering pump priority.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-[#E53935] text-white text-sm font-extrabold font-mono px-3 py-1">
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
      <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-[#111111] dark:text-white flex items-center gap-2">
            <Cpu className="size-5 text-[#FF8A00]" /> AI HydroRisk Diagnosis & Mitigation Plan
          </h3>
          <Button variant="outline" size="sm" render={<Link to="/ai-predictions" />} className="text-xs font-bold border-[#E5E5E5] text-[#111111] dark:text-white">
            Full AI Engine <ArrowRight className="size-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {severeZones.map(zone => (
            <div key={zone.id} className="p-4 rounded-xl border border-[#E53935]/30 bg-[#E53935]/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#111111] dark:text-white">{zone.name} Zone</span>
                <span className="text-xs font-mono font-bold text-[#E53935] bg-[#E53935]/10 px-2 py-0.5 rounded">
                  Risk Score: {zone.currentRiskScore}/100
                </span>
              </div>
              <p className="text-xs text-[#666666] dark:text-gray-400">
                Elevation: {zone.elevation}m • Drainage Blockage: {100 - zone.drainageCapacity}%
              </p>

              <div className="p-2.5 rounded-lg bg-white dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10 text-xs space-y-1">
                <span className="font-bold text-[#FF8A00] block">Recommended Civic Mitigation:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[#111111] dark:text-gray-200">
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
