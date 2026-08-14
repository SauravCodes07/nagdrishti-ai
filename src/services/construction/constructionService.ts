/**
 * NagDrishti AI — Year-Round Construction Intelligence Service
 * Monitors civil works, road construction, Metro Phase 2 expansions, and PWD upgrades across Nagpur
 * Data Sources: OpenStreetMap construction tags + NMC Smart City Project Feeds + Satellite Change Detection
 */

export type ConstructionStatus = 'ACTIVE' | 'PLANNED' | 'COMPLETED' | 'HALTED';
export type ConstructionType = 'METRO_EXPANSION' | 'FLYOVER_REPAIR' | 'ROAD_WIDENING' | 'DRAINAGE_UPGRADE' | 'ASPHALT_RESURFACING' | 'CULVERT_REBUILD';

export interface ConstructionProject {
  id: string;
  projectName: string;
  type: ConstructionType;
  status: ConstructionStatus;
  zoneId: string;
  zoneName: string;
  locationName: string;
  coordinates: [number, number]; // Centroid [lat, lng]
  bounds?: [number, number][]; // Area Polygon
  roadSegmentsAffected: string[];
  trafficImpact: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  speedLimitKmh: number;
  laneClosures: string;
  startDate: string;
  expectedEndDate: string;
  executingAgency: string;
  source: 'NMC_MUNICIPAL_FEED' | 'OSM_CONTRIBUTORS' | 'SATELLITE_CHANGE_DETECTION' | 'CITIZEN_VERIFIED';
  confidenceScorePct: number;
  lastUpdated: string;
  detourAdvice: string;
}

export const NAGPUR_CONSTRUCTION_PROJECTS: ConstructionProject[] = [
  {
    id: 'CONST-NGP-01',
    projectName: 'Nagpur Metro Phase 2 — Automotive Square to Kanhan Extension',
    type: 'METRO_EXPANSION',
    status: 'ACTIVE',
    zoneId: 'mankapur',
    zoneName: 'Mankapur / North Nagpur',
    locationName: 'Kamptee Road, Near Automotive Square',
    coordinates: [21.1920, 79.0950],
    bounds: [
      [21.1880, 79.0910],
      [21.1960, 79.0930],
      [21.1970, 79.0990],
      [21.1890, 79.0970]
    ],
    roadSegmentsAffected: ['Kamptee Road (NH-44)', 'Automotive Square Junction'],
    trafficImpact: 'HIGH',
    speedLimitKmh: 30,
    laneClosures: '2 of 6 Lanes Barricaded for Pier Erection',
    startDate: '2025-11-10',
    expectedEndDate: '2027-04-30',
    executingAgency: 'Maha Metro Rail Corporation Ltd',
    source: 'NMC_MUNICIPAL_FEED',
    confidenceScorePct: 98,
    lastUpdated: '2026-08-14 09:30 IST',
    detourAdvice: 'Heavy vehicles advised to take Outer Ring Road Bypass via Pardi Interchange.'
  },
  {
    id: 'CONST-NGP-02',
    projectName: 'Pardi Double-Decker Flyover Expansion & Freight Ramp Upgrades',
    type: 'FLYOVER_REPAIR',
    status: 'ACTIVE',
    zoneId: 'pardi',
    zoneName: 'Pardi Freight Hub',
    locationName: 'Bhandara Road Corridor (Old NH-6)',
    coordinates: [21.1550, 79.1450],
    bounds: [
      [21.1510, 79.1390],
      [21.1590, 79.1420],
      [21.1610, 79.1510],
      [21.1530, 79.1490]
    ],
    roadSegmentsAffected: ['HB Town Square', 'Pardi Octroi Post Junction', 'Shanti Nagar Link'],
    trafficImpact: 'SEVERE',
    speedLimitKmh: 20,
    laneClosures: 'Single Lane One-Way Traffic at HB Town Incline',
    startDate: '2026-01-15',
    expectedEndDate: '2026-11-20',
    executingAgency: 'National Highways Authority of India (NHAI)',
    source: 'NMC_MUNICIPAL_FEED',
    confidenceScorePct: 95,
    lastUpdated: '2026-08-13 18:00 IST',
    detourAdvice: 'Use Kalamna Market Road for East-West cross-city travel.'
  },
  {
    id: 'CONST-NGP-03',
    projectName: 'Wardha Road Smart Mobility Corridor & Underpass Drainage Rebuilding',
    type: 'DRAINAGE_UPGRADE',
    status: 'ACTIVE',
    zoneId: 'wardha_road',
    zoneName: 'Wardha Road / MIHAN',
    locationName: 'Chhatrapati Square Underpass & Ajni Bridge Connector',
    coordinates: [21.1080, 79.0580],
    bounds: [
      [21.1040, 79.0540],
      [21.1120, 79.0560],
      [21.1140, 79.0620],
      [21.1060, 79.0610]
    ],
    roadSegmentsAffected: ['Wardha Road (Southbound)', 'Chhatrapati Nagar Ring Road Merge'],
    trafficImpact: 'MODERATE',
    speedLimitKmh: 35,
    laneClosures: 'Service Road Diverted; Main Elevated Flyover Fully Open',
    startDate: '2026-03-01',
    expectedEndDate: '2026-09-30',
    executingAgency: 'Nagpur Municipal Corporation (PWD Wing)',
    source: 'SATELLITE_CHANGE_DETECTION',
    confidenceScorePct: 91,
    lastUpdated: '2026-08-14 08:15 IST',
    detourAdvice: 'Maintain travel via the elevated flyover; avoid lower service lane.'
  },
  {
    id: 'CONST-NGP-04',
    projectName: 'Ambazari Lake Spillway Channel Deepening & Retaining Wall Reinforcement',
    type: 'CULVERT_REBUILD',
    status: 'ACTIVE',
    zoneId: 'dharampeth',
    zoneName: 'Dharampeth',
    locationName: 'Ambazari Lake Spillway to Nag River Head',
    coordinates: [21.1350, 79.0520],
    bounds: [
      [21.1320, 79.0480],
      [21.1380, 79.0500],
      [21.1390, 79.0570],
      [21.1330, 79.0550]
    ],
    roadSegmentsAffected: ['Craze Castle Road', 'Subhash Nagar T-Point'],
    trafficImpact: 'MODERATE',
    speedLimitKmh: 25,
    laneClosures: 'Heavy machinery movement between 10 PM and 5 AM',
    startDate: '2026-02-10',
    expectedEndDate: '2026-10-15',
    executingAgency: 'Maharashtra Water Resources Department',
    source: 'NMC_MUNICIPAL_FEED',
    confidenceScorePct: 94,
    lastUpdated: '2026-08-12 14:00 IST',
    detourAdvice: 'Follow temporary directional signage on Hingna T-Point.'
  },
  {
    id: 'CONST-NGP-05',
    projectName: 'Outer Ring Road White-Topping & Concrete Pavement Resurfacing',
    type: 'ASPHALT_RESURFACING',
    status: 'PLANNED',
    zoneId: 'hanuman_nagar',
    zoneName: 'Hanuman Nagar / South Ring',
    locationName: 'Manewada Ring Road to Besa Square',
    coordinates: [21.1050, 79.0950],
    roadSegmentsAffected: ['Manewada Square', 'Besa T-Point'],
    trafficImpact: 'LOW',
    speedLimitKmh: 40,
    laneClosures: 'Night work scheduled starting next month',
    startDate: '2026-09-15',
    expectedEndDate: '2026-12-31',
    executingAgency: 'Nagpur Improvement Trust (NIT)',
    source: 'NMC_MUNICIPAL_FEED',
    confidenceScorePct: 88,
    lastUpdated: '2026-08-10 11:00 IST',
    detourAdvice: 'Work will be restricted to night hours to prevent peak congestion.'
  }
];

export const getActiveConstructionProjects = (): ConstructionProject[] => {
  return NAGPUR_CONSTRUCTION_PROJECTS.filter(p => p.status === 'ACTIVE');
};

export const getConstructionInZone = (zoneId: string): ConstructionProject[] => {
  return NAGPUR_CONSTRUCTION_PROJECTS.filter(p => p.zoneId === zoneId);
};
