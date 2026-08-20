"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  CloudRain,
  Activity,
  Layers,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  Sliders,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../../components/layouts/AdminLayout";
import { getAdminAnalytics, getRiskZones, updateDispatchStatus } from "../../../lib/api";
import {
  HoverLiftCard,
  RiskPulse,
  AnimatedCounter,
} from "../../../components/motion";

const MapComponent = dynamic(() => import("../../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[460px] rounded-2xl bg-[#F1F5F9] dark:bg-[#162235] flex items-center justify-center text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
      Loading GIS Ward Boundaries...
    </div>
  ),
});

export default function AdminZonesPage() {
  const [analytics, setAnalytics] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsData, zonesData] = await Promise.all([
        getAdminAnalytics(),
        getRiskZones(),
      ]);
      if (analyticsData) setAnalytics(analyticsData);
      if (Array.isArray(zonesData)) {
        setZones(zonesData);
        if (!selectedZoneId && zonesData.length > 0) {
          setSelectedZoneId(zonesData[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load zone analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (zoneId, newStatus) => {
    try {
      setUpdatingId(zoneId);
      await updateDispatchStatus(zoneId, newStatus);
      await fetchData();
    } catch (err) {
      console.error("Failed to update dispatch status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const selectedBreakdown = analytics?.zone_breakdowns?.find(
    (z) => z.zone_id === selectedZoneId
  ) || analytics?.zone_breakdowns?.[0];

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Severe":
        return "bg-[#FEE2E2] text-[#991B1B] dark:bg-red-500/20 dark:text-[#F87171] border-red-500/30";
      case "High":
        return "bg-[#FFEDD5] text-[#9A3412] dark:bg-orange-500/20 dark:text-[#FB923C] border-orange-500/30";
      case "Medium":
        return "bg-[#FEF9C3] text-[#854D0E] dark:bg-amber-500/20 dark:text-[#FDE68A] border-amber-500/30";
      default:
        return "bg-[#DCFCE7] text-[#166534] dark:bg-green-500/20 dark:text-[#4ADE80] border-green-500/30";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Zone Risk Factor Decomposition
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
              Explainable AI risk scoring formula across all 10 Nagpur administrative zones
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] transition shadow-sm flex items-center gap-1.5 self-start cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0F766E] dark:text-[#14B8A6]" : ""}`} />
            <span>Refresh Analytics</span>
          </motion.button>
        </div>

        {/* Formula Explainer Bar */}
        <HoverLiftCard className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-sm space-y-2.5">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
              Dynamic Municipal Risk Formulation
            </h2>
          </div>
          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1220] border border-[#CBD5E1] dark:border-[#334155] font-mono text-xs text-[#0F172A] dark:text-[#F8FAFC] overflow-x-auto leading-relaxed">
            <span className="font-bold text-[#0F766E] dark:text-[#14B8A6]">Score = </span>
            <span className="text-blue-600 dark:text-blue-400">0.35 × Rainfall</span> +{" "}
            <span className="text-amber-600 dark:text-amber-400">0.25 × Drainage Deficit</span> +{" "}
            <span className="text-purple-600 dark:text-purple-400">0.15 × Elevation Factor</span> +{" "}
            <span className="text-emerald-600 dark:text-emerald-400">0.15 × 30d Historical</span> +{" "}
            <span className="text-red-600 dark:text-red-400">0.10 × 24h Reports</span>
          </div>
        </HoverLiftCard>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: All Zones Table / List */}
          <div className="lg:col-span-5 bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#243244]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                Nagpur Administrative Wards ({analytics?.zone_breakdowns?.length || zones.length})
              </span>
              <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                Select to inspect factors
              </span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {analytics?.zone_breakdowns?.map((zb) => {
                const isSelected = zb.zone_id === (selectedBreakdown?.zone_id || selectedZoneId);
                return (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    key={zb.zone_id}
                    onClick={() => setSelectedZoneId(zb.zone_id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-[#CCFBF1]/30 dark:bg-teal-500/10 border-[#0F766E] dark:border-[#14B8A6]"
                        : "bg-[#F8FAFC] dark:bg-[#0B0F17] hover:bg-[#F1F5F9] dark:hover:bg-[#162235] border-[#E2E8F0] dark:border-[#243244]"
                    }`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                          {zb.zone_name}
                        </p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getCategoryBadgeClass(zb.category)}`}>
                          {zb.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        Rainfall: {zb.components?.rainfall?.raw_val_mm || 0} mm • Dispatch: {zb.dispatch_status}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {zb.total_score}%
                      </span>
                      <span className="block text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                        Risk Index
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Factor Decomposition Card & GIS Map */}
          <div className="lg:col-span-7 space-y-6">
            {selectedBreakdown ? (
              <HoverLiftCard className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-sm space-y-6">
                {/* Zone Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] dark:border-[#243244]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {selectedBreakdown.zone_name} Ward
                      </h2>
                      <RiskPulse category={selectedBreakdown.category}>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getCategoryBadgeClass(selectedBreakdown.category)}`}>
                          {selectedBreakdown.category} Alert ({selectedBreakdown.total_score}%)
                        </span>
                      </RiskPulse>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                      Computed using live rainfall telemetry & municipal GIS layers
                    </p>
                  </div>

                  {/* Dispatch Status Action */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">
                      Dispatch:
                    </span>
                    <select
                      value={selectedBreakdown.dispatch_status}
                      onChange={(e) => handleStatusChange(selectedBreakdown.zone_id, e.target.value)}
                      disabled={updatingId === selectedBreakdown.zone_id}
                      className="px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6]"
                    >
                      <option value="Unassigned">Unassigned</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* 5-Factor Decomposition Progress Bars with Spring Motion Animation */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                    Component Weight Contribution Breakdown
                  </h3>

                  {/* 1. Rainfall (35%) */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        1. Live Rainfall Intensity (35% weight)
                      </span>
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        +{selectedBreakdown.components?.rainfall?.weighted_contribution} pts ({selectedBreakdown.components?.rainfall?.raw_val_mm} mm)
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] dark:bg-[#334155] h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedBreakdown.components?.rainfall?.normalized_score || 0}%` }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className="bg-blue-600 h-full rounded-full"
                      />
                    </div>
                  </div>

                  {/* 2. Drainage Deficit (25%) */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        2. Drainage Infrastructure Deficit (25% weight)
                      </span>
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        +{selectedBreakdown.components?.drainage_deficit?.weighted_contribution} pts (Capacity: {Math.round((1 - selectedBreakdown.components?.drainage_deficit?.deficit_score / 100) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] dark:bg-[#334155] h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedBreakdown.components?.drainage_deficit?.deficit_score || 0}%` }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className="bg-amber-500 h-full rounded-full"
                      />
                    </div>
                  </div>

                  {/* 3. Elevation Factor (15%) */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        3. Basin Topography & Low-Elevation (15% weight)
                      </span>
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        +{selectedBreakdown.components?.elevation?.weighted_contribution} pts
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] dark:bg-[#334155] h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedBreakdown.components?.elevation?.normalized_score || 0}%` }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className="bg-purple-500 h-full rounded-full"
                      />
                    </div>
                  </div>

                  {/* 4. Historical Incidents (15%) */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        4. 30-Day Historical Verified Incidents (15% weight)
                      </span>
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        +{selectedBreakdown.components?.historical_incidents?.weighted_contribution} pts ({selectedBreakdown.components?.historical_incidents?.verified_30d_count} verified)
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] dark:bg-[#334155] h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedBreakdown.components?.historical_incidents?.normalized_score || 0}%` }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className="bg-emerald-500 h-full rounded-full"
                      />
                    </div>
                  </div>

                  {/* 5. Recent Report Density (10%) */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        5. 24-Hour Crowdsourced Report Density (10% weight)
                      </span>
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        +{selectedBreakdown.components?.report_density?.weighted_contribution} pts ({selectedBreakdown.components?.report_density?.recent_24h_count} active reports)
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] dark:bg-[#334155] h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedBreakdown.components?.report_density?.normalized_score || 0}%` }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className="bg-red-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Ward GIS Map */}
                <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#243244]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                    Ward Spatial Boundary Map
                  </span>
                  <div className="h-64 w-full rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#243244] relative">
                    <MapComponent zones={zones} />
                  </div>
                </div>
              </HoverLiftCard>
            ) : (
              <div className="p-12 text-center text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                Loading zone analytics breakdown...
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
