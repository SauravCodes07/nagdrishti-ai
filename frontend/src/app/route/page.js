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
  Compass,
  ArrowRight,
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-teal-400 tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>OSMnx Risk-Aware Pathfinding</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              Flood-Safe Road Navigation
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Calculates optimal paths while avoiding heavily waterlogged wards and submerged underpasses.
          </p>
        </div>

        {/* 2-Column Responsive Layout on Desktop / Stacked on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Route Setup & Summary */}
          <div className="lg:col-span-5 space-y-4">
            {/* Origin & Destination Inputs Card */}
            <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-xl space-y-4">
              {/* Origin Picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-teal-400 tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                  <span>Origin Point (A)</span>
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
                  className="w-full p-3 rounded-2xl bg-[#0B0F17] border border-[#1E293B] text-xs font-bold text-white focus:outline-none focus:border-teal-500 cursor-pointer"
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
                  className="p-2.5 rounded-full bg-[#1E293B] hover:bg-teal-600 hover:text-white text-slate-300 transition shadow-sm active:scale-90 border border-[#334155]"
                  title="Swap Origin and Destination"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              {/* Destination Picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span>Destination Point (B)</span>
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
                  className="w-full p-3 rounded-2xl bg-[#0B0F17] border border-[#1E293B] text-xs font-bold text-white focus:outline-none focus:border-teal-500 cursor-pointer"
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
                className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-lg shadow-teal-600/30 active:scale-95 transition flex items-center justify-center gap-2"
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
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold space-y-1 animate-in fade-in">
                <div className="flex items-center gap-2 font-black text-red-400">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Route Calculation Error</span>
                </div>
                <p className="pl-6 text-[11px] leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Route Result Summary Card */}
            {routeResult && (
              <div className="bg-[#131B2A] border border-teal-500/40 rounded-3xl p-5 shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="font-black text-sm text-white">Safe Route Calculated</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    A* Risk-Optimized
                  </span>
                </div>

                {/* Distance & ETA */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-[#0B0F17] border border-[#1E293B]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Total Distance</div>
                    <div className="text-2xl font-black text-white mt-0.5">
                      {routeResult.distance_km || routeResult.total_distance_km || 0} <span className="text-xs font-normal text-slate-400">km</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0B0F17] border border-[#1E293B]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Estimated Time</div>
                    <div className="text-2xl font-black text-teal-400 mt-0.5">
                      {routeResult.estimated_minutes || routeResult.estimated_time_min || 12} <span className="text-xs font-normal text-slate-400">mins</span>
                    </div>
                  </div>
                </div>

                {/* Avoidance callout */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 leading-relaxed">
                  {routeResult.safety_explanation ||
                    `Successfully generated flood-penalized path across ${routeResult.node_count || 14} road network vertices.`}
                </div>

                {/* Traversed Wards */}
                {routeResult.traversed_zones && routeResult.traversed_zones.length > 0 && (
                  <div className="text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">Wards Traversed: </span>
                    {routeResult.traversed_zones.join(" → ")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Large Leaflet Route Map */}
          <div className="lg:col-span-7 bg-[#131B2A] border border-[#1E293B] rounded-3xl p-3 sm:p-4 shadow-xl">
            <div className="h-[460px] sm:h-[620px] w-full rounded-2xl overflow-hidden relative">
              <MapComponent routeData={routeResult} />
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
