"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Camera,
  Navigation,
  CloudRain,
  Activity,
  Droplets,
  Car,
  Bell,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import {
  ScrollReveal,
  AnimatedCounter,
  HoverLiftCard,
  RiskPulse,
  StaggerGrid,
  StaggerItem,
  AnimatedIcon,
} from "../../components/motion";

const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[440px] rounded-2xl bg-[#F1F5F9] dark:bg-[#162235] flex items-center justify-center text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
      Loading GIS Map Layer...
    </div>
  ),
});

import { getRiskZones, getReports, getBroadcastAlerts, getWeather, DEFAULT_RISK_ZONES, DEFAULT_WEATHER } from "../../lib/api";

export default function AppDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState(DEFAULT_RISK_ZONES);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(DEFAULT_WEATHER);
  const [selectedZone, setSelectedZone] = useState(() => DEFAULT_RISK_ZONES[1] || DEFAULT_RISK_ZONES[0]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [zData, rData, aData, wData] = await Promise.allSettled([
        getRiskZones(),
        getReports(),
        getBroadcastAlerts(),
        getWeather(),
      ]);

      if (zData.status === "fulfilled" && Array.isArray(zData.value)) {
        setZones(zData.value);
        const sorted = [...zData.value].sort(
          (a, b) => (b.latest_risk_score ?? b.risk_score ?? 0) - (a.latest_risk_score ?? a.risk_score ?? 0)
        );
        if (sorted.length > 0) setSelectedZone(sorted[0]);
      }
      if (rData.status === "fulfilled" && Array.isArray(rData.value)) {
        setReports(rData.value);
      }
      if (aData.status === "fulfilled" && Array.isArray(aData.value)) {
        setAlerts(aData.value);
      }
      if (wData.status === "fulfilled" && wData.value) {
        setWeather(wData.value);
      }
    } catch (err) {
      console.error("Dashboard feed error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const severeZonesCount = zones.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75)).length;
  const highZonesCount = zones.filter((z) => (z.risk_category === "High" || ((z.latest_risk_score ?? z.risk_score) >= 50 && (z.latest_risk_score ?? z.risk_score) < 75))).length;

  const highestRiskScore = zones.reduce((max, z) => Math.max(max, z.latest_risk_score ?? z.risk_score ?? 0), 0);
  const averageRiskScore = zones.length ? Math.round(zones.reduce((sum, z) => sum + (z.latest_risk_score ?? z.risk_score ?? 0), 0) / zones.length) : 24;

  const overallThreat = highestRiskScore >= 75 ? "Severe Flood Risk" : highestRiskScore >= 50 ? "High Risk Alert" : highestRiskScore >= 25 ? "Moderate Waterlogging" : "Low Risk (Normal)";
  const threatBg = highestRiskScore >= 75
    ? "bg-[#FEE2E2] text-[#991B1B] border-red-200 dark:bg-red-500/15 dark:text-[#F87171] dark:border-red-500/30"
    : highestRiskScore >= 50
    ? "bg-[#FFEDD5] text-[#9A3412] border-orange-200 dark:bg-orange-500/15 dark:text-[#FB923C] dark:border-orange-500/30"
    : highestRiskScore >= 25
    ? "bg-[#FEF9C3] text-[#854D0E] border-amber-200 dark:bg-amber-500/15 dark:text-[#FDE047] dark:border-amber-500/30"
    : "bg-[#DCFCE7] text-[#166534] border-emerald-200 dark:bg-emerald-500/15 dark:text-[#4ADE80] dark:border-emerald-500/30";

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {/* Top Header & Sync Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6]">
                City Risk Overview
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F5F9] dark:bg-[#162235] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#243244]">
                10 Administrative Wards
              </span>
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight mt-1">
              City Risk Overview
            </h1>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={loadData}
              disabled={loading}
              className="h-10 px-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              title="Refresh Feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0F766E] dark:text-[#14B8A6]" : ""}`} />
              <span>Sync Feeds</span>
            </motion.button>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/report"
                className="h-10 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Report Hazard</span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* 4 KPI Live Telemetry Cards with Spring Animated Counters */}
        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: IMD Rainfall */}
          <StaggerItem>
            <HoverLiftCard className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] h-full">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-medium uppercase tracking-wider">IMD Rainfall</span>
                <AnimatedIcon icon={CloudRain} type="wiggle" className="text-[#0F766E] dark:text-[#14B8A6]" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-baseline gap-1">
                <AnimatedCounter value={weather.rainfall_intensity_mm ?? 0} decimals={1} suffix=" mm/h" />
              </div>
              <div className="text-xs text-[#0F766E] dark:text-[#14B8A6] font-semibold truncate">
                {weather.condition || "Live Doppler Radar"}
              </div>
            </HoverLiftCard>
          </StaggerItem>

          {/* Card 2: Flooded Wards */}
          <StaggerItem>
            <HoverLiftCard riskCategory={severeZonesCount > 0 ? "Severe" : "Low"} className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] h-full">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-medium uppercase tracking-wider">Flooded Wards</span>
                <AnimatedIcon icon={Droplets} type="pulse" className="text-[#DC2626]" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-[#DC2626] dark:text-[#F87171] flex items-baseline gap-1">
                <AnimatedCounter value={severeZonesCount + highZonesCount} suffix={` / ${zones.length || 10}`} />
              </div>
              <div className="text-xs text-[#DC2626] dark:text-[#F87171] font-semibold">
                {severeZonesCount} Severe, {highZonesCount} High Risk
              </div>
            </HoverLiftCard>
          </StaggerItem>

          {/* Card 3: Safe Roads */}
          <StaggerItem>
            <HoverLiftCard className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] h-full">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-medium uppercase tracking-wider">Safe Road Index</span>
                <AnimatedIcon icon={Car} type="scale" className="text-[#16A34A]" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-[#16A34A] dark:text-[#4ADE80] flex items-baseline gap-1">
                <AnimatedCounter value={zones.length > 0 ? Math.round((1 - (severeZonesCount / zones.length)) * 100) : 92} suffix="%" />
              </div>
              <div className="text-xs text-[#16A34A] dark:text-[#4ADE80] font-semibold">
                OSM Graph Accessible
              </div>
            </HoverLiftCard>
          </StaggerItem>

          {/* Card 4: Reports */}
          <StaggerItem>
            <HoverLiftCard className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] space-y-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] h-full">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-medium uppercase tracking-wider">Citizen Reports</span>
                <AnimatedIcon icon={Activity} type="pulse" className="text-[#F59E0B]" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-baseline gap-1">
                <AnimatedCounter value={reports.length} />
              </div>
              <div className="text-xs text-[#854D0E] dark:text-[#FDE68A] font-semibold">
                Crowdsourced Ground Intel
              </div>
            </HoverLiftCard>
          </StaggerItem>
        </StaggerGrid>

        {/* City Threat Index Alert Bar */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`p-2.5 rounded-xl border ${threatBg}`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase text-[#64748B] dark:text-[#94A3B8]">City Assessment:</span>
                  <RiskPulse category={highestRiskScore >= 75 ? "Severe" : highestRiskScore >= 50 ? "High" : "Low"}>
                    <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${threatBg}`}>
                      {overallThreat}
                    </span>
                  </RiskPulse>
                </div>
                <p className="text-xs text-[#475569] dark:text-[#CBD5E1] mt-0.5">
                  Citywide Average Risk Score: <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold">{averageRiskScore}/100</strong>. Highest Basin Threat: <strong className="text-[#DC2626] font-semibold">{highestRiskScore}/100</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/route"
                  className="h-9 px-3.5 rounded-xl bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] border border-[#0F766E]/20 font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Find Safe Route</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/alerts"
                  className="h-9 px-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#334155] dark:text-[#CBD5E1] border border-[#CBD5E1] dark:border-[#334155] font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Broadcast Alerts</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Catchment Map */}
          <div className="lg:col-span-8 space-y-4">
            <ScrollReveal direction="up" delay={0.15}>
              <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      Live Conditions
                    </h2>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      Real-time risk categories across 10 municipal wards
                    </p>
                  </div>

                  <Link
                    href="/map"
                    className="text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline flex items-center gap-1"
                  >
                    <span>Full Map View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="h-[420px] w-full rounded-xl overflow-hidden relative border border-[#E2E8F0] dark:border-[#243244]">
                  <MapComponent
                    zones={zones}
                    reports={reports}
                    selectedZone={selectedZone}
                    onZoneClick={(z) => setSelectedZone(z)}
                  />
                </div>

                {/* Severity Legend */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-[#64748B] dark:text-[#94A3B8] border-t border-[#E2E8F0] dark:border-[#243244]">
                  <span className="font-semibold">Risk Legend:</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span>
                      <span>Low (&lt;25)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]"></span>
                      <span>Medium (25–49)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span>
                      <span>High (50–74)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
                      <span className="font-semibold text-[#DC2626] dark:text-[#F87171]">Severe (75+)</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Ward Telemetry Inspector & Quick Actions */}
          <div className="lg:col-span-4 space-y-4">
            {/* Selected Ward Telemetry Card */}
            <ScrollReveal direction="up" delay={0.2}>
              <HoverLiftCard
                riskCategory={selectedZone?.risk_category || "Low"}
                className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#243244] pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                    Zone Details
                  </span>
                  {selectedZone && (
                    <RiskPulse category={selectedZone.risk_category}>
                      <span
                        className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                          selectedZone.risk_category === "Severe"
                            ? "bg-[#FEE2E2] text-[#991B1B]"
                            : selectedZone.risk_category === "High"
                            ? "bg-[#FFEDD5] text-[#9A3412]"
                            : selectedZone.risk_category === "Medium"
                            ? "bg-[#FEF9C3] text-[#854D0E]"
                            : "bg-[#DCFCE7] text-[#166534]"
                        }`}
                      >
                        {selectedZone.risk_category || "Low"}
                      </span>
                    </RiskPulse>
                  )}
                </div>

                {selectedZone ? (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        {selectedZone.zone_name}
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        NMC Zone ID: {selectedZone.id || selectedZone.zone_id || "WZ-01"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244]">
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-medium block">Risk Score</span>
                        <span className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5 block">
                          <AnimatedCounter value={selectedZone.latest_risk_score ?? selectedZone.risk_score ?? 15} decimals={1} />
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244]">
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-medium block">Rainfall</span>
                        <span className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5 block">
                          <AnimatedCounter value={selectedZone.rainfall_mm ?? selectedZone.rainfall_intensity_mm ?? 18} decimals={1} suffix=" mm/h" />
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#475569] dark:text-[#CBD5E1] pt-1">
                      <div className="flex justify-between py-1 border-b border-[#E2E8F0] dark:border-[#243244]">
                        <span>Drainage Capacity:</span>
                        <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          {Math.round((selectedZone.drainage_capacity || 0.6) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#E2E8F0] dark:border-[#243244]">
                        <span>Elevation Factor:</span>
                        <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          {selectedZone.elevation_m ? `${selectedZone.elevation_m}m` : "Low-lying basin"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Dispatch Status:</span>
                        <span className="font-semibold text-[#0F766E] dark:text-[#14B8A6]">
                          {selectedZone.dispatch_status || "Standard Monitoring"}
                        </span>
                      </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        href={`/route?destination=${encodeURIComponent(selectedZone.zone_name)}`}
                        className="w-full h-10 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Route Safely to {selectedZone.zone_name}</span>
                      </Link>
                    </motion.div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-[#64748B] dark:text-[#94A3B8] text-xs">
                    Click any ward polygon on the map to inspect live metrics.
                  </div>
                )}
              </HoverLiftCard>
            </ScrollReveal>

            {/* Quick Action Shortcuts */}
            <ScrollReveal direction="up" delay={0.25}>
              <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-2">
                  Quick Actions
                </span>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/route"
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#243244] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          Safe Route Planner
                        </div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">A* flood-avoidance routing</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/report"
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#243244] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          Report Incident Photo
                        </div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Vision AI auto-verification</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/alerts"
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#243244] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          Civic Emergency Advisories
                        </div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">NMC official broadcasts</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                  </Link>
                </motion.div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
