import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Search, MapPin, Navigation, X, Locate } from 'lucide-react';
import { searchNagpurLocations, GeocodingResult, getCurrentBrowserPosition } from '../../services/geocoding/geocodingService';
import { getProgressivePOIsInViewport } from '../../services/poi/poiService';
import { getIncidents } from '../../services/incidents/incidentService';
import { getActiveConstructionProjects } from '../../services/construction/constructionService';
import { getSatelliteFloodPolygons } from '../../services/satellite/satelliteService';
import { getTileUrlForStyle, BaseMapStyle } from '../../services/maps/mapService';
import { useTheme } from '../../context/theme/ThemeContext';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router';

export const CitizenLiveMapPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Selected Feature Details for Bottom Sheet
  const [selectedPlace, setSelectedPlace] = useState<{
    title: string;
    category: string;
    subtitle: string;
    coordinates: [number, number];
    hazardInfo?: string;
    icon: string;
  } | null>(null);

  // Map Controls State
  const [mapStyle, setMapStyle] = useState<BaseMapStyle>('VECTOR_DAY');
  const [currentZoom, setCurrentZoom] = useState<number>(13);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'TRANSPORT' | 'HEALTH' | 'SAFETY' | 'LANDMARK'>('ALL');
  const [showFlooding, setShowFlooding] = useState(true);
  const [showConstruction, setShowConstruction] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const poiLayerRef = useRef<L.LayerGroup | null>(null);
  const hazardsLayerRef = useRef<L.LayerGroup | null>(null);

  // Debounced Place Search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      searchNagpurLocations(searchQuery).then(res => {
        setSearchResults(res);
        setIsSearching(false);
      });
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.1458, 79.0882], // Zero Mile Stone
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

    hazardsLayerRef.current = L.layerGroup().addTo(map);
    poiLayerRef.current = L.layerGroup().addTo(map);

    // Track zoom level changes for progressive detail rendering
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Layer
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

  // Update Progressive POIs & Hazards based on Zoom & Filters
  useEffect(() => {
    if (!mapInstanceRef.current || !poiLayerRef.current || !hazardsLayerRef.current) return;

    poiLayerRef.current.clearLayers();
    hazardsLayerRef.current.clearLayers();

    // 1. Render Progressive POIs based on Zoom Level
    const visiblePOIs = getProgressivePOIsInViewport(currentZoom, filterCategory);
    visiblePOIs.forEach(poi => {
      const icon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="background:${poi.color}; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.25); cursor:pointer;">${poi.icon}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker(poi.coordinates, { icon });
      marker.on('click', () => {
        setSelectedPlace({
          title: poi.name,
          category: poi.subType,
          subtitle: poi.address || 'Nagpur Geographic Landmark',
          coordinates: poi.coordinates,
          icon: poi.icon
        });
      });
      marker.addTo(poiLayerRef.current!);
    });

    // 2. Render Active Construction Zones
    if (showConstruction) {
      const constructions = getActiveConstructionProjects();
      constructions.forEach(c => {
        const icon = L.divIcon({
          className: 'custom-map-icon',
          html: `<div style="background:#FF8A00; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); cursor:pointer;">🚧</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        const marker = L.marker(c.coordinates, { icon });
        marker.on('click', () => {
          setSelectedPlace({
            title: c.projectName,
            category: `CONSTRUCTION • ${c.trafficImpact} IMPACT`,
            subtitle: `${c.laneClosures} — ${c.locationName}`,
            coordinates: c.coordinates,
            hazardInfo: c.detourAdvice,
            icon: '🚧'
          });
        });
        marker.addTo(hazardsLayerRef.current!);
      });
    }

    // 3. Render Satellite Flood Polygons & Incidents
    if (showFlooding) {
      const floodPolys = getSatelliteFloodPolygons();
      floodPolys.forEach(feat => {
        const poly = L.polygon(feat.coordinates, {
          color: '#E53935',
          fillColor: '#E53935',
          fillOpacity: 0.3,
          weight: 2
        });
        poly.on('click', () => {
          setSelectedPlace({
            title: feat.zoneName,
            category: 'COPERNICUS SAR FLOOD RISK',
            subtitle: `${feat.areaHectares} ha surface water pooling detected by radar satellite.`,
            coordinates: feat.coordinates[0],
            hazardInfo: feat.notes,
            icon: '💧'
          });
        });
        poly.addTo(hazardsLayerRef.current!);
      });

      const incidents = getIncidents().filter(i => i.severity === 'SEVERE' || i.severity === 'HIGH');
      incidents.forEach(inc => {
        const icon = L.divIcon({
          className: 'custom-map-icon',
          html: `<div style="background:#E53935; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); cursor:pointer;">${inc.type === 'WATERLOGGING' ? '💧' : '⚠️'}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        const marker = L.marker(inc.coordinates, { icon });
        marker.on('click', () => {
          setSelectedPlace({
            title: inc.title,
            category: `${inc.severity} ${inc.type}`,
            subtitle: inc.locationName,
            coordinates: inc.coordinates,
            hazardInfo: inc.recommendedAction,
            icon: '⚠️'
          });
        });
        marker.addTo(hazardsLayerRef.current!);
      });
    }
  }, [currentZoom, filterCategory, showFlooding, showConstruction]);

  // Handle Search Result Selection & Smooth Map Pan
  const handleSelectSearchResult = (result: GeocodingResult) => {
    setShowDropdown(false);
    setSearchQuery(result.name);
    setSelectedPlace({
      title: result.name,
      category: result.category,
      subtitle: result.displayName,
      coordinates: result.coordinates,
      icon: '📍'
    });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(result.coordinates, 15, { duration: 1.2 });
    }
  };

  // GPS Current Location Button
  const handleLocateMe = async () => {
    try {
      const coords = await getCurrentBrowserPosition();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(coords, 15, { duration: 1.2 });
      }
      setSelectedPlace({
        title: 'Your Current Position (GPS)',
        category: 'MY LOCATION',
        subtitle: `Latitude: ${coords[0].toFixed(4)}, Longitude: ${coords[1].toFixed(4)}`,
        coordinates: coords,
        icon: '📍'
      });
    } catch {
      alert('Could not retrieve device GPS.');
    }
  };

  return (
    <div className="space-y-3 relative">
      {/* 1. Search Bar & Layer Bar */}
      <div className="bg-white dark:bg-[#111C2E] p-3 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-2.5">
        <div className="relative">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10">
            <Search className="size-4 text-[#666666] dark:text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search places, Metro, Hospitals in Nagpur..."
              value={searchQuery}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              className="w-full text-xs font-semibold text-[#111111] dark:text-white bg-transparent focus:outline-none placeholder:text-[#666666]"
            />
            <button
              onClick={handleLocateMe}
              className="size-7 rounded-lg bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/10 flex items-center justify-center text-[#FF8A00] shadow-2xs shrink-0 cursor-pointer"
              title="Locate Me"
            >
              <Locate className="size-3.5" />
            </button>
          </div>

          {/* Search Dropdown Suggestions */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/15 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-[#E5E5E5] dark:divide-white/5">
              {searchResults.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full p-2.5 text-left text-xs hover:bg-[#FFF8E1] dark:hover:bg-white/5 flex items-start gap-2 cursor-pointer transition-colors"
                >
                  <MapPin className="size-3.5 text-[#FF8A00] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#111111] dark:text-white">{item.name}</div>
                    <div className="text-[10px] text-[#666666] dark:text-gray-400 line-clamp-1">{item.displayName}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Style & Category Filter Chips */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 bg-[#F7F7F7] dark:bg-[#0B1320] p-1 rounded-xl border border-[#E5E5E5] dark:border-white/5 shrink-0">
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

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(['ALL', 'TRANSPORT', 'HEALTH', 'SAFETY', 'LANDMARK'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap border transition-all cursor-pointer",
                  filterCategory === cat
                    ? "bg-[#FFF8E1] text-[#111111] dark:bg-[#FFC107]/20 dark:text-white border-[#FFC107]"
                    : "bg-[#F7F7F7] dark:bg-[#0B1320] text-[#666666] border-[#E5E5E5] dark:border-white/10"
                )}
              >
                {cat === 'ALL' ? '🌟 All' : cat === 'TRANSPORT' ? '🚇 Metro' : cat === 'HEALTH' ? '🏥 Health' : cat === 'SAFETY' ? '👮 Safety' : '🏛️ Landmark'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Map Canvas Viewport */}
      <div className="relative rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-white/10 shadow-sm bg-white dark:bg-[#111C2E]">
        <div ref={mapContainerRef} className="w-full h-[440px] z-0" />
      </div>

      {/* 3. Tapped Place Bottom Sheet / Card */}
      {selectedPlace && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#FF8A00]/40 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-[#FFF8E1] dark:bg-[#FFC107]/20 text-xl flex items-center justify-center shrink-0">
                {selectedPlace.icon}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFC107] text-[#111111]">
                  {selectedPlace.category}
                </span>
                <h4 className="font-bold text-sm text-[#111111] dark:text-white mt-0.5">
                  {selectedPlace.title}
                </h4>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlace(null)}
              className="p-1 text-[#666666] hover:text-[#111111] dark:hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="text-xs text-[#666666] dark:text-gray-300">
            {selectedPlace.subtitle}
          </p>

          {selectedPlace.hazardInfo && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 font-semibold">
              💡 <strong>Advisory:</strong> {selectedPlace.hazardInfo}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button
              onClick={() => {
                navigate(`/citizen/route?destination=${encodeURIComponent(selectedPlace.title)}`);
              }}
              className="flex-1 bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold h-10 text-xs gap-1.5 shadow-xs cursor-pointer"
            >
              <Navigation className="size-4" /> Plan Safe Route Here
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenLiveMapPage;
