import React, { useState } from 'react';
import { Database, Cpu, Navigation, ShieldCheck, CloudRain, Satellite, HardHat, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const DataPipelineFlow: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);

  const pipelineStages = [
    {
      id: 'input',
      title: '1. Real-World Signals',
      subtitle: 'Multi-Source Ingestion',
      icon: <CloudRain className="size-5 text-[#FF8A00]" />,
      summary: 'Continuous ingestion of live weather, radar satellite imagery, road work, and crowdsourced hazard pins.',
      details: [
        { label: 'Open-Meteo API', desc: 'Real-time rainfall mm, humidity, temperature, and 24h precipitation probability for Nagpur.' },
        { label: 'Copernicus Sentinel-1 SAR', desc: 'Synthetic Aperture Radar penetration through storm clouds to detect waterpooling extent.' },
        { label: 'Construction Registry', desc: 'Maha Metro Phase 2, Pardi Flyover, and Wardha Road civil projects with lane status.' },
        { label: 'Citizen Live Reports', desc: 'Geotagged pothole, waterlogging, and fallen tree photos uploaded by citizens.' }
      ]
    },
    {
      id: 'gis',
      title: '2. PostGIS Spatial Layer',
      subtitle: 'Geometric & Topology Indexing',
      icon: <Database className="size-5 text-blue-500" />,
      summary: 'PostgreSQL + PostGIS 3.4 spatial database engine performing spatial indexing and topological queries.',
      details: [
        { label: 'Geometric Primitives', desc: 'Points (Reports), LineStrings (Roads & Corridors), and Polygons (Inundation zones).' },
        { label: 'GIST Spatial Indexes', desc: 'Sub-millisecond bounding box queries and polygon intersection calculations.' },
        { label: 'ST_DWithin & ST_Intersects', desc: 'Determining road hazard exposure and nearest emergency resource proximity.' }
      ]
    },
    {
      id: 'geoai',
      title: '3. GeoAI & Risk Engine',
      subtitle: 'Prithvi ViT 100M + Multi-Factor Analysis',
      icon: <Cpu className="size-5 text-[#FFC107]" />,
      summary: 'GeoAI foundation models segment flood extent while the Multi-Factor Risk Engine computes dynamic danger indices.',
      details: [
        { label: 'IBM/NASA Prithvi EO-100M', desc: 'Hugging Face Vision Transformer foundation model for cloud-resilient flood segmentation.' },
        { label: 'Multi-Factor Urban Equation', desc: 'Rainfall (30%) + Elevation (20%) + Drainage (20%) + Satellite SAR (15%) + Construction (15%).' },
        { label: 'Explainable AI Insights', desc: 'Rule-based verification combined with neural spatial anomaly detection.' }
      ]
    },
    {
      id: 'action',
      title: '4. Actionable Intelligence',
      subtitle: 'Safe Routing & Civic Response',
      icon: <ShieldCheck className="size-5 text-emerald-500" />,
      summary: 'Real-time turn-by-turn routing with Safety Scores and automated dispatch prioritization for NMC teams.',
      details: [
        { label: 'Citizen Predictive Navigation', desc: 'Fastest vs Recommended Safe routes with 0–100 safety scoring and hazard avoidance.' },
        { label: 'NMC Command Dashboard', desc: 'Automated dewatering pump assignment and high-priority traffic diversions.' },
        { label: 'Civic Safety Alerts', desc: 'Targeted proximity notifications before drivers approach submerged underpasses.' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold">
          <Database className="size-3.5" /> ARCHITECTURE PIPELINE
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] dark:text-white tracking-tight font-outfit">
          From Real-World Signals to Predictive Action.
        </h2>
        <p className="text-sm sm:text-base text-[#666666] dark:text-gray-300">
          NagDrishti AI combines spatial databases, satellite radar, and machine learning into a structured pipeline designed for high-consequence civic decisions.
        </p>
      </div>

      {/* Interactive Pipeline Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {pipelineStages.map((stage, idx) => {
          const isActive = activeStage === idx;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(idx)}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative",
                isActive
                  ? "bg-white dark:bg-[#111C2E] border-[#FF8A00] shadow-md ring-2 ring-[#FF8A00]/20"
                  : "bg-[#F7F7F7] dark:bg-[#0B1320] border-[#E5E5E5] dark:border-white/10 hover:border-[#FFC107]"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-white dark:bg-slate-800 border border-[#E5E5E5] dark:border-white/10 flex items-center justify-center shadow-xs">
                  {stage.icon}
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-400">
                  STAGE 0{idx + 1}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#111111] dark:text-white">
                  {stage.title}
                </h4>
                <p className="text-[10px] text-[#666666] dark:text-gray-400 font-medium line-clamp-1">
                  {stage.subtitle}
                </p>
              </div>

              {isActive && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-3 bg-[#FF8A00] rotate-45" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Stage Deep Dive Box */}
      <div className="bg-white dark:bg-[#111C2E] p-6 sm:p-8 rounded-3xl border border-[#E5E5E5] dark:border-white/10 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E5] dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-[#FFF8E1] dark:bg-[#FFC107]/20 border border-[#FFC107]/40 flex items-center justify-center">
              {pipelineStages[activeStage].icon}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#111111] dark:text-white">
                {pipelineStages[activeStage].title} — {pipelineStages[activeStage].subtitle}
              </h3>
              <p className="text-xs text-[#666666] dark:text-gray-400 mt-0.5">
                {pipelineStages[activeStage].summary}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pipelineStages[activeStage].details.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/5 space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#FF8A00] shrink-0" />
                <h5 className="font-bold text-xs sm:text-sm text-[#111111] dark:text-white">
                  {item.label}
                </h5>
              </div>
              <p className="text-xs text-[#666666] dark:text-gray-300 leading-relaxed pl-6">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
