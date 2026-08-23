"use client";

import { useEffect, useRef, useState } from "react";
import { Layers, Globe, Map as MapIcon, Moon, MapPin, Navigation } from "lucide-react";
import { reverseGeocodeLocation } from "../lib/geoService";

export function getRiskColor(category, score) {
  if (category === "Severe" || score >= 75) return "#EF4444"; // Bold Red
  if (category === "High" || score >= 50) return "#F97316";   // Bold Orange
  if (category === "Medium" || score >= 25) return "#EAB308"; // Bold Amber
  return "#10B981"; // Bold Emerald Green
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
  const currentTileLayerRef = useRef(null);
  const zonesLayerGroupRef = useRef(null);
  const reportsLayerGroupRef = useRef(null);
  const routeLayerGroupRef = useRef(null);
  const endpointsLayerGroupRef = useRef(null);

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
      zoom: isHeroBackground ? 12.5 : 12,
      zoomControl: false,
      scrollWheelZoom: !isHeroBackground,
      dragging: true,
      touchZoom: !isHeroBackground,
      doubleClickZoom: !isHeroBackground,
    });

    // Add Base Tile Layer
    const provider = TILE_PROVIDERS[initialLayer] || TILE_PROVIDERS.satellite;
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
                  geoInfo.insideNmc
                    ? `<span style="display:inline-block; font-size:10px; font-weight:700; text-transform:uppercase; background:#DCFCE7; color:#166534; padding:2px 6px; border-radius:4px; border:1px solid rgba(22,101,52,0.2);">
                        ${geoInfo.wardNumber ? `${geoInfo.wardNumber} • ` : ""}Inside NMC Limits
                       </span>`
                    : `<span style="display:inline-block; font-size:10px; font-weight:600; text-transform:uppercase; background:#F1F5F9; color:#475569; padding:2px 6px; border-radius:4px; border:1px solid #CBD5E1;">
                        Outside NMC Limits
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
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isHeroBackground, initialLayer]);

  // Handle Layer Switching
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

  // Update Citizen Incident Markers
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

  // Update Individual Origin (A) and Destination (B) Markers
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
        .bindPopup(`<strong>Origin:</strong> ${origin.name || 'Start Point'}`)
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
        .bindPopup(`<strong>Destination:</strong> ${destination.name || 'Arrival Point'}`)
        .addTo(endpointsLayerGroupRef.current);
    }
  }, [origin, destination]);

  // Update Safe Route Polyline Overlay with High-Definition Road Following & Glow
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
        // Outer ambient glow path
        L.polyline(latlngs, {
          color: "#0D9488",
          weight: 9,
          opacity: 0.35,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(routeLayerGroupRef.current);

        // Sharp primary road-following polyline
        const mainLine = L.polyline(latlngs, {
          color: "#14B8A6",
          weight: 5,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(routeLayerGroupRef.current);

        try {
          mapInstanceRef.current.fitBounds(mainLine.getBounds(), { padding: [50, 50] });
        } catch (_) {}
      }
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
