"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  Filter,
  RefreshCw,
  Camera,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import CitizenLayout from "../../components/layouts/CitizenLayout";

const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] rounded-2xl bg-[#F1F5F9] dark:bg-[#162235] flex items-center justify-center text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
      Loading GIS Map Layer...
    </div>
  ),
});
import { getRiskZones, getReports, getWeather } from "../../lib/api";

export default function MapPage() {
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [weather, setWeather] = useState({ condition: "Showers", rainfall_intensity_mm: 18.5 });
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("all");
  const [selectedZone, setSelectedZone] = useState(null);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const [zRes, rRes, wRes] = await Promise.allSettled([
        getRiskZones(),
        getReports(),
        getWeather(),
      ]);

      if (zRes.status === "fulfilled" && Array.isArray(zRes.value)) {
        setZones(zRes.value);
        if (!selectedZone && zRes.value.length > 0) {
          const severe = zRes.value.find((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75));
          setSelectedZone(severe || zRes.value[0]);
        }
      }
      if (rRes.status === "fulfilled" && Array.isArray(rRes.value)) {
        setReports(rRes.value);
      }
      if (wRes.status === "fulfilled" && wRes.value) {
        setWeather(wRes.value);
      }
    } catch (err) {
      console.error("Failed to load map data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  const filteredZones = zones.filter((z) => {
    if (filterMode === "all") return true;
    const cat = (z.risk_category || "").toLowerCase();
    return cat === filterMode.toLowerCase();
  });

  const severeZonesCount = zones.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75)).length;
  const highZonesCount = zones.filter((z) => (z.risk_category === "High" || ((z.latest_risk_score ?? z.risk_score) >= 50 && (z.latest_risk_score ?? z.risk_score) < 75))).length;

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Live Risk Map
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
              Real-time catchment risk overlay and crowdsourced hazard markers across 10 administrative zones
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={fetchMapData}
              disabled={loading}
              className="h-10 px-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0F766E] dark:text-[#14B8A6]" : ""}`} />
              <span>Refresh Map</span>
            </button>

            <Link
              href="/report"
              className="h-10 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Report Hazard</span>
            </Link>
          </div>
        </div>

        {/* Severity Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Risk:</span>
          </span>

          {[
            { id: "all", label: `All Wards (${zones.length})` },
            { id: "severe", label: `Severe (${severeZonesCount})` },
            { id: "high", label: `High (${highZonesCount})` },
            { id: "medium", label: "Medium" },
            { id: "low", label: "Low" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id)}
              className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterMode === f.id
                  ? "bg-[#0F766E] text-white dark:bg-[#14B8A6] dark:text-[#042F2E]"
                  : "bg-[#FFFFFF] dark:bg-[#111C2E] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#243244] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 2-Column Responsive Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Map Screen */}
          <div className="lg:col-span-8 bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                <Layers className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>Nagpur PostGIS Layer</span>
              </div>
              <span className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8]">
                Click any zone to inspect catchment metrics
              </span>
            </div>

            <div className="h-[480px] sm:h-[540px] w-full rounded-xl overflow-hidden relative border border-[#E2E8F0] dark:border-[#243244]">
              <MapComponent
                zones={filteredZones}
                reports={reports}
                selectedZone={selectedZone}
                onZoneClick={(z) => setSelectedZone(z)}
              />
            </div>
          </div>

          {/* Right Inspector & Ward Details Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#243244] pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  Zone Details
                </span>
                {selectedZone && (
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
                )}
              </div>

              {selectedZone ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {selectedZone.zone_name}
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      NMC Zone ID: {selectedZone.id || selectedZone.zone_id || "WZ-01"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244]">
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-medium block">Risk Score</span>
                      <span className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5 block">
                        {(selectedZone.latest_risk_score ?? selectedZone.risk_score ?? 15).toFixed(1)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244]">
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-medium block">Rainfall</span>
                      <span className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5 block">
                        {(selectedZone.rainfall_mm ?? selectedZone.rainfall_intensity_mm ?? 18).toFixed(1)}
                        <span className="text-xs font-normal text-[#64748B]"> mm/h</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#475569] dark:text-[#CBD5E1]">
                    <div className="flex justify-between py-1 border-b border-[#E2E8F0] dark:border-[#243244]">
                      <span>Drainage Capacity:</span>
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        {Math.round((selectedZone.drainage_capacity || 0.6) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E2E8F0] dark:border-[#243244]">
                      <span>Basin Elevation:</span>
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        {selectedZone.elevation_m ? `${selectedZone.elevation_m}m` : "Low-lying"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Dispatch Status:</span>
                      <span className="font-semibold text-[#0F766E] dark:text-[#14B8A6]">
                        {selectedZone.dispatch_status || "Standard Monitoring"}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/route?destination=${encodeURIComponent(selectedZone.zone_name)}`}
                    className="w-full h-10 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Plan Safe Route to {selectedZone.zone_name}</span>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8 text-[#64748B] dark:text-[#94A3B8] text-xs font-normal">
                  Select a ward polygon from the map to view detailed risk intelligence.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
