"use client";

import { useEffect, useRef, useState } from "react";
import { Locate, Layers, Eye, AlertTriangle, Navigation, MapPin } from "lucide-react";
import { API_BASE } from "../lib/api";

// Color mapping for risk categories
export function getRiskColor(category, score) {
  if (category === "Severe" || score > 75) return "#E53935"; // Red
  if (category === "High" || score > 50) return "#FF8A00";   // Orange
  if (category === "Medium" || score > 25) return "#FFC107"; // Yellow
  return "#22A447"; // Green
}

export default function MapComponent({
  zones = [],
  reports = [],
  routeData = null,
  clickMode = null, // "start" | "end" | "hazard" | null
  onLocationSelected = null,
  selectedZone = null,
  onZoneClick = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const leafletRef = useRef(null);
  const zonesLayerGroupRef = useRef(null);
  const reportsLayerGroupRef = useRef(null);
  const routeLayerGroupRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  // Initialize Leaflet Map safely in client environment
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = require("leaflet");
    leafletRef.current = L;

    // Fix default marker icon paths in Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    // Center of Nagpur (Zero Mile: 21.1458, 79.0882)
    const map = L.map(mapContainerRef.current, {
      center: [21.1458, 79.0882],
      zoom: 13,
      zoomControl: false,
    });

    // High clarity OSM tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    zonesLayerGroupRef.current = L.layerGroup().addTo(map);
    reportsLayerGroupRef.current = L.layerGroup().addTo(map);
    routeLayerGroupRef.current = L.layerGroup().addTo(map);

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (onLocationSelected) {
        onLocationSelected({ lat, lng });
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Zone Polygons
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !zonesLayerGroupRef.current) return;

    zonesLayerGroupRef.current.clearLayers();

    zones.forEach((zone) => {
      let coords = null;
      const b = zone.boundary;

      if (b && b.coordinates && b.coordinates[0]) {
        coords = b.coordinates[0].map((pt) => [pt[1], pt[0]]);
      }

      if (!coords || coords.length === 0) return;

      const riskScore = zone.latest_risk_score ?? 10.0;
      const category = zone.risk_category || "Low";
      const color = getRiskColor(category, riskScore);
      const isPhotoConfirmed = !!zone.photo_confirmed;

      const polygon = L.polygon(coords, {
        color: color,
        weight: isPhotoConfirmed ? 3.5 : 2,
        opacity: 0.9,
        fillColor: color,
        fillOpacity: isPhotoConfirmed ? 0.45 : 0.25,
        className: isPhotoConfirmed && category === "Severe" ? "severe-zone-pulse" : "",
      });

      const weather = zone.latest_weather;
      const rainfallMm = weather ? weather.rainfall_intensity_mm : 0.0;
      const weatherSource = weather ? weather.source : "None";

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; margin-bottom: 8px;">
            <strong style="font-size: 14px; color: #111;">${zone.name} Ward</strong>
            <span style="background: ${color}; color: ${category === 'Medium' ? '#000' : '#fff'}; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">
              ${category.toUpperCase()} (${riskScore})
            </span>
          </div>

          ${isPhotoConfirmed ? `
            <div style="background: #FEF2F2; border: 1px solid #F87171; border-radius: 6px; padding: 4px 8px; margin-bottom: 8px; font-size: 11px; color: #991B1B; font-weight: bold; display: flex; align-items: center; gap: 4px;">
              📸 PHOTO-CONFIRMED WATERLOGGING
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; color: #444;">
            <div><strong>Rainfall:</strong> ${rainfallMm} mm</div>
            <div><strong>Source:</strong> ${weatherSource}</div>
            <div><strong>Drainage:</strong> ${Math.round(zone.drainage_capacity * 100)}%</div>
            <div><strong>Elevation:</strong> ${zone.elevation_factor}</div>
            <div style="grid-column: span 2;">
              <strong>Dispatch State:</strong> 
              <span style="font-weight: 600; color: ${zone.dispatch_status === 'Dispatched' ? '#D97706' : zone.dispatch_status === 'Resolved' ? '#16A34A' : '#6B7280'}">
                ${zone.dispatch_status}
              </span>
            </div>
          </div>
        </div>
      `;

      polygon.bindPopup(popupHtml);

      polygon.on("click", () => {
        if (onZoneClick) onZoneClick(zone);
      });

      polygon.addTo(zonesLayerGroupRef.current);
    });
  }, [zones, onZoneClick]);

  // Update Citizen Hazard Report Markers
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !reportsLayerGroupRef.current) return;

    reportsLayerGroupRef.current.clearLayers();

    reports.forEach((rep) => {
      let lat = null;
      let lng = null;

      if (rep.reporter_location) {
        if (rep.reporter_location.coordinates) {
          lng = rep.reporter_location.coordinates[0];
          lat = rep.reporter_location.coordinates[1];
        } else if (Array.isArray(rep.reporter_location) && rep.reporter_location.length >= 2) {
          lng = rep.reporter_location[0];
          lat = rep.reporter_location[1];
        }
      }

      if (lat === null || lng === null) return;

      const isWaterlogging = rep.waterlogging_detected === true;
      const isPothole = rep.pothole_detected === true;

      const markerColor = isWaterlogging ? "#E53935" : isPothole ? "#FF8A00" : "#3B82F6";
      const iconHtml = `
        <div style="background-color: ${markerColor}; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: bold;">
          ${isWaterlogging ? "🌊" : isPothole ? "⚠️" : "📍"}
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-hazard-marker",
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      const photoUrl = rep.photo ? (rep.photo.startsWith("http") ? rep.photo : `${API_BASE}${rep.photo}`) : null;

      const popupContent = `
        <div style="font-family: sans-serif; min-width: 220px; max-width: 280px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px;">
            <strong style="font-size: 13px; color: #111;">Hazard #${rep.id} (${rep.zone_name || 'Nagpur'})</strong>
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${rep.verification_status === 'Verified' ? '#DCFCE7' : rep.verification_status === 'Rejected' ? '#FEE2E2' : '#FEF3C7'}; color: ${rep.verification_status === 'Verified' ? '#166534' : rep.verification_status === 'Rejected' ? '#991B1B' : '#92400E'};">
              ${rep.verification_status}
            </span>
          </div>

          ${photoUrl ? `
            <div style="margin: 6px 0; border-radius: 6px; overflow: hidden; max-height: 120px;">
              <img src="${photoUrl}" alt="Hazard" style="width: 100%; height: 110px; object-fit: cover;" />
            </div>
          ` : ''}

          <p style="font-size: 12px; color: #333; margin: 4px 0 8px 0;">${rep.description || 'No description provided.'}</p>

          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 6px; font-size: 11px;">
            <div style="font-weight: bold; color: #475569; margin-bottom: 3px;">🤖 Hugging Face AI Vision:</div>
            <div style="display: flex; justify-content: space-between;">
              <span>Pothole:</span>
              <strong style="color: ${rep.pothole_detected ? '#DC2626' : '#64748B'}">
                ${rep.pothole_detected === null ? 'Not Evaluated' : rep.pothole_detected ? `Detected (${Math.round((rep.pothole_confidence || 0) * 100)}%)` : 'Clear'}
              </strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Waterlogging:</span>
              <strong style="color: ${rep.waterlogging_detected ? '#DC2626' : '#64748B'}">
                ${rep.waterlogging_detected === null ? 'Not Evaluated' : rep.waterlogging_detected ? `Detected (${Math.round((rep.waterlogging_confidence || 0) * 100)}%)` : 'Clear'}
              </strong>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(reportsLayerGroupRef.current);
    });
  }, [reports]);

  // Update Safe Route Polyline Overlay
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !routeLayerGroupRef.current) return;

    routeLayerGroupRef.current.clearLayers();

    if (routeData && routeData.coordinates && routeData.coordinates.length > 0) {
      const latlngs = routeData.coordinates;

      const glowLine = L.polyline(latlngs, {
        color: "#38BDF8",
        weight: 8,
        opacity: 0.4,
        lineCap: "round",
      }).addTo(routeLayerGroupRef.current);

      const mainLine = L.polyline(latlngs, {
        color: "#0284C7",
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        dashArray: "8, 6",
      }).addTo(routeLayerGroupRef.current);

      const startPt = latlngs[0];
      const startIcon = L.divIcon({
        className: "route-start-marker",
        html: `<div style="background-color: #22A447; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">A</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker(startPt, { icon: startIcon })
        .bindPopup("<strong>Route Start Point</strong>")
        .addTo(routeLayerGroupRef.current);

      const endPt = latlngs[latlngs.length - 1];
      const endIcon = L.divIcon({
        className: "route-end-marker",
        html: `<div style="background-color: #E53935; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">B</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker(endPt, { icon: endIcon })
        .bindPopup("<strong>Route Destination</strong>")
        .addTo(routeLayerGroupRef.current);

      mapInstanceRef.current.fitBounds(mainLine.getBounds(), { padding: [40, 40] });
    }
  }, [routeData]);

  // GPS User Locator
  const handleLocateMe = () => {
    const L = leafletRef.current;
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocating(false);

        if (mapInstanceRef.current && L) {
          mapInstanceRef.current.setView([latitude, longitude], 15);

          const userIcon = L.divIcon({
            className: "user-gps-marker",
            html: `
              <div style="position: relative; width: 22px; height: 22px;">
                <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: #3B82F6; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #2563EB; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          L.marker([latitude, longitude], { icon: userIcon })
            .bindPopup("<strong>📍 Your Current Location</strong>")
            .addTo(mapInstanceRef.current);
        }

        if (onLocationSelected) {
          onLocationSelected({ lat: latitude, lng: longitude });
        }
      },
      (err) => {
        setLocating(false);
        console.warn("Geolocation failed:", err.message);
        alert("Could not access your location. You can click anywhere on the map to set a location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls & Overlays */}
      <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2">
        {clickMode && (
          <div className="bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 shadow-lg text-xs font-semibold flex items-center space-x-2 animate-bounce">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>
              {clickMode === "start"
                ? "Click map to set ROUTE ORIGIN"
                : clickMode === "end"
                ? "Click map to set DESTINATION"
                : "Click map to pinpoint HAZARD"}
            </span>
          </div>
        )}
      </div>

      {/* Locate Me GPS Button */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <button
          onClick={handleLocateMe}
          disabled={locating}
          className="bg-white hover:bg-slate-50 text-slate-800 p-2.5 rounded-xl shadow-md border border-slate-200 transition-transform active:scale-95 flex items-center justify-center group"
          title="Locate my position (GPS)"
          aria-label="Locate me"
        >
          <Locate className={`w-5 h-5 text-blue-600 ${locating ? "animate-spin" : "group-hover:scale-110 transition-transform"}`} />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-slate-200 text-[11px] font-medium text-slate-700 space-y-1 hidden sm:block">
        <div className="font-bold text-[10px] uppercase text-slate-400 tracking-wider mb-1">
          Ward Risk Severity
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#22A447]"></span>
          <span>Low (0–25)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#FFC107]"></span>
          <span>Medium (26–50)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#FF8A00]"></span>
          <span>High (51–75)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#E53935] ring-2 ring-red-300 animate-pulse"></span>
          <span className="font-bold text-red-600">Severe / Flooded (76–100)</span>
        </div>
      </div>
    </div>
  );
}
