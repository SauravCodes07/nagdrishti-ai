"use client";

import { useState } from "react";
import {
  Navigation,
  ArrowUpDown,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Locate,
  Sparkles,
  CheckCircle2,
  Layers,
} from "lucide-react";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import MapComponent from "../../components/MapComponent";
import { getSafeRoute } from "../../lib/api";

const PRESET_LOCATIONS = [
  { name: "Zero Mile Marker", lat: 21.1458, lng: 79.0882 },
  { name: "Sitabuldi Junction", lat: 21.1498, lng: 79.0806 },
  { name: "Dharampeth Square", lat: 21.1472, lng: 79.0664 },
  { name: "Sadar Bazaar", lat: 21.1605, lng: 79.0830 },
  { name: "Mahal Chowk", lat: 21.1430, lng: 79.1120 },
  { name: "Lakadganj Square", lat: 21.1550, lng: 79.1300 },
  { name: "Itwari Railway Station", lat: 21.1720, lng: 79.1200 },
  { name: "Airport Road (Sonegaon)", lat: 21.0920, lng: 79.0680 },
];

export default function SafeRoutePage() {
  const [fromLocation, setFromLocation] = useState(PRESET_LOCATIONS[2]); // Dharampeth
  const [toLocation, setToLocation] = useState(PRESET_LOCATIONS[5]);   // Lakadganj

  const [customFromLat, setCustomFromLat] = useState("21.1472");
  const [customFromLng, setCustomFromLng] = useState("79.0664");
  const [customToLat, setCustomToLat] = useState("21.1550");
  const [customToLng, setCustomToLng] = useState("79.1300");

  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSwap = () => {
    const tempLoc = fromLocation;
    setFromLocation(toLocation);
    setToLocation(tempLoc);

    const tLat = customFromLat;
    const tLng = customFromLng;
    setCustomFromLat(customToLat);
    setCustomFromLng(customToLng);
    setCustomToLat(tLat);
    setCustomToLng(tLng);
  };

  const handleFindRoute = async () => {
    setErrorMsg("");
    setLoading(true);
    setRouteResult(null);

    const fLat = parseFloat(customFromLat);
    const fLng = parseFloat(customFromLng);
    const tLat = parseFloat(customToLat);
    const tLng = parseFloat(customToLng);

    if (isNaN(fLat) || isNaN(fLng) || isNaN(tLat) || isNaN(tLng)) {
      setErrorMsg("Please enter valid numeric latitude and longitude coordinates.");
      setLoading(false);
      return;
    }

    try {
      const data = await getSafeRoute(fLat, fLng, tLat, tLng);
      setRouteResult(data);
    } catch (err) {
      console.error("Routing error:", err);
      setErrorMsg(err.message || "Could not calculate safe route across road network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CitizenLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            Safe Route Navigation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Risk-aware pathfinding bypassing flooded wards and road hazards
          </p>
        </div>

        {/* Origin & Destination Inputs Card */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
          {/* Origin Picker */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              Origin Point (Start)
            </label>
            <select
              value={fromLocation.name}
              onChange={(e) => {
                const found = PRESET_LOCATIONS.find((p) => p.name === e.target.value);
                if (found) {
                  setFromLocation(found);
                  setCustomFromLat(found.lat.toFixed(4));
                  setCustomFromLng(found.lng.toFixed(4));
                }
              }}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  📍 {loc.name} ({loc.lat}, {loc.lng})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-1">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-teal-500 hover:text-white text-slate-600 dark:text-slate-300 transition shadow-sm active:scale-90"
              title="Swap Origin and Destination"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Destination Picker */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-red-500 tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Destination Point (End)
            </label>
            <select
              value={toLocation.name}
              onChange={(e) => {
                const found = PRESET_LOCATIONS.find((p) => p.name === e.target.value);
                if (found) {
                  setToLocation(found);
                  setCustomToLat(found.lat.toFixed(4));
                  setCustomToLng(found.lng.toFixed(4));
                }
              }}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  🏁 {loc.name} ({loc.lat}, {loc.lng})
                </option>
              ))}
            </select>
          </div>

          {/* Calculate Route CTA */}
          <button
            onClick={handleFindRoute}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-lg shadow-teal-600/30 active:scale-95 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Computing Safest Route...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Calculate Flood-Safe Route</span>
              </>
            )}
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold space-y-1 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-black">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Route Calculation Error</span>
            </div>
            <p className="pl-6 text-[11px] leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Route Result Summary Card */}
        {routeResult && (
          <div className="bg-white dark:bg-[#131B2A] border border-teal-500/30 rounded-3xl p-4 shadow-xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  Safe Path Found
                </span>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Risk-Optimized
              </span>
            </div>

            {/* Distance & ETA */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                  Total Distance
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {routeResult.distance_km || routeResult.total_distance_km || 0} <span className="text-xs">km</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                  Estimated Travel
                </div>
                <div className="text-xl font-black text-teal-600 dark:text-teal-400">
                  {routeResult.estimated_time_min || 12} <span className="text-xs">mins</span>
                </div>
              </div>
            </div>

            {/* Avoided Hazard Zones Callout */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
              <p className="leading-relaxed">
                {routeResult.safety_explanation ||
                  `Path routed successfully across ${routeResult.node_count || 12} road network segments.`}
              </p>
            </div>
          </div>
        )}

        {/* Route Preview Leaflet Map */}
        <div className="h-[360px] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 relative">
          <MapComponent routeData={routeResult} />
        </div>
      </div>
    </CitizenLayout>
  );
}
