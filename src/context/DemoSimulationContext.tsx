import React, { createContext, useContext, useState, useEffect } from 'react';
import { NAGPUR_ZONES, NagpurZone } from '../data/crisis/nagpur-zones';
import { INCIDENTS_DATA, Incident } from '../data/crisis/incident-data';
import { CRISIS_RESOURCES, CrisisResource } from '../data/crisis/resource-data';
import { INITIAL_CITIZEN_REPORTS, CitizenReport } from '../data/crisis/citizen-reports';

export type SimulationStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface SimulationStageInfo {
  stage: SimulationStage;
  title: string;
  subtitle: string;
  rainfallMm: number;
  description: string;
}

export const SIMULATION_STAGES: SimulationStageInfo[] = [
  {
    stage: 1,
    title: 'Stage 1: Baseline Conditions',
    subtitle: 'Normal Urban Operations',
    rainfallMm: 12,
    description: 'Dry spell with light drizzle. All drainage channels clear. Traffic flowing normally.'
  },
  {
    stage: 2,
    title: 'Stage 2: Heavy Rainfall Onset',
    subtitle: 'Cloudburst Warning Issued',
    rainfallMm: 38,
    description: 'Intensity increases to 38 mm/hr. Catchment runoff accelerating in West Nagpur.'
  },
  {
    stage: 3,
    title: 'Stage 3: AI High-Risk Detection',
    subtitle: 'Early Machine Learning Alerts',
    rainfallMm: 54,
    description: 'HydroRisk AI flags Dharampeth & Sitabuldi basins exceeding 75% risk threshold.'
  },
  {
    stage: 4,
    title: 'Stage 4: Severe Waterlogging Crisis',
    subtitle: 'Underpass Submergence Peak',
    rainfallMm: 78,
    description: 'Rainfall hits 78 mm. Dharampeth waterlogging reaches 92% severe level (3.5 ft water).'
  },
  {
    stage: 5,
    title: 'Stage 5: Traffic & Pothole Surge',
    subtitle: 'Corridor Congestion Gridlock',
    rainfallMm: 82,
    description: 'Sitabuldi interchange gridlocked at 94%. Wardha Road surface experiencing asphalt failure.'
  },
  {
    stage: 6,
    title: 'Stage 6: Citizen Reports Inflow',
    subtitle: 'Crowdsourced Geotagged Reports',
    rainfallMm: 80,
    description: 'Citizens submit real-time photos and location pins for stalled vehicles and clogged drains.'
  },
  {
    stage: 7,
    title: 'Stage 7: AI Actionable Dispatch',
    subtitle: 'Autonomous Priority Allocation',
    rainfallMm: 76,
    description: 'AI Engine calculates top response priorities (#1 Dewatering Pump, #2 Flyover Barricade).'
  },
  {
    stage: 8,
    title: 'Stage 8: Full Civic Mitigation',
    subtitle: 'Resources Deployed & Active',
    rainfallMm: 68,
    description: '32 Dewatering pumps activated. Rapid asphalt units deployed. Disaster response active.'
  }
];

interface DemoSimulationContextType {
  stage: SimulationStage;
  setStage: (stage: SimulationStage) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  nextStage: () => void;
  prevStage: () => void;
  resetSimulation: () => void;
  stageInfo: SimulationStageInfo;
  
  // Computed dynamic state driven by simulation stage
  currentRainfallMm: number;
  kpis: {
    severeZonesCount: number;
    highZonesCount: number;
    mediumZonesCount: number;
    lowZonesCount: number;
    activeIncidentsCount: number;
    resourcesDeployedCount: number;
  };
  zones: NagpurZone[];
  incidents: Incident[];
  resources: CrisisResource[];
  citizenReports: CitizenReport[];
  addCitizenReport: (report: Omit<CitizenReport, 'id' | 'timestamp' | 'timeAgo' | 'upvotes' | 'verificationStatus'>) => void;
}

const DemoSimulationContext = createContext<DemoSimulationContextType | undefined>(undefined);

export const DemoSimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stage, setStage] = useState<SimulationStage>(4); // Default to Stage 4 (Crisis Peak) for impressive initial view!
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>(INITIAL_CITIZEN_REPORTS);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setStage(prev => (prev >= 8 ? 1 : ((prev + 1) as SimulationStage)));
      }, 5000); // Advance every 5 seconds when playing
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(prev => !prev);
  const nextStage = () => setStage(prev => (prev >= 8 ? 1 : ((prev + 1) as SimulationStage)));
  const prevStage = () => setStage(prev => (prev <= 1 ? 8 : ((prev - 1) as SimulationStage)));
  const resetSimulation = () => {
    setStage(1);
    setIsPlaying(false);
  };

  const stageInfo = SIMULATION_STAGES.find(s => s.stage === stage) || SIMULATION_STAGES[3];

  // Dynamic calculations based on stage multiplier
  const multiplier = stage / 4; // 1.0 at Stage 4

  const currentRainfallMm = Math.round(stageInfo.rainfallMm);

  // Compute dynamic zones based on stage
  const zones: NagpurZone[] = NAGPUR_ZONES.map(zone => {
    let riskFactor = multiplier;
    if (stage === 1) riskFactor = 0.3;
    if (stage === 2) riskFactor = 0.6;
    if (stage === 3) riskFactor = 0.85;
    if (stage === 4 || stage === 5 || stage === 6) riskFactor = 1.05;
    if (stage === 7 || stage === 8) riskFactor = 0.9;

    const currentRiskScore = Math.min(99, Math.round(zone.currentRiskScore * riskFactor));
    let baselineRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE' = 'LOW';
    if (currentRiskScore >= 85) baselineRisk = 'SEVERE';
    else if (currentRiskScore >= 70) baselineRisk = 'HIGH';
    else if (currentRiskScore >= 45) baselineRisk = 'MEDIUM';

    return {
      ...zone,
      rainfallMm: Math.round(zone.rainfallMm * (currentRainfallMm / 78)),
      currentRiskScore,
      waterloggingProb: Math.min(0.99, Number((zone.waterloggingProb * riskFactor).toFixed(2))),
      baselineRisk
    };
  });

  const severeZonesCount = zones.filter(z => z.baselineRisk === 'SEVERE').length;
  const highZonesCount = zones.filter(z => z.baselineRisk === 'HIGH').length;
  const mediumZonesCount = zones.filter(z => z.baselineRisk === 'MEDIUM').length;
  const lowZonesCount = zones.filter(z => z.baselineRisk === 'LOW').length;

  const activeIncidentsCount = Math.round(15 + stage * 7);
  const resourcesDeployedCount = Math.round(8 + stage * 3.5);

  const kpis = {
    severeZonesCount,
    highZonesCount,
    mediumZonesCount,
    lowZonesCount,
    activeIncidentsCount,
    resourcesDeployedCount
  };

  const addCitizenReport = (newRep: Omit<CitizenReport, 'id' | 'timestamp' | 'timeAgo' | 'upvotes' | 'verificationStatus'>) => {
    const created: CitizenReport = {
      ...newRep,
      id: `REP-${800 + citizenReports.length + 1}`,
      timestamp: 'Just now',
      timeAgo: '1 min ago',
      upvotes: 1,
      verificationStatus: 'PENDING'
    };
    setCitizenReports(prev => [created, ...prev]);
  };

  return (
    <DemoSimulationContext.Provider
      value={{
        stage,
        setStage,
        isPlaying,
        setIsPlaying,
        togglePlay,
        nextStage,
        prevStage,
        resetSimulation,
        stageInfo,
        currentRainfallMm,
        kpis,
        zones,
        incidents: INCIDENTS_DATA,
        resources: CRISIS_RESOURCES,
        citizenReports,
        addCitizenReport
      }}
    >
      {children}
    </DemoSimulationContext.Provider>
  );
};

export const useDemoSimulation = () => {
  const context = useContext(DemoSimulationContext);
  if (!context) {
    throw new Error('useDemoSimulation must be used within a DemoSimulationProvider');
  }
  return context;
};
