/**
 * NagDrishti AI — PostGIS & Spatial Database Client Service
 * Provides geometric queries (ST_DWithin, ST_Intersects, ST_Buffer, Nearest Resource)
 * Compatible with Supabase PostgreSQL + PostGIS extension
 */

export interface SpatialPoint {
  latitude: number;
  longitude: number;
}

export interface SpatialFeature {
  id: string;
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
  geometry: any;
  properties: Record<string, any>;
}

// Calculate Haversine distance in km between two GPS coordinates
export const calculateDistanceKm = (
  p1: [number, number], // [lat, lng]
  p2: [number, number]
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1[0] * Math.PI) / 180) *
      Math.cos((p2[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Check if a point is inside a polygon (Ray-casting algorithm simulating ST_Contains / ST_Intersects)
export const isPointInPolygon = (
  point: [number, number],
  polygon: [number, number][]
): boolean => {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// Spatial query helper: Find nearest emergency resources within radius
export const findNearestResources = <T extends { coordinates: [number, number] }>(
  userLocation: [number, number],
  resources: T[],
  maxRadiusKm = 5.0
): { resource: T; distanceKm: number }[] => {
  return resources
    .map(r => ({
      resource: r,
      distanceKm: calculateDistanceKm(userLocation, r.coordinates)
    }))
    .filter(r => r.distanceKm <= maxRadiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

// Simulated PostGIS SQL schema export for documentation & backend integration
export const POSTGIS_DATABASE_CONFIG = {
  driver: 'supabase-postgis',
  srid: 4326, // WGS84
  tables: [
    'nagpur_zones',
    'citizen_reports',
    'construction_projects',
    'emergency_resources',
    'flood_inundation_zones',
    'road_segments'
  ]
};
