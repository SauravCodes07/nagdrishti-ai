import React from 'react';
import { RainfallChart } from '../../components/crisis/rainfall-chart';
import { ZONE_RAINFALL_FORECAST, CURRENT_WEATHER_SUMMARY } from '../../data/crisis/rainfall-data';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { CloudRain, Wind, Droplets, Thermometer, Activity } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

const RainfallPage: React.FC = () => {
  const { currentRainfallMm } = useDemoSimulation();

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#FFC107] text-[#111111] font-mono text-[10px] font-black">
              DOPPLER RADAR TELEMETRY
            </Badge>
            <span className="text-xs text-[#666666] dark:text-gray-400">• Real-time Rain Gauge Station Grid</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Nagpur Rainfall Monitor & Forecast
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Precipitation telemetry, cloudburst warning system, and 24-hour predictive forecast.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#FFF8E1] dark:bg-[#FFC107]/10 p-3 rounded-xl border border-[#FFC107]/30">
          <div className="text-right">
            <span className="text-[10px] text-[#666666] dark:text-gray-400 font-bold uppercase block">Current Rainfall</span>
            <span className="text-2xl font-black text-[#FF8A00] font-mono">{currentRainfallMm} mm/hr</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111C2E] p-4 rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600">
            <Droplets className="size-6" />
          </div>
          <div>
            <span className="text-xs text-[#666666] dark:text-gray-400 block">24h Total Rain</span>
            <span className="text-xl font-bold font-mono text-[#111111] dark:text-white">{CURRENT_WEATHER_SUMMARY.total24hRainfallMm} mm</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111C2E] p-4 rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-[#FF8A00]/10 text-[#FF8A00]">
            <CloudRain className="size-6" />
          </div>
          <div>
            <span className="text-xs text-[#666666] dark:text-gray-400 block">Peak Rate</span>
            <span className="text-xl font-bold font-mono text-[#111111] dark:text-white">{CURRENT_WEATHER_SUMMARY.peakRainfallRateMmHr} mm/hr</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111C2E] p-4 rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-600">
            <Wind className="size-6" />
          </div>
          <div>
            <span className="text-xs text-[#666666] dark:text-gray-400 block">Wind Velocity</span>
            <span className="text-xl font-bold font-mono text-[#111111] dark:text-white">{CURRENT_WEATHER_SUMMARY.windSpeedKmh} km/h</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111C2E] p-4 rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-lg bg-[#22A447]/10 text-[#22A447]">
            <Thermometer className="size-6" />
          </div>
          <div>
            <span className="text-xs text-[#666666] dark:text-gray-400 block">Ambient Temp</span>
            <span className="text-xl font-bold font-mono text-[#111111] dark:text-white">{CURRENT_WEATHER_SUMMARY.temperatureC} °C</span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <RainfallChart />

      {/* Zone Wise Rainfall Forecast Table */}
      <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-[#111111] dark:text-white flex items-center gap-2">
          <Activity className="size-5 text-[#FF8A00]" /> Zone-Wise 6-Hour Precipitation Forecast
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F7F7] dark:bg-[#0B1320] text-[#666666] dark:text-gray-400 uppercase text-[10px] font-bold border-b border-[#E5E5E5] dark:border-white/10">
              <tr>
                <th className="p-3">Nagpur Zone</th>
                <th className="p-3">Current Rainfall</th>
                <th className="p-3">3h Forecast</th>
                <th className="p-3">6h Forecast</th>
                <th className="p-3">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-white/10">
              {ZONE_RAINFALL_FORECAST.map(z => (
                <tr key={z.zoneId} className="hover:bg-[#F7F7F7]/60 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-[#111111] dark:text-white">{z.zoneName}</td>
                  <td className="p-3 font-mono font-semibold text-[#FF8A00]">{z.currentMm} mm</td>
                  <td className="p-3 font-mono text-[#111111] dark:text-white">{z.forecast3hMm} mm</td>
                  <td className="p-3 font-mono text-[#111111] dark:text-white">{z.forecast6hMm} mm</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      z.trend === 'RISING' ? 'bg-[#E53935]/10 text-[#E53935]' : z.trend === 'STABLE' ? 'bg-[#FFC107]/20 text-[#111111] dark:text-[#FFC107]' : 'bg-[#22A447]/10 text-[#22A447]'
                    }`}>
                      {z.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RainfallPage;
