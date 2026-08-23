"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  Navigation,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import LocationSearchInput from "../../components/LocationSearchInput";
import { getSafeRoute, getRiskZones, getReports, DEFAULT_RISK_ZONES } from "../../lib/api";
import { getNmcWardInfo, isWithinServiceRegion } from "../../lib/geoService";
import {
  HoverLiftCard,
  MagneticButton,
  AnimatedCounter,
} from "../../components/motion";

const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[460px] rounded-2xl bg-[#F1F5F9] dark:bg-[#162235] flex items-center justify-center text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
      Loading High-Precision GIS Map...
    </div>
  ),
});

const QUICK_TRIP_PRESETS = [
  {
    name: "Fetri → Lakadganj",
    desc: "Suburban Corridor",
    origin: { name: "Fetri (Katol Road)", lat: 21.2185, lng: 78.9620 },
    dest: { name: "Lakadganj Square", lat: 21.1550, lng: 79.1300 },
  },
  {
    name: "Sitabuldi → Dharampeth",
    desc: "Central Metro Strip",
    origin: { name: "Sitabuldi Interchange", lat: 21.1465, lng: 79.0825 },
    dest: { name: "Dharampeth Square", lat: 21.1472, lng: 79.0664 },
  },
  {
    name: "Hingna → Sitabuldi",
    desc: "Industrial Transit Link",
    origin: { name: "Hingna MIDC", lat: 21.0950, lng: 78.9780 },
    dest: { name: "Sitabuldi Interchange", lat: 21.1465, lng: 79.0825 },
  },
  {
    name: "Besa → Sadar",
    desc: "South to North Radial",
    origin: { name: "Besa (Manewada Rd)", lat: 21.0850, lng: 79.1020 },
    dest: { name: "Sadar Residency Rd", lat: 21.1605, lng: 79.0830 },
  },
  {
    name: "Kamptee → Airport",
    desc: "Metropolitan Bypass",
    origin: { name: "Kamptee Town", lat: 21.2280, lng: 79.1980 },
    dest: { name: "Wardha Rd Airport T1", lat: 21.0920, lng: 79.0630 },
  },
];

function SafeRouteContent() {
  const searchParams = useSearchParams();
  const destQuery = searchParams ? searchParams.get("destination") : null;

  const [startPoint, setStartPoint] = useState({
    name: "Sitabuldi Interchange",
    lat: 21.1465,
    lng: 79.0825,
    source: "preset",
  });
  const [endPoint, setEndPoint] = useState({
    name: "Dharampeth Square",
    lat: 21.1472,
    lng: 79.0664,
    source: "preset",
  });

  const [travelMode, setTravelMode] = useState("driving"); // "driving" | "walking"
  const [zones, setZones] = useState(DEFAULT_RISK_ZONES);
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
      setEndPoint({ name: destQuery, lat: 21.1458, lng: 79.0882, source: "query" });
    }
  }, [destQuery]);

  const originWard = startPoint?.lat ? getNmcWardInfo(startPoint.lat, startPoint.lng) : null;
  const destWard = endPoint?.lat ? getNmcWardInfo(endPoint.lat, endPoint.lng) : null;

  const handleCalculateRoute = async () => {
    if (!startPoint || !endPoint) {
      setError("Please select both Origin and Destination.");
      return;
    }

    if (!startPoint.lat || !startPoint.lng || !endPoint.lat || !endPoint.lng) {
      setError("Please select valid locations with coordinates.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getSafeRoute(
        startPoint.lat,
        startPoint.lng,
        endPoint.lat,
        endPoint.lng,
        travelMode
      );
      setRouteResult(data);
    } catch (err) {
      console.error("[Route Page Error]:", err);
      setError(
        err.message || "Failed to calculate road route across OpenStreetMap road network."
      );
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

  const applyPreset = (preset) => {
    setStartPoint(preset.origin);
    setEndPoint(preset.dest);
    setRouteResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          Safe Routes & Navigation
        </h1>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
          Real OpenStreetMap road routing with NMC municipal flood risk intelligence across Nagpur & surrounding metropolitan areas
        </p>
      </div>

      {/* Quick Pick Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
          Quick Trip Routes
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_TRIP_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="h-8 px-3 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#CBD5E1] dark:border-[#334155] hover:border-[#0F766E] dark:hover:border-[#14B8A6] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5 shrink-0 transition shadow-2xs hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6]" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Responsive Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Route Parameters & Analysis */}
        <div className="lg:col-span-5 space-y-4">
          <HoverLiftCard className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#243244] pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <h2 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider">
                  Journey Parameters
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Travel Mode Toggle */}
                <div className="flex p-0.5 rounded-lg bg-[#F1F5F9] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244]">
                  <button
                    type="button"
                    onClick={() => setTravelMode("driving")}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition ${
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
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition ${
                      travelMode === "walking"
                        ? "bg-[#FFFFFF] dark:bg-[#1E293B] text-[#0F766E] dark:text-[#5EEAD4] shadow-xs"
                        : "text-[#64748B] dark:text-[#94A3B8]"
                    }`}
                  >
                    Walk
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSwap}
                  className="p-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F17] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-[#475569] dark:text-[#CBD5E1] font-medium text-xs flex items-center transition cursor-pointer"
                  title="Swap Origin and Destination"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>

            {/* Origin Search Input */}
            <div className="space-y-1">
              <LocationSearchInput
                label="Origin (Start Location)"
                value={startPoint}
                onChange={(loc) => setStartPoint(loc)}
                allowCurrentLocation={true}
                placeholder="Search origin (e.g. Fetri, Sitabuldi, Hingna)..."
                dotColor="teal"
              />
              {originWard && (
                <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 pl-1">
                  <MapPin className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>{originWard.statusText}</span>
                </div>
              )}
            </div>

            {/* Destination Search Input */}
            <div className="space-y-1">
              <LocationSearchInput
                label="Destination (Arrival Point)"
                value={endPoint}
                onChange={(loc) => setEndPoint(loc)}
                allowCurrentLocation={false}
                placeholder="Search destination (e.g. Lakadganj, Sadar, Airport)..."
                dotColor="red"
              />
              {destWard && (
                <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 pl-1">
                  <MapPin className="w-3 h-3 text-[#DC2626]" />
                  <span>{destWard.statusText}</span>
                </div>
              )}
            </div>

            {/* Calculate Button */}
            <MagneticButton>
              <button
                onClick={handleCalculateRoute}
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Navigation className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Calculating safest road route..." : "Find Flood-Safe Route"}</span>
              </button>
            </MagneticButton>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="p-3 rounded-xl bg-[#FEF2F2] dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs font-medium text-[#991B1B] dark:text-[#F87171] flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Route Result Card */}
            <AnimatePresence>
              {routeResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] space-y-3 shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#16A34A] dark:text-[#4ADE80] font-semibold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Road Path Computed</span>
                    </div>
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {(routeResult.distance_km || routeResult.total_distance_km || 0).toFixed(1)} km
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244]">
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase block">Distance</span>
                      <span className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        <AnimatedCounter
                          value={routeResult.distance_km || routeResult.total_distance_km || 0}
                          decimals={1}
                          suffix=" km"
                        />
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244]">
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase block">Estimated Time</span>
                      <span className="text-base font-bold text-[#0F766E] dark:text-[#14B8A6]">
                        <AnimatedCounter
                          value={routeResult.estimated_minutes || routeResult.estimated_time_min || 12}
                          prefix="~"
                          suffix=" min"
                        />
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      <Info className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                      <span>Safety Assessment</span>
                    </div>
                    <p className="text-[11px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                      {routeResult.safety_explanation ||
                        "Standard road route active. Municipal flood sensor telemetry is concentrated within NMC administrative wards."}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </HoverLiftCard>
        </div>

        {/* Right Column: Interactive Map Screen */}
        <div className="lg:col-span-7 bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
              Interactive GIS Map & Ward Boundaries
            </span>
            <span className="text-[11px] font-medium text-[#0F766E] dark:text-[#14B8A6] flex items-center gap-1">
              {routeResult ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span>Road Route Active</span>
                </>
              ) : (
                <span>Click map to set Origin / Destination</span>
              )}
            </span>
          </div>

          <div className="h-[460px] sm:h-[540px] w-full rounded-xl overflow-hidden relative border border-[#E2E8F0] dark:border-[#243244]">
            <MapComponent
              zones={zones}
              reports={reports}
              origin={startPoint}
              destination={endPoint}
              route={routeResult?.route_coordinates || routeResult?.coordinates || []}
              onSetOrigin={(loc) => {
                setStartPoint({
                  name: loc.name,
                  lat: loc.lat,
                  lng: loc.lng,
                  source: "map",
                });
                setRouteResult(null);
              }}
              onSetDestination={(loc) => {
                setEndPoint({
                  name: loc.name,
                  lat: loc.lat,
                  lng: loc.lng,
                  source: "map",
                });
                setRouteResult(null);
              }}
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
