"use client";

import { useEffect, useRef, useState } from "react";
import { Layers, Globe, Map as MapIcon, Moon } from "lucide-react";
import { API_BASE } from "../lib/api";

export function getRiskColor(category, score) {
  if (category === "Severe" || score >= 75) return "#DC2626"; // Severe Red
  if (category === "High" || score >= 50) return "#F97316";   // High Orange
  if (category === "Medium" || score >= 25) return "#EAB308"; // Medium Amber
  return "#16A34A"; // Low Green
}

const TILE_PROVIDERS = {
  street: {
    name: "Street View",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    name: "Satellite View",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics',
    maxZoom: 19,
  },
  dark: {
    name: "Dark Map",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  },
};

export default function MapComponent({
  zones = [],
  reports = [],
  routeData = null,
  route = null,
  selectedZone = null,
  onZoneClick = null,
  onLocationSelected = null,
  isHeroBackground = false,
  initialLayer = "street",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const leafletRef = useRef(null);
  const currentTileLayerRef = useRef(null);
  const zonesLayerGroupRef = useRef(null);
  const reportsLayerGroupRef = useRef(null);
  const routeLayerGroupRef = useRef(null);

  const [activeLayer, setActiveLayer] = useState(initialLayer);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);

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
      zoom: isHeroBackground ? 12 : 13,
      zoomControl: false,
      scrollWheelZoom: !isHeroBackground,
      dragging: true,
      touchZoom: !isHeroBackground,
      doubleClickZoom: !isHeroBackground,
    });

    // Add Base Tile Layer
    const provider = TILE_PROVIDERS[initialLayer] || TILE_PROVIDERS.street;
    const tileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
    }).addTo(map);

    currentTileLayerRef.current = tileLayer;

    if (!isHeroBackground) {
      L.control.zoom({ position: "bottomright" }).addTo(map);
    }

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
  }, [isHeroBackground, initialLayer]);

  // Handle Layer Switching (Street / Satellite / Dark)
  const handleSwitchLayer = (layerKey) => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !TILE_PROVIDERS[layerKey]) return;

    if (currentTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
    }

    const provider = TILE_PROVIDERS[layerKey];
    const newTileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
    }).addTo(mapInstanceRef.current);

    currentTileLayerRef.current = newTileLayer;
    setActiveLayer(layerKey);
    setLayerMenuOpen(false);
  };

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

      const isSelected = selectedZone && (selectedZone.id === zone.id || selectedZone.zone_id === zone.zone_id || selectedZone.zone_name === zone.zone_name);

      const polygon = L.polygon(coords, {
        color: isSelected ? "#0F766E" : color,
        weight: isSelected ? 3.5 : 2,
        fillColor: color,
        fillOpacity: activeLayer === "satellite" ? 0.35 : (isSelected ? 0.4 : 0.2),
      });

      polygon.on("click", () => {
        if (onZoneClick) {
          onZoneClick(zone);
        }
      });

      if (!isHeroBackground) {
        // Polygon Popup tooltip
        const popupContent = `
          <div style="font-family: var(--font-inter), 'Inter', system-ui, sans-serif; min-width: 200px; max-width: 260px; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;">
              <strong style="font-size: 13px; font-weight: 600;">${zone.zone_name}</strong>
              <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; padding: 2px 6px; border-radius: 6px; background: ${color}20; color: ${color};">
                ${category}
              </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-bottom: 6px;">
              <div>
                <span style="color: #64748B;">Risk Score:</span>
                <strong style="display: block; color: ${color}; font-size: 14px; font-weight: 700;">${riskScore.toFixed(1)}</strong>
              </div>
              <div>
                <span style="color: #64748B;">Rainfall:</span>
                <strong style="display: block; font-size: 14px; font-weight: 700;">${(zone.rainfall_mm ?? zone.rainfall_intensity_mm ?? 0).toFixed(1)} mm/h</strong>
              </div>
            </div>

            <div style="font-size: 11px; color: #475569; border-top: 1px solid #E2E8F0; padding-top: 4px;">
              <span>Drain Capacity: ${Math.round((zone.drainage_capacity || 0.5) * 100)}%</span>
              ${zone.elevation_m ? ` | Elev: ${zone.elevation_m}m` : ''}
            </div>
          </div>
        `;
        polygon.bindPopup(popupContent);
      }

      polygon.addTo(zonesLayerGroupRef.current);
    });
  }, [zones, selectedZone, onZoneClick, isHeroBackground, activeLayer]);

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
        <div style="background-color: ${markerColor}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 600;">
          ${isWaterlogging ? "🌊" : "⚠️"}
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-hazard-marker",
        html: iconHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      if (!isHeroBackground) {
        const photoUrl = rep.photo ? (rep.photo.startsWith("http") ? rep.photo : `${API_BASE}${rep.photo}`) : null;
        const statusBg = rep.verification_status === 'Verified' ? '#DCFCE7' : rep.verification_status === 'Rejected' ? '#FEE2E2' : '#FEF9C3';
        const statusText = rep.verification_status === 'Verified' ? '#166534' : rep.verification_status === 'Rejected' ? '#991B1B' : '#854D0E';

        const popupContent = `
          <div style="font-family: var(--font-inter), 'Inter', system-ui, sans-serif; min-width: 220px; max-width: 280px; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;">
              <strong style="font-size: 13px; font-weight: 600;">Report #${rep.id}</strong>
              <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; padding: 2px 6px; border-radius: 6px; background: ${statusBg}; color: ${statusText};">
                ${rep.verification_status || 'Pending'}
              </span>
            </div>

            ${photoUrl ? `
              <div style="margin: 6px 0; border-radius: 8px; overflow: hidden; max-height: 110px;">
                <img src="${photoUrl}" alt="Hazard" style="width: 100%; height: 100px; object-fit: cover;" />
              </div>
            ` : ''}

            <p style="font-size: 12px; margin: 4px 0 8px 0; color: #334155; line-height: 1.4;">${rep.description || 'Citizen hazard report.'}</p>

            <div style="background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px; font-size: 11px;">
              <div style="font-weight: 600; color: #0F766E; margin-bottom: 2px;">AI Vision Analysis:</div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748B;">Waterlogging:</span>
                <strong style="color: ${isWaterlogging ? '#DC2626' : '#16A34A'}; font-weight: 600;">
                  ${rep.waterlogging_confidence ? `${(rep.waterlogging_confidence * 100).toFixed(0)}% Confirmed` : 'Queued'}
                </strong>
              </div>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
      }

      marker.addTo(reportsLayerGroupRef.current);
    });
  }, [reports, isHeroBackground]);

  // Update Safe Route Polyline Overlay
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !routeLayerGroupRef.current) return;

    routeLayerGroupRef.current.clearLayers();

    const activeRouteCoords = routeData?.coordinates || route;

    if (activeRouteCoords && activeRouteCoords.length > 0) {
      const latlngs = activeRouteCoords;

      const mainLine = L.polyline(latlngs, {
        color: "#0F766E",
        weight: 5,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(routeLayerGroupRef.current);

      try {
        mapInstanceRef.current.fitBounds(mainLine.getBounds(), { padding: [40, 40] });
      } catch (_) {}
    }
  }, [routeData, route]);

  return (
    <div className="w-full h-full min-h-[360px] relative rounded-2xl overflow-hidden group">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Layer Control Switcher (Street / Satellite / Dark) */}
      {!isHeroBackground && (
        <div className="absolute top-3 right-3 z-20">
          <div className="relative">
            <button
              onClick={() => setLayerMenuOpen(!layerMenuOpen)}
              className="h-9 px-3 rounded-xl bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#243244] shadow-md hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Change Map View Style"
            >
              {activeLayer === "satellite" ? (
                <Globe className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
              ) : activeLayer === "dark" ? (
                <Moon className="w-3.5 h-3.5 text-[#F59E0B]" />
              ) : (
                <MapIcon className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
              )}
              <span className="capitalize">{activeLayer} View</span>
            </button>

            {layerMenuOpen && (
              <div className="absolute right-0 top-11 w-44 rounded-xl bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#243244] shadow-xl p-1.5 space-y-1 z-30">
                <button
                  onClick={() => handleSwitchLayer("street")}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeLayer === "street"
                      ? "bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] font-semibold"
                      : "text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>Standard Street</span>
                </button>

                <button
                  onClick={() => handleSwitchLayer("satellite")}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeLayer === "satellite"
                      ? "bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] font-semibold"
                      : "text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>Esri Satellite</span>
                </button>

                <button
                  onClick={() => handleSwitchLayer("dark")}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeLayer === "dark"
                      ? "bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] font-semibold"
                      : "text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Dark Terrain</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
