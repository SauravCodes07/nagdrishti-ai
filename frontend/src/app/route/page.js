"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Navigation,
  MapPin,
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Car,
  RefreshCw,
  Sparkles,
  Info,
} from "lucide-react";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { getSafeRoute, getRiskZones, getReports } from "../../lib/api";

const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] rounded-2xl bg-slate-100 dark:bg-[#131B2A] flex items-center justify-center text-xs font-bold text-slate-400">
      Loading GIS Map Layer...
    </div>
  ),
});

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

function SafeRouteContent() {
  const searchParams = useSearchParams();
  const destQuery = searchParams ? searchParams.get("destination") : null;

  const [startPoint, setStartPoint] = useState(NAGPUR_HUBS[2]); // Dharampeth
  const [endPoint, setEndPoint] = useState(NAGPUR_HUBS[11]); // Lakadganj

  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRiskZones().then((data) => {
      if (Array.isArray(data)) setZones(data);
    }).catch(() => {});

    getReports().then((data) => {
      if (Array.isArray(data)) setReports(data);
    }).catch(() => {});

    if (destQuery) {
      const match = NAGPUR_HUBS.find((h) => h.name.toLowerCase().includes(destQuery.toLowerCase()));
      if (match) setEndPoint(match);
    }
  }, [destQuery]);

  const handleCalculateRoute = async () => {
    if (!startPoint || !endPoint) {
      setError("Please select both Origin and Destination.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getSafeRoute(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng);
      setRouteResult(data);
    } catch (err) {
      setError(err.message || "Failed to calculate safe route across road graph.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = startPoint;
    setStartPoint(endPoint);
    setEndPoint(temp);
    setRouteResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Flood-Safe Route Planner
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
          Dynamic A* algorithm on Nagpur's OpenStreetMap graph that penalizes high-risk flood zones and submerged underpasses
        </p>
      </div>

      {/* 2-Column Responsive Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Route Calculator Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#EA580C] dark:text-[#FF8A00]" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Journey Parameters
                </h2>
              </div>

              <button
                onClick={handleSwap}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0B0F17] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                title="Swap Origin and Destination"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Swap</span>
              </button>
            </div>

            {/* Origin Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00]"></span>
                <span>Origin (Start Location)</span>
              </label>

              <select
                value={`${startPoint.lat},${startPoint.lng}`}
                onChange={(e) => {
                  const [lat, lng] = e.target.value.split(",").map(Number);
                  const hub = NAGPUR_HUBS.find((h) => Math.abs(h.lat - lat) < 0.001 && Math.abs(h.lng - lng) < 0.001);
                  setStartPoint(hub || { name: `Coordinates (${lat.toFixed(3)}, ${lng.toFixed(3)})`, lat, lng });
                }}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] rounded-2xl px-3.5 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF8A00] cursor-pointer"
              >
                {NAGPUR_HUBS.map((hub) => (
                  <option key={`start-${hub.name}`} value={`${hub.lat},${hub.lng}`}>
                    {hub.name} ({hub.lat.toFixed(4)}, {hub.lng.toFixed(4)})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>Destination (Arrival Point)</span>
              </label>

              <select
                value={`${endPoint.lat},${endPoint.lng}`}
                onChange={(e) => {
                  const [lat, lng] = e.target.value.split(",").map(Number);
                  const hub = NAGPUR_HUBS.find((h) => Math.abs(h.lat - lat) < 0.001 && Math.abs(h.lng - lng) < 0.001);
                  setEndPoint(hub || { name: `Coordinates (${lat.toFixed(3)}, ${lng.toFixed(3)})`, lat, lng });
                }}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] rounded-2xl px-3.5 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF8A00] cursor-pointer"
              >
                {NAGPUR_HUBS.map((hub) => (
                  <option key={`end-${hub.name}`} value={`${hub.lat},${hub.lng}`}>
                    {hub.name} ({hub.lat.toFixed(4)}, {hub.lng.toFixed(4)})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Button */}
            <button
              onClick={handleCalculateRoute}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-[#FF8A00]/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Navigation className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Computing Risk-Penalized A* Path..." : "Find Flood-Safe Route"}</span>
            </button>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Results Breakdown */}
            {routeResult && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Safe Path Calculated</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {routeResult.distance_km || routeResult.total_distance_km} km
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Distance</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {routeResult.distance_km || routeResult.total_distance_km} km
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated Time</span>
                    <span className="text-base font-black text-[#EA580C] dark:text-[#FF8A00]">
                      ~{routeResult.estimated_minutes || routeResult.estimated_time_min || 14} mins
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {routeResult.safety_explanation || "Path safely routes around high-risk basin coordinates."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Large Interactive Map Screen */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Live Route Topology & Flood Barriers
            </span>
            <span className="text-[10px] font-bold text-[#EA580C] dark:text-[#FF8A00]">
              {routeResult ? "Safe Polyline Rendered" : "Select Points & Calculate"}
            </span>
          </div>

          <div className="h-[480px] sm:h-[560px] w-full rounded-2xl overflow-hidden relative border border-slate-200 dark:border-[#1E293B]">
            <MapComponent
              zones={zones}
              reports={reports}
              route={routeResult?.route_coordinates || routeResult?.coordinates || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SafeRoutePage() {
  return (
    <CitizenLayout>
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs font-bold text-slate-400">
            Loading Safe Route Navigation...
          </div>
        }
      >
        <SafeRouteContent />
      </Suspense>
    </CitizenLayout>
  );
}
