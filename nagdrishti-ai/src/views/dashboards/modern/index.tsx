import React from 'react';
import { useDemoSimulation } from '../../../context/DemoSimulationContext';
import { DemoSimulationBar } from '../../../components/crisis/demo-simulation-bar';
import { NagpurHeritageBanner } from '../../../components/crisis/nagpur-heritage-banner';
import { CrisisKpiCards } from '../../../components/crisis/crisis-kpi-cards';
import { LiveCrisisMap } from '../../../components/crisis/live-crisis-map';
import { UrgentAlerts } from '../../../components/crisis/urgent-alerts';
import { RainfallChart } from '../../../components/crisis/rainfall-chart';
import { TopAffectedAreas } from '../../../components/crisis/top-affected-areas';
import { IncidentStatsChart } from '../../../components/crisis/incident-stats-chart';
import { ResponsePriority } from '../../../components/crisis/response-priority';
import { CitizenReportModal } from '../../../components/crisis/citizen-report-modal';
import { CloudRain, Navigation } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Link } from 'react-router';

const ModernDashboard: React.FC = () => {
  const { currentRainfallMm } = useDemoSimulation();

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Top Header & Status Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider font-mono">
              🟢 LIVE MONITORING
            </span>
            <span className="text-xs text-muted-foreground">• Updated 2 mins ago</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Nagpur Crisis Command Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time AI-powered urban risk intelligence & flood mitigation for Nagpur Municipal Corporation
          </p>
        </div>

        {/* Right Quick Weather Badge & Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 bg-bhagwa/10 border border-bhagwa/20 px-3.5 py-2 rounded-xl text-xs">
            <div className="p-2 rounded-lg bg-bhagwa text-white">
              <CloudRain className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-base text-foreground font-mono leading-none">
                  {currentRainfallMm} mm
                </span>
                <Badge className="bg-rose-500 text-white text-[9px] font-bold">
                  HEAVY ALERT
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">
                High Rainfall Expected in West Nagpur
              </span>
            </div>
          </div>

          <CitizenReportModal />

          <Button variant="outline" render={<Link to="/safe-route" />} className="gap-1.5 font-bold text-xs">
            <Navigation className="size-4 text-emerald-600" /> Safe Route
          </Button>
        </div>
      </div>

      {/* Hackathon Demo Simulation Controller */}
      <DemoSimulationBar />

      {/* Nagpur Heritage Civic Banner */}
      <NagpurHeritageBanner />

      {/* Crisis KPI Cards */}
      <section>
        <CrisisKpiCards />
      </section>

      {/* Main Interactive Leaflet Map & Urgent Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <LiveCrisisMap />
        </div>
        <div className="lg:col-span-4">
          <UrgentAlerts />
        </div>
      </div>

      {/* AI Actionable Priorities & Top Affected Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ResponsePriority />
        </div>
        <div className="lg:col-span-5">
          <TopAffectedAreas />
        </div>
      </div>

      {/* Rainfall Trend & Incident Statistics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <RainfallChart />
        </div>
        <div className="lg:col-span-5">
          <IncidentStatsChart />
        </div>
      </div>

    </div>
  );
};

export default ModernDashboard;
