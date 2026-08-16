"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { getRiskZones, getReports, getWeather } from "../../lib/api";
import {
  CloudRain,
  Layers,
  AlertTriangle,
  Navigation,
  X,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  MapPin,
  ChevronRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-neutral-100 flex flex-col items-center justify-center text-neutral-500 text-xs">
      <div className="w-8 h-8 border-3 border-[#FFC107] border-t-transparent rounded-full animate-spin mb-2"></div>
      <span className="font-semibold text-[#111111]">Loading Nagpur Live Flood Map...</span>
    </div>
  ),
});

export default function LiveMapPage() {
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [layerFilter, setLayerFilter] = useState("all"); // "all" | "severe" | "reports"

  const loadMapData = async () => {
    try {
      const [z, r, w] = await Promise.all([
        getRiskZones().catch(() => []),
        getReports().catch(() => []),
        getWeather().catch(() => null),
      ]);
      setZones(Array.isArray(z) ? z : []);
      setReports(Array.isArray(r) ? r : []);
      setWeather(w);
    } catch (err) {
      console.error("Map data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
    const interval = setInterval(loadMapData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredZones = layerFilter === "severe"
    ? zones.filter((z) => (z.latest_risk_score ?? z.risk_score ?? 0) >= 50)
    : zones;

  const filteredReports = layerFilter === "severe"
    ? reports.filter((r) => r.is_waterlogged || r.verification_status === "verified")
    : reports;

  return (
    <CitizenLayout>
      <div className="relative w-full h-[calc(100vh-130px)] flex flex-col overflow-hidden">
        
        {/* Floating Top Status Bar */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur border border-[#E5E5E5] shadow-sm text-xs font-bold text-[#111111]">
            <CloudRain className="w-4 h-4 text-[#FF8A00]" />
            <span>
              Rainfall: {weather?.nagpur_city_average_rain_mm?.toFixed(1) || "0.0"} mm/h
            </span>
          </div>

          <button
            onClick={loadMapData}
            className="pointer-events-auto p-2 rounded-full bg-white/95 backdrop-blur border border-[#E5E5E5] shadow-sm text-[#111111] hover:bg-neutral-100 transition active:rotate-180"
            title="Refresh Map Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Floating Layer Filter Chips */}
        <div className="absolute top-14 left-3 z-30 flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setLayerFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition shadow-xs ${
              layerFilter === "all"
                ? "bg-[#111111] text-white"
                : "bg-white/90 text-[#666666] border border-[#E5E5E5]"
            }`}
          >
            All Wards ({zones.length})
          </button>
          <button
            onClick={() => setLayerFilter("severe")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition shadow-xs ${
              layerFilter === "severe"
                ? "bg-red-600 text-white"
                : "bg-white/90 text-[#666666] border border-[#E5E5E5]"
            }`}
          >
            High Risk Only
          </button>
        </div>

        {/* The Leaflet Map Instance */}
        <div className="flex-1 w-full h-full">
          <MapComponent
            zones={filteredZones}
            reports={filteredReports}
            selectedZone={selectedZone}
            onZoneClick={(zone) => setSelectedZone(zone)}
          />
        </div>

        {/* Zone Details Bottom Sheet */}
        <AnimatePresence>
          {selectedZone && (
            <motion.div
              initial={{ y: 250, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 250, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-2 left-2 right-2 z-40 bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-lg space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-[#111111]">
                      {selectedZone.name}
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        (selectedZone.latest_risk_score ?? selectedZone.risk_score ?? 0) >= 60
                          ? "bg-red-100 text-red-700"
                          : (selectedZone.latest_risk_score ?? selectedZone.risk_score ?? 0) >= 30
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {selectedZone.risk_category || "Moderate"}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#666666] mt-0.5">
                    Drainage: {(selectedZone.drainage_capacity * 100).toFixed(0)}% • Elev Factor: {selectedZone.elevation_factor}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedZone(null)}
                  className="p-1 rounded-full hover:bg-neutral-100 text-[#666666]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[#F7F7F7] p-2.5 rounded-xl text-center">
                <div>
                  <div className="text-[10px] text-[#666666] font-medium">Risk Score</div>
                  <div className="text-sm font-black text-[#111111]">
                    {(selectedZone.latest_risk_score ?? selectedZone.risk_score ?? 10).toFixed(1)}/100
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#666666] font-medium">Rainfall</div>
                  <div className="text-sm font-black text-[#111111]">
                    {selectedZone.rainfall_mm?.toFixed(1) || weather?.nagpur_city_average_rain_mm?.toFixed(1) || 0} mm/h
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#666666] font-medium">Dispatch</div>
                  <div className="text-[11px] font-bold text-[#111111] truncate mt-0.5">
                    {selectedZone.dispatch_status || "Normal"}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Single Primary Orange Action */}
              <div className="flex gap-2">
                <Link
                  href={`/route?to=${selectedZone.name}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#111111] text-white text-xs font-bold hover:bg-black transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Route Here</span>
                </Link>

                <Link
                  href="/report"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FF8A00] text-white text-xs font-bold hover:bg-[#E67C00] shadow-sm transition"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report Hazard</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </CitizenLayout>
  );
}
