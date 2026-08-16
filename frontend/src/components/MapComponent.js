"use client";

import { useEffect, useRef, useState } from "react";
import { Locate, Layers, Eye, AlertTriangle, Navigation, MapPin, RefreshCw } from "lucide-react";
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

  // Initialize Leaflet Map safely in client environment (100% Free OpenStreetMap)
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

    // Center of Nagpur (Zero Mile Marker: 21.1458, 79.0882)
    const map = L.map(mapContainerRef.current, {
      center: [21.1458, 79.0882],
      zoom: 13,
      zoomControl: false,
    });

    // High clarity standard OpenStreetMap tiles (Zero paid API tokens)
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

      const polygon = L.polygon(coords, {
        color: color,
        weight: isPhotoConfirmed ? 3.5 : 2,
        opacity: 0.9,
        fillColor: color,
        fillOpacity: isPhotoConfirmed ? 0.40 : 0.22,
        className: isPhotoConfirmed && category === "Severe" ? "severe-zone-pulse" : "",
      });

      const rainfallMm = zone.rainfall_mm ?? 0.0;
      const dispatchStatus = zone.dispatch_status || "Unassigned";

      const popupHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 200px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; margin-bottom: 8px;">
            <strong style="font-size: 14px; color: #111111;">${zone.name}</strong>
            <span style="background: ${color}; color: ${category === 'Medium' ? '#111' : '#fff'}; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; text-transform: uppercase;">
              ${category} (${riskScore.toFixed(1)})
            </span>
          </div>

          ${isPhotoConfirmed && category === "Severe" ? `
            <div style="background: #FEF2F2; border: 1px solid #F87171; border-radius: 6px; padding: 4px 8px; margin-bottom: 8px; font-size: 11px; color: #991B1B; font-weight: bold; display: flex; align-items: center; gap: 4px;">
              📸 PHOTO-CONFIRMED FLOODING
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; color: #444;">
            <div><strong>Rainfall:</strong> ${rainfallMm.toFixed(1)} mm/h</div>
            <div><strong>Drainage:</strong> ${Math.round((zone.drainage_capacity || 0.5) * 100)}%</div>
            <div><strong>Elevation:</strong> ${zone.elevation_factor || 0.4}</div>
            <div><strong>Dispatch:</strong> <span style="font-weight: 700; color: #111;">${dispatchStatus}</span></div>
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
      const markerColor = isWaterlogging ? "#E53935" : "#FF8A00";

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
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px;">
            <strong style="font-size: 13px; color: #111;">Hazard #${rep.id}</strong>
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: ${rep.verification_status === 'verified' ? '#DCFCE7' : rep.verification_status === 'rejected' ? '#FEE2E2' : '#FEF3C7'}; color: ${rep.verification_status === 'verified' ? '#166534' : rep.verification_status === 'rejected' ? '#991B1B' : '#92400E'};">
              ${rep.verification_status || 'Pending'}
            </span>
          </div>

          ${photoUrl ? `
            <div style="margin: 6px 0; border-radius: 8px; overflow: hidden; max-height: 120px;">
              <img src="${photoUrl}" alt="Hazard" style="width: 100%; height: 110px; object-fit: cover;" />
            </div>
          ` : ''}

          <p style="font-size: 12px; color: #333; margin: 4px 0 8px 0;">${rep.description || 'Citizen hazard report.'}</p>

          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px; font-size: 11px;">
            <div style="font-weight: 700; color: #475569; margin-bottom: 2px;">🤖 Hugging Face AI Vision:</div>
            <div style="display: flex; justify-content: space-between;">
              <span>Waterlogging:</span>
              <strong style="color: ${isWaterlogging ? '#DC2626' : '#64748B'}">
                ${rep.ai_confidence ? `${(rep.ai_confidence * 100).toFixed(0)}% Confirmed` : 'Queued'}
              </strong>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(reportsLayerGroupRef.current);
    });
  }, [reports]);

  // Update Safe Route Polyline Overlay with Progressive Animation
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !routeLayerGroupRef.current) return;

    routeLayerGroupRef.current.clearLayers();

    if (routeData && routeData.coordinates && routeData.coordinates.length > 0) {
      const latlngs = routeData.coordinates;

      // Glow outline
      L.polyline(latlngs, {
        color: "#22A447",
        weight: 8,
        opacity: 0.35,
        lineCap: "round",
      }).addTo(routeLayerGroupRef.current);

      // Primary safe path
      const mainLine = L.polyline(latlngs, {
        color: "#166534",
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        dashArray: "6, 8",
      }).addTo(routeLayerGroupRef.current);

      // Start Marker
      const startPt = latlngs[0];
      const startIcon = L.divIcon({
        className: "route-start-marker",
        html: `<div style="background-color: #22A447; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 13px;">A</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      L.marker(startPt, { icon: startIcon })
        .bindPopup("<strong>📍 Route Origin</strong>")
        .addTo(routeLayerGroupRef.current);

      // Destination Marker
      const endPt = latlngs[latlngs.length - 1];
      const endIcon = L.divIcon({
        className: "route-end-marker",
        html: `<div style="background-color: #E53935; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 13px;">B</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      L.marker(endPt, { icon: endIcon })
        .bindPopup("<strong>🏁 Safe Destination</strong>")
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
        alert("Could not access your GPS location.");
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
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden shadow-inner border border-[#E5E5E5]">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <button
          onClick={handleLocateMe}
          disabled={locating}
          className="bg-white hover:bg-neutral-50 text-[#111111] p-2.5 rounded-xl shadow-md border border-[#E5E5E5] transition-transform active:scale-95 flex items-center justify-center"
          title="Locate my position (GPS)"
          aria-label="Locate me"
        >
          <Locate className={`w-4 h-4 text-blue-600 ${locating ? "animate-spin" : ""}`} />
        </button>

        <button
          onClick={handleResetView}
          className="bg-white hover:bg-neutral-50 text-[#111111] p-2.5 rounded-xl shadow-md border border-[#E5E5E5] transition-transform active:scale-95 flex items-center justify-center text-[10px] font-black"
          title="Reset to Zero Mile Nagpur"
        >
          0M
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-[#E5E5E5] text-[11px] font-medium text-[#111111] space-y-1 hidden sm:block">
        <div className="font-extrabold text-[10px] uppercase text-[#666666] tracking-wider mb-1">
          Ward Flood Severity
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
