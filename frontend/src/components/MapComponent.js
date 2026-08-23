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
} from "lucide-react";
import { reverseGeocodeLocation, getCurrentGpsLocation } from "../lib/geoService";
import { getTrafficIncidents, getTrafficFlowStatus } from "../lib/api";

export function getRiskColor(category, score) {
  if (category === "Severe" || score >= 75) return "#EF4444"; // Bold Red
  if (category === "High" || score >= 50) return "#F97316";   // Bold Orange
  if (category === "Medium" || score >= 25) return "#EAB308"; // Bold Amber
  return "#10B981"; // Bold Emerald Green
}

const TILE_PROVIDERS = {
  street: {
    id: "street",
    name: "Standard Road",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: ["a", "b", "c"],
  },
  satellite: {
    id: "satellite",
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics • Latest available satellite imagery',
    maxZoom: 19,
    subdomains: [],
  },
  dark: {
    id: "dark",
    name: "Dark Map",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
    subdomains: ["a", "b", "c", "d"],
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
  initialLayer = "satellite",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const leafletRef = useRef(null);

  // Dedicated Layer References
  const currentTileLayerRef = useRef(null);
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
  const [trafficLastUpdated, setTrafficLastUpdated] = useState(null);
  const [trafficIncidentsCount, setTrafficIncidentsCount] = useState(0);
  const [locatingUser, setLocatingUser] = useState(false);

  const trafficIntervalRef = useRef(null);

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
      center: [21.1458, 79.0882],
      zoom: isHeroBackground ? 12.0 : 11.5,
      minZoom: 8,
      maxZoom: 19,
      zoomControl: false,
      scrollWheelZoom: !isHeroBackground,
      dragging: true,
      touchZoom: !isHeroBackground,
      doubleClickZoom: !isHeroBackground,
    });

    // Create Dedicated Leaflet Panes for strictly controlled z-ordering
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
    const provider = TILE_PROVIDERS[initialLayer] || TILE_PROVIDERS.satellite;
    const tileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
      subdomains: provider.subdomains || [],
      pane: "tilePane",
    }).addTo(map);

    currentTileLayerRef.current = tileLayer;

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

    // Interactive Map Click Handler with Dynamic Reverse Geocode & Ward Detection
    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;

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
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 210px; padding: 2px;">
              <div style="font-size: 12.5px; font-weight: 700; color: #0F172A; margin-bottom: 2px; line-height: 1.25;">
                ${geoInfo.name}
              </div>
              <div style="font-size: 11px; color: #64748B; margin-bottom: 6px; line-height: 1.2;">
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
                onSetOriginRef.current(geoInfo);
                map.closePopup();
              };
            }
            if (destBtn && onSetDestinationRef.current) {
              destBtn.onclick = () => {
                onSetDestinationRef.current(geoInfo);
                map.closePopup();
              };
            }
          }, 40);
        }
      } catch (err) {
        if (onLocationSelectedRef.current) {
          onLocationSelectedRef.current({
            lat,
            lng,
            name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
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

    // Remove only the base tile layer from tilePane
    if (currentTileLayerRef.current) {
      try {
        mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
      } catch (_) {}
    }

    const provider = TILE_PROVIDERS[layerKey];
    const newTileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
      subdomains: provider.subdomains || [],
      pane: "tilePane",
    }).addTo(mapInstanceRef.current);

    currentTileLayerRef.current = newTileLayer;
    setActiveLayer(layerKey);
    setLayerMenuOpen(false);
  }, []);

  // Sync external initialLayer prop changes (e.g. from hero toggle)
  useEffect(() => {
    if (initialLayer && initialLayer !== activeLayer && mapInstanceRef.current) {
      handleSwitchLayer(initialLayer);
    }
  }, [initialLayer, activeLayer, handleSwitchLayer]);

  // 3. TomTom Live Traffic Engine (Flow & Incidents)
  const fetchTrafficData = useCallback(async () => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !trafficLayerGroupRef.current) return;

    setTrafficStatus("updating");

    try {
      // Fetch incidents & flow status in parallel
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

      // Update Incidents
      trafficLayerGroupRef.current.clearLayers();
      let incidentsCount = 0;

      if (incRes.status === "fulfilled" && Array.isArray(incRes.value?.incidents)) {
        const incidents = incRes.value.incidents;
        incidentsCount = incidents.length;

        incidents.forEach((inc) => {
          if (!inc.coordinates || !inc.coordinates[0] || !inc.coordinates[1]) return;
          const [lat, lng] = inc.coordinates;

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
      setTrafficLastUpdated(new Date());
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

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

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

  // 6. Update Real GPS Location Marker & Accuracy Circle in locationPane
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !locationLayerGroupRef.current) return;

    locationLayerGroupRef.current.clearLayers();

    // Check if origin or selected location has GPS source
    const gpsTarget = (origin?.source === "gps" || origin?.accuracy) ? origin : null;

    if (gpsTarget && gpsTarget.lat && gpsTarget.lng) {
      const accuracyRadius = Math.max(8, Math.min(gpsTarget.accuracy || 20, 500));

      // Accuracy circle
      L.circle([Number(gpsTarget.lat), Number(gpsTarget.lng)], {
        radius: accuracyRadius,
        color: "#0F766E",
        weight: 1.5,
        opacity: 0.6,
        fillColor: "#14B8A6",
        fillOpacity: 0.12,
        pane: "locationPane",
      }).addTo(locationLayerGroupRef.current);

      // Pulsing Beacon Marker
      const beaconIcon = L.divIcon({
        className: "custom-gps-beacon",
        html: `
          <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: #0F766E; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: #0F766E; border: 2.5px solid white; box-shadow: 0 0 10px rgba(15,118,110,0.8), 0 2px 4px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        pane: "locationPane",
      });

      L.marker([Number(gpsTarget.lat), Number(gpsTarget.lng)], { icon: beaconIcon, pane: "locationPane" })
        .bindPopup(`<strong>Your Current Location</strong><br/><span style="font-size:10px; color:#64748B;">Accuracy: ±${gpsTarget.accuracy || 15}m</span>`)
        .addTo(locationLayerGroupRef.current);
    }
  }, [origin]);

  // 7. Update Origin (A) and Destination (B) Markers in endpointsLayerGroup
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapInstanceRef.current || !endpointsLayerGroupRef.current) return;

    endpointsLayerGroupRef.current.clearLayers();

    if (origin && origin.lat && origin.lng) {
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

    if (destination && destination.lat && destination.lng) {
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
        .filter(Boolean);

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

        // Auto-fit route with generous padding
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

  // Quick GPS Trigger on Map
  const handleLocateMe = async () => {
    if (locatingUser || !mapInstanceRef.current) return;
    setLocatingUser(true);
    try {
      const loc = await getCurrentGpsLocation({ enableHighAccuracy: true, timeout: 8000 });
      if (loc.lat && loc.lng) {
        mapInstanceRef.current.setView([loc.lat, loc.lng], 14, { animate: true });
        if (onSetOriginRef.current) {
          onSetOriginRef.current(loc);
        }
      }
    } catch (err) {
      console.warn("[Map Locate Me] Error:", err.message);
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
          <div className="relative">
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
              <span className="capitalize">{TILE_PROVIDERS[activeLayer]?.name || "Map"}</span>
            </button>

            {layerMenuOpen && (
              <div className="absolute right-0 top-11 w-48 rounded-xl bg-[#FFFFFF] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#243244] shadow-xl p-1.5 space-y-1 z-30">
                <button
                  type="button"
                  onClick={() => handleSwitchLayer("street")}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeLayer === "street"
                      ? "bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] font-semibold"
                      : "text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>Standard Road</span>
                </button>

                <button
                  type="button"
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
                  type="button"
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

                <div className="pt-1 border-t border-[#E2E8F0] dark:border-[#243244] px-2 py-1 text-[10px] text-[#94A3B8] leading-tight">
                  Satellite imagery date varies by area
                </div>
              </div>
            )}
          </div>
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
            title="Recenter Map View"
          >
            <RotateCcw className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Recenter</span>
          </button>

          {/* Quick Locate Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            className="h-8 px-2.5 rounded-lg bg-[#FFFFFF]/90 dark:bg-[#0F172A]/90 backdrop-blur-md border border-[#E2E8F0] dark:border-[#243244] shadow-md hover:bg-[#FFFFFF] dark:hover:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-[11px] flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Focus Current GPS Location"
          >
            <Navigation className={`w-3 h-3 text-[#0F766E] dark:text-[#14B8A6] ${locatingUser ? "animate-spin" : ""}`} />
            <span>{locatingUser ? "Locating..." : "My GPS"}</span>
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
