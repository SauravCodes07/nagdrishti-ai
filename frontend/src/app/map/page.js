"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  MapPin,
  AlertTriangle,
  Droplets,
  CloudRain,
  Navigation,
  RefreshCw,
  X,
  ShieldCheck,
  CheckCircle2,
  Activity,
  ArrowRight,
  Info,
} from "lucide-react";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import MapComponent from "../../components/MapComponent";
import { getRiskZones, getReports, getWeather } from "../../lib/api";

export default function CitizenMapPage() {
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedZone, setSelectedZone] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [zData, rData, wData] = await Promise.allSettled([
        getRiskZones(),
        getReports(),
        getWeather(),
      ]);

      if (zData.status === "fulfilled" && Array.isArray(zData.value)) {
        setZones(zData.value);
        if (!selectedZone && zData.value.length > 0) {
          // Select highest risk zone by default for desktop side panel
          const sorted = [...zData.value].sort(
            (a, b) => (b.latest_risk_score ?? b.risk_score ?? 0) - (a.latest_risk_score ?? a.risk_score ?? 0)
          );
          setSelectedZone(sorted[0]);
        }
      }
      if (rData.status === "fulfilled" && Array.isArray(rData.value)) setReports(rData.value);
      if (wData.status === "fulfilled" && wData.value) setWeather(wData.value);
    } catch (err) {
      console.error("Map page fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterChips = ["All", "Severe", "High", "Medium", "Low", "Dispatches"];

  const filteredZones = zones.filter((z) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Dispatches") return z.dispatch_status && z.dispatch_status !== "Unassigned";
    const cat =
      z.risk_category ||
      ((z.latest_risk_score ?? z.risk_score) >= 75
        ? "Severe"
        : (z.latest_risk_score ?? z.risk_score) >= 50
        ? "High"
        : (z.latest_risk_score ?? z.risk_score) >= 25
        ? "Medium"
        : "Low");
    return cat.toLowerCase() === selectedCategory.toLowerCase();
  });

  const severeZonesCount = zones.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75)).length;

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-400">
                Citywide GIS Topology
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[10px] font-bold">
                10 Administrative Wards
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              Live Nagpur Flood & Hazard Map
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-[#131B2A] border border-[#1E293B] text-slate-300 hover:text-white font-bold text-xs shadow-sm active:scale-95 transition flex items-center gap-1.5"
              title="Refresh Live Map"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-400" : ""}`} />
              <span>Refresh Map</span>
            </button>

            <Link
              href="/route"
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 flex items-center gap-1.5 transition active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Safe Routes</span>
            </Link>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filterChips.map((chip) => {
            const isSelected = selectedCategory === chip;
            return (
              <button
                key={chip}
                onClick={() => setSelectedCategory(chip)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                    : "bg-[#131B2A] text-slate-300 border border-[#1E293B] hover:bg-[#1E293B]"
                }`}
              >
                <span>{chip}</span>
                {chip === "Severe" && severeZonesCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black">
                    {severeZonesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop 2-Column Grid / Mobile Stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Leaflet Map View */}
          <div className="lg:col-span-8 bg-[#131B2A] border border-[#1E293B] rounded-3xl p-3 sm:p-4 shadow-xl">
            <div className="h-[480px] sm:h-[620px] w-full rounded-2xl overflow-hidden relative">
              <MapComponent
                zones={filteredZones}
                reports={reports}
                onZoneClick={(zone) => setSelectedZone(zone)}
              />
            </div>
          </div>

          {/* Right Inspector & Ward Details Panel */}
          <div className="lg:col-span-4 space-y-4">
            {selectedZone ? (
              <div className="bg-[#131B2A] border border-teal-500/30 rounded-3xl p-5 shadow-xl space-y-4 animate-in fade-in">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-white">{selectedZone.name}</h3>
                      <p className="text-[11px] text-slate-400">Ward ID #{selectedZone.id}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      (selectedZone.risk_category === "Severe" || (selectedZone.latest_risk_score ?? selectedZone.risk_score) >= 75)
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : (selectedZone.risk_category === "High" || (selectedZone.latest_risk_score ?? selectedZone.risk_score) >= 50)
                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {selectedZone.risk_category || "Low Risk"} ({(selectedZone.latest_risk_score ?? selectedZone.risk_score ?? 10).toFixed(1)})
                  </span>
                </div>

                {/* Photo confirmed flood banner if applicable */}
                {selectedZone.photo_confirmed && (
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Photo Evidence Confirms Active Street Submersion</span>
                  </div>
                )}

                {/* Metrics 4-Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-[#0B0F17] border border-[#1E293B]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Rainfall</div>
                    <div className="font-black text-sm text-white mt-0.5">
                      {(selectedZone.rainfall_mm ?? 0).toFixed(1)} mm/h
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0B0F17] border border-[#1E293B]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Drainage Cap</div>
                    <div className="font-black text-sm text-white mt-0.5">
                      {Math.round((selectedZone.drainage_capacity || 0.5) * 100)}%
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0B0F17] border border-[#1E293B]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Elevation Factor</div>
                    <div className="font-black text-sm text-white mt-0.5">
                      {selectedZone.elevation_factor || 0.4}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0B0F17] border border-[#1E293B]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Dispatch Status</div>
                    <div className="font-black text-sm text-teal-400 mt-0.5">
                      {selectedZone.dispatch_status || "Unassigned"}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <Link
                    href={`/route?destination=${encodeURIComponent(selectedZone.name)}`}
                    className="w-full py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/30 active:scale-95 transition"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Calculate Safe Route Here</span>
                  </Link>

                  <Link
                    href="/report"
                    className="w-full py-3 px-4 rounded-2xl bg-[#1E293B] hover:bg-[#243044] text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-[#334155] transition"
                  >
                    <Camera className="w-4 h-4 text-teal-400" />
                    <span>Report Hazard in {selectedZone.name}</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-8 text-center space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto">
                  <Info className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-white">Click Any Ward On Map</h3>
                <p className="text-xs leading-relaxed">
                  Select any colored ward boundary or incident marker to inspect real-time drainage metrics and calculate safe paths.
                </p>
              </div>
            )}

            {/* Live Ward Quick List */}
            <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-4 shadow-sm space-y-2 max-h-72 overflow-y-auto">
              <div className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-wider">
                Nagpur Ward Severity Overview
              </div>
              {zones.map((z) => {
                const score = z.latest_risk_score ?? z.risk_score ?? 10;
                const isSevere = z.risk_category === "Severe" || score >= 75;
                const isHigh = z.risk_category === "High" || score >= 50;

                return (
                  <div
                    key={z.id}
                    onClick={() => setSelectedZone(z)}
                    className={`p-2.5 rounded-2xl cursor-pointer transition flex items-center justify-between border ${
                      selectedZone?.id === z.id
                        ? "bg-teal-500/10 border-teal-500/40 text-teal-300"
                        : "bg-[#0B0F17]/60 border-[#1E293B] hover:bg-[#1E293B] text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isSevere ? "bg-red-500" : isHigh ? "bg-orange-500" : "bg-emerald-500"
                        }`}
                      />
                      <span className="text-xs font-bold truncate">{z.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {score.toFixed(0)}/100
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
