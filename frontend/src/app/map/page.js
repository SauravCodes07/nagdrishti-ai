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
      const [zData, rData, wData] = await Promise.allSettled([
        getRiskZones(),
        getReports(),
        getWeather(),
      ]);

      if (zData.status === "fulfilled" && Array.isArray(zData.value)) {
        setZones(zData.value);
        if (!selectedZone && zData.value.length > 0) {
          const sorted = [...zData.value].sort(
            (a, b) => (b.latest_risk_score ?? b.risk_score ?? 0) - (a.latest_risk_score ?? a.risk_score ?? 0)
          );
          setSelectedZone(sorted[0]);
        }
      }
      if (rData.status === "fulfilled" && Array.isArray(rData.value)) setReports(rData.value);
      if (wData.status === "fulfilled" && wData.value) setWeather(wData.value);
    } catch (err) {
      console.error("Map data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  const severeZones = zones.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75));
  const highZones = zones.filter((z) => (z.risk_category === "High" || ((z.latest_risk_score ?? z.risk_score) >= 50 && (z.latest_risk_score ?? z.risk_score) < 75)));

  const filteredZones = filterMode === "all"
    ? zones
    : filterMode === "severe"
    ? severeZones
    : filterMode === "high"
    ? highZones
    : zones.filter((z) => (z.latest_risk_score ?? z.risk_score ?? 0) < 50);

  return (
    <CitizenLayout>
      <div className="space-y-4">
        {/* Top Filter and Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] p-4 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>

            {[
              { id: "all", label: `All Wards (${zones.length})` },
              { id: "severe", label: `Severe (${severeZones.length})` },
              { id: "high", label: `High Risk (${highZones.length})` },
              { id: "normal", label: "Normal Flow" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  filterMode === f.id
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-[#0B0F17] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1E293B]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={fetchMapData}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-[#1E293B] active:scale-95 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600 dark:text-teal-400" : ""}`} />
              <span>Refresh Map</span>
            </button>

            <Link
              href="/report"
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Report</span>
            </Link>
          </div>
        </div>

        {/* 2-Column GIS Screen on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Map */}
          <div className="lg:col-span-8 bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-3 shadow-xl">
            <div className="h-[520px] sm:h-[620px] w-full rounded-2xl overflow-hidden relative">
              <MapComponent
                zones={filteredZones}
                reports={reports}
                onZoneClick={(zone) => setSelectedZone(zone)}
              />
            </div>
          </div>

          {/* Right Column: Ward Detail Inspector & Severity Breakdown */}
          <div className="lg:col-span-4 space-y-4">
            {selectedZone ? (
              <div className="bg-white dark:bg-[#131B2A] border border-teal-500/30 rounded-3xl p-5 shadow-xl space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      Ward Telemetry
                    </span>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedZone.name}
                    </h2>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      (selectedZone.latest_risk_score ?? selectedZone.risk_score) >= 75
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                        : (selectedZone.latest_risk_score ?? selectedZone.risk_score) >= 50
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    Score: {(selectedZone.latest_risk_score ?? selectedZone.risk_score ?? 0).toFixed(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Rainfall</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {(selectedZone.rainfall_mm ?? 0).toFixed(1)} mm/h
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Drainage Cap</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {Math.round((selectedZone.drainage_capacity || 0.5) * 100)}%
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Dispatch Status</span>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 block mt-0.5">
                      {selectedZone.dispatch_status || "Unassigned"}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Photo Proof</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mt-0.5">
                      {selectedZone.photo_confirmed ? "📸 Confirmed" : "None"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/route?destination=${encodeURIComponent(selectedZone.name)}`}
                  className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 transition active:scale-95"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Navigate Safe Route to This Ward</span>
                </Link>
              </div>
            ) : null}

            {/* Ward Severity Rankings List */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                All Administrative Wards ({zones.length})
              </span>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {[...zones]
                  .sort((a, b) => (b.latest_risk_score ?? b.risk_score ?? 0) - (a.latest_risk_score ?? a.risk_score ?? 0))
                  .map((z, idx) => {
                    const score = z.latest_risk_score ?? z.risk_score ?? 0;
                    const isSevere = score >= 75;
                    const isHigh = score >= 50 && score < 75;

                    return (
                      <div
                        key={z.id}
                        onClick={() => setSelectedZone(z)}
                        className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                          selectedZone?.id === z.id
                            ? "bg-teal-50 dark:bg-teal-500/10 border-teal-500/50 shadow-sm"
                            : "bg-slate-50 dark:bg-[#0B0F17] border-slate-200 dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#1E293B]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[10px] font-black text-slate-400">#{idx + 1}</span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{z.name}</span>
                        </div>

                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isSevere
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : isHigh
                              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {score.toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
