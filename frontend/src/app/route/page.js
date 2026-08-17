"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Navigation,
  Compass,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { getSafeRoute, getRiskZones, getReports } from "../../lib/api";

const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] rounded-2xl bg-[#F1F5F9] dark:bg-[#162235] flex items-center justify-center text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
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
        <h1 className="text-2xl sm:text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Safe Routes
        </h1>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
          Dynamic A* algorithm on Nagpur's OpenStreetMap graph that penalizes high-risk flood zones and submerged underpasses
        </p>
      </div>

      {/* 2-Column Responsive Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Route Calculator Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#243244] pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <h2 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider">
                  Journey Parameters
                </h2>
              </div>

              <button
                onClick={handleSwap}
                className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F17] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-[#475569] dark:text-[#CBD5E1] font-medium text-xs flex items-center gap-1 transition cursor-pointer"
                title="Swap Origin and Destination"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Swap</span>
              </button>
            </div>

            {/* Origin Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#14B8A6]"></span>
                <span>Origin (Start Location)</span>
              </label>

              <select
                value={`${startPoint.lat},${startPoint.lng}`}
                onChange={(e) => {
                  const [lat, lng] = e.target.value.split(",").map(Number);
                  const hub = NAGPUR_HUBS.find((h) => Math.abs(h.lat - lat) < 0.001 && Math.abs(h.lng - lng) < 0.001);
                  setStartPoint(hub || { name: `Coordinates (${lat.toFixed(3)}, ${lng.toFixed(3)})`, lat, lng });
                }}
                className="w-full text-xs font-normal bg-[#FFFFFF] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6] cursor-pointer"
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
              <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
                <span>Destination (Arrival Point)</span>
              </label>

              <select
                value={`${endPoint.lat},${endPoint.lng}`}
                onChange={(e) => {
                  const [lat, lng] = e.target.value.split(",").map(Number);
                  const hub = NAGPUR_HUBS.find((h) => Math.abs(h.lat - lat) < 0.001 && Math.abs(h.lng - lng) < 0.001);
                  setEndPoint(hub || { name: `Coordinates (${lat.toFixed(3)}, ${lng.toFixed(3)})`, lat, lng });
                }}
                className="w-full text-xs font-normal bg-[#FFFFFF] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-3.5 py-2.5 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6] cursor-pointer"
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
              className="w-full h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Navigation className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Computing A* Path..." : "Find Flood-Safe Route"}</span>
            </button>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs font-medium text-[#991B1B] dark:text-[#F87171] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Results Breakdown */}
            {routeResult && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#16A34A] dark:text-[#4ADE80] font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Safe Path Calculated</span>
                  </div>
                  <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {routeResult.distance_km || routeResult.total_distance_km} km
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244]">
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase block">Distance</span>
                    <span className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {routeResult.distance_km || routeResult.total_distance_km} km
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244]">
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase block">Estimated Time</span>
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
        </div>

        {/* Right Column: Interactive Map Screen */}
        <div className="lg:col-span-7 bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
              Route Topology & Drainage Basins
            </span>
            <span className="text-[11px] font-medium text-[#0F766E] dark:text-[#14B8A6]">
              {routeResult ? "Safe Corridor Rendered" : "Select Points & Calculate"}
            </span>
          </div>

          <div className="h-[460px] sm:h-[520px] w-full rounded-xl overflow-hidden relative border border-[#E2E8F0] dark:border-[#243244]">
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
          <div className="p-8 text-center text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
            Loading Safe Route Navigation...
          </div>
        }
      >
        <SafeRouteContent />
      </Suspense>
    </CitizenLayout>
  );
}
