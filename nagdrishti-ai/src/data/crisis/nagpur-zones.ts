export interface NagpurZone {
  id: string;
  name: string;
  marathiName: string;
  center: [number, number]; // [lat, lng]
  bounds: [number, number][]; // Polygon coordinates
  elevation: number; // in meters
  drainageCapacity: number; // %
  population: number;
  baselineRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  currentRiskScore: number; // 0 - 100
  rainfallMm: number;
  waterloggingProb: number; // 0 - 1
  roadDamageIndex: number; // 0 - 10
  trafficCongestion: number; // 0 - 100%
  activeIncidents: number;
  heritageSpot?: string;
  recommendedActions: string[];
}

export const NAGPUR_ZONES: NagpurZone[] = [
  {
    id: 'dharampeth',
    name: 'Dharampeth',
    marathiName: 'धरमपेठ',
    center: [21.1425, 79.0620],
    bounds: [
      [21.1480, 79.0550],
      [21.1490, 79.0690],
      [21.1370, 79.0710],
      [21.1350, 79.0570]
    ],
    elevation: 295,
    drainageCapacity: 42,
    population: 85000,
    baselineRisk: 'SEVERE',
    currentRiskScore: 92,
    rainfallMm: 78,
    waterloggingProb: 0.92,
    roadDamageIndex: 8.4,
    trafficCongestion: 82,
    activeIncidents: 14,
    heritageSpot: 'Ambazari Lake Spillway & Gokulpeth Market',
    recommendedActions: ['Deploy High-Capacity Dewatering Pumps', 'Divert Traffic via West High Court Road', 'Alert Local Residents']
  },
  {
    id: 'sitabuldi',
    name: 'Sitabuldi',
    marathiName: 'सीताबर्डी',
    center: [21.1448, 79.0825],
    bounds: [
      [21.1510, 79.0760],
      [21.1520, 79.0910],
      [21.1390, 79.0900],
      [21.1380, 79.0770]
    ],
    elevation: 302,
    drainageCapacity: 50,
    population: 110000,
    baselineRisk: 'SEVERE',
    currentRiskScore: 89,
    rainfallMm: 74,
    waterloggingProb: 0.88,
    roadDamageIndex: 7.9,
    trafficCongestion: 94,
    activeIncidents: 18,
    heritageSpot: 'Sitabuldi Fort & Metro Interchange',
    recommendedActions: ['Deploy Traffic Police at Flyover Base', 'Barricade Low-Lying Underpass', 'Clear Main Storm Drain']
  },
  {
    id: 'mankapur',
    name: 'Mankapur',
    marathiName: 'मानकापूर',
    center: [21.1890, 79.0730],
    bounds: [
      [21.1960, 79.0640],
      [21.1970, 79.0820],
      [21.1810, 79.0810],
      [21.1800, 79.0650]
    ],
    elevation: 290,
    drainageCapacity: 38,
    population: 72000,
    baselineRisk: 'HIGH',
    currentRiskScore: 78,
    rainfallMm: 68,
    waterloggingProb: 0.76,
    roadDamageIndex: 6.8,
    trafficCongestion: 70,
    activeIncidents: 9,
    heritageSpot: 'Mankapur Sports Complex',
    recommendedActions: ['Inspect Ring Road Culverts', 'Deploy Mobile Pothole Repair Unit']
  },
  {
    id: 'pardi',
    name: 'Pardi',
    marathiName: 'पारडी',
    center: [21.1550, 79.1450],
    bounds: [
      [21.1620, 79.1360],
      [21.1630, 79.1550],
      [21.1470, 79.1540],
      [21.1460, 79.1370]
    ],
    elevation: 288,
    drainageCapacity: 35,
    population: 94000,
    baselineRisk: 'HIGH',
    currentRiskScore: 74,
    rainfallMm: 65,
    waterloggingProb: 0.72,
    roadDamageIndex: 8.9,
    trafficCongestion: 88,
    activeIncidents: 11,
    heritageSpot: 'Pardi Flyover & Industrial Freight Hub',
    recommendedActions: ['Station Heavy Towing Crane', 'Clear Silt from Nag River Feeder Branch']
  },
  {
    id: 'hanuman_nagar',
    name: 'Hanuman Nagar',
    marathiName: 'हनुमान नगर',
    center: [21.1210, 79.0980],
    bounds: [
      [21.1280, 79.0900],
      [21.1290, 79.1060],
      [21.1140, 79.1050],
      [21.1130, 79.0910]
    ],
    elevation: 308,
    drainageCapacity: 64,
    population: 68000,
    baselineRisk: 'MEDIUM',
    currentRiskScore: 56,
    rainfallMm: 52,
    waterloggingProb: 0.52,
    roadDamageIndex: 4.5,
    trafficCongestion: 52,
    activeIncidents: 5,
    heritageSpot: 'Medical Square & Government Medical College',
    recommendedActions: ['Ensure Hospital Corridor Clear', 'Monitor Nala Level']
  },
  {
    id: 'sadar',
    name: 'Sadar',
    marathiName: 'सदर',
    center: [21.1620, 79.0810],
    bounds: [
      [21.1690, 79.0730],
      [21.1700, 79.0890],
      [21.1550, 79.0880],
      [21.1540, 79.0740]
    ],
    elevation: 312,
    drainageCapacity: 72,
    population: 62000,
    baselineRisk: 'MEDIUM',
    currentRiskScore: 48,
    rainfallMm: 48,
    waterloggingProb: 0.44,
    roadDamageIndex: 4.1,
    trafficCongestion: 65,
    activeIncidents: 4,
    heritageSpot: 'Zero Mile Stone & Reserve Bank of India Building',
    recommendedActions: ['Keep Civil Lines Emergency Lane Standby']
  },
  {
    id: 'mahal',
    name: 'Mahal',
    marathiName: 'महाल',
    center: [21.1420, 79.1080],
    bounds: [
      [21.1490, 79.1000],
      [21.1500, 79.1160],
      [21.1350, 79.1150],
      [21.1340, 79.1010]
    ],
    elevation: 298,
    drainageCapacity: 45,
    population: 125000,
    baselineRisk: 'HIGH',
    currentRiskScore: 71,
    rainfallMm: 62,
    waterloggingProb: 0.69,
    roadDamageIndex: 6.2,
    trafficCongestion: 78,
    activeIncidents: 8,
    heritageSpot: 'Old City & Kotwali Chowk',
    recommendedActions: ['Manual Drain Unclogging Squad Deployment']
  },
  {
    id: 'wardha_road',
    name: 'Wardha Road / Mihan',
    marathiName: 'वर्धा रोड / मिहान',
    center: [21.0800, 79.0500],
    bounds: [
      [21.0950, 79.0380],
      [21.0960, 79.0620],
      [21.0650, 79.0600],
      [21.0640, 79.0360]
    ],
    elevation: 318,
    drainageCapacity: 78,
    population: 45000,
    baselineRisk: 'LOW',
    currentRiskScore: 38,
    rainfallMm: 40,
    waterloggingProb: 0.32,
    roadDamageIndex: 7.2, // Pothole watch on old highway sections
    trafficCongestion: 45,
    activeIncidents: 3,
    heritageSpot: 'Dr. Babasaheb Ambedkar International Airport',
    recommendedActions: ['Speed Control Signage for Aquaplaning Safety']
  }
];
