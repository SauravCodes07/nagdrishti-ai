import React, { useState } from 'react';
import { BellRing, CheckCircle2 } from 'lucide-react';
import { getIncidents } from '../../services/incidents/incidentService';
import { getActiveConstructionProjects } from '../../services/construction/constructionService';
import { cn } from '../../lib/utils';

export const CitizenAlertsPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const incidents = getIncidents();
  const constructions = getActiveConstructionProjects();

  const userCenter: [number, number] = [21.1458, 79.0882];
  const calcDistKm = (target: [number, number]): string => {
    const [lat1, lon1] = userCenter;
    const [lat2, lon2] = target;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  const alerts = [
    ...incidents.map(inc => ({
      id: inc.id,
      category: inc.type,
      title: inc.title,
      location: inc.locationName,
      severity: inc.severity,
      timeAgo: inc.reportedTime,
      advice: inc.recommendedAction,
      distanceKm: calcDistKm(inc.coordinates),
      source: 'NMC Crisis Verification'
    })),
    ...constructions.map(c => ({
      id: c.id,
      category: 'CONSTRUCTION',
      title: c.projectName,
      location: c.locationName,
      severity: c.trafficImpact === 'SEVERE' ? 'SEVERE' : 'HIGH',
      timeAgo: 'Ongoing Project',
      advice: c.detourAdvice,
      distanceKm: calcDistKm(c.coordinates),
      source: 'Maha Metro / PWD'
    }))
  ];

  const filteredAlerts = alerts.filter(a => {
    if (filterType === 'ALL') return true;
    if (filterType === 'WATERLOGGING') return a.category === 'WATERLOGGING';
    if (filterType === 'CONSTRUCTION') return a.category === 'CONSTRUCTION';
    if (filterType === 'DAMAGE') return a.category === 'ROAD_DAMAGE';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111C2E] p-4 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-2">
        <div className="flex items-center gap-1.5">
          <BellRing className="size-4 text-[#E53935]" />
          <h1 className="text-xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Active Civic Safety Alerts
          </h1>
        </div>
        <p className="text-[11px] text-[#666666] dark:text-gray-400">
          Proximity-sorted alerts for waterlogged underpasses, road cave-ins, and construction detours in Nagpur.
        </p>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType('ALL')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
              filterType === 'ALL' ? "bg-[#FF8A00] text-white shadow-xs" : "bg-[#F7F7F7] dark:bg-[#0B1320] text-[#666666]"
            )}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilterType('WATERLOGGING')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
              filterType === 'WATERLOGGING' ? "bg-[#FF8A00] text-white shadow-xs" : "bg-[#F7F7F7] dark:bg-[#0B1320] text-[#666666]"
            )}
          >
            💧 Waterlogging
          </button>
          <button
            onClick={() => setFilterType('CONSTRUCTION')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
              filterType === 'CONSTRUCTION' ? "bg-[#FF8A00] text-white shadow-xs" : "bg-[#F7F7F7] dark:bg-[#0B1320] text-[#666666]"
            )}
          >
            🚧 Construction
          </button>
          <button
            onClick={() => setFilterType('DAMAGE')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
              filterType === 'DAMAGE' ? "bg-[#FF8A00] text-white shadow-xs" : "bg-[#F7F7F7] dark:bg-[#0B1320] text-[#666666]"
            )}
          >
            🕳️ Road Damage
          </button>
        </div>
      </div>

      {/* Alerts Feed List */}
      <div className="space-y-2.5">
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-2 hover:border-[#FFC107] transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[9px] font-mono font-bold px-2 py-0.5 rounded",
                    alert.severity === 'SEVERE'
                      ? "bg-[#E53935] text-white"
                      : "bg-[#FF8A00] text-white"
                  )}
                >
                  {alert.severity}
                </span>
                <span className="text-[10px] font-bold text-[#666666] dark:text-gray-400">
                  📍 {alert.distanceKm} km away
                </span>
              </div>

              <span className="text-[10px] text-[#666666] dark:text-gray-400">
                {alert.timeAgo}
              </span>
            </div>

            <h3 className="font-bold text-sm text-[#111111] dark:text-white">
              {alert.title}
            </h3>

            <p className="text-[11px] text-[#666666] dark:text-gray-300">
              📍 {alert.location}
            </p>

            <div className="p-2.5 rounded-xl bg-[#FFF8E1] dark:bg-[#FFC107]/10 border border-[#FFC107]/30 text-[11px] font-semibold text-[#111111] dark:text-gray-200">
              💡 <span className="text-[#FF8A00] font-bold">Advisory:</span> {alert.advice}
            </div>

            <div className="flex justify-between items-center text-[10px] text-[#666666] dark:text-gray-400 pt-1">
              <span>Source: {alert.source}</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="size-3" /> Live Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CitizenAlertsPage;
