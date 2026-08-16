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

  // If user clicked on map while in picking mode
  const handleSetFromMap = (type) => {
    setClickMode(type);
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
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">A* Safe Route Search</h2>
            <p className="text-xs text-slate-500">Real OSM road network penalized by crisis risk</p>
          </div>
        </div>

        <button
          onClick={handleSwapLocations}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center space-x-1"
          title="Swap start and destination"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Swap</span>
        </button>
      </div>

      {/* Origin Selection */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Route Origin (A)</span>
          </span>
          <button
            onClick={() => handleSetFromMap("start")}
            className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
              clickMode === "start"
                ? "bg-amber-500 text-white animate-pulse"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            {clickMode === "start" ? "Click on Map Now..." : "Pick on Map"}
          </button>
        </div>

        <select
          value={`${startPoint.lat},${startPoint.lng}`}
          onChange={(e) => {
            const [lat, lng] = e.target.value.split(",").map(Number);
            const hub = NAGPUR_HUBS.find((h) => Math.abs(h.lat - lat) < 0.001 && Math.abs(h.lng - lng) < 0.001);
            setStartPoint({ name: hub ? hub.name : `Point (${lat.toFixed(3)}, ${lng.toFixed(3)})`, lat, lng });
          }}
          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {NAGPUR_HUBS.map((hub) => (
            <option key={`start-${hub.name}`} value={`${hub.lat},${hub.lng}`}>
              {hub.name} ({hub.lat.toFixed(4)}, {hub.lng.toFixed(4)})
            </option>
          ))}
          {!NAGPUR_HUBS.some((h) => Math.abs(h.lat - startPoint.lat) < 0.001 && Math.abs(h.lng - startPoint.lng) < 0.001) && (
            <option value={`${startPoint.lat},${startPoint.lng}`}>
              📍 Custom: {startPoint.lat.toFixed(4)}, {startPoint.lng.toFixed(4)}
            </option>
          )}
        </select>
      </div>

      {/* Destination Selection */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Destination (B)</span>
          </span>
          <button
            onClick={() => handleSetFromMap("end")}
            className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
              clickMode === "end"
                ? "bg-amber-500 text-white animate-pulse"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            {clickMode === "end" ? "Click on Map Now..." : "Pick on Map"}
          </button>
        </div>

        <select
          value={`${endPoint.lat},${endPoint.lng}`}
          onChange={(e) => {
            const [lat, lng] = e.target.value.split(",").map(Number);
            const hub = NAGPUR_HUBS.find((h) => Math.abs(h.lat - lat) < 0.001 && Math.abs(h.lng - lng) < 0.001);
            setEndPoint({ name: hub ? hub.name : `Point (${lat.toFixed(3)}, ${lng.toFixed(3)})`, lat, lng });
          }}
          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {NAGPUR_HUBS.map((hub) => (
            <option key={`end-${hub.name}`} value={`${hub.lat},${hub.lng}`}>
              {hub.name} ({hub.lat.toFixed(4)}, {hub.lng.toFixed(4)})
            </option>
          ))}
          {!NAGPUR_HUBS.some((h) => Math.abs(h.lat - endPoint.lat) < 0.001 && Math.abs(h.lng - endPoint.lng) < 0.001) && (
            <option value={`${endPoint.lat},${endPoint.lng}`}>
              📍 Custom: {endPoint.lat.toFixed(4)}, {endPoint.lng.toFixed(4)}
            </option>
          )}
        </select>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculateRoute}
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FFC107] to-[#FF8A00] text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-60"
      >
        <Navigation className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        <span>{loading ? "Computing Safe Path Across OSM Network..." : "Find Safest Route"}</span>
      </button>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Route Result Card */}
      {routeResult && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white space-y-3 animate-fadeIn border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Safe Route Verified</span>
            </div>
            <span className="text-xs font-bold text-slate-300">
              {routeResult.distance_km} km
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Distance</span>
              <span className="text-base font-black text-white">{routeResult.distance_km} km</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Est. Time</span>
              <span className="text-base font-black text-amber-400">~{routeResult.estimated_minutes} mins</span>
            </div>
          </div>

          {/* Safety Explanation */}
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-xs text-slate-300">
            <div className="font-bold text-amber-400 mb-1 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Risk Penalty Avoidance:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-200">
              {routeResult.safety_explanation}
            </p>
          </div>

          {/* Traversed Wards */}
          {routeResult.traversed_zones && routeResult.traversed_zones.length > 0 && (
            <div className="text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Traverses Wards: </span>
              {routeResult.traversed_zones.join(" → ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
