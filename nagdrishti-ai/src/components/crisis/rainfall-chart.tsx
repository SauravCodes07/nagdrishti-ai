import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { HOURLY_RAINFALL } from '../../data/crisis/rainfall-data';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { CloudRain } from 'lucide-react';
import { Badge } from '../ui/badge';

export const RainfallChart: React.FC = () => {
  const { currentRainfallMm } = useDemoSimulation();

  return (
    <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-bhagwa/10 text-bhagwa">
            <CloudRain className="size-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground tracking-tight flex items-center gap-2">
              Rainfall Trend & Forecast
              <Badge className="bg-bhagwa text-white text-[10px] font-mono">
                {currentRainfallMm} mm/hr
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time Doppler radar & 24h forecast model
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-1 bg-muted rounded font-bold text-foreground">
            Peak: 85 mm (02:00 PM)
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={HOURLY_RAINFALL}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'gray' }} />
            <YAxis tick={{ fontSize: 10, fill: 'gray' }} unit="mm" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Area
              type="monotone"
              dataKey="rainfallMm"
              name="Recorded Rainfall (mm)"
              stroke="#f97316"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRain)"
            />
            <Area
              type="monotone"
              dataKey="forecast"
              name="AI Predictive Forecast (mm)"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorForecast)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
