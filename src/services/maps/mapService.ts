/**
 * NagDrishti AI — Map Provider & GIS Vector Layer Abstraction
 * Supports Mapbox GL JS WebGL vector rendering with seamless fallback to Leaflet / Carto / Esri Satellite
 */

export type BaseMapStyle = 'VECTOR_DAY' | 'VECTOR_DARK' | 'SATELLITE' | 'SATELLITE_HYBRID' | 'TERRAIN';

export interface MapLayerConfig {
  id: string;
  name: string;
  category: 'BASE' | 'OVERLAY' | 'HAZARD' | 'CIVIC' | 'GEOAI';
  visible: boolean;
  opacity: number;
  attribution: string;
}

export interface MapConfig {
  center: [number, number]; // [lat, lng]
  zoom: number;
  minZoom: number;
  maxZoom: number;
  pitch?: number;
  bearing?: number;
  style: BaseMapStyle;
}

export const NAGPUR_MAP_CONFIG: MapConfig = {
  center: [21.1458, 79.0882], // Zero Mile Stone, Nagpur
  zoom: 13,
  minZoom: 10,
  maxZoom: 19,
  pitch: 0,
  bearing: 0,
  style: 'VECTOR_DAY'
};

// Map Tile Layer URL Providers
export const MAP_PROVIDERS = {
  mapbox: {
    token: import.meta.env.VITE_MAPBOX_TOKEN || '',
    vectorDay: 'mapbox://styles/mapbox/navigation-day-v1',
    vectorDark: 'mapbox://styles/mapbox/navigation-night-v1',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    satelliteHybrid: 'mapbox://styles/mapbox/satellite-streets-v12',
    attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  carto: {
    voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    darkMatter: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    positron: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  esri: {
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  osm: {
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};

export const hasMapboxToken = (): boolean => {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  return typeof token === 'string' && token.trim().length > 10;
};

export const getTileUrlForStyle = (style: BaseMapStyle, isDark = false): { url: string; attribution: string; subdomains?: string[] } => {
  switch (style) {
    case 'SATELLITE':
    case 'SATELLITE_HYBRID':
      return {
        url: MAP_PROVIDERS.esri.satellite,
        attribution: MAP_PROVIDERS.esri.attribution
      };
    case 'TERRAIN':
      return {
        url: MAP_PROVIDERS.esri.terrain,
        attribution: MAP_PROVIDERS.esri.attribution
      };
    case 'VECTOR_DARK':
      return {
        url: MAP_PROVIDERS.carto.darkMatter,
        attribution: MAP_PROVIDERS.carto.attribution,
        subdomains: ['a', 'b', 'c', 'd']
      };
    case 'VECTOR_DAY':
    default:
      if (isDark) {
        return {
          url: MAP_PROVIDERS.carto.darkMatter,
          attribution: MAP_PROVIDERS.carto.attribution,
          subdomains: ['a', 'b', 'c', 'd']
        };
      }
      return {
        url: MAP_PROVIDERS.carto.voyager,
        attribution: MAP_PROVIDERS.carto.attribution,
        subdomains: ['a', 'b', 'c', 'd']
      };
  }
};
