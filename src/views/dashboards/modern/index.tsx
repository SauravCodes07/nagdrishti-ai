import React, { useEffect, useState } from 'react';
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
import { CloudRain, Navigation, User } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Link } from 'react-router';
import { fetchNagpurWeather, WeatherData } from '../../../services/weather/weatherService';

const ModernDashboard: React.FC = () => {
  const { currentRainfallMm } = useDemoSimulation();
  const [liveWeather, setLiveWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetchNagpurWeather().then(setLiveWeather);
  }, []);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Top Header & Status Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111C2E] rounded-2xl p-4 sm:p-6 border border-[#E5E5E5] dark:border-white/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22A447] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22A447]"></span>
            </span>
            <span className="text-xs font-bold text-[#22A447] uppercase tracking-wider font-mono">
              🟢 COMMAND CENTER ACTIVE
            </span>
            <span className="text-xs text-[#666666] dark:text-gray-400">• Nagpur Municipal Corporation (NMC)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Nagpur Crisis Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Real-time GeoAI predictive intelligence for waterlogging, construction impact, traffic, and emergency response across Nagpur.
          </p>
        </div>

        {/* Right Quick Weather & Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Live Open-Meteo Weather Badge */}
          <div className="flex items-center gap-3 bg-[#FFF8E1] dark:bg-[#FFC107]/10 border border-[#FFC107]/30 px-3.5 py-2 rounded-xl text-xs">
            <div className="p-2 rounded-lg bg-[#FF8A00] text-white">
              <CloudRain className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-[#111111] dark:text-white font-mono leading-none">
                  {currentRainfallMm} mm
                </span>
                {liveWeather?.isLive && (
                  <Badge className="bg-blue-600 text-white text-[8px] font-mono font-bold">
                    OPEN-METEO
                  </Badge>
                )}
                <Badge className="bg-[#E53935] text-white text-[9px] font-bold">
                  HEAVY ALERT
                </Badge>
              </div>
              <span className="text-[11px] text-[#666666] dark:text-gray-400">
                {liveWeather ? liveWeather.weatherDescription : 'High Rainfall in West Nagpur'}
              </span>
            </div>
          </div>

          <CitizenReportModal />

          <Button
            variant="outline"
            render={<Link to="/safe-route" />}
            className="gap-1.5 font-bold text-xs border-[#E5E5E5] dark:border-white/10 text-[#111111] dark:text-white hover:bg-[#F7F7F7]"
          >
            <Navigation className="size-4 text-[#22A447]" /> Safe Route
          </Button>

          <Button
            variant="outline"
            render={<Link to="/citizen" />}
            className="gap-1.5 font-bold text-xs border-[#FF8A00]/40 text-[#FF8A00] hover:bg-[#FF8A00]/10"
          >
            <User className="size-4" /> Citizen View
          </Button>
        </div>
      </div>

      {/* Demo Simulation Controller */}
      <DemoSimulationBar />

      {/* Nagpur Heritage Civic Banner */}
      <NagpurHeritageBanner />

      {/* Crisis KPI Cards */}
      <section>
        <CrisisKpiCards />
      </section>

      {/* Main Interactive Map & Urgent Alerts Section */}
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
