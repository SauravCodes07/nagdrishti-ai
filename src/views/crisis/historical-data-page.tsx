import React from 'react';
import { BarChart2 } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const HISTORICAL_YEARLY = [
  { year: '2021', rainfall: 1120, floodEvents: 14, potholesRepaired: 840 },
  { year: '2022', rainfall: 1280, floodEvents: 18, potholesRepaired: 1120 },
  { year: '2023', rainfall: 1450, floodEvents: 22, potholesRepaired: 1480 },
  { year: '2024', rainfall: 1390, floodEvents: 16, potholesRepaired: 1320 },
  { year: '2025', rainfall: 1520, floodEvents: 12, potholesRepaired: 980 }, // AI deployment reduced flood events!
];

const HistoricalDataPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#FFC107] text-[#111111] font-mono text-[10px] font-black">
              5-YEAR MONSOON HISTORICAL ARCHIVE
            </Badge>
            <span className="text-xs text-[#666666] dark:text-gray-400">• NMC Historical Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Historical Flood & Rainfall Archive
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Comparative analysis of past cloudburst events, flood mitigation performance, and road repair history.
          </p>
        </div>

        <Badge className="bg-[#22A447] text-white font-bold text-xs px-3 py-1 font-mono">
          -45% Flood Duration Improvement
        </Badge>
      </div>

      <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-[#111111] dark:text-white flex items-center gap-2">
          <BarChart2 className="size-5 text-[#FF8A00]" /> Annual Monsoon Flood Events vs Annual Rainfall
        </h3>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={HISTORICAL_YEARLY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#666666' }} />
              <YAxis tick={{ fontSize: 11, fill: '#666666' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E5E5',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="rainfall" name="Annual Rainfall (mm)" fill="#FFC107" radius={[4, 4, 0, 0]} />
              <Bar dataKey="floodEvents" name="Major Flood Incidents" fill="#E53935" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HistoricalDataPage;
