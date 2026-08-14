import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { useDemoSimulation } from '../../context/DemoSimulationContext';

export const IncidentStatsChart: React.FC = () => {
  const { kpis } = useDemoSimulation();

  const data = [
    { name: 'Waterlogging', value: Math.round(kpis.activeIncidentsCount * 0.42), color: '#E53935' },
    { name: 'Road Damage & Potholes', value: Math.round(kpis.activeIncidentsCount * 0.28), color: '#FF8A00' },
    { name: 'Traffic Congestion', value: Math.round(kpis.activeIncidentsCount * 0.18), color: '#FFC107' },
    { name: 'Drainage Overflow', value: Math.round(kpis.activeIncidentsCount * 0.08), color: '#0284C7' },
    { name: 'Fallen Trees & Other', value: Math.max(1, Math.round(kpis.activeIncidentsCount * 0.04)), color: '#8B5CF6' },
  ];

  return (
    <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-4 sm:p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#FF8A00]/10 text-[#FF8A00]">
            <PieIcon className="size-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#111111] dark:text-white tracking-tight">
              Incident Breakdown
            </h3>
            <p className="text-xs text-[#666666] dark:text-gray-400">
              Categories of active crisis reports
            </p>
          </div>
        </div>
      </div>

      <div className="w-full h-60 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
