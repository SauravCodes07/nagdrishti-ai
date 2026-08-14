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
    <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-4 sm:p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#FF8A00]/10 text-[#FF8A00]">
            <CloudRain className="size-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#111111] dark:text-white tracking-tight flex items-center gap-2">
              Rainfall Trend & Forecast
              <Badge className="bg-[#FFC107] text-[#111111] text-[10px] font-mono font-black">
                {currentRainfallMm} mm/hr
              </Badge>
            </h3>
            <p className="text-xs text-[#666666] dark:text-gray-400">
              Real-time Doppler radar & 24h forecast model
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10 rounded-lg font-bold text-[#111111] dark:text-white">
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
                <stop offset="5%" stopColor="#FFC107" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#FFC107" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#FF8A00" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" opacity={0.6} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#666666' }} />
            <YAxis tick={{ fontSize: 10, fill: '#666666' }} unit="mm" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E5E5',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#111111',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Area
              type="monotone"
              dataKey="rainfallMm"
              name="Recorded Rainfall (mm)"
              stroke="#FFC107"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRain)"
            />
            <Area
              type="monotone"
              dataKey="forecast"
              name="AI Predictive Forecast (mm)"
              stroke="#FF8A00"
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
