"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  Filter,
  RefreshCw,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Activity,
  MapPin,
  Camera,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import CitizenLayout from "../../components/layouts/CitizenLayout";

const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[520px] rounded-2xl bg-slate-100 dark:bg-[#131B2A] flex items-center justify-center text-xs font-bold text-slate-400">
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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Nagpur Live GIS Flood Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              Real-time catchment risk overlay and crowdsourced hazard markers across 10 administrative zones
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchMapData}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#EA580C] dark:text-[#FF8A00]" : ""}`} />
              <span>Refresh Map</span>
            </button>

            <Link
              href="/report"
              className="px-4 py-2 rounded-xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-[#FF8A00]/25 flex items-center gap-1.5 transition active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Report Hazard</span>
            </Link>
          </div>
        </div>

        {/* Severity Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Severity:</span>
          </span>

          {[
            { id: "all", label: `All Wards (${zones.length})` },
            { id: "severe", label: `Severe (${severeZonesCount})` },
            { id: "high", label: `High Risk (${highZonesCount})` },
            { id: "medium", label: "Medium" },
            { id: "low", label: "Low Risk" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterMode === f.id
                  ? "bg-[#EA580C] dark:bg-[#FF8A00] text-white dark:text-slate-950 shadow-md shadow-[#FF8A00]/20"
                  : "bg-white dark:bg-[#131B2A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#1E293B]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 2-Column Responsive Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Map Screen */}
          <div className="lg:col-span-8 bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Layers className="w-4 h-4 text-[#EA580C] dark:text-[#FF8A00]" />
                <span>Interactive PostGIS Layer</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">
                Click any zone to inspect catchment hydrology
              </span>
            </div>

            <div className="h-[520px] sm:h-[600px] w-full rounded-2xl overflow-hidden relative border border-slate-200 dark:border-[#1E293B]">
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
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Ward Catchment Inspector
                </span>
                {selectedZone && (
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      selectedZone.risk_category === "Severe"
                        ? "bg-red-500 text-white"
                        : selectedZone.risk_category === "High"
                        ? "bg-orange-500 text-white"
                        : selectedZone.risk_category === "Medium"
                        ? "bg-amber-500 text-white"
                        : "bg-emerald-500 text-white"
                    }`}
                  >
                    {selectedZone.risk_category || "Low"}
                  </span>
                )}
              </div>

              {selectedZone ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {selectedZone.zone_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Zone ID: {selectedZone.id || selectedZone.zone_id || "WZ-01"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Risk Score</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                        {(selectedZone.latest_risk_score ?? selectedZone.risk_score ?? 15).toFixed(1)}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Rainfall</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                        {(selectedZone.rainfall_mm ?? selectedZone.rainfall_intensity_mm ?? 18).toFixed(1)}
                        <span className="text-[10px] font-normal text-slate-400"> mm/h</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1E293B]">
                      <span>Drainage Capacity:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {Math.round((selectedZone.drainage_capacity || 0.6) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1E293B]">
                      <span>Basin Elevation:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {selectedZone.elevation_m ? `${selectedZone.elevation_m}m` : "Low-lying"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Dispatch Status:</span>
                      <span className="font-bold text-[#EA580C] dark:text-[#FF8A00]">
                        {selectedZone.dispatch_status || "Standard Monitoring"}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/route?destination=${encodeURIComponent(selectedZone.zone_name)}`}
                    className="w-full py-3.5 rounded-2xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-[#FF8A00]/25 transition active:scale-95"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Plan Safe Route to {selectedZone.zone_name}</span>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs font-medium">
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
