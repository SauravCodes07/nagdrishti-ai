import React from 'react';
import { CRISIS_RESOURCES, RESOURCE_SUMMARY } from '../../data/crisis/resource-data';
import { Badge } from '../../components/ui/badge';

const ResourcesPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#FFC107] text-[#111111] font-mono text-[10px] font-black">
              CIVIC LOGISTICS INVENTORY
            </Badge>
            <span className="text-xs text-[#666666] dark:text-gray-400">• NMC Equipment & Fleet Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Resource Inventory & Deployment Status
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Dewatering pumps, road repair units, traffic police squads, barricades, and disaster rescue craft.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-[#22A447] text-white font-extrabold text-xs px-3 py-1 font-mono">
            {RESOURCE_SUMMARY.deploymentPercentage}% Deployed
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111C2E] p-4 rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-xs">
          <span className="text-xs text-[#666666] dark:text-gray-400 block">Total Resources</span>
          <span className="text-2xl font-bold font-mono text-[#111111] dark:text-white">{RESOURCE_SUMMARY.totalResources}</span>
        </div>
        <div className="bg-white dark:bg-[#111C2E] p-4 rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-xs">
          <span className="text-xs text-[#666666] dark:text-gray-400 block">Active Deployed</span>
          <span className="text-2xl font-bold font-mono text-[#FF8A00]">{RESOURCE_SUMMARY.totalDeployed}</span>
        </div>
        <div className="bg-white dark:bg-[#111C2E] p-4 rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-xs">
          <span className="text-xs text-[#666666] dark:text-gray-400 block">Reserve Available</span>
          <span className="text-2xl font-bold font-mono text-[#22A447]">{RESOURCE_SUMMARY.totalAvailable}</span>
        </div>
        <div className="bg-white dark:bg-[#111C2E] p-4 rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-xs">
          <span className="text-xs text-[#666666] dark:text-gray-400 block">In Maintenance</span>
          <span className="text-2xl font-bold font-mono text-[#666666] dark:text-gray-400">{RESOURCE_SUMMARY.totalInMaintenance}</span>
        </div>
      </div>

      {/* Resource Inventory List */}
      <div className="space-y-4">
        {CRISIS_RESOURCES.map(res => (
          <div key={res.id} className="bg-white dark:bg-[#111C2E] rounded-2xl p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#111111] dark:text-white bg-[#FFF8E1] dark:bg-[#FFC107]/20 border border-[#FFC107] px-2 py-0.5 rounded">
                  {res.id} • {res.type}
                </span>
                <h3 className="text-base font-bold text-[#111111] dark:text-white mt-1">{res.name}</h3>
              </div>

              <span className={`text-xs font-bold px-2.5 py-1 rounded font-mono ${
                res.status === 'HIGH_DEMAND' ? 'bg-[#FFC107] text-[#111111]' : 'bg-[#22A447] text-white'
              }`}>
                {res.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-[#F7F7F7] dark:bg-[#0B1320] p-3 rounded-xl border border-[#E5E5E5] dark:border-white/10">
              <div>
                <span className="text-[#666666] dark:text-gray-400 text-[10px] block">Total Owned</span>
                <span className="font-bold text-[#111111] dark:text-white font-mono text-sm">{res.totalQuantity}</span>
              </div>
              <div>
                <span className="text-[#666666] dark:text-gray-400 text-[10px] block">Currently Deployed</span>
                <span className="font-bold text-[#FF8A00] font-mono text-sm">{res.deployedQuantity}</span>
              </div>
              <div>
                <span className="text-[#666666] dark:text-gray-400 text-[10px] block">Reserve Standby</span>
                <span className="font-bold text-[#22A447] font-mono text-sm">{res.availableQuantity}</span>
              </div>
              <div>
                <span className="text-[#666666] dark:text-gray-400 text-[10px] block">Capacity Spec</span>
                <span className="font-bold text-[#111111] dark:text-white text-[11px] truncate block">{res.capacityMetric}</span>
              </div>
            </div>

            <p className="text-xs text-[#666666] dark:text-gray-400">
              📍 Primary Assignment: <strong className="text-[#111111] dark:text-white">{res.assignedLocation}</strong>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcesPage;
