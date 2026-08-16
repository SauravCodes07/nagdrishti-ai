"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { getSafeRoute, getRiskZones } from "../../lib/api";
import {
  Navigation,
  MapPin,
  ArrowUpDown,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Milestone,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] bg-neutral-100 flex flex-col items-center justify-center text-neutral-500 text-xs">
      <div className="w-6 h-6 border-2 border-[#FFC107] border-t-transparent rounded-full animate-spin mb-2"></div>
      <span>Loading Route Map...</span>
    </div>
  ),
});

const NAGPUR_LANDMARKS = [
  { name: "Dharampeth (West)", lat: 21.1472, lng: 79.0664 },
  { name: "Sitabuldi Interchange (Central)", lat: 21.1465, lng: 79.0825 },
  { name: "Lakadganj (East)", lat: 21.1550, lng: 79.1300 },
  { name: "Mahal (South-East)", lat: 21.1430, lng: 79.1080 },
  { name: "Sadar Residency (North)", lat: 21.1605, lng: 79.0830 },
  { name: "Mankapur Ring Rd (North-West)", lat: 21.1850, lng: 79.0720 },
  { name: "Nagpur Central Station", lat: 21.1525, lng: 79.0880 },
  { name: "Nagpur Airport (Sonegaon)", lat: 21.0922, lng: 79.0550 },
];

export default function SafeRoutePage() {
  const [fromIndex, setFromIndex] = useState(0); // Dharampeth
  const [toIndex, setToIndex] = useState(2);   // Lakadganj
  const [zones, setZones] = useState([]);
  const [routeResult, setRouteResult] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    getRiskZones()
      .then((z) => setZones(Array.isArray(z) ? z : []))
      .catch(() => {});
  }, []);

  const handleSwap = () => {
    const temp = fromIndex;
    setFromIndex(toIndex);
    setToIndex(temp);
  };

  const handleCalculateRoute = async (e) => {
    if (e) e.preventDefault();
    if (fromIndex === toIndex) {
      setErrorMsg("Origin and destination cannot be identical.");
      return;
    }
    setLoadingRoute(true);
    setErrorMsg(null);
    setRouteResult(null);

    const fromPt = NAGPUR_LANDMARKS[fromIndex];
    const toPt = NAGPUR_LANDMARKS[toIndex];

    try {
      const res = await getSafeRoute(fromPt.lat, fromPt.lng, toPt.lat, toPt.lng);
      setRouteResult(res);
    } catch (err) {
      setErrorMsg(err.message || "Failed to calculate safe route across road network.");
    } finally {
      setLoadingRoute(false);
    }
  };

  return (
    <CitizenLayout>
      <div className="p-4 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-[#111111] tracking-tight">
              Risk-Aware Safe Route
            </h1>
            <p className="text-xs text-[#666666] font-medium">
              OSMnx A* street pathfinding bypassing active waterlogging & crisis wards
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#FFC107] flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
        </div>

        {/* Origin & Destination Card */}
        <form onSubmit={handleCalculateRoute} className="bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-xs space-y-3">
          <div className="space-y-2 relative">
            
            {/* From Selector */}
            <div className="flex items-center gap-2 bg-[#F7F7F7] p-2 rounded-xl border border-[#E5E5E5]">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-[#666666] uppercase block">
                  Origin (Starting Point)
                </label>
                <select
                  value={fromIndex}
                  onChange={(e) => setFromIndex(Number(e.target.value))}
                  className="w-full text-xs font-bold text-[#111111] bg-transparent focus:outline-hidden"
                >
                  {NAGPUR_LANDMARKS.map((item, idx) => (
                    <option key={item.name} value={idx}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwap}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-[#E5E5E5] shadow-xs flex items-center justify-center text-[#666666] hover:text-[#111111] active:rotate-180 transition"
              title="Swap Origin & Destination"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>

            {/* To Selector */}
            <div className="flex items-center gap-2 bg-[#F7F7F7] p-2 rounded-xl border border-[#E5E5E5]">
              <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-[#666666] uppercase block">
                  Destination
                </label>
                <select
                  value={toIndex}
                  onChange={(e) => setToIndex(Number(e.target.value))}
                  className="w-full text-xs font-bold text-[#111111] bg-transparent focus:outline-hidden"
                >
                  {NAGPUR_LANDMARKS.map((item, idx) => (
                    <option key={item.name} value={idx}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* THE SINGLE PRIMARY ACTION CTA ON THIS SCREEN */}
          <button
            type="submit"
            disabled={loadingRoute}
            className="w-full py-3.5 px-4 rounded-xl bg-[#FF8A00] hover:bg-[#E67C00] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingRoute ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Computing Safest Route...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Find Safest Route</span>
              </>
            )}
          </button>
        </form>

        {/* Route Details Card */}
        {routeResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Route Summary Stats */}
            <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-xs space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl bg-[#F7F7F7]">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-[#666666] font-medium">
                    <Milestone className="w-3.5 h-3.5 text-[#FF8A00]" />
                    <span>Distance</span>
                  </div>
                  <div className="text-xl font-black text-[#111111] mt-0.5">
                    {routeResult.distance_km} km
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F7F7F7]">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-[#666666] font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#22A447]" />
                    <span>Estimated Time</span>
                  </div>
                  <div className="text-xl font-black text-[#111111] mt-0.5">
                    ~{routeResult.estimated_minutes} mins
                  </div>
                </div>
              </div>

              {/* Avoided Danger Zones Callout */}
              {routeResult.avoided_high_risk_zones && routeResult.avoided_high_risk_zones.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-extrabold text-amber-950">
                    <ShieldAlert className="w-4 h-4 text-[#FF8A00]" />
                    <span>Active Hazard Diversion</span>
                  </div>
                  <p className="text-[11px]">
                    Route actively bypasses high-risk waterlogging in:{" "}
                    <span className="font-bold">{routeResult.avoided_high_risk_zones.join(", ")}</span>.
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#22A447] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {routeResult.safety_explanation}
                </p>
              </div>
            </div>

            {/* Map Preview of the Calculated Route */}
            <div className="w-full h-72 rounded-2xl overflow-hidden border border-[#E5E5E5] shadow-xs">
              <MapComponent
                zones={zones}
                routeData={routeResult}
              />
            </div>
          </motion.div>
        )}

      </div>
    </CitizenLayout>
  );
}
