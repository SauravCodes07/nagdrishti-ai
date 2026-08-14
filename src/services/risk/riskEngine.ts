/**
 * NagDrishti AI — Modular Multi-Factor Urban Risk Engine
 * Calculates normalized risk scores (0 - 100) across all Nagpur municipal zones
 * Inputs: Open-Meteo Rainfall + DEM Elevation + Drainage Choking + Sentinel SAR Flood Signal + Construction + Traffic + Citizen Reports
 * Output: Standardized Risk Object with Explainable Factor Weights & Civic Actions
 */

import { NAGPUR_ZONES, NagpurZone } from '../../data/crisis/nagpur-zones';
import { getLatestSatelliteObservation } from '../satellite/satelliteService';
import { getActiveConstructionProjects } from '../construction/constructionService';
import { NAGPUR_TRAFFIC_CORRIDORS } from '../traffic/trafficService';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';

export interface FactorContribution {
  factor: string;
  weightPct: number;
  scoreContribution: number;
  description: string;
  status: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
}

export interface ZoneRiskAssessment {
  zoneId: string;
  zoneName: string;
  marathiName: string;
  center: [number, number];
  bounds: [number, number][];
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  waterloggingProbabilityPct: number;
  roadDamageIndex: number; // 0 - 10
  trafficCongestionPct: number;
  contributingFactors: FactorContribution[];
  recommendedAction: string;
  priorityRank: number;
  engineType: 'MULTI_FACTOR_RULE_ENGINE' | 'GEOAI_PRITHVI_HYBRID';
  timestamp: string;
}

export interface CalculateRiskOptions {
  rainfallMm?: number;
  useLiveWeather?: boolean;
}

export const calculateZoneRisk = (
  zone: NagpurZone,
  rainfallMmOverride?: number
): ZoneRiskAssessment => {
  const rainfall = rainfallMmOverride !== undefined ? rainfallMmOverride : zone.rainfallMm;

  // 1. Rainfall Impact (Weight: 30%)
  const rainfallScore = Math.min(100, (rainfall / 80) * 100);
  const rainfallWeight = 0.30;

  // 2. Elevation Vulnerability (Weight: 20%) — Low elevation basins (285m - 295m) pool water heavily
  const elevationFactor = Math.max(0, Math.min(100, ((325 - zone.elevation) / 40) * 100));
  const elevationWeight = 0.20;

  // 3. Drainage Capacity Deficit (Weight: 20%) — Lower capacity = higher choking risk
  const drainageDeficitScore = Math.max(0, 100 - zone.drainageCapacity);
  const drainageWeight = 0.20;

  // 4. Satellite SAR Flood Signal (Weight: 15%)
  const satelliteObs = getLatestSatelliteObservation();
  const satFeature = satelliteObs.detectedFeatures.find(f => f.zoneId === zone.id);
  const satelliteScore = satFeature ? (satFeature.severity === 'CRITICAL' ? 95 : satFeature.severity === 'HIGH' ? 80 : 50) : 10;
  const satelliteWeight = 0.15;

  // 5. Active Construction & Traffic Stress (Weight: 15%)
  const activeConstructions = getActiveConstructionProjects().filter(p => p.zoneId === zone.id);
  const traffic = NAGPUR_TRAFFIC_CORRIDORS.find(t => t.zoneId === zone.id);
  const trafficCongestion = traffic ? traffic.congestionScorePct : zone.trafficCongestion;
  const constructionScore = activeConstructions.length > 0 ? (activeConstructions.some(c => c.trafficImpact === 'SEVERE') ? 90 : 65) : 20;
  const infrastructureScore = (constructionScore * 0.5) + (trafficCongestion * 0.5);
  const infrastructureWeight = 0.15;

  // Compute Total Weighted Risk Score
  const rawScore = (
    (rainfallScore * rainfallWeight) +
    (elevationFactor * elevationWeight) +
    (drainageDeficitScore * drainageWeight) +
    (satelliteScore * satelliteWeight) +
    (infrastructureScore * infrastructureWeight)
  );

  const riskScore = Math.min(99, Math.max(5, Math.round(rawScore)));

  let riskLevel: RiskLevel = 'LOW';
  if (riskScore >= 80) riskLevel = 'SEVERE';
  else if (riskScore >= 65) riskLevel = 'HIGH';
  else if (riskScore >= 40) riskLevel = 'MEDIUM';

  const contributingFactors: FactorContribution[] = [
    {
      factor: 'Precipitation Intensity',
      weightPct: 30,
      scoreContribution: Math.round(rainfallScore * rainfallWeight),
      description: `${rainfall} mm current precipitation level`,
      status: rainfall >= 60 ? 'CRITICAL' : rainfall >= 30 ? 'ELEVATED' : 'NORMAL'
    },
    {
      factor: 'Topographic Basin Elevation',
      weightPct: 20,
      scoreContribution: Math.round(elevationFactor * elevationWeight),
      description: `${zone.elevation}m ASL elevation profile`,
      status: zone.elevation <= 295 ? 'CRITICAL' : zone.elevation <= 305 ? 'ELEVATED' : 'NORMAL'
    },
    {
      factor: 'Storm Drainage Blockage',
      weightPct: 20,
      scoreContribution: Math.round(drainageDeficitScore * drainageWeight),
      description: `${100 - zone.drainageCapacity}% drainage deficit risk`,
      status: zone.drainageCapacity <= 45 ? 'CRITICAL' : zone.drainageCapacity <= 65 ? 'ELEVATED' : 'NORMAL'
    },
    {
      factor: 'Copernicus Sentinel-1 SAR',
      weightPct: 15,
      scoreContribution: Math.round(satelliteScore * satelliteWeight),
      description: satFeature ? `${satFeature.areaHectares} ha surface water detected` : 'No major radar flood anomaly',
      status: satFeature && satFeature.severity === 'CRITICAL' ? 'CRITICAL' : satFeature ? 'ELEVATED' : 'NORMAL'
    },
    {
      factor: 'Construction & Traffic Load',
      weightPct: 15,
      scoreContribution: Math.round(infrastructureScore * infrastructureWeight),
      description: `${activeConstructions.length} active civil works • ${trafficCongestion}% congestion`,
      status: infrastructureScore >= 75 ? 'CRITICAL' : infrastructureScore >= 50 ? 'ELEVATED' : 'NORMAL'
    }
  ];

  // Derive actionable civic recommendation
  let recommendedAction = zone.recommendedActions[0] || 'Standard civic monitoring';
  if (riskLevel === 'SEVERE') {
    if (activeConstructions.length > 0) {
      recommendedAction = 'Barricade construction perimeter, divert traffic via elevated bypass, and deploy dewatering pump.';
    } else {
      recommendedAction = 'Deploy High-Capacity Dewatering Pump Unit & issue emergency citizen route advisory.';
    }
  } else if (riskLevel === 'HIGH') {
    recommendedAction = 'Pre-position portable dewatering pump, inspect stormwater culverts, and station traffic wardens.';
  }

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    marathiName: zone.marathiName,
    center: zone.center,
    bounds: zone.bounds,
    riskScore,
    riskLevel,
    waterloggingProbabilityPct: Math.min(98, Math.round(riskScore * 0.95)),
    roadDamageIndex: zone.roadDamageIndex,
    trafficCongestionPct: trafficCongestion,
    contributingFactors,
    recommendedAction,
    priorityRank: 1, // dynamically calculated below
    engineType: 'MULTI_FACTOR_RULE_ENGINE',
    timestamp: new Date().toISOString()
  };
};

export const assessAllNagpurZones = (rainfallMmOverride?: number): ZoneRiskAssessment[] => {
  const assessments = NAGPUR_ZONES.map(z => calculateZoneRisk(z, rainfallMmOverride));
  // Sort descending by risk score
  assessments.sort((a, b) => b.riskScore - a.riskScore);
  // Assign priority ranks
  assessments.forEach((item, idx) => {
    item.priorityRank = idx + 1;
  });
  return assessments;
};
