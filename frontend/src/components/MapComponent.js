"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "../lib/api";

export function getRiskColor(category, score) {
  if (category === "Severe" || score >= 75) return "#DC2626"; // Severe Red
  if (category === "High" || score >= 50) return "#F97316";   // High Orange
  if (category === "Medium" || score >= 25) return "#EAB308"; // Medium Amber
  return "#16A34A"; // Low Green
}

export default function MapComponent({
  zones = [],
  reports = [],
  routeData = null,
  route = null,
  selectedZone = null,
  onZoneClick = null,
  onLocationSelected = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const leafletRef = useRef(null);
  const zonesLayerGroupRef = useRef(null);
  const reportsLayerGroupRef = useRef(null);
  const routeLayerGroupRef = useRef(null);

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

      const isSelected = selectedZone && (selectedZone.id === zone.id || selectedZone.zone_id === zone.zone_id || selectedZone.zone_name === zone.zone_name);

      const polygon = L.polygon(coords, {
        color: isSelected ? "#0F766E" : color,
        weight: isSelected ? 3.5 : 2,
        fillColor: color,
        fillOpacity: isSelected ? 0.4 : 0.2,
      });

      polygon.on("click", () => {
        if (onZoneClick) {
          onZoneClick(zone);
        }
      });

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
        <div style="background-color: ${markerColor}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 600;">
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

      // Safe path line in Teal
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
    <div className="w-full h-full min-h-[400px] relative rounded-2xl overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
}
