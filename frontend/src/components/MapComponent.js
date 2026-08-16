"use client";

import { useEffect, useRef, useState } from "react";
import { Locate, MapPin, RefreshCw, Layers } from "lucide-react";
import { API_BASE } from "../lib/api";

export function getRiskColor(category, score) {
  if (category === "Severe" || score >= 75) return "#DC2626"; // Red
  if (category === "High" || score >= 50) return "#EF4444";   // Orange-Red
  if (category === "Medium" || score >= 25) return "#F59E0B"; // Amber
  return "#16A34A"; // Green
}

export default function MapComponent({
  zones = [],
  reports = [],
  routeData = null,
  route = null,
  clickMode = null,
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

  const [locating, setLocating] = useState(false);

  // Initialize Leaflet Map safely in client environment
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = require("leaflet");
    leafletRef.current = L;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    const map = L.map(mapContainerRef.current, {
      center: [21.1458, 79.0882],
      zoom: 13,
      zoomControl: false,
    });

    // Clean OpenStreetMap tiles
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

      const riskScore = zone.latest_risk_score ?? zone.risk_score ?? 10.0;
      const category = zone.risk_category || (riskScore >= 75 ? "Severe" : riskScore >= 50 ? "High" : riskScore >= 25 ? "Medium" : "Low");
      const color = getRiskColor(category, riskScore);
      const isPhotoConfirmed = !!zone.photo_confirmed || category === "Severe";

      const isSelected = selectedZone && (selectedZone.id === zone.id || selectedZone.zone_id === zone.zone_id || selectedZone.zone_name === zone.zone_name);

      const polygon = L.polygon(coords, {
        color: isSelected ? "#FF8A00" : color,
        weight: isSelected ? 4 : isPhotoConfirmed ? 3 : 2,
        fillColor: color,
        fillOpacity: isSelected ? 0.45 : isPhotoConfirmed ? 0.35 : 0.22,
        className: category === "Severe" ? "severe-zone-pulse" : "",
      });

      polygon.on("click", () => {
        if (onZoneClick) {
          onZoneClick(zone);
        }
      });

      // Polygon Popup tooltip
      const popupContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 200px; max-width: 260px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
            <strong style="font-size: 13px;">${zone.zone_name}</strong>
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: ${color}20; color: ${color};">
              ${category}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-bottom: 6px;">
            <div>
              <span style="color: #64748B;">Risk Index:</span>
              <strong style="display: block; color: ${color}; font-size: 14px;">${riskScore.toFixed(1)}</strong>
            </div>
            <div>
              <span style="color: #64748B;">Rainfall:</span>
              <strong style="display: block; font-size: 14px;">${(zone.rainfall_mm ?? zone.rainfall_intensity_mm ?? 0).toFixed(1)} mm/h</strong>
            </div>
          </div>

          <div style="font-size: 11px; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            <span>Drain Capacity: ${Math.round((zone.drainage_capacity || 0.5) * 100)}%</span>
            ${zone.elevation_m ? ` | Elev: ${zone.elevation_m}m` : ''}
          </div>
        </div>
      `;

      polygon.bindPopup(popupContent);
      polygon.addTo(zonesLayerGroupRef.current);
    });
  }, [zones, selectedZone, onZoneClick]);

  // Update Citizen Reports & Hazard Markers
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !reportsLayerGroupRef.current) return;

    reportsLayerGroupRef.current.clearLayers();

    reports.forEach((rep) => {
      let lat = rep.lat;
      let lng = rep.lng;

      if ((lat === undefined || lng === undefined) && rep.reporter_location) {
        if (rep.reporter_location.coordinates) {
          lng = rep.reporter_location.coordinates[0];
          lat = rep.reporter_location.coordinates[1];
        } else if (Array.isArray(rep.reporter_location) && rep.reporter_location.length >= 2) {
          lng = rep.reporter_location[0];
          lat = rep.reporter_location[1];
        }
      }

      if (lat === undefined || lng === undefined || lat === null || lng === null) return;

      const isWaterlogging = rep.is_waterlogged === true || rep.waterlogging_detected === true;
      const markerColor = isWaterlogging ? "#DC2626" : "#F59E0B";

      const iconHtml = `
        <div style="background-color: ${markerColor}; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: bold;">
          ${isWaterlogging ? "🌊" : "⚠️"}
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
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 220px; max-width: 280px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
            <strong style="font-size: 13px;">Hazard #${rep.id}</strong>
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: ${rep.verification_status === 'Verified' ? '#DCFCE7' : rep.verification_status === 'Rejected' ? '#FEE2E2' : '#FEF3C7'}; color: ${rep.verification_status === 'Verified' ? '#166534' : rep.verification_status === 'Rejected' ? '#991B1B' : '#92400E'};">
              ${rep.verification_status || 'Pending'}
            </span>
          </div>

          ${photoUrl ? `
            <div style="margin: 6px 0; border-radius: 8px; overflow: hidden; max-height: 120px;">
              <img src="${photoUrl}" alt="Hazard" style="width: 100%; height: 110px; object-fit: cover;" />
            </div>
          ` : ''}

          <p style="font-size: 12px; margin: 4px 0 8px 0;">${rep.description || 'Citizen hazard report.'}</p>

          <div style="background: rgba(255, 138, 0, 0.1); border: 1px solid rgba(255, 138, 0, 0.25); border-radius: 8px; padding: 6px; font-size: 11px;">
            <div style="font-weight: 700; color: #EA580C; margin-bottom: 2px;">🤖 Hugging Face AI Vision:</div>
            <div style="display: flex; justify-content: space-between;">
              <span>Waterlogging:</span>
              <strong style="color: ${isWaterlogging ? '#DC2626' : '#64748B'}">
                ${rep.waterlogging_confidence ? `${(rep.waterlogging_confidence * 100).toFixed(0)}% Confirmed` : 'Queued'}
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

    const activeRouteCoords = routeData?.coordinates || route;

    if (activeRouteCoords && activeRouteCoords.length > 0) {
      const latlngs = activeRouteCoords;

      // Glow outline (Saffron)
      L.polyline(latlngs, {
        color: "#FFA726",
        weight: 9,
        opacity: 0.45,
        lineCap: "round",
      }).addTo(routeLayerGroupRef.current);

      // Primary safe path (Saffron/Orange)
      const mainLine = L.polyline(latlngs, {
        color: "#EA580C",
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        dashArray: "6, 8",
      }).addTo(routeLayerGroupRef.current);

      // Start Marker (Saffron)
      const startPt = latlngs[0];
      const startIcon = L.divIcon({
        className: "route-start-marker",
        html: `<div style="background-color: #EA580C; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 13px;">A</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker(startPt, { icon: startIcon })
        .bindPopup("<strong>📍 Route Origin</strong>")
        .addTo(routeLayerGroupRef.current);

      // Destination Marker (Red)
      const endPt = latlngs[latlngs.length - 1];
      const endIcon = L.divIcon({
        className: "route-end-marker",
        html: `<div style="background-color: #DC2626; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 13px;">B</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker(endPt, { icon: endIcon })
        .bindPopup("<strong>🏁 Safe Destination</strong>")
        .addTo(routeLayerGroupRef.current);

      mapInstanceRef.current.fitBounds(mainLine.getBounds(), { padding: [40, 40] });
    }
  }, [routeData, route]);

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
        setLocating(false);

        if (mapInstanceRef.current && L) {
          mapInstanceRef.current.setView([latitude, longitude], 15);

          const userIcon = L.divIcon({
            className: "user-gps-marker",
            html: `
              <div style="position: relative; width: 24px; height: 24px;">
                <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: #FF8A00; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background: #EA580C; border: 2.5px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([latitude, longitude], { icon: userIcon })
            .bindPopup("<strong>📍 Your Current GPS Location</strong>")
            .addTo(mapInstanceRef.current);
        }
      },
      (err) => {
        alert("Could not detect location: " + err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([21.1458, 79.0882], 13);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-3xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <button
          onClick={handleLocateMe}
          disabled={locating}
          className="bg-white/95 dark:bg-[#131B2A]/95 text-slate-800 dark:text-slate-100 p-2.5 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 transition active:scale-95 flex items-center justify-center backdrop-blur-sm cursor-pointer"
          title="Locate my position (GPS)"
        >
          <Locate className={`w-4 h-4 text-[#EA580C] dark:text-[#FF8A00] ${locating ? "animate-spin" : ""}`} />
        </button>

        <button
          onClick={handleResetView}
          className="bg-white/95 dark:bg-[#131B2A]/95 text-slate-800 dark:text-slate-100 p-2.5 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 transition active:scale-95 flex items-center justify-center text-[10px] font-black backdrop-blur-sm cursor-pointer hover:text-[#EA580C] dark:hover:text-[#FF8A00]"
          title="Reset to Zero Mile Nagpur"
        >
          0M
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-[#131B2A]/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-200 space-y-1 hidden sm:block">
        <div className="font-extrabold text-[10px] uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">
          Ward Risk Severity
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#16A34A]"></span>
          <span>Low (0–25)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
          <span>Medium (26–50)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#EF4444]"></span>
          <span>High (51–75)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#DC2626] ring-2 ring-red-400 animate-pulse"></span>
          <span className="font-bold text-red-500">Severe / Flooded (&gt;75)</span>
        </div>
      </div>
    </div>
  );
}
