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
import { isValidCoordinate } from "../lib/geoService";
import LocationSearchInput from "./LocationSearchInput";

export default function SafeRouteFinder({
  onRouteFound,
  onPickOnMap,
  pickedLocation,
  clickMode,
  setClickMode,
}) {
  const [startPoint, setStartPoint] = useState({
    name: "Shri Ramdeobaba College of Engineering (RCOEM)",
    lat: 21.1776,
    lng: 79.0617,
    source: "preset",
  });
  const [endPoint, setEndPoint] = useState({
    name: "AIIMS Nagpur (MIHAN)",
    lat: 21.0360,
    lng: 79.0300,
    source: "preset",
  });

  const [travelMode, setTravelMode] = useState("driving");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeResult, setRouteResult] = useState(null);

  const handleCalculateRoute = async () => {
    if (!startPoint || !endPoint) {
      setError("Please specify both Start (Origin) and Destination locations.");
      return;
    }

    if (!isValidCoordinate(startPoint.lat, startPoint.lng) || !isValidCoordinate(endPoint.lat, endPoint.lng)) {
      setError("Please select valid locations with coordinates.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getSafeRoute(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng, travelMode);
      setRouteResult(data);
      if (onRouteFound) {
        onRouteFound(data);
      }
    } catch (err) {
      console.error("[SafeRouteFinder Error]:", err);
      setError(err.message || "Failed to calculate safe route across road network.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLocations = () => {
    const temp = startPoint;
    setStartPoint(endPoint);
    setEndPoint(temp);
    setRouteResult(null);
  };

  return (
    <div className="hover-card bg-[#FFFFFF] dark:bg-[#111C2E] rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] dark:border-[#243244] shadow-[0_1px_3px_rgba(15,23,42,0.08)] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#243244]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#CCFBF1] dark:bg-teal-500/15 rounded-xl text-[#0F766E] dark:text-[#5EEAD4]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Safe Road Route Finder</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">OpenStreetMap network with flood hazard analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex p-0.5 rounded-lg bg-[#F1F5F9] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244]">
            <button
              type="button"
              onClick={() => setTravelMode("driving")}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition ${
                travelMode === "driving"
                  ? "bg-[#FFFFFF] dark:bg-[#1E293B] text-[#0F766E] dark:text-[#5EEAD4] shadow-xs"
                  : "text-[#64748B] dark:text-[#94A3B8]"
              }`}
            >
              Drive
            </button>
            <button
              type="button"
              onClick={() => setTravelMode("walking")}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition ${
                travelMode === "walking"
                  ? "bg-[#FFFFFF] dark:bg-[#1E293B] text-[#0F766E] dark:text-[#5EEAD4] shadow-xs"
                  : "text-[#64748B] dark:text-[#94A3B8]"
              }`}
            >
              Walk
            </button>
          </div>

          <button
            onClick={handleSwapLocations}
            className="hover-btn text-xs font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] p-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] transition-colors flex items-center cursor-pointer"
            title="Swap start and destination"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Start Location Search */}
      <LocationSearchInput
        label="Start Location (Origin)"
        value={startPoint}
        onChange={(loc) => {
          setStartPoint(loc);
          setRouteResult(null);
        }}
        allowCurrentLocation={true}
        placeholder="Search origin in Nagpur (e.g. Ramdeobaba, Yerla, Sitabuldi)..."
        dotColor="teal"
      />

      {/* Destination Location Search */}
      <LocationSearchInput
        label="Destination (Arrival Point)"
        value={endPoint}
        onChange={(loc) => {
          setEndPoint(loc);
          setRouteResult(null);
        }}
        allowCurrentLocation={false}
        placeholder="Search destination in Nagpur (e.g. AIIMS, YCCE, Lakadganj, Katol)..."
        dotColor="red"
      />

      {/* Calculate Button */}
      <button
        onClick={handleCalculateRoute}
        disabled={loading}
        className="hover-btn w-full h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
      >
        <Navigation className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        <span>{loading ? "Finding safest road route..." : "Find Flood-Safe Route"}</span>
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
