import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { Layers, Maximize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { Link } from 'react-router';

interface MapLayerState {
  waterlogging: boolean;
  roadDamage: boolean;
  traffic: boolean;
  drainage: boolean;
  citizenReports: boolean;
  resources: boolean;
  heatmap: boolean;
}

export const LiveCrisisMap: React.FC<{ fullScreenMode?: boolean }> = ({ fullScreenMode = false }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const polygonLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const { zones, incidents, resources, citizenReports, stageInfo } = useDemoSimulation();

  const [activeLayers, setActiveLayers] = useState<MapLayerState>({
    waterlogging: true,
    roadDamage: true,
    traffic: true,
    drainage: true,
    citizenReports: true,
    resources: true,
    heatmap: true,
  });

  const toggleLayer = (layerKey: keyof MapLayerState) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on Nagpur Zero Mile Stone: [21.1458, 79.0882]
    const map = L.map(mapContainerRef.current, {
      center: [21.1458, 79.0882],
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | NMC Crisis Command',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    polygonLayerGroupRef.current = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Layers & Markers when zones/incidents or activeLayers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !polygonLayerGroupRef.current || !markersLayerGroupRef.current) return;

    polygonLayerGroupRef.current.clearLayers();
    markersLayerGroupRef.current.clearLayers();

    // 1. Draw Zone Heatmap Polygons
    if (activeLayers.heatmap) {
      zones.forEach(zone => {
        let color = '#22A447'; // Green - Low
        let opacity = 0.25;
        if (zone.baselineRisk === 'SEVERE') {
          color = '#E53935'; // Red - Severe
          opacity = 0.45;
        } else if (zone.baselineRisk === 'HIGH') {
          color = '#FF8A00'; // Orange - High
          opacity = 0.4;
        } else if (zone.baselineRisk === 'MEDIUM') {
          color = '#FFC107'; // Yellow - Medium
          opacity = 0.3;
        }

        const polygon = L.polygon(zone.bounds as [number, number][], {
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: opacity,
        });

        polygon.bindTooltip(
          `<div><strong>${zone.name} (${zone.marathiName})</strong><br/>Risk Score: ${zone.currentRiskScore}/100 [${zone.baselineRisk}]<br/>Rainfall: ${zone.rainfallMm} mm</div>`,
          { sticky: true }
        );

        polygon.addTo(polygonLayerGroupRef.current!);
      });
    }

    // Helper for Custom Div Icons
    const createCustomIcon = (emoji: string, bgColor: string, pulse: boolean = false) => {
      return L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="
            background-color: ${bgColor};
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid white;
            position: relative;
          ">
            ${emoji}
            ${pulse ? `<span style="
              position: absolute;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              border: 2px solid ${bgColor};
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></span>` : ''}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
    };

    // 2. Add Incident Markers
    incidents.forEach(inc => {
      let include = false;
      let emoji = '⚠️';
      let bgColor = '#FF8A00';

      if (inc.type === 'WATERLOGGING' && activeLayers.waterlogging) {
        include = true;
        emoji = '💧';
        bgColor = inc.severity === 'SEVERE' ? '#E53935' : '#FF8A00';
      } else if (inc.type === 'TRAFFIC' && activeLayers.traffic) {
        include = true;
        emoji = '🚗';
        bgColor = inc.severity === 'SEVERE' ? '#E53935' : '#FFC107';
      } else if (inc.type === 'ROAD_DAMAGE' && activeLayers.roadDamage) {
        include = true;
        emoji = '⚠️';
        bgColor = '#FF8A00';
      } else if (inc.type === 'DRAINAGE_OVERFLOW' && activeLayers.drainage) {
        include = true;
        emoji = '🌊';
        bgColor = '#0284c7';
      }

      if (include) {
        const icon = createCustomIcon(emoji, bgColor, inc.severity === 'SEVERE');
        const marker = L.marker(inc.coordinates, { icon });

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; color: white; background: ${bgColor}; font-family: monospace;">
                ${inc.severity} (${inc.riskScore}%)
              </span>
              <span style="font-size: 10px; color: #666666;">${inc.type}</span>
            </div>
            <h5 style="font-size: 13px; font-weight: bold; margin: 0 0 4px 0; color: #111111;">${inc.title}</h5>
            <p style="font-size: 11px; margin: 0; color: #666666;">${inc.locationName}</p>
            <div style="font-size: 10px; margin-top: 4px; color: #E53935; font-weight: bold;">
              ${inc.recommendedAction}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(markersLayerGroupRef.current!);
      }
    });

    // 3. Add Resource Markers
    if (activeLayers.resources) {
      resources.forEach(res => {
        const icon = createCustomIcon('🚑', '#22A447');
        const marker = L.marker([21.1448 + (Math.random() - 0.5) * 0.04, 79.0825 + (Math.random() - 0.5) * 0.04], { icon });
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px;">
            <span style="font-size: 10px; font-weight: bold; color: #22A447; background: rgba(34, 164, 71, 0.1); padding: 2px 6px; border-radius: 4px;">
              DEPLOYED
            </span>
            <h5 style="font-size: 13px; font-weight: bold; margin: 4px 0; color: #111111;">${res.name}</h5>
            <p style="font-size: 11px; color: #666666; margin: 0;">Deployed: ${res.deployedQuantity} / ${res.totalQuantity}</p>
          </div>
        `);
        marker.addTo(markersLayerGroupRef.current!);
      });
    }

    // 4. Add Citizen Reports
    if (activeLayers.citizenReports) {
      citizenReports.forEach(rep => {
        const icon = createCustomIcon('📸', '#8B5CF6');
        const marker = L.marker(rep.coordinates, { icon });
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 10px; font-weight: bold; color: #8B5CF6;">CITIZEN REPORT</span>
              <span style="font-size: 10px; color: #666666;">👍 ${rep.upvotes}</span>
            </div>
            <h5 style="font-size: 12px; font-weight: bold; margin: 4px 0; color: #111111;">${rep.issueType} — ${rep.locationName}</h5>
            <p style="font-size: 11px; color: #666666; margin: 0;">Reported by ${rep.citizenName}</p>
          </div>
        `);
        marker.addTo(markersLayerGroupRef.current!);
      });
    }
  }, [zones, incidents, resources, citizenReports, activeLayers]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-white/10 shadow-sm bg-white dark:bg-[#111C2E]">
      {/* Floating Header Card */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 dark:bg-[#111C2E]/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-md flex items-center gap-2 pointer-events-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22A447] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22A447]"></span>
          </span>
          <span className="font-bold text-xs text-[#111111] dark:text-white">
            Live Crisis Map — Nagpur
          </span>
          <Badge className="bg-[#FFC107] text-[#111111] text-[9px] font-mono font-black">
            {stageInfo.title.split(':')[0]}
          </Badge>
        </div>

        <div className="flex items-center gap-1 pointer-events-auto">
          {!fullScreenMode && (
            <Button
              variant="outline"
              size="sm"
              render={<Link to="/live-map" />}
              className="bg-white/95 dark:bg-[#111C2E]/95 backdrop-blur-md h-8 text-xs font-semibold gap-1 shadow-xs border-[#E5E5E5] text-[#111111] dark:text-white"
            >
              <Maximize2 className="size-3.5" /> Fullscreen
            </Button>
          )}
        </div>
      </div>

      {/* Layer Control Drawer / Buttons Bar */}
      <div className="absolute bottom-4 left-3 right-3 z-[1000] flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1 bg-white/95 dark:bg-[#111C2E]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-lg max-w-full overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-[#666666] dark:text-gray-400 uppercase px-2 whitespace-nowrap flex items-center gap-1">
            <Layers className="size-3 text-[#FF8A00]" /> Layers:
          </span>

          <button
            onClick={() => toggleLayer('heatmap')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border min-h-[36px] cursor-pointer",
              activeLayers.heatmap ? "bg-[#FFF8E1] text-[#111111] dark:bg-[#FFC107]/20 dark:text-white border-[#FFC107] font-bold shadow-xs" : "bg-white dark:bg-[#111C2E] text-[#666666] dark:text-gray-400 border-[#E5E5E5] dark:border-white/10 hover:bg-[#F7F7F7]"
            )}
          >
            🔥 Heatmap
          </button>

          <button
            onClick={() => toggleLayer('waterlogging')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border min-h-[36px] cursor-pointer",
              activeLayers.waterlogging ? "bg-[#FFF8E1] text-[#111111] dark:bg-[#FFC107]/20 dark:text-white border-[#FFC107] font-bold shadow-xs" : "bg-white dark:bg-[#111C2E] text-[#666666] dark:text-gray-400 border-[#E5E5E5] dark:border-white/10 hover:bg-[#F7F7F7]"
            )}
          >
            💧 Waterlogging
          </button>

          <button
            onClick={() => toggleLayer('roadDamage')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border min-h-[36px] cursor-pointer",
              activeLayers.roadDamage ? "bg-[#FFF8E1] text-[#111111] dark:bg-[#FFC107]/20 dark:text-white border-[#FFC107] font-bold shadow-xs" : "bg-white dark:bg-[#111C2E] text-[#666666] dark:text-gray-400 border-[#E5E5E5] dark:border-white/10 hover:bg-[#F7F7F7]"
            )}
          >
            ⚠️ Potholes / Damage
          </button>

          <button
            onClick={() => toggleLayer('traffic')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border min-h-[36px] cursor-pointer",
              activeLayers.traffic ? "bg-[#FFF8E1] text-[#111111] dark:bg-[#FFC107]/20 dark:text-white border-[#FFC107] font-bold shadow-xs" : "bg-white dark:bg-[#111C2E] text-[#666666] dark:text-gray-400 border-[#E5E5E5] dark:border-white/10 hover:bg-[#F7F7F7]"
            )}
          >
            🚗 Traffic
          </button>

          <button
            onClick={() => toggleLayer('citizenReports')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border min-h-[36px] cursor-pointer",
              activeLayers.citizenReports ? "bg-[#FFF8E1] text-[#111111] dark:bg-[#FFC107]/20 dark:text-white border-[#FFC107] font-bold shadow-xs" : "bg-white dark:bg-[#111C2E] text-[#666666] dark:text-gray-400 border-[#E5E5E5] dark:border-white/10 hover:bg-[#F7F7F7]"
            )}
          >
            📸 Citizen Reports
          </button>

          <button
            onClick={() => toggleLayer('resources')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border min-h-[36px] cursor-pointer",
              activeLayers.resources ? "bg-[#FFF8E1] text-[#111111] dark:bg-[#FFC107]/20 dark:text-white border-[#FFC107] font-bold shadow-xs" : "bg-white dark:bg-[#111C2E] text-[#666666] dark:text-gray-400 border-[#E5E5E5] dark:border-white/10 hover:bg-[#F7F7F7]"
            )}
          >
            🚑 Resources
          </button>
        </div>
      </div>

      {/* Actual Map Canvas Container */}
      <div
        ref={mapContainerRef}
        className={cn(
          "w-full transition-all z-0",
          fullScreenMode ? "h-[calc(100vh-140px)] min-h-[500px]" : "h-[380px] sm:h-[480px] lg:h-[540px]"
        )}
      />
    </div>
  );
};
