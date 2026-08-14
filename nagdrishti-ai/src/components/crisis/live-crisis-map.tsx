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
        let color = '#22c55e'; // Green
        let opacity = 0.25;
        if (zone.baselineRisk === 'SEVERE') {
          color = '#ef4444';
          opacity = 0.45;
        } else if (zone.baselineRisk === 'HIGH') {
          color = '#f97316';
          opacity = 0.4;
        } else if (zone.baselineRisk === 'MEDIUM') {
          color = '#eab308';
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
      let bgColor = '#f97316';

      if (inc.type === 'WATERLOGGING' && activeLayers.waterlogging) {
        include = true;
        emoji = '💧';
        bgColor = inc.severity === 'SEVERE' ? '#ef4444' : '#f97316';
      } else if (inc.type === 'TRAFFIC' && activeLayers.traffic) {
        include = true;
        emoji = '🚗';
        bgColor = inc.severity === 'SEVERE' ? '#ef4444' : '#eab308';
      } else if (inc.type === 'ROAD_DAMAGE' && activeLayers.roadDamage) {
        include = true;
        emoji = '⚠️';
        bgColor = '#ea580c';
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
              <span style="font-size: 10px; color: #666;">${inc.reportedTime}</span>
            </div>
            <strong style="font-size: 13px; color: #111; display: block; margin-bottom: 2px;">${inc.title}</strong>
            <p style="font-size: 11px; color: #444; margin: 0 0 6px 0;">${inc.locationName}</p>
            <div style="background: #f1f5f9; padding: 6px; border-radius: 6px; font-size: 10.5px; border-left: 3px solid #f97316; margin-bottom: 8px;">
              <strong>AI Recommendation:</strong><br/>${inc.recommendedAction}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(markersLayerGroupRef.current!);
      }
    });

    // 3. Add Citizen Reports Markers
    if (activeLayers.citizenReports) {
      citizenReports.forEach(rep => {
        const icon = createCustomIcon('📸', '#8b5cf6', false);
        const marker = L.marker(rep.coordinates, { icon });
        marker.bindPopup(`
          <div style="font-family: system-ui; max-width: 200px;">
            <span style="font-size: 9px; font-weight: bold; background: #8b5cf6; color: white; padding: 2px 5px; border-radius: 4px;">CITIZEN REPORT</span>
            <strong style="font-size: 12px; display: block; margin-top: 4px;">${rep.issueType}</strong>
            <p style="font-size: 11px; margin: 2px 0 4px 0;">${rep.locationName}</p>
            <span style="font-size: 10px; color: #666;">Reported by ${rep.citizenName} • 👍 ${rep.upvotes}</span>
          </div>
        `);
        marker.addTo(markersLayerGroupRef.current!);
      });
    }

    // 4. Add Resource Markers
    if (activeLayers.resources) {
      resources.forEach(res => {
        const icon = createCustomIcon('🚑', '#10b981', false);
        const marker = L.marker([21.1448 + (Math.random() - 0.5) * 0.04, 79.0825 + (Math.random() - 0.5) * 0.04], { icon });
        marker.bindPopup(`
          <div style="font-family: system-ui; max-width: 200px;">
            <span style="font-size: 9px; font-weight: bold; background: #10b981; color: white; padding: 2px 5px; border-radius: 4px;">DEPLOYED RESOURCE</span>
            <strong style="font-size: 12px; display: block; margin-top: 4px;">${res.name}</strong>
            <p style="font-size: 11px; margin: 2px 0 4px 0;">Deployed: ${res.deployedQuantity} / ${res.totalQuantity}</p>
          </div>
        `);
        marker.addTo(markersLayerGroupRef.current!);
      });
    }
  }, [zones, incidents, resources, citizenReports, activeLayers]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border shadow-md bg-card">
      {/* Map Header Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-md pointer-events-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-xs text-foreground">
            Live Crisis Map — Nagpur
          </span>
          <Badge className="bg-bhagwa text-white text-[9px] font-mono">
            {stageInfo.title.split(':')[0]}
          </Badge>
        </div>

        <div className="flex items-center gap-1 pointer-events-auto">
          {!fullScreenMode && (
            <Button
              variant="outline"
              size="sm"
              render={<Link to="/live-map" />}
              className="bg-background/90 backdrop-blur-md h-8 text-xs font-semibold gap-1 shadow-sm"
            >
              <Maximize2 className="size-3.5" /> Fullscreen
            </Button>
          )}
        </div>
      </div>

      {/* Layer Control Drawer / Buttons Bar */}
      <div className="absolute bottom-4 left-3 right-3 z-[1000] flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1 bg-background/95 backdrop-blur-md p-1.5 rounded-xl border border-border shadow-lg max-w-full overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 whitespace-nowrap flex items-center gap-1">
            <Layers className="size-3 text-bhagwa" /> Layers:
          </span>

          <button
            onClick={() => toggleLayer('heatmap')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border min-h-[36px]",
              activeLayers.heatmap ? "bg-bhagwa text-white border-bhagwa shadow-sm" : "bg-card text-muted-foreground border-border hover:bg-muted"
            )}
          >
            🔥 Heatmap
          </button>

          <button
            onClick={() => toggleLayer('waterlogging')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border min-h-[36px]",
              activeLayers.waterlogging ? "bg-rose-500 text-white border-rose-500 shadow-sm" : "bg-card text-muted-foreground border-border hover:bg-muted"
            )}
          >
            💧 Waterlogging
          </button>

          <button
            onClick={() => toggleLayer('roadDamage')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border min-h-[36px]",
              activeLayers.roadDamage ? "bg-orange-500 text-white border-orange-500 shadow-sm" : "bg-card text-muted-foreground border-border hover:bg-muted"
            )}
          >
            ⚠️ Potholes / Damage
          </button>

          <button
            onClick={() => toggleLayer('traffic')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border min-h-[36px]",
              activeLayers.traffic ? "bg-amber-500 text-white border-amber-500 shadow-sm" : "bg-card text-muted-foreground border-border hover:bg-muted"
            )}
          >
            🚗 Traffic
          </button>

          <button
            onClick={() => toggleLayer('citizenReports')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border min-h-[36px]",
              activeLayers.citizenReports ? "bg-purple-600 text-white border-purple-600 shadow-sm" : "bg-card text-muted-foreground border-border hover:bg-muted"
            )}
          >
            📸 Citizen Reports
          </button>

          <button
            onClick={() => toggleLayer('resources')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border min-h-[36px]",
              activeLayers.resources ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-card text-muted-foreground border-border hover:bg-muted"
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
