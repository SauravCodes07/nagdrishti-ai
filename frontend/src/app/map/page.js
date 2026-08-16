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

      if (zData.status === "fulfilled" && Array.isArray(zData.value)) setZones(zData.value);
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
    const cat = z.risk_category || ((z.latest_risk_score ?? z.risk_score) >= 75 ? "Severe" : (z.latest_risk_score ?? z.risk_score) >= 50 ? "High" : (z.latest_risk_score ?? z.risk_score) >= 25 ? "Medium" : "Low");
    return cat.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <CitizenLayout>
      <div className="space-y-3">
        {/* Top Header & Weather Status */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Live Flood Map
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Nagpur Municipal GIS & Hazard Feeds
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm active:scale-95 transition"
            title="Refresh Live Map"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
          </button>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {filterChips.map((chip) => {
            const isSelected = selectedCategory === chip;
            return (
              <button
                key={chip}
                onClick={() => setSelectedCategory(chip)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
                    : "bg-white dark:bg-[#131B2A] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                }`}
              >
                {chip}
                {chip === "Severe" && zones.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75)).length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px]">
                    {zones.filter((z) => (z.risk_category === "Severe" || (z.latest_risk_score ?? z.risk_score) >= 75)).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Interactive Leaflet Map Container */}
        <div className="h-[460px] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 relative">
          <MapComponent
            zones={filteredZones}
            reports={reports}
            onZoneClick={(zone) => setSelectedZone(zone)}
          />
        </div>

        {/* Selected Zone Bottom Sheet Details */}
        {selectedZone && (
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {selectedZone.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Nagpur Municipal Ward #{selectedZone.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    (selectedZone.risk_category === "Severe" || (selectedZone.latest_risk_score ?? selectedZone.risk_score) >= 75)
                      ? "bg-red-500/10 text-red-600 border border-red-500/30"
                      : (selectedZone.risk_category === "High" || (selectedZone.latest_risk_score ?? selectedZone.risk_score) >= 50)
                      ? "bg-orange-500/10 text-orange-600 border border-orange-500/30"
                      : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                  }`}
                >
                  {selectedZone.risk_category || "Low Risk"} ({(selectedZone.latest_risk_score ?? selectedZone.risk_score ?? 10).toFixed(1)})
                </span>

                <button
                  onClick={() => setSelectedZone(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metrics 4-Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Rainfall</div>
                <div className="font-extrabold text-slate-900 dark:text-white">
                  {(selectedZone.rainfall_mm ?? 0).toFixed(1)} mm/h
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Drainage Capacity</div>
                <div className="font-extrabold text-slate-900 dark:text-white">
                  {Math.round((selectedZone.drainage_capacity || 0.5) * 100)}%
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Elevation Factor</div>
                <div className="font-extrabold text-slate-900 dark:text-white">
                  {selectedZone.elevation_factor || 0.4}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Dispatch Status</div>
                <div className="font-extrabold text-teal-600 dark:text-teal-400">
                  {selectedZone.dispatch_status || "Unassigned"}
                </div>
              </div>
            </div>

            {/* Direct Routing Action */}
            <Link
              href={`/route?destination=${encodeURIComponent(selectedZone.name)}`}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 active:scale-95 transition"
            >
              <Navigation className="w-4 h-4" />
              <span>Calculate Safe Route to {selectedZone.name}</span>
            </Link>
          </div>
        )}
      </div>
    </CitizenLayout>
  );
}
