"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import SafeRouteFinder from "../components/SafeRouteFinder";
import ReportHazardModal from "../components/ReportHazardModal";
import AdminCommandCenter from "../components/AdminCommandCenter";
import { getRiskZones, getReports } from "../lib/api";
import {
  Shield,
  Navigation,
  AlertTriangle,
  Layers,
  Activity,
  CloudRain,
  MapPin,
  RefreshCw,
  Info,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

// Client-side dynamic import of Leaflet map (ssr: false)
const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-medium text-xs">
      <div className="flex flex-col items-center space-y-2">
        <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Nagpur GIS Map Engine...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  const [mode, setMode] = useState("citizen"); // "citizen" | "admin"
  const [activeTab, setActiveTab] = useState("map"); // "map" | "route" | "overview" | "admin"

  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);

  // Safe routing state
  const [routeData, setRouteData] = useState(null);

  // Map picking mode state
  const [clickMode, setClickMode] = useState(null); // "start" | "end" | "hazard" | null
  const [pickedLocation, setPickedLocation] = useState(null);

  // Citizen Hazard Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Load live data from Django API
  const refreshData = async () => {
    try {
      const [zonesData, reportsData] = await Promise.all([
        getRiskZones().catch(() => []),
        getReports().catch(() => []),
      ]);

      if (Array.isArray(zonesData)) {
        setZones(zonesData);
      }
      if (Array.isArray(reportsData)) {
        setReports(reportsData);
      }
    } catch (err) {
      console.error("Data refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchInitial = async () => {
      try {
        const [zonesData, reportsData] = await Promise.all([
          getRiskZones().catch(() => []),
          getReports().catch(() => []),
        ]);
        if (mounted) {
          if (Array.isArray(zonesData)) setZones(zonesData);
          if (Array.isArray(reportsData)) setReports(reportsData);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) setLoading(false);
      }
    };

    fetchInitial();
    const interval = setInterval(fetchInitial, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLocationPickedOnMap = (coords) => {
    setPickedLocation(coords);
    if (clickMode === "hazard") {
      setReportModalOpen(true);
    }
    setClickMode(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mode={mode}
        setMode={setMode}
        zones={zones}
        reports={reports}
        onOpenReportModal={() => setReportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {mode === "admin" ? (
          /* Admin Command Center Mode */
          <AdminCommandCenter zones={zones} onDataRefreshed={refreshData} />
        ) : (
          /* Citizen Experience Mode (Mobile-first, responsive) */
          <div className="space-y-6">
            {/* Top Quick Actions & City Pulse Header */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Nagpur Urban Crisis Map
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Real-time rainfall, waterlogging risk prediction & safer road routing
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFC107] to-[#FF8A00] text-slate-950 font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2 active:scale-95"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Report Hazard</span>
                </button>

                <button
                  onClick={() => setActiveTab(activeTab === "route" ? "map" : "route")}
                  className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
                    activeTab === "route"
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  <span>{activeTab === "route" ? "Close Route" : "Safe Route"}</span>
                </button>
              </div>
            </div>

            {/* Split Screen Layout: Map & Interactive Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Column (Takes 2 cols on desktop) */}
              <div className="lg:col-span-2 h-[520px] sm:h-[600px]">
                <MapComponent
                  zones={zones}
                  reports={reports}
                  routeData={routeData}
                  clickMode={clickMode}
                  onLocationSelected={handleLocationPickedOnMap}
                  selectedZone={selectedZone}
                  onZoneClick={(z) => setSelectedZone(z)}
                />
              </div>

              {/* Sidebar Interactive Panel */}
              <div className="space-y-5">
                {activeTab === "route" ? (
                  /* Safe Route Finder Component */
                  <SafeRouteFinder
                    onRouteFound={(res) => setRouteData(res)}
                    onPickOnMap={(type) => setClickMode(type)}
                    pickedLocation={pickedLocation}
                    clickMode={clickMode}
                    setClickMode={setClickMode}
                  />
                ) : selectedZone ? (
                  /* Selected Zone Detail Card */
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h2 className="text-base font-black text-slate-900">{selectedZone.name} Ward</h2>
                        <span className="text-xs text-slate-400">Nagpur Administrative Zone</span>
                      </div>
                      <span
                        className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg ${
                          selectedZone.risk_category === "Severe"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : selectedZone.risk_category === "High"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : selectedZone.risk_category === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {selectedZone.risk_category} ({selectedZone.latest_risk_score ?? 10})
                      </span>
                    </div>

                    {selectedZone.photo_confirmed && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Photo-Confirmed Waterlogging Active in this Ward</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Rainfall (Open-Meteo)</span>
                        <span className="text-base font-black text-slate-800">
                          {selectedZone.latest_weather?.rainfall_intensity_mm ?? 0} mm
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Source: {selectedZone.latest_weather?.source ?? "None"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Drainage Capacity</span>
                        <span className="text-base font-black text-slate-800">
                          {Math.round(selectedZone.drainage_capacity * 100)}%
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Deficit: {Math.round((1 - selectedZone.drainage_capacity) * 100)}%
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Elevation Factor</span>
                        <span className="text-base font-black text-slate-800">
                          {selectedZone.elevation_factor}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Low-lying basin index</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Civic Status</span>
                        <span className="text-sm font-bold text-slate-800">
                          {selectedZone.dispatch_status}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Municipal dispatch</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedZone(null)}
                      className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                ) : (
                  /* Overview Wards Summary Card */
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h2 className="text-sm font-bold text-slate-900">Nagpur Wards Crisis Status</h2>
                      <span className="text-xs text-slate-400">{zones.length} Wards</span>
                    </div>

                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {zones.map((z) => (
                        <div
                          key={z.id}
                          onClick={() => setSelectedZone(z)}
                          className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-slate-900">{z.name}</span>
                              {z.photo_confirmed && (
                                <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                                  📸 Flood
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500">
                              Rain: {z.latest_weather?.rainfall_intensity_mm ?? 0}mm | Drainage:{" "}
                              {Math.round(z.drainage_capacity * 100)}%
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              z.risk_category === "Severe"
                                ? "bg-red-500 text-white"
                                : z.risk_category === "High"
                                ? "bg-amber-500 text-white"
                                : z.risk_category === "Medium"
                                ? "bg-yellow-400 text-slate-950"
                                : "bg-emerald-500 text-white"
                            }`}
                          >
                            {z.latest_risk_score ?? 10} ({z.risk_category})
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Click any ward polygon for full sensor breakdown</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Citizen Hazard Reporting Modal */}
      <ReportHazardModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        initialLocation={pickedLocation}
        onPickOnMap={() => setClickMode("hazard")}
        onReportSubmitted={() => {
          refreshData();
        }}
      />
    </div>
  );
}
