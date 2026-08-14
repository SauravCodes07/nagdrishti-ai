export interface RouteOption {
  id: string;
  name: string;
  riskType: 'SAFE' | 'MODERATE_RISK' | 'HIGH_RISK_AVOID';
  badgeColor: string; // Tailwind class
  distanceKm: number;
  etaMinutes: number;
  waterloggingRiskScore: number; // 0 - 100
  trafficRiskScore: number; // 0 - 100
  potholeRiskScore: number; // 0 - 100
  safetyScore: number; // 0 - 100
  viaRoads: string[];
  warnings: string[];
  highlights: string[];
  coordinates: [number, number][]; // Line coordinates for rendering route on map
}

export interface RouteQuery {
  originId: string;
  originName: string;
  destinationId: string;
  destinationName: string;
  routes: RouteOption[];
}

export const PREDEFINED_LOCATIONS = [
  { id: 'airport', name: 'Nagpur Airport (MIHAN / Wardha Rd)' },
  { id: 'railway_station', name: 'Nagpur Railway Station (Central)' },
  { id: 'dharampeth', name: 'Dharampeth Market (Gokulpeth)' },
  { id: 'civil_lines', name: 'Civil Lines (High Court & Collectorate)' },
  { id: 'sitabuldi', name: 'Sitabuldi Interchange' },
  { id: 'medical_sq', name: 'Medical Square (Government Hospital)' },
  { id: 'mankapur', name: 'Mankapur Sports Complex (Ring Road)' },
  { id: 'pardi', name: 'Pardi Freight Hub' }
];

export const DEMO_ROUTE_QUERIES: Record<string, RouteQuery> = {
  'airport-civil_lines': {
    originId: 'airport',
    originName: 'Nagpur Airport',
    destinationId: 'civil_lines',
    destinationName: 'Civil Lines',
    routes: [
      {
        id: 'route-1-recommended',
        name: 'Recommended AI Safe Route',
        riskType: 'SAFE',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
        distanceKm: 12.4,
        etaMinutes: 24,
        waterloggingRiskScore: 12,
        trafficRiskScore: 25,
        potholeRiskScore: 18,
        safetyScore: 94,
        viaRoads: ['Wardha Road Elevated Flyover', 'Assembly Road', 'Zero Mile Elevated Corridor'],
        warnings: ['Slight rain slick on flyover joints — maintain 40kmh'],
        highlights: ['Bypasses waterlogged Dharampeth basin completely', 'Elevated flyover dry status verified by AI CCTV'],
        coordinates: [
          [21.0850, 79.0520],
          [21.1100, 79.0600],
          [21.1350, 79.0750],
          [21.1550, 79.0780],
          [21.1620, 79.0810]
        ]
      },
      {
        id: 'route-2-alternative',
        name: 'Alternative Ring Road Route',
        riskType: 'MODERATE_RISK',
        badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
        distanceKm: 15.1,
        etaMinutes: 32,
        waterloggingRiskScore: 48,
        trafficRiskScore: 54,
        potholeRiskScore: 42,
        safetyScore: 68,
        viaRoads: ['Outer Ring Road', 'Katamol Nala Bypass', 'Sadar Road'],
        warnings: ['1.2 ft standing water at Ring Road underpass', 'Moderate traffic congestion near Sadar'],
        highlights: ['Avoids city center traffic congestion'],
        coordinates: [
          [21.0850, 79.0520],
          [21.0900, 79.0200],
          [21.1400, 79.0300],
          [21.1700, 79.0600],
          [21.1620, 79.0810]
        ]
      },
      {
        id: 'route-3-avoid',
        name: 'Direct Underpass Route (Dharampeth - AVOID)',
        riskType: 'HIGH_RISK_AVOID',
        badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
        distanceKm: 10.8,
        etaMinutes: 58,
        waterloggingRiskScore: 92,
        trafficRiskScore: 89,
        potholeRiskScore: 85,
        safetyScore: 18,
        viaRoads: ['West High Court Road', 'Gokulpeth Underpass', 'Sitabuldi Ramps'],
        warnings: ['CRITICAL: 3.5 ft deep water submergence at Gokulpeth Underpass!', 'Multiple vehicles stranded', 'Severe traffic gridlock'],
        highlights: ['DO NOT TAKE — High risk of vehicle hydro-lock and stranding'],
        coordinates: [
          [21.0850, 79.0520],
          [21.1200, 79.0600],
          [21.1425, 79.0620],
          [21.1448, 79.0825],
          [21.1620, 79.0810]
        ]
      }
    ]
  }
};
