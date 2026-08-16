"use client";

import { useState } from "react";
import {
  Navigation,
  MapPin,
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Route,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { getSafeRoute } from "../lib/api";

const NAGPUR_HUBS = [
  { name: "Zero Mile Center", lat: 21.1458, lng: 79.0882 },
  { name: "Sitabuldi Junction", lat: 21.1465, lng: 79.0825 },
  { name: "Dharampeth Square", lat: 21.1472, lng: 79.0664 },
  { name: "Sadar Residency Rd", lat: 21.1605, lng: 79.0830 },
  { name: "Mahal Gandhi Gate", lat: 21.1470, lng: 79.1020 },
  { name: "Gandhibagh Market", lat: 21.1560, lng: 79.1010 },
  { name: "Dhantoli Lokmat Sq", lat: 21.1330, lng: 79.0810 },
  { name: "Medical Square", lat: 21.1310, lng: 79.0980 },
  { name: "Hanuman Nagar Sq", lat: 21.1250, lng: 79.1050 },
  { name: "Nehru Nagar Sq", lat: 21.1200, lng: 79.1350 },
  { name: "Mangalwari Sadar", lat: 21.1750, lng: 79.0750 },
  { name: "Lakadganj Square", lat: 21.1550, lng: 79.1300 },
  { name: "Wardha Road Ajni", lat: 21.1180, lng: 79.0780 },
  { name: "Shankar Nagar Sq", lat: 21.1390, lng: 79.0600 },
];

export default function SafeRouteFinder({
  onRouteFound,
  onPickOnMap,
  pickedLocation,
  clickMode,
  setClickMode,
}) {
  const [startPoint, setStartPoint] = useState({ name: "Dharampeth Square", lat: 21.1472, lng: 79.0664 });
  const [endPoint, setEndPoint] = useState({ name: "Lakadganj Square", lat: 21.1550, lng: 79.1300 });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeResult, setRouteResult] = useState(null);

  const handleSetFromMap = (type) => {
    if (setClickMode) setClickMode(type);
  };

  const handleCalculateRoute = async () => {
    if (!startPoint || !endPoint) {
      setError("Please specify both Start and Destination locations.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getSafeRoute(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng);
      setRouteResult(data);
      if (onRouteFound) {
        onRouteFound(data);
      }
    } catch (err) {
      setError(err.message || "Failed to calculate safe route across road graph.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLocations = () => {
    const temp = startPoint;
    setStartPoint(endPoint);
    setEndPoint(temp);
  };

  return (
    <div className="bg-white dark:bg-[#131B2A] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-[#1E293B] shadow-xl space-y-4 font-sans text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-teal-500/10 rounded-2xl text-teal-600 dark:text-teal-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">A* Safe Route Search</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real OSM road network penalized by flood severity</p>
          </div>
        </div>

        <button
          onClick={handleSwapLocations}
          className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl bg-slate-100 dark:bg-[#0B0F17] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] transition-colors flex items-center space-x-1.5"
          title="Swap start and destination"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Swap</span>
        </button>
      </div>

      {/* Origin Selection */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <span>Route Origin (A)</span>
          </span>
          <button
            onClick={() => handleSetFromMap("start")}
            className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
              clickMode === "start"
                ? "bg-teal-500 text-white animate-pulse"
                : "text-teal-600 dark:text-teal-400 hover:underline"
            }`}
          >
            {clickMode === "start" ? "Click on Map..." : "Pick on Map"}
          </button>
        </div>

        <select
          value={`${startPoint.lat},${startPoint.lng}`}
          onChange={(e) => {
            const [lat, lng] = e.target.value.split(",").map(Number);
            const hub = NAGPUR_HUBS.find((h) => Math.abs(h.lat - lat) < 0.001 && Math.abs(h.lng - lng) < 0.001);
            setStartPoint({ name: hub ? hub.name : `Point (${lat.toFixed(3)}, ${lng.toFixed(3)})`, lat, lng });
          }}
          className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] rounded-2xl px-3.5 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 cursor-pointer"
        >
          {NAGPUR_HUBS.map((hub) => (
            <option key={`start-${hub.name}`} value={`${hub.lat},${hub.lng}`}>
              {hub.name} ({hub.lat.toFixed(4)}, {hub.lng.toFixed(4)})
            </option>
          ))}
        </select>
      </div>

      {/* Destination Selection */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Destination (B)</span>
          </span>
          <button
            onClick={() => handleSetFromMap("end")}
            className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
              clickMode === "end"
                ? "bg-teal-500 text-white animate-pulse"
                : "text-teal-600 dark:text-teal-400 hover:underline"
            }`}
          >
            {clickMode === "end" ? "Click on Map..." : "Pick on Map"}
          </button>
        </div>

        <select
          value={`${endPoint.lat},${endPoint.lng}`}
          onChange={(e) => {
            const [lat, lng] = e.target.value.split(",").map(Number);
            const hub = NAGPUR_HUBS.find((h) => Math.abs(h.lat - lat) < 0.001 && Math.abs(h.lng - lng) < 0.001);
            setEndPoint({ name: hub ? hub.name : `Point (${lat.toFixed(3)}, ${lng.toFixed(3)})`, lat, lng });
          }}
          className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] rounded-2xl px-3.5 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 cursor-pointer"
        >
          {NAGPUR_HUBS.map((hub) => (
            <option key={`end-${hub.name}`} value={`${hub.lat},${hub.lng}`}>
              {hub.name} ({hub.lat.toFixed(4)}, {hub.lng.toFixed(4)})
            </option>
          ))}
        </select>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculateRoute}
        disabled={loading}
        className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-teal-600/30 transition-all flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-50"
      >
        <Navigation className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        <span>{loading ? "Computing Safe Path Across OSM Network..." : "Find Flood-Safe Route"}</span>
      </button>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs font-medium text-red-700 dark:text-red-300 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Route Result Card */}
      {routeResult && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white space-y-3 animate-in fade-in border border-slate-200 dark:border-[#1E293B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Safe Route Verified</span>
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white">
              {routeResult.distance_km || routeResult.total_distance_km} km
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B]">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Distance</span>
              <span className="text-base font-black text-slate-900 dark:text-white">{routeResult.distance_km || routeResult.total_distance_km} km</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B]">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Est. Time</span>
              <span className="text-base font-black text-teal-600 dark:text-teal-400">~{routeResult.estimated_minutes || routeResult.estimated_time_min || 12} mins</span>
            </div>
          </div>

          {/* Safety Explanation */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
            <p className="text-[11px] leading-relaxed">
              {routeResult.safety_explanation || "Path computed successfully avoiding severe flood zones."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
