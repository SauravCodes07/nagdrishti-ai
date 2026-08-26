"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Layers,
  Globe,
  Map as MapIcon,
  Moon,
  MapPin,
  Navigation,
  Activity,
  AlertTriangle,
  RotateCcw,
  Zap,
  Info,
  Car,
  Crosshair,
  Check,
} from "lucide-react";
import {
  reverseGeocodeLocation,
  getCurrentGpsLocation,
  getGpsAccuracyTier,
  isValidCoordinate,
} from "../lib/geoService";
import { getTrafficIncidents, getTrafficFlowStatus } from "../lib/api";

export function getRiskColor(category, score) {
  if (category === "Severe" || score >= 75) return "#EF4444"; // Bold Red
  if (category === "High" || score >= 50) return "#F97316";   // Bold Orange
  if (category === "Medium" || score >= 25) return "#EAB308"; // Bold Amber
  return "#10B981"; // Bold Emerald Green
}

const MAPTILER_KEY = typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_MAPTILER_KEY : null;

// High-Fidelity Tile Providers with Progressive Zoom Labels
const TILE_PROVIDERS = {
  street: {
    id: "street",
    name: "Standard Road Map",
    url: MAPTILER_KEY
      ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    labelsUrl: null,
    attribution: MAPTILER_KEY
      ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a> (Voyager)',
    maxZoom: 19,
    subdomains: MAPTILER_KEY ? [] : ["a", "b", "c", "d"],
  },
  satellite: {
    id: "satellite",
    name: "Satellite (Hybrid Labels)",
    url: MAPTILER_KEY
      ? `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`
      : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    labelsUrl: MAPTILER_KEY
      ? `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
      : "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics',
    maxZoom: 19,
    subdomains: [],
  },
  dark: {
    id: "dark",
    name: "Dark Terrain",
    url: MAPTILER_KEY
      ? `https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
      : "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
    labelsUrl: null,
    attribution: MAPTILER_KEY
      ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      : '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    subdomains: MAPTILER_KEY ? [] : ["a", "b", "c", "d"],
  },
};

export default function MapComponent({
  zones = [],
  reports = [],
  routeData = null,
  route = null,
  origin = null,
  destination = null,
  selectedZone = null,
  onZoneClick = null,
  onLocationSelected = null,
  onSetOrigin = null,
  onSetDestination = null,
  isHeroBackground = false,
  initialLayer = "street",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const leafletRef = useRef(null);

  // Dedicated Layer References
  const currentTileLayerRef = useRef(null);
  const currentLabelsLayerRef = useRef(null);
  const zonesLayerGroupRef = useRef(null);
  const reportsLayerGroupRef = useRef(null);
  const routeLayerGroupRef = useRef(null);
  const endpointsLayerGroupRef = useRef(null);
  const locationLayerGroupRef = useRef(null);
  const trafficLayerGroupRef = useRef(null);
  const trafficFlowTileLayerRef = useRef(null);

  // Stable Callback References
  const onLocationSelectedRef = useRef(onLocationSelected);
  const onSetOriginRef = useRef(onSetOrigin);
  const onSetDestinationRef = useRef(onSetDestination);
  const onZoneClickRef = useRef(onZoneClick);

  useEffect(() => {
    onLocationSelectedRef.current = onLocationSelected;
    onSetOriginRef.current = onSetOrigin;
    onSetDestinationRef.current = onSetDestination;
    onZoneClickRef.current = onZoneClick;
  }, [onLocationSelected, onSetOrigin, onSetDestination, onZoneClick]);

  // UI State
  const [activeLayer, setActiveLayer] = useState(initialLayer);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [trafficEnabled, setTrafficEnabled] = useState(false);
  const [trafficStatus, setTrafficStatus] = useState("idle"); // "idle" | "live" | "updating" | "unavailable"
  const [trafficIncidentsCount, setTrafficIncidentsCount] = useState(0);
  const [locatingUser, setLocatingUser] = useState(false);
  const [gpsErrorNotice, setGpsErrorNotice] = useState(null);
  const [tileErrorNotice, setTileErrorNotice] = useState(null);

  const trafficIntervalRef = useRef(null);
  const layerMenuContainerRef = useRef(null);
  const prevInitialLayerRef = useRef(initialLayer);

  // 1. Initialize Leaflet Map safely in client environment with Dedicated Panes
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
      center: [21.1458, 79.0882], // Zero Mile, Nagpur
      zoom: isHeroBackground ? 12.0 : 11.5,
      minZoom: 8,
      maxZoom: 19,
      zoomControl: false,
      scrollWheelZoom: !isHeroBackground,
      dragging: true,
      touchZoom: !isHeroBackground,
      doubleClickZoom: !isHeroBackground,
    });

    // Create Dedicated Leaflet Panes for strictly controlled layer stacking
    map.createPane("labelsPane");
    map.getPane("labelsPane").style.zIndex = 250;
    map.getPane("labelsPane").style.pointerEvents = "none";

    map.createPane("trafficTilePane");
    map.getPane("trafficTilePane").style.zIndex = 350;
    map.getPane("trafficTilePane").style.pointerEvents = "none";

    map.createPane("zonesPane");
    map.getPane("zonesPane").style.zIndex = 400;

    map.createPane("trafficIncidentsPane");
    map.getPane("trafficIncidentsPane").style.zIndex = 420;

    map.createPane("routePane");
    map.getPane("routePane").style.zIndex = 460;

    map.createPane("locationPane");
    map.getPane("locationPane").style.zIndex = 550;

    // Add Base Tile Layer in standard tilePane
    const initialKey = TILE_PROVIDERS[initialLayer] ? initialLayer : "street";
    const provider = TILE_PROVIDERS[initialKey];
    const tileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
      subdomains: provider.subdomains || [],
      pane: "tilePane",
    }).addTo(map);

    currentTileLayerRef.current = tileLayer;

    // Add Reference / Hybrid Labels Layer if configured (e.g. for Satellite)
    if (provider.labelsUrl) {
      const labelsLayer = L.tileLayer(provider.labelsUrl, {
        maxZoom: provider.maxZoom,
        subdomains: provider.subdomains || [],
        pane: "labelsPane",
      }).addTo(map);
      currentLabelsLayerRef.current = labelsLayer;
    }

    if (!isHeroBackground) {
      L.control.zoom({ position: "bottomright" }).addTo(map);
    }

    // Initialize Layer Groups
    zonesLayerGroupRef.current = L.layerGroup().addTo(map);
    reportsLayerGroupRef.current = L.layerGroup().addTo(map);
    trafficLayerGroupRef.current = L.layerGroup().addTo(map);
    routeLayerGroupRef.current = L.layerGroup().addTo(map);
    locationLayerGroupRef.current = L.layerGroup().addTo(map);
    endpointsLayerGroupRef.current = L.layerGroup().addTo(map);

    // Interactive Map Click Handler with Dynamic Reverse Geocode & Action Popup
    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      if (!isValidCoordinate(lat, lng)) return;

      try {
        const geoInfo = await reverseGeocodeLocation(lat, lng);
        if (onLocationSelectedRef.current) {
          onLocationSelectedRef.current(geoInfo);
        }

        if (!isHeroBackground) {
          const latKey = Number(lat).toFixed(4).replace(".", "_");
          const lngKey = Number(lng).toFixed(4).replace(".", "_");
          const originBtnId = `btn_set_origin_${latKey}_${lngKey}`;
          const destBtnId = `btn_set_dest_${latKey}_${lngKey}`;

          const isUrban = geoInfo.coverageState === "NAGPUR_URBAN" || geoInfo.insideNmc;
          const isRural = geoInfo.coverageState === "NAGPUR_RURAL" || (geoInfo.insideDistrict && !geoInfo.insideNmc);

          const popupHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 220px; padding: 2px;">
              <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 2px; line-height: 1.25;">
                ${geoInfo.name}
              </div>
              <div style="font-size: 11px; color: #64748B; margin-bottom: 6px; line-height: 1.25;">
                ${geoInfo.subtitle || geoInfo.fullAddress}
              </div>
              <div style="margin-bottom: 8px;">
                ${
                  isUrban
                    ? `<span style="display:inline-block; font-size:10px; font-weight:700; text-transform:uppercase; background:#DCFCE7; color:#166534; padding:2px 6px; border-radius:4px; border:1px solid rgba(22,101,52,0.2);">
                        ${geoInfo.wardNumber ? `${geoInfo.wardNumber} • ` : ""}Inside NMC Limits
                       </span>`
                    : isRural
                    ? `<span style="display:inline-block; font-size:10px; font-weight:700; text-transform:uppercase; background:#CCFBF1; color:#0F766E; padding:2px 6px; border-radius:4px; border:1px solid rgba(15,118,110,0.2);">
                        Nagpur Rural Coverage
                       </span>`
                    : `<span style="display:inline-block; font-size:10px; font-weight:600; text-transform:uppercase; background:#F1F5F9; color:#475569; padding:2px 6px; border-radius:4px; border:1px solid #CBD5E1;">
                        Outside Nagpur District
                       </span>`
                }
              </div>
              <div style="display: flex; gap: 6px;">
                <button id="${originBtnId}" style="flex: 1; padding: 6px 8px; font-size: 10.5px; font-weight: 700; background: #0F766E; color: white; border: none; border-radius: 6px; cursor: pointer; transition: background 0.15s;">
                  Set as Origin (A)
                </button>
                <button id="${destBtnId}" style="flex: 1; padding: 6px 8px; font-size: 10.5px; font-weight: 700; background: #DC2626; color: white; border: none; border-radius: 6px; cursor: pointer; transition: background 0.15s;">
                  Set as Dest (B)
                </button>
              </div>
            </div>
          `;

          L.popup({ offset: [0, -8] })
            .setLatLng([lat, lng])
            .setContent(popupHtml)
            .openOn(map);

          setTimeout(() => {
            const originBtn = document.getElementById(originBtnId);
            const destBtn = document.getElementById(destBtnId);

            if (originBtn && onSetOriginRef.current) {
              originBtn.onclick = () => {
                onSetOriginRef.current({
                  ...geoInfo,
                  source: "map_click",
                });
                map.closePopup();
              };
            }
            if (destBtn && onSetDestinationRef.current) {
              destBtn.onclick = () => {
                onSetDestinationRef.current({
                  ...geoInfo,
                  source: "map_click",
                });
                map.closePopup();
              };
            }
          }, 50);
        }
      } catch (err) {
        if (onLocationSelectedRef.current) {
          onLocationSelectedRef.current({
            lat,
            lng,
            name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            source: "map_click",
          });
        }
      }
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      }
    };
  }, [isHeroBackground]);

  // 2. Base Map Layer Switching without destroying or resetting route/markers
  const handleSwitchLayer = useCallback((layerKey) => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !TILE_PROVIDERS[layerKey]) return;

    // Remove current base tile layer
    if (currentTileLayerRef.current) {
      try {
        mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
      } catch (_) {}
      currentTileLayerRef.current = null;
    }

    // Remove current labels overlay
    if (currentLabelsLayerRef.current) {
      try {
        mapInstanceRef.current.removeLayer(currentLabelsLayerRef.current);
      } catch (_) {}
      currentLabelsLayerRef.current = null;
    }

    const provider = TILE_PROVIDERS[layerKey];
    setTileErrorNotice(null);

    const newTileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
      subdomains: provider.subdomains || [],
      pane: "tilePane",
    });

    let tileErrorCount = 0;
    newTileLayer.on("tileerror", () => {
      tileErrorCount++;
      if (tileErrorCount === 5 && layerKey !== "street") {
        const errorMsg =
          layerKey === "satellite"
            ? "Satellite imagery temporarily unavailable"
            : "Dark terrain map temporarily unavailable";
        setTileErrorNotice(errorMsg);
        setTimeout(() => {
          handleSwitchLayer("street");
        }, 100);
      }
    });

    newTileLayer.addTo(mapInstanceRef.current);
    currentTileLayerRef.current = newTileLayer;

    // Add labels overlay if supported (e.g. Satellite Hybrid)
    if (provider.labelsUrl) {
      const labelsLayer = L.tileLayer(provider.labelsUrl, {
        maxZoom: provider.maxZoom,
        subdomains: provider.subdomains || [],
        pane: "labelsPane",
      }).addTo(mapInstanceRef.current);
      currentLabelsLayerRef.current = labelsLayer;
    }

    setActiveLayer(layerKey);
    setLayerMenuOpen(false);
  }, []);

  // Sync external initialLayer prop changes (e.g. when landing page toggles heroMapLayer)
  useEffect(() => {
    if (initialLayer && initialLayer !== prevInitialLayerRef.current && mapInstanceRef.current) {
      prevInitialLayerRef.current = initialLayer;
      handleSwitchLayer(initialLayer);
    }
  }, [initialLayer, handleSwitchLayer]);

  // Click-outside listener for layer switcher menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (layerMenuContainerRef.current && !layerMenuContainerRef.current.contains(e.target)) {
        setLayerMenuOpen(false);
      }
    };
    if (layerMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [layerMenuOpen]);

  // 3. TomTom Live Traffic Engine (Flow & Incidents)
  const fetchTrafficData = useCallback(async () => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !trafficLayerGroupRef.current) return;

    setTrafficStatus("updating");

    try {
      const [incRes, flowRes] = await Promise.allSettled([
        getTrafficIncidents("78.24,20.58,79.66,21.75", true),
        getTrafficFlowStatus(),
      ]);

      // Update Flow Tile Overlay if available
      if (flowRes.status === "fulfilled" && flowRes.value?.live && flowRes.value?.tile_url) {
        if (trafficFlowTileLayerRef.current) {
          try {
            mapInstanceRef.current.removeLayer(trafficFlowTileLayerRef.current);
          } catch (_) {}
        }
        const flowLayer = L.tileLayer(flowRes.value.tile_url, {
          opacity: 0.75,
          maxZoom: 19,
          pane: "trafficTilePane",
        }).addTo(mapInstanceRef.current);
        trafficFlowTileLayerRef.current = flowLayer;
      }

      // Update Incidents Overlay
      trafficLayerGroupRef.current.clearLayers();
      let incidentsCount = 0;

      if (incRes.status === "fulfilled" && Array.isArray(incRes.value?.incidents)) {
        const incidents = incRes.value.incidents;
        incidentsCount = incidents.length;

        incidents.forEach((inc) => {
          if (!inc.coordinates || !inc.coordinates[0] || !inc.coordinates[1]) return;
          const [lat, lng] = inc.coordinates;
          if (!isValidCoordinate(lat, lng)) return;

          const isMajorDelay = inc.delay_minutes >= 5;
          const iconColor = isMajorDelay ? "#DC2626" : "#EA580C";

          const iconHtml = `
            <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${iconColor}; opacity: 0.35; animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 16px; height: 16px; border-radius: 50%; background-color: ${iconColor}; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 9px; font-weight: 800;">!</div>
            </div>
          `;

          const markerIcon = L.divIcon({
            className: "custom-traffic-incident-marker",
            html: iconHtml,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
            pane: "trafficIncidentsPane",
          });

          const popupContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 190px; padding: 2px;">
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 3px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${iconColor};"></span>
                <span style="font-size: 12px; font-weight: 700; color: #0F172A;">${inc.description || "Traffic Incident"}</span>
              </div>
              <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
                <strong>Road:</strong> ${inc.road || "Nagpur Corridor"}
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: #64748B; background: #F8FAFC; padding: 4px 6px; border-radius: 6px; border: 1px solid #E2E8F0;">
                <span>Delay: <strong style="color: ${iconColor};">+${inc.delay_minutes} min</strong></span>
                <span>Length: <strong>${Math.round(inc.length_meters || 0)} m</strong></span>
              </div>
            </div>
          `;

          L.marker([lat, lng], { icon: markerIcon, pane: "trafficIncidentsPane" })
            .bindPopup(popupContent)
            .addTo(trafficLayerGroupRef.current);
        });
      }

      setTrafficIncidentsCount(incidentsCount);
      setTrafficStatus("live");
    } catch (err) {
      console.warn("[Map Traffic] Fetch notice:", err.message);
      setTrafficStatus("unavailable");
    }
  }, []);

  // Handle Traffic Toggle (ON/OFF) and 60s Periodic Polling
  useEffect(() => {
    if (trafficEnabled) {
      fetchTrafficData();
      trafficIntervalRef.current = setInterval(() => {
        fetchTrafficData();
      }, 60000);
    } else {
      if (trafficIntervalRef.current) clearInterval(trafficIntervalRef.current);
      if (trafficLayerGroupRef.current) trafficLayerGroupRef.current.clearLayers();
      if (trafficFlowTileLayerRef.current && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(trafficFlowTileLayerRef.current);
        } catch (_) {}
        trafficFlowTileLayerRef.current = null;
      }
      setTrafficStatus("idle");
    }

    return () => {
      if (trafficIntervalRef.current) clearInterval(trafficIntervalRef.current);
    };
  }, [trafficEnabled, fetchTrafficData]);

  // 4. Update Zone Catchment Polygons in zonesPane
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !zonesLayerGroupRef.current) return;

    zonesLayerGroupRef.current.clearLayers();

    zones.forEach((zone) => {
      let boundaryCoords = [];
      if (zone.boundary?.coordinates?.[0]) {
        boundaryCoords = zone.boundary.coordinates[0];
      } else if (Array.isArray(zone.boundary) && zone.boundary.length > 0) {
        boundaryCoords = zone.boundary;
      }

      if (!boundaryCoords || boundaryCoords.length < 3) return;

      const latlngs = boundaryCoords.map((coord) => [coord[1], coord[0]]);
      const riskScore = Number(zone.latest_risk_score ?? zone.risk_score ?? 25);
      const riskCat = zone.risk_category || "Low";
      const color = getRiskColor(riskCat, riskScore);
      const isSelected = selectedZone && selectedZone.id === zone.id;

      const polygon = L.polygon(latlngs, {
        color: color,
        weight: isSelected ? 3.5 : isHeroBackground ? 1.5 : 2,
        opacity: isSelected ? 1.0 : 0.85,
        fillColor: color,
        fillOpacity: isSelected ? 0.38 : isHeroBackground ? 0.16 : 0.22,
        dashArray: isSelected ? null : "3, 6",
        pane: "zonesPane",
      });

      if (!isHeroBackground) {
        const popupContent = `
          <div style="font-family: sans-serif; min-width: 170px; padding: 2px;">
            <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 2px;">
              ${zone.name || `Ward ${zone.id}`}
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 11px; color: #64748B;">Hazard Severity:</span>
              <span style="font-size: 11px; font-weight: 800; color: ${color};">
                ${riskCat} (${riskScore.toFixed(0)}/100)
              </span>
            </div>
            <div style="font-size: 10px; color: #475569;">
              Rainfall: <strong>${zone.rainfall_mm ?? 18} mm</strong> • Drainage: <strong>${((zone.drainage_capacity ?? 0.6) * 100).toFixed(0)}%</strong>
            </div>
          </div>
        `;
        polygon.bindPopup(popupContent);

        polygon.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          if (onZoneClickRef.current) {
            onZoneClickRef.current(zone);
          }
        });
      }

      polygon.addTo(zonesLayerGroupRef.current);
    });
  }, [zones, selectedZone, isHeroBackground]);

  // 5. Update Citizen Incident Markers
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !reportsLayerGroupRef.current) return;

    reportsLayerGroupRef.current.clearLayers();

    reports.forEach((rep) => {
      let lat = null;
      let lng = null;

      if (rep.lat && rep.lng) {
        lat = Number(rep.lat);
        lng = Number(rep.lng);
      } else if (rep.reporter_location?.coordinates) {
        lng = Number(rep.reporter_location.coordinates[0]);
        lat = Number(rep.reporter_location.coordinates[1]);
      }

      if (!isValidCoordinate(lat, lng)) return;

      const isWaterlogging = rep.waterlogging_confidence > 0.6 || rep.severity === "Severe";
      const iconHtml = `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${isWaterlogging ? '#EF4444' : '#14B8A6'}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: ${isWaterlogging ? '#DC2626' : '#0F766E'}; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.3);"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-incident-marker",
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      if (!isHeroBackground) {
        const popupContent = `
          <div style="font-family: sans-serif; min-width: 180px; padding: 2px;">
            <div style="font-size: 12px; font-weight: 700; color: #0F172A; margin-bottom: 2px;">
              ${rep.description || 'Citizen Incident Report'}
            </div>
            <div style="font-size: 10px; color: #64748B; margin-bottom: 4px;">
              ${rep.zone_name || 'Nagpur Zone'} • ${rep.severity || 'Medium'}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
      }

      marker.addTo(reportsLayerGroupRef.current);
    });
  }, [reports, isHeroBackground]);

  // 6. Update Real GPS Location Marker & Dynamic Accuracy Circle in locationPane
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !locationLayerGroupRef.current) return;

    locationLayerGroupRef.current.clearLayers();

    // Check if origin or selected location has verified GPS source
    const gpsTarget = (origin?.source === "gps" || origin?.accuracy !== undefined && origin?.accuracy !== null) ? origin : null;

    if (gpsTarget && isValidCoordinate(gpsTarget.lat, gpsTarget.lng)) {
      const accuracyRadius = Math.max(5, Math.min(gpsTarget.accuracy || 15, 1000));
      const accuracyTier = getGpsAccuracyTier(accuracyRadius);

      // Real Accuracy Circle sized to actual accuracy meters
      L.circle([Number(gpsTarget.lat), Number(gpsTarget.lng)], {
        radius: accuracyRadius,
        color: accuracyTier.isLowAccuracy ? "#EA580C" : "#0F766E",
        weight: 1.5,
        opacity: 0.65,
        fillColor: accuracyTier.isLowAccuracy ? "#F97316" : "#14B8A6",
        fillOpacity: 0.12,
        pane: "locationPane",
      }).addTo(locationLayerGroupRef.current);

      // Dedicated Pulsing GPS Beacon Marker
      const beaconIcon = L.divIcon({
        className: "custom-gps-beacon",
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: #0F766E; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 15px; height: 15px; border-radius: 50%; background-color: #0F766E; border: 2.5px solid white; box-shadow: 0 0 10px rgba(15,118,110,0.8), 0 2px 5px rgba(0,0,0,0.35);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        pane: "locationPane",
      });

      L.marker([Number(gpsTarget.lat), Number(gpsTarget.lng)], { icon: beaconIcon, pane: "locationPane" })
        .bindPopup(`
          <div style="font-family: sans-serif; min-width: 170px;">
            <strong style="font-size: 12px; color: #0F172A;">Your Current Location</strong>
            <div style="font-size: 10.5px; color: #0F766E; font-weight: 600; margin-top: 2px;">
              ${accuracyTier.accuracyText} • ${accuracyTier.label}
            </div>
            ${accuracyTier.advice ? `<div style="font-size: 10px; color: #EA580C; margin-top: 3px;">${accuracyTier.advice}</div>` : ""}
          </div>
        `)
        .addTo(locationLayerGroupRef.current);
    }
  }, [origin]);

  // 7. Update Origin (A) and Destination (B) Markers in endpointsLayerGroup
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !endpointsLayerGroupRef.current) return;

    endpointsLayerGroupRef.current.clearLayers();

    if (origin && isValidCoordinate(origin.lat, origin.lng) && origin.source !== "gps") {
      const originIcon = L.divIcon({
        className: "custom-origin-marker",
        html: `<div style="background-color: #0F766E; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 12px rgba(15,118,110,0.8), 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 800;">A</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([Number(origin.lat), Number(origin.lng)], { icon: originIcon })
        .bindPopup(`<strong>Origin (A):</strong> ${origin.name || 'Start Point'}`)
        .addTo(endpointsLayerGroupRef.current);
    }

    if (destination && isValidCoordinate(destination.lat, destination.lng)) {
      const destIcon = L.divIcon({
        className: "custom-destination-marker",
        html: `<div style="background-color: #DC2626; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 12px rgba(220,38,38,0.8), 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 800;">B</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([Number(destination.lat), Number(destination.lng)], { icon: destIcon })
        .bindPopup(`<strong>Destination (B):</strong> ${destination.name || 'Arrival Point'}`)
        .addTo(endpointsLayerGroupRef.current);
    }
  }, [origin, destination]);

  // 8. Update Safe Route Polyline Overlay in routePane (ALWAYS above traffic and zones)
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !routeLayerGroupRef.current) return;

    routeLayerGroupRef.current.clearLayers();

    const activeRouteData = routeData || route;
    let rawCoords = [];

    if (Array.isArray(activeRouteData)) {
      rawCoords = activeRouteData;
    } else if (activeRouteData && typeof activeRouteData === "object") {
      rawCoords =
        activeRouteData.coordinates ||
        activeRouteData.route_coordinates ||
        activeRouteData.geojson?.coordinates ||
        [];
    }

    if (rawCoords && rawCoords.length >= 2) {
      // Normalize [lng, lat] vs [lat, lng]
      const latlngs = rawCoords
        .map((pt) => {
          if (Array.isArray(pt) && pt.length >= 2) {
            const first = Number(pt[0]);
            const second = Number(pt[1]);
            if (first > 50 && second < 50) {
              return [second, first]; // [lng, lat] -> [lat, lng]
            }
            return [first, second];
          }
          return null;
        })
        .filter((pt) => pt && isValidCoordinate(pt[0], pt[1]));

      if (latlngs.length >= 2) {
        // Outer ambient glow path in routePane
        L.polyline(latlngs, {
          color: "#0F766E",
          weight: 9,
          opacity: 0.45,
          lineCap: "round",
          lineJoin: "round",
          pane: "routePane",
        }).addTo(routeLayerGroupRef.current);

        // Sharp primary road-following polyline in routePane
        const mainLine = L.polyline(latlngs, {
          color: "#14B8A6",
          weight: 5,
          opacity: 1.0,
          lineCap: "round",
          lineJoin: "round",
          pane: "routePane",
        }).addTo(routeLayerGroupRef.current);

        // Auto-fit route bounds with generous padding
        try {
          const bounds = mainLine.getBounds();
          if (bounds.isValid()) {
            mapInstanceRef.current.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 16,
              animate: true,
            });
          }
        } catch (_) {}
      }
    }
  }, [routeData, route]);

  // Recenter to District Center or Active Route
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const activeRouteData = routeData || route;
    if (activeRouteData && routeLayerGroupRef.current && routeLayerGroupRef.current.getLayers().length > 0) {
      const layers = routeLayerGroupRef.current.getLayers();
      const lastLine = layers[layers.length - 1];
      if (lastLine && lastLine.getBounds) {
        mapInstanceRef.current.fitBounds(lastLine.getBounds(), { padding: [50, 50], maxZoom: 16 });
        return;
      }
    }
    mapInstanceRef.current.setView([21.1458, 79.0882], 11.5, { animate: true });
  };

  // Real Browser GPS Trigger on Map
  const handleLocateMe = async () => {
    if (locatingUser || !mapInstanceRef.current) return;
    setLocatingUser(true);
    setGpsErrorNotice(null);

    try {
      const loc = await getCurrentGpsLocation({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
      if (isValidCoordinate(loc.lat, loc.lng)) {
        mapInstanceRef.current.setView([loc.lat, loc.lng], 15, { animate: true });
        if (onSetOriginRef.current) {
          onSetOriginRef.current(loc);
        }
      }
    } catch (err) {
      console.warn("[Map Locate Me] Error:", err.message);
      setGpsErrorNotice(err.message || "Unable to determine your current location.");
      setTimeout(() => setGpsErrorNotice(null), 6000);
    } finally {
      setLocatingUser(false);
    }
  };

  return (
    <div className="w-full h-full min-h-[360px] relative rounded-2xl overflow-hidden group">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Controls Bar (Top-Right) */}
      {!isHeroBackground && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          {/* Live Traffic Toggle Pill */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setTrafficEnabled(!trafficEnabled)}
              className={`h-9 px-3 rounded-xl border shadow-md font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                trafficEnabled
                  ? "bg-[#0F766E] dark:bg-[#14B8A6] text-white dark:text-[#042F2E] border-transparent shadow-teal-500/20"
                  : "bg-[#FFFFFF] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#243244] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
              }`}
              title="Toggle TomTom Live Traffic Overlay"
            >
              <Car className={`w-3.5 h-3.5 ${trafficEnabled ? "animate-pulse" : ""}`} />
              <span>{trafficEnabled ? "Traffic ON" : "Live Traffic"}</span>
            </button>
          </div>

          {/* Layer Control Switcher (Street / Satellite / Dark) */}
          <div className="relative" ref={layerMenuContainerRef}>
            <button
              type="button"
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
              <span>{TILE_PROVIDERS[activeLayer]?.name || "Map"}</span>
            </button>

            {layerMenuOpen && (
              <div className="absolute right-0 top-11 w-56 rounded-xl bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#243244] shadow-xl p-1.5 space-y-1 z-30">
                <button
                  type="button"
                  onClick={() => handleSwitchLayer("street")}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition cursor-pointer ${
                    activeLayer === "street"
                      ? "bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] font-bold"
                      : "text-[#475569] dark:text-[#CBD5E1] font-medium hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                    <span>Standard Road Map</span>
                  </div>
                  {activeLayer === "street" && (
                    <Check className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4] shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchLayer("satellite")}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition cursor-pointer ${
                    activeLayer === "satellite"
                      ? "bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] font-bold"
                      : "text-[#475569] dark:text-[#CBD5E1] font-medium hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                    <span>Satellite (Hybrid Labels)</span>
                  </div>
                  {activeLayer === "satellite" && (
                    <Check className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4] shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchLayer("dark")}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition cursor-pointer ${
                    activeLayer === "dark"
                      ? "bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] font-bold"
                      : "text-[#475569] dark:text-[#CBD5E1] font-medium hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Dark Terrain</span>
                  </div>
                  {activeLayer === "dark" && (
                    <Check className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4] shrink-0" />
                  )}
                </button>

                <div className="pt-1 border-t border-[#E2E8F0] dark:border-[#243244] px-2 py-1 text-[10px] text-[#94A3B8] leading-tight">
                  High-fidelity satellite & vector terrain
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Tile Loading Notice if any */}
      {tileErrorNotice && (
        <div className="absolute top-14 right-3 z-30 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/90 border border-amber-200 dark:border-amber-500/40 text-xs text-amber-900 dark:text-amber-200 shadow-lg flex items-center gap-2 max-w-xs">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="leading-tight">{tileErrorNotice}</div>
        </div>
      )}

      {/* Floating GPS Error Notice if any */}
      {gpsErrorNotice && (
        <div className="absolute top-14 left-4 right-4 sm:left-auto sm:right-3 sm:max-w-xs z-30 p-2.5 rounded-xl bg-[#FEF2F2] dark:bg-red-950/90 border border-red-200 dark:border-red-500/40 text-xs text-[#991B1B] dark:text-[#FCA5A5] shadow-lg flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="leading-tight">{gpsErrorNotice}</div>
        </div>
      )}

      {/* Floating Quick Action Bar (Bottom-Left) */}
      {!isHeroBackground && (
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
          {/* Recenter Button */}
          <button
            type="button"
            onClick={handleRecenter}
            className="h-8 px-2.5 rounded-lg bg-[#FFFFFF]/90 dark:bg-[#0F172A]/90 backdrop-blur-md border border-[#E2E8F0] dark:border-[#243244] shadow-md hover:bg-[#FFFFFF] dark:hover:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
            title="Recenter Map View to Nagpur District"
          >
            <RotateCcw className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Recenter</span>
          </button>

          {/* Quick Real GPS Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            className="h-8 px-2.5 rounded-lg bg-[#FFFFFF]/90 dark:bg-[#0F172A]/90 backdrop-blur-md border border-[#E2E8F0] dark:border-[#243244] shadow-md hover:bg-[#FFFFFF] dark:hover:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-[11px] flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Detect and focus device GPS location"
          >
            <Crosshair className={`w-3 h-3 text-[#0F766E] dark:text-[#14B8A6] ${locatingUser ? "animate-spin" : ""}`} />
            <span>{locatingUser ? "Acquiring GPS..." : "My GPS"}</span>
          </button>

          {/* Live Traffic Status Pill */}
          {trafficEnabled && (
            <div className="h-8 px-3 rounded-lg bg-[#FFFFFF]/95 dark:bg-[#0F172A]/95 backdrop-blur-md border border-[#E2E8F0] dark:border-[#243244] shadow-md flex items-center gap-2 text-[11px] font-medium text-[#0F172A] dark:text-[#F8FAFC]">
              {trafficStatus === "live" ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                  <span className="text-green-600 dark:text-green-400 font-semibold">LIVE TRAFFIC</span>
                  {trafficIncidentsCount > 0 && (
                    <span className="text-[#64748B] dark:text-[#94A3B8]">• {trafficIncidentsCount} Incidents</span>
                  )}
                </>
              ) : trafficStatus === "updating" ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-spin shrink-0" />
                  <span className="text-amber-600 dark:text-amber-400">Updating traffic...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Traffic data unavailable</span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
