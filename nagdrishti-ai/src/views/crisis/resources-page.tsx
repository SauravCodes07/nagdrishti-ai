import React from 'react';
import { CRISIS_RESOURCES, RESOURCE_SUMMARY } from '../../data/crisis/resource-data';
import { Badge } from '../../components/ui/badge';

const ResourcesPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-bhagwa text-white font-mono text-[10px]">
              CIVIC LOGISTICS INVENTORY
            </Badge>
            <span className="text-xs text-muted-foreground">• NMC Equipment & Fleet Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Resource Inventory & Deployment Status
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Dewatering pumps, road repair units, traffic police squads, barricades, and disaster rescue craft.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500 text-white font-extrabold text-xs px-3 py-1 font-mono">
            {RESOURCE_SUMMARY.deploymentPercentage}% Deployed
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <span className="text-xs text-muted-foreground block">Total Resources</span>
          <span className="text-2xl font-bold font-mono text-foreground">{RESOURCE_SUMMARY.totalResources}</span>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <span className="text-xs text-muted-foreground block">Active Deployed</span>
          <span className="text-2xl font-bold font-mono text-bhagwa">{RESOURCE_SUMMARY.totalDeployed}</span>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <span className="text-xs text-muted-foreground block">Reserve Available</span>
          <span className="text-2xl font-bold font-mono text-emerald-600">{RESOURCE_SUMMARY.totalAvailable}</span>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <span className="text-xs text-muted-foreground block">In Maintenance</span>
          <span className="text-2xl font-bold font-mono text-muted-foreground">{RESOURCE_SUMMARY.totalInMaintenance}</span>
        </div>
      </div>

      {/* Resource Inventory List */}
      <div className="space-y-4">
        {CRISIS_RESOURCES.map(res => (
          <div key={res.id} className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-bhagwa bg-bhagwa/10 px-2 py-0.5 rounded">
                  {res.id} • {res.type}
                </span>
                <h3 className="text-base font-bold text-foreground mt-1">{res.name}</h3>
              </div>

              <span className={`text-xs font-bold px-2.5 py-1 rounded font-mono ${
                res.status === 'HIGH_DEMAND' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {res.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-muted/30 p-3 rounded-xl">
              <div>
                <span className="text-muted-foreground text-[10px] block">Total Owned</span>
                <span className="font-bold text-foreground font-mono text-sm">{res.totalQuantity}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block">Currently Deployed</span>
                <span className="font-bold text-bhagwa font-mono text-sm">{res.deployedQuantity}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block">Reserve Standby</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">{res.availableQuantity}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block">Capacity Spec</span>
                <span className="font-bold text-foreground text-[11px] truncate block">{res.capacityMetric}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              📍 Primary Assignment: <strong className="text-foreground">{res.assignedLocation}</strong>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcesPage;
