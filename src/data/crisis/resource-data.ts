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
    capacityMetric: '12,000 Litres / Minute per Pump'
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
    capacityMetric: '15 Mins Response / 45 Mins Cold-Mix Patch'
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
    capacityMetric: '2 Squads per Major Junction'
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
    capacityMetric: 'High-Visibility LED Illuminated'
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
    capacityMetric: '8-Person Inflatable Motorized Craft'
  }
];

export const RESOURCE_SUMMARY = {
  totalResources: 495,
  totalDeployed: 387,
  totalAvailable: 91,
  totalInMaintenance: 17,
  deploymentPercentage: 78.2
};
