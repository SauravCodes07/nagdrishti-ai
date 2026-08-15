export type ResourceType = 'PUMP' | 'REPAIR_TEAM' | 'TRAFFIC_POLICE' | 'BARRICADE' | 'EMERGENCY_VEHICLE';

export interface CrisisResource {
  id: string;
  name: string;
  type: ResourceType;
  totalQuantity: number;
  deployedQuantity: number;
  availableQuantity: number;
  maintenanceQuantity: number;
  status: 'OPTIMAL' | 'HIGH_DEMAND' | 'CRITICAL_DEFICIT';
  assignedLocation?: string;
  capacityMetric: string;
  coordinates: [number, number]; // Verified base staging coordinates
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    id: 'RES-01',
    name: 'High-Capacity Dewatering Pumps (500 HP)',
    type: 'PUMP',
    totalQuantity: 45,
    deployedQuantity: 32,
    availableQuantity: 10,
    maintenanceQuantity: 3,
    status: 'HIGH_DEMAND',
    assignedLocation: 'Dharampeth, Sitabuldi & Pardi Underpasses',
    capacityMetric: '12,000 Litres / Minute per Pump',
    coordinates: [21.1448, 79.0845] // Sitabuldi Central
  },
  {
    id: 'RES-02',
    name: 'Rapid Road Patching & Pothole Squads',
    type: 'REPAIR_TEAM',
    totalQuantity: 24,
    deployedQuantity: 18,
    availableQuantity: 5,
    maintenanceQuantity: 1,
    status: 'OPTIMAL',
    assignedLocation: 'Wardha Road, Ring Road & Kamptee Corridor',
    capacityMetric: '15 Mins Response / 45 Mins Cold-Mix Patch',
    coordinates: [21.1425, 79.0620] // Dharampeth WHC
  },
  {
    id: 'RES-03',
    name: 'Traffic Police Diversion Units',
    type: 'TRAFFIC_POLICE',
    totalQuantity: 60,
    deployedQuantity: 48,
    availableQuantity: 10,
    maintenanceQuantity: 2,
    status: 'HIGH_DEMAND',
    assignedLocation: 'Sitabuldi Square, Medical Square, Variety Chowk',
    capacityMetric: '2 Squads per Major Junction',
    coordinates: [21.1340, 79.0980] // Medical Square
  },
  {
    id: 'RES-04',
    name: 'Flood Safety Barricades & Hazard Cones',
    type: 'BARRICADE',
    totalQuantity: 350,
    deployedQuantity: 280,
    availableQuantity: 60,
    maintenanceQuantity: 10,
    status: 'OPTIMAL',
    assignedLocation: 'All Waterlogged Underpasses & River Banks',
    capacityMetric: 'High-Visibility LED Illuminated',
    coordinates: [21.1550, 79.1450] // Pardi Corridor
  },
  {
    id: 'RES-05',
    name: 'NDRF / Disaster Response Boats & Amphibious Trucks',
    type: 'EMERGENCY_VEHICLE',
    totalQuantity: 16,
    deployedQuantity: 9,
    availableQuantity: 6,
    maintenanceQuantity: 1,
    status: 'OPTIMAL',
    assignedLocation: 'Nag River Corridor & Ambazari Spillway Staging',
    capacityMetric: '8-Person Inflatable Motorized Craft',
    coordinates: [21.1295, 79.0440] // Ambazari Dam
  }
];

export const RESOURCE_SUMMARY = {
  totalResources: 495,
  totalDeployed: 387,
  totalAvailable: 91,
  totalInMaintenance: 17,
  deploymentPercentage: 78.2
};
