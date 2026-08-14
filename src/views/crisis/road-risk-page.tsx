import React from 'react';
import { ROAD_DAMAGE_AI_PREDICTIONS } from '../../data/crisis/ai-predictions-data';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const RoadRiskPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#FF8A00] text-white font-mono text-[10px] font-bold">
              ASPHALT CAVITATION PREDICTOR
            </Badge>
            <span className="text-xs text-[#666666] dark:text-gray-400">• PWD Rapid Road Surface Grid</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Nagpur Road Damage & Pothole Risk
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Predictive AI tracking asphalt degradation, sub-base water saturation, and high-speed skid hazards.
          </p>
        </div>

        <Badge className="bg-[#FF8A00] text-white font-extrabold text-xs px-3 py-1 font-mono">
          84% Max Risk Score
        </Badge>
      </div>

      {/* Predictions list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ROAD_DAMAGE_AI_PREDICTIONS.map(item => (
          <div key={item.modelId} className="bg-white dark:bg-[#111C2E] rounded-2xl p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white bg-[#FF8A00] px-2.5 py-1 rounded font-mono">
                {item.severity} RISK ({item.riskScore}/100)
              </span>
              <span className="text-xs font-mono text-[#666666] dark:text-gray-400">Model: PotholeNet v3.1</span>
            </div>

            <h3 className="text-base font-bold text-[#111111] dark:text-white">
              📍 {item.targetZone}
            </h3>

            <p className="text-xs text-[#666666] dark:text-gray-400 leading-relaxed">
              {item.explanation}
            </p>

            <div className="space-y-2 pt-2 border-t border-[#E5E5E5] dark:border-white/10">
              <h4 className="text-xs font-bold text-[#111111] dark:text-white uppercase tracking-wider">
                Key Predictor Factors
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {item.inputs.map((inp, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10">
                    <span className="text-[10px] text-[#666666] dark:text-gray-400 block">{inp.name}</span>
                    <span className="font-bold text-[#111111] dark:text-white">{inp.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FFF8E1] dark:bg-[#FF8A00]/10 border border-[#FF8A00]/30 text-xs flex items-center justify-between">
              <span className="font-bold text-[#111111] dark:text-white">
                Action: {item.recommendedAction}
              </span>
              <Button size="sm" className="bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold text-xs">
                Dispatch PWD Team
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadRiskPage;
