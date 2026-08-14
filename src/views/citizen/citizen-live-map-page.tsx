import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, Compass } from 'lucide-react';
import { getIncidents } from '../../services/incidents/incidentService';
import { getActiveConstructionProjects } from '../../services/construction/constructionService';
import { getSatelliteFloodPolygons } from '../../services/satellite/satelliteService';
import { getTileUrlForStyle, BaseMapStyle } from '../../services/maps/mapService';
import { useTheme } from '../../context/theme/ThemeContext';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { Link } from 'react-router';

export const CitizenLiveMapPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonsLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapStyle, setMapStyle] = useState<BaseMapStyle>('VECTOR_DAY');
  const [filterPotholes, setFilterPotholes] = useState(true);
  const [filterFlooding, setFilterFlooding] = useState(true);
  const [filterConstruction, setFilterConstruction] = useState(true);

  // Initialize Leaflet Map with smooth controls
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.1458, 79.0882], // Zero Mile, Nagpur
      zoom: 13,
      zoomControl: false,
    });

    const tileInfo = getTileUrlForStyle(mapStyle, isDark);
    tileLayerRef.current = L.tileLayer(tileInfo.url, {
      attribution: tileInfo.attribution,
      subdomains: tileInfo.subdomains || ['a', 'b', 'c', 'd'],
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    polygonsLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer on Style change or Dark mode toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;

    map.removeLayer(tileLayerRef.current);
    const tileInfo = getTileUrlForStyle(mapStyle, isDark);
    tileLayerRef.current = L.tileLayer(tileInfo.url, {
      attribution: tileInfo.attribution,
      subdomains: tileInfo.subdomains || ['a', 'b', 'c', 'd'],
      maxZoom: 19
    }).addTo(map);
  }, [mapStyle, isDark]);

  // Update Hazard Pins & Zones
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !polygonsLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    polygonsLayerRef.current.clearLayers();

    // 1. Draw Satellite Flood Inundation Polygons
    if (filterFlooding) {
      const floodFeatures = getSatelliteFloodPolygons();
      floodFeatures.forEach(feat => {
        const poly = L.polygon(feat.coordinates, {
          color: '#E53935',
          fillColor: '#E53935',
          fillOpacity: 0.35,
          weight: 2
        });
        poly.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px;">
            <span style="font-size: 10px; font-weight: bold; background: #E53935; color: white; padding: 2px 6px; border-radius: 4px;">
              COPERNICUS SAR FLOOD EXTENT
            </span>
            <h4 style="font-size: 13px; font-weight: bold; margin: 4px 0;">${feat.zoneName}</h4>
            <p style="font-size: 11px; margin: 0; color: #555;">${feat.notes}</p>
          </div>
        `);
        poly.addTo(polygonsLayerRef.current!);
      });
    }

    // 2. Draw Active Construction Zones
    if (filterConstruction) {
      const constructions = getActiveConstructionProjects();
      const createConstIcon = () => L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="background:#FF8A00; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3);">🚧</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      constructions.forEach(c => {
        const marker = L.marker(c.coordinates, { icon: createConstIcon() });
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
            <span style="font-size: 10px; font-weight: bold; color: #FF8A00; background: #FFF8E1; padding: 2px 6px; border-radius: 4px;">
              CONSTRUCTION • ${c.trafficImpact} IMPACT
            </span>
            <h4 style="font-size: 13px; font-weight: bold; margin: 4px 0;">${c.projectName}</h4>
            <p style="font-size: 11px; margin: 0; color: #666;">${c.laneClosures}</p>
            <p style="font-size: 10px; margin-top: 4px; color: #FF8A00; font-weight: bold;">💡 ${c.detourAdvice}</p>
          </div>
        `);
        marker.addTo(markersLayerRef.current!);
      });
    }

    // 3. Draw Incidents (Potholes, Waterlogging, Traffic)
    const incidents = getIncidents();
    incidents.forEach(inc => {
      let show = false;
      let emoji = '⚠️';
      let bgColor = '#FF8A00';

      if (inc.type === 'WATERLOGGING' && filterFlooding) {
        show = true;
        emoji = '💧';
        bgColor = inc.severity === 'SEVERE' ? '#E53935' : '#FF8A00';
      } else if (inc.type === 'ROAD_DAMAGE' && filterPotholes) {
        show = true;
        emoji = '🕳️';
        bgColor = '#FF8A00';
      } else if (inc.type === 'TRAFFIC') {
        show = true;
        emoji = '🚗';
        bgColor = inc.severity === 'SEVERE' ? '#E53935' : '#FFC107';
      }

      if (show) {
        const icon = L.divIcon({
          className: 'custom-map-icon',
          html: `<div style="background:${bgColor}; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3);">${emoji}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker(inc.coordinates, { icon });
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 200px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
              <span style="font-size: 9px; font-weight: bold; background:${bgColor}; color:white; padding:1px 5px; border-radius:3px;">
                ${inc.severity}
              </span>
              <span style="font-size: 10px; color: #888;">${inc.type}</span>
            </div>
            <h4 style="font-size: 12px; font-weight: bold; margin: 3px 0;">${inc.title}</h4>
            <p style="font-size: 11px; margin: 0; color: #666;">${inc.locationName}</p>
            <p style="font-size: 10px; margin-top: 4px; color: #E53935; font-weight: bold;">${inc.recommendedAction}</p>
          </div>
        `);
        marker.addTo(markersLayerRef.current!);
      }
    });
  }, [filterPotholes, filterFlooding, filterConstruction]);

  return (
    <div className="space-y-3">
      {/* Map Style & Layer Filter Bar */}
      <div className="bg-white dark:bg-[#111C2E] p-3 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#111111] dark:text-white flex items-center gap-1.5">
            <Compass className="size-4 text-[#FF8A00]" /> Live Nagpur Safety GIS
          </span>

          {/* Style Selector */}
          <div className="flex items-center gap-1 bg-[#F7F7F7] dark:bg-[#0B1320] p-1 rounded-xl border border-[#E5E5E5] dark:border-white/5">
            <button
              onClick={() => setMapStyle('VECTOR_DAY')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                mapStyle === 'VECTOR_DAY' ? "bg-[#FF8A00] text-white shadow-xs" : "text-[#666666] dark:text-gray-400"
              )}
            >
              Street
            </button>
            <button
              onClick={() => setMapStyle('SATELLITE')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                mapStyle === 'SATELLITE' ? "bg-[#FF8A00] text-white shadow-xs" : "text-[#666666] dark:text-gray-400"
              )}
            >
              Satellite
            </button>
          </div>
        </div>

        {/* Hazard Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            onClick={() => setFilterFlooding(prev => !prev)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap cursor-pointer",
              filterFlooding ? "bg-rose-500/10 text-rose-600 border-rose-500/30" : "bg-[#F7F7F7] dark:bg-[#0B1320] text-[#666666] border-[#E5E5E5] dark:border-white/10"
            )}
          >
            💧 Waterlogging
          </button>
          <button
            onClick={() => setFilterConstruction(prev => !prev)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap cursor-pointer",
              filterConstruction ? "bg-[#FFF8E1] text-[#111111] border-[#FFC107]" : "bg-[#F7F7F7] dark:bg-[#0B1320] text-[#666666] border-[#E5E5E5] dark:border-white/10"
            )}
          >
            🚧 Construction
          </button>
          <button
            onClick={() => setFilterPotholes(prev => !prev)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap cursor-pointer",
              filterPotholes ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : "bg-[#F7F7F7] dark:bg-[#0B1320] text-[#666666] border-[#E5E5E5] dark:border-white/10"
            )}
          >
            🕳️ Potholes
          </button>
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="relative rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-white/10 shadow-sm bg-white dark:bg-[#111C2E]">
        <div ref={mapContainerRef} className="w-full h-[460px] z-0" />
      </div>

      {/* Quick Action Link to Safe Route */}
      <Button
        render={<Link to="/citizen/route" />}
        className="w-full bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold h-11 text-xs gap-2 shadow-xs cursor-pointer"
      >
        <Navigation className="size-4" /> Plan Safe Navigation Using This Map
      </Button>
    </div>
  );
};

export default CitizenLiveMapPage;
