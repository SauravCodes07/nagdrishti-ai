export interface AIPredictionModelInput {
  name: string;
  value: string | number;
  weight: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface AIPredictionResult {
  modelId: string;
  modelName: string;
  targetZone: string;
  riskScore: number; // 0 - 100
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  probabilityPct: number;
  confidenceScorePct: number;
  leadTimeMinutes: number;
  inputs: AIPredictionModelInput[];
  explanation: string;
  recommendedAction: string;
  actionPriority: number;
}

export const WATERLOGGING_AI_PREDICTIONS: AIPredictionResult[] = [
  {
    modelId: 'WL-PRED-01',
    modelName: 'HydroRisk-XGBoost v2.4 (Waterlogging Classifier)',
    targetZone: 'Dharampeth (Ambazari Spillway Basin)',
    riskScore: 92,
    severity: 'SEVERE',
    probabilityPct: 94,
    confidenceScorePct: 96,
    leadTimeMinutes: 35,
    inputs: [
      { name: 'Rainfall Intensity', value: '78 mm / hr', weight: '35%', impact: 'NEGATIVE' },
      { name: 'Drainage Capacity Blockage', value: '58% Choked', weight: '25%', impact: 'NEGATIVE' },
      { name: 'Elevation Profile', value: '295m (Low Basin)', weight: '20%', impact: 'NEGATIVE' },
      { name: 'Historical Flood Index', value: '4 Major Floods (5 yrs)', weight: '12%', impact: 'NEGATIVE' },
      { name: 'Live Citizen Reports', value: '14 Active Verification', weight: '8%', impact: 'NEGATIVE' },
    ],
    explanation: 'Extreme run-off volume from Ambazari catchment exceeding local storm sewer discharge capacity by 180%. High risk of flash waterlogging within 30-40 minutes.',
    recommendedAction: 'Immediate Deployment of 500HP Dewatering Pump Unit #4 to Gokulpeth Underpass & Issue Citizen Route Advisory.',
    actionPriority: 1
  },
  {
    modelId: 'WL-PRED-02',
    modelName: 'HydroRisk-XGBoost v2.4 (Waterlogging Classifier)',
    targetZone: 'Sitabuldi Interchange',
    riskScore: 89,
    severity: 'SEVERE',
    probabilityPct: 91,
    confidenceScorePct: 94,
    leadTimeMinutes: 25,
    inputs: [
      { name: 'Rainfall Intensity', value: '74 mm / hr', weight: '35%', impact: 'NEGATIVE' },
      { name: 'Drainage Capacity Blockage', value: '50% Choked', weight: '25%', impact: 'NEGATIVE' },
      { name: 'Elevation Profile', value: '302m', weight: '20%', impact: 'NEUTRAL' },
      { name: 'Traffic Back-up Pressure', value: '94% Gridlock', weight: '12%', impact: 'NEGATIVE' },
      { name: 'Live Citizen Reports', value: '18 Active Verification', weight: '8%', impact: 'NEGATIVE' },
    ],
    explanation: 'Urban concrete runoff converging on the underpass intersection. Traffic gridlock preventing natural vehicle displacement of water.',
    recommendedAction: 'Barricade Low-Lying Ramp + Station Traffic Squad 3 to divert vehicles towards West High Court Road.',
    actionPriority: 2
  },
  {
    modelId: 'WL-PRED-03',
    modelName: 'HydroRisk-XGBoost v2.4 (Waterlogging Classifier)',
    targetZone: 'Pardi Industrial Freight Corridor',
    riskScore: 74,
    severity: 'HIGH',
    probabilityPct: 78,
    confidenceScorePct: 89,
    leadTimeMinutes: 45,
    inputs: [
      { name: 'Rainfall Intensity', value: '65 mm / hr', weight: '35%', impact: 'NEGATIVE' },
      { name: 'Drainage Capacity Blockage', value: '65% Heavy Silt', weight: '25%', impact: 'NEGATIVE' },
      { name: 'Elevation Profile', value: '288m (Nag River Catchment)', weight: '20%', impact: 'NEGATIVE' },
      { name: 'Heavy Truck Wheel Load', value: 'High Axle Stress', weight: '12%', impact: 'NEGATIVE' },
      { name: 'Live Citizen Reports', value: '11 Active Verification', weight: '8%', impact: 'NEGATIVE' },
    ],
    explanation: 'Nag River tributary feeder swelling due to upstream storm discharge. Expected water accumulation of 2.2 ft on Freight Road.',
    recommendedAction: 'Pre-position Mobile Portable Dewatering Unit at Underpass Base & Alert Freight Terminals.',
    actionPriority: 3
  }
];

export const ROAD_DAMAGE_AI_PREDICTIONS: AIPredictionResult[] = [
  {
    modelId: 'RD-PRED-01',
    modelName: 'PotholeNet-CNN v3.1 (Asphalt Degradation Predictor)',
    targetZone: 'Wardha Road Corridor (Airport Stretch)',
    riskScore: 84,
    severity: 'HIGH',
    probabilityPct: 88,
    confidenceScorePct: 92,
    leadTimeMinutes: 60,
    inputs: [
      { name: 'Road Age & Surface Type', value: '7.5 Yrs Bituminous', weight: '30%', impact: 'NEGATIVE' },
      { name: 'Water Submergence Hours', value: '4.2 Hrs Continuous', weight: '30%', impact: 'NEGATIVE' },
      { name: 'Heavy Vehicle Traffic Load', value: '42,000 PCU / Day', weight: '20%', impact: 'NEGATIVE' },
      { name: 'Historical Pothole Recurrence', value: 'High Friction Loss', weight: '10%', impact: 'NEGATIVE' },
      { name: 'Citizen Skid Reports', value: '8 Geo-Tagged Hits', weight: '10%', impact: 'NEGATIVE' },
    ],
    explanation: 'Continuous water infiltration weakening sub-base asphalt bonding under high-speed traffic, leading to rapid cavitation forming deep potholes.',
    recommendedAction: 'Deploy PWD Emergency Cold-Mix Patching Unit & Place Illuminated Caution Cones.',
    actionPriority: 1
  },
  {
    modelId: 'RD-PRED-02',
    modelName: 'PotholeNet-CNN v3.1 (Asphalt Degradation Predictor)',
    targetZone: 'Hingna Road MIDC Arterial',
    riskScore: 79,
    severity: 'HIGH',
    probabilityPct: 82,
    confidenceScorePct: 90,
    leadTimeMinutes: 90,
    inputs: [
      { name: 'Road Age & Surface Type', value: '9 Yrs Mixed Asphalt', weight: '30%', impact: 'NEGATIVE' },
      { name: 'Water Submergence Hours', value: '5.5 Hrs Continuous', weight: '30%', impact: 'NEGATIVE' },
      { name: 'Heavy Lorry Weight', value: 'Overloaded Axles', weight: '20%', impact: 'NEGATIVE' },
      { name: 'Historical Pothole Recurrence', value: 'Severe Wear', weight: '10%', impact: 'NEGATIVE' },
      { name: 'Citizen Skid Reports', value: '5 Geo-Tagged Hits', weight: '10%', impact: 'NEGATIVE' },
    ],
    explanation: 'Heavy industrial trucks traversing waterlogged asphalt inducing high shear stress and edge unraveling.',
    recommendedAction: 'Restrict Heavy Freight Vehicles to Central Elevated Lane & Patch Cracks with Rapid Sealant.',
    actionPriority: 2
  }
];

// Python API Abstraction Types
export type PythonAIResponsePayload = {
  status: 'SUCCESS' | 'ERROR';
  model_version: string;
  execution_time_ms: number;
  predictions: {
    zone_id: string;
    risk_score: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
    waterlogging_probability: number;
    rainfall_mm: number;
    recommended_action: string;
  }[];
};
