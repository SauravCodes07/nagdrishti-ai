"use client";

import { useState } from "react";
import {
  Navigation,
  Compass,
  ShieldCheck,
  AlertTriangle,
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
    <div className="hover-card bg-[#FFFFFF] dark:bg-[#111C2E] rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] dark:border-[#243244] shadow-[0_1px_3px_rgba(15,23,42,0.08)] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#243244]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#CCFBF1] dark:bg-teal-500/15 rounded-xl text-[#0F766E] dark:text-[#5EEAD4]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">A* Safe Route Search</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">OSM road network penalized by flood severity</p>
          </div>
        </div>

        <button
          onClick={handleSwapLocations}
          className="hover-btn text-xs font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] transition-colors flex items-center space-x-1.5 cursor-pointer"
          title="Swap start and destination"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Swap</span>
        </button>
      </div>

      {/* Start Location Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1] flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#14B8A6]"></span>
          <span>Start Location (Origin)</span>
        </label>
        <select
          value={`${startPoint.lat},${startPoint.lng}`}
          onChange={(e) => {
            const [lat, lng] = e.target.value.split(",").map(Number);
            const hub = NAGPUR_HUBS.find((h) => Math.abs(h.lat - lat) < 0.001 && Math.abs(h.lng - lng) < 0.001);
            setStartPoint(hub || { name: `Coordinates (${lat.toFixed(3)}, ${lng.toFixed(3)})`, lat, lng });
          }}
          className="w-full text-xs font-normal bg-[#FFFFFF] dark:bg-[#0B1220] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6] cursor-pointer"
        >
          {NAGPUR_HUBS.map((hub) => (
            <option key={`start-${hub.name}`} value={`${hub.lat},${hub.lng}`}>
              {hub.name} ({hub.lat.toFixed(4)}, {hub.lng.toFixed(4)})
            </option>
          ))}
        </select>
      </div>

      {/* Destination Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1] flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
          <span>Destination (Arrival)</span>
        </label>
        <select
          value={`${endPoint.lat},${endPoint.lng}`}
          onChange={(e) => {
            const [lat, lng] = e.target.value.split(",").map(Number);
            const hub = NAGPUR_HUBS.find((h) => Math.abs(h.lat - lat) < 0.001 && Math.abs(h.lng - lng) < 0.001);
            setEndPoint(hub || { name: `Coordinates (${lat.toFixed(3)}, ${lng.toFixed(3)})`, lat, lng });
          }}
          className="w-full text-xs font-normal bg-[#FFFFFF] dark:bg-[#0B1220] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6] cursor-pointer"
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
        className="hover-btn w-full h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
      >
        <Navigation className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        <span>{loading ? "Computing A* Path..." : "Find Flood-Safe Route"}</span>
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs font-medium text-[#991B1B] dark:text-[#F87171] flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Route Results Box */}
      {routeResult && (
        <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#243244] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[#16A34A] dark:text-[#4ADE80] font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Safe Corridor Identified</span>
            </div>
            <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {routeResult.distance_km || routeResult.total_distance_km} km
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244]">
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-medium block">Distance</span>
              <span className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {routeResult.distance_km || routeResult.total_distance_km} km
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244]">
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-medium block">Est. Time</span>
              <span className="text-base font-bold text-[#0F766E] dark:text-[#14B8A6]">
                ~{routeResult.estimated_minutes || routeResult.estimated_time_min || 14} min
              </span>
            </div>
          </div>

          <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
            {routeResult.safety_explanation || "Path safely routes around high-risk basin coordinates."}
          </p>
        </div>
      )}
    </div>
  );
}
