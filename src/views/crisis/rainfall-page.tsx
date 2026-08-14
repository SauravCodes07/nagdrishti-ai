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
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-bhagwa text-white font-mono text-[10px]">
              DOPPLER RADAR TELEMETRY
            </Badge>
            <span className="text-xs text-muted-foreground">• Real-time Rain Gauge Station Grid</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Nagpur Rainfall Monitor & Forecast
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Precipitation telemetry, cloudburst warning system, and 24-hour predictive forecast.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border">
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground font-bold uppercase block">Current Rainfall</span>
            <span className="text-2xl font-black text-bhagwa font-mono">{currentRainfallMm} mm/hr</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600">
            <Droplets className="size-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">24h Total Rain</span>
            <span className="text-xl font-bold font-mono text-foreground">{CURRENT_WEATHER_SUMMARY.total24hRainfallMm} mm</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-bhagwa/10 text-bhagwa">
            <CloudRain className="size-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Peak Rate</span>
            <span className="text-xl font-bold font-mono text-foreground">{CURRENT_WEATHER_SUMMARY.peakRainfallRateMmHr} mm/hr</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-600">
            <Wind className="size-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Wind Velocity</span>
            <span className="text-xl font-bold font-mono text-foreground">{CURRENT_WEATHER_SUMMARY.windSpeedKmh} km/h</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600">
            <Thermometer className="size-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Ambient Temp</span>
            <span className="text-xl font-bold font-mono text-foreground">{CURRENT_WEATHER_SUMMARY.temperatureC} °C</span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <RainfallChart />

      {/* Zone Wise Rainfall Forecast Table */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
          <Activity className="size-5 text-bhagwa" /> Zone-Wise 6-Hour Precipitation Forecast
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
              <tr>
                <th className="p-3">Nagpur Zone</th>
                <th className="p-3">Current Rainfall</th>
                <th className="p-3">3h Forecast</th>
                <th className="p-3">6h Forecast</th>
                <th className="p-3">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ZONE_RAINFALL_FORECAST.map(z => (
                <tr key={z.zoneId} className="hover:bg-muted/20">
                  <td className="p-3 font-bold text-foreground">{z.zoneName}</td>
                  <td className="p-3 font-mono font-semibold text-bhagwa">{z.currentMm} mm</td>
                  <td className="p-3 font-mono text-foreground">{z.forecast3hMm} mm</td>
                  <td className="p-3 font-mono text-foreground">{z.forecast6hMm} mm</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      z.trend === 'RISING' ? 'bg-rose-500/10 text-rose-600' : z.trend === 'STABLE' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
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
