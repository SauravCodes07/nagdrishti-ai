export type IncidentType = 'WATERLOGGING' | 'ROAD_DAMAGE' | 'TRAFFIC' | 'DRAINAGE_OVERFLOW' | 'FALLEN_TREE';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
export type IncidentStatus = 'PREDICTED' | 'REPORTED' | 'VERIFIED' | 'DISPATCHED' | 'RESOLVED';

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  locationName: string;
  zoneId: string;
  coordinates: [number, number];
  severity: IncidentSeverity;
  status: IncidentStatus;
  riskScore: number; // 0 - 100
  rainfallMm: number;
  reportedTime: string;
  description: string;
  recommendedAction: string;
  assignedTeam?: string;
  upvotes?: number;
}

export const INCIDENTS_DATA: Incident[] = [
  {
    id: 'INC-901',
    type: 'WATERLOGGING',
    title: 'Severe Waterlogging at Underpass',
    locationName: 'Dharampeth, Near Gokulpeth Market',
    zoneId: 'dharampeth',
    coordinates: [21.1425, 79.0620],
    severity: 'SEVERE',
    status: 'VERIFIED',
    riskScore: 92,
    rainfallMm: 78,
    reportedTime: '10 mins ago',
    description: '3.5 ft water accumulation near underpass. Vehicles stranded. High risk of engine hydro-lock.',
    recommendedAction: 'Deploy High-Capacity Dewatering Pump (Pump #4) + Divert Traffic',
    assignedTeam: 'NMC Emergency Dewatering Team Alpha',
    upvotes: 42
  },
  {
    id: 'INC-902',
    type: 'TRAFFIC',
    title: 'Flyover Gridlock & Water Overflow',
    locationName: 'Sitabuldi Interchange Flyover Base',
    zoneId: 'sitabuldi',
    coordinates: [21.1448, 79.0825],
    severity: 'SEVERE',
    status: 'VERIFIED',
    riskScore: 89,
    rainfallMm: 74,
    reportedTime: '15 mins ago',
    description: 'Heavy traffic standstill due to 2 ft water standing at flyover ramp. Vehicles taking unsafe U-turns.',
    recommendedAction: 'Barricade Flyover Ramp + Deploy Traffic Police Unit 3',
    assignedTeam: 'Nagpur Traffic Police West Wing',
    upvotes: 38
  },
  {
    id: 'INC-903',
    type: 'ROAD_DAMAGE',
    title: 'Massive Pothole Cluster & Asphalt Failure',
    locationName: 'Wardha Road, Near Airport T-Junction',
    zoneId: 'wardha_road',
    coordinates: [21.0850, 79.0520],
    severity: 'HIGH',
    status: 'REPORTED',
    riskScore: 78,
    rainfallMm: 40,
    reportedTime: '25 mins ago',
    description: 'Deep potholes exposed by rain. 2 two-wheelers skidded. Traffic slowing dramatically.',
    recommendedAction: 'Deploy Mobile Asphalt Patching Unit + Hazard Cone Placement',
    assignedTeam: 'PWD Rapid Road Repair Team',
    upvotes: 29
  },
  {
    id: 'INC-904',
    type: 'DRAINAGE_OVERFLOW',
    title: 'Nag River Tributary Overflow',
    locationName: 'Mankapur Ring Road Canal Junction',
    zoneId: 'mankapur',
    coordinates: [21.1890, 79.0730],
    severity: 'HIGH',
    status: 'VERIFIED',
    riskScore: 81,
    rainfallMm: 68,
    reportedTime: '30 mins ago',
    description: 'Culvert clogged with plastic waste causing river surge onto service road.',
    recommendedAction: 'Deploy Hydraulic Excavator Unclogger + Flood Warning Siren',
    assignedTeam: 'NMC Stormwater Drain Squad',
    upvotes: 21
  },
  {
    id: 'INC-905',
    type: 'FALLEN_TREE',
    title: 'Large Banyan Branch Blocking Road',
    locationName: 'Sadar, Near High Court Flyover Ramp',
    zoneId: 'sadar',
    coordinates: [21.1620, 79.0810],
    severity: 'MEDIUM',
    status: 'DISPATCHED',
    riskScore: 54,
    rainfallMm: 48,
    reportedTime: '40 mins ago',
    description: 'Heavy branch snapped during thunderstorm, blocking left lane towards Civil Lines.',
    recommendedAction: 'Deploy Tree Chainsaw Unit + Clear Lane',
    assignedTeam: 'NMC Garden & Forestry Quick Response',
    upvotes: 15
  },
  {
    id: 'INC-906',
    type: 'WATERLOGGING',
    title: 'Low Elevation Street Submersion',
    locationName: 'Pardi, Near Freight Terminal Underpass',
    zoneId: 'pardi',
    coordinates: [21.1550, 79.1450],
    severity: 'HIGH',
    status: 'PREDICTED',
    riskScore: 74,
    rainfallMm: 65,
    reportedTime: 'AI Predicted (15m lead)',
    description: 'Model predicts 2.8 ft submergence within next 30 minutes based on upstream runoff.',
    recommendedAction: 'Pre-position Portable Dewatering Unit before flooding peak',
    assignedTeam: 'Zone 8 Emergency Contingent',
    upvotes: 8
  },
  {
    id: 'INC-907',
    type: 'TRAFFIC',
    title: 'Industrial Heavy Vehicle Congestion',
    locationName: 'Hingna Road, MIDC T-Point',
    zoneId: 'dharampeth',
    coordinates: [21.1100, 79.0200],
    severity: 'MEDIUM',
    status: 'VERIFIED',
    riskScore: 62,
    rainfallMm: 55,
    reportedTime: '50 mins ago',
    description: 'Truck breakdown in middle lane combined with 1.5 ft water puddle causing 3km queue.',
    recommendedAction: 'Deploy Heavy Tow Truck to clear stalled lorry',
    assignedTeam: 'MIDC Traffic Control Room',
    upvotes: 19
  }
];
