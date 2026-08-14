import React from 'react';
import { ROAD_DAMAGE_AI_PREDICTIONS } from '../../data/crisis/ai-predictions-data';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const RoadRiskPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-orange-500 text-white font-mono text-[10px]">
              ASPHALT CAVITATION PREDICTOR
            </Badge>
            <span className="text-xs text-muted-foreground">• PWD Rapid Road Surface Grid</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Nagpur Road Damage & Pothole Risk
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Predictive AI tracking asphalt degradation, sub-base water saturation, and high-speed skid hazards.
          </p>
        </div>

        <Badge className="bg-orange-500 text-white font-extrabold text-xs px-3 py-1 font-mono">
          84% Max Risk Score
        </Badge>
      </div>

      {/* Predictions list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ROAD_DAMAGE_AI_PREDICTIONS.map(item => (
          <div key={item.modelId} className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 bg-orange-500/10 px-2.5 py-1 rounded font-mono">
                {item.severity} RISK ({item.riskScore}/100)
              </span>
              <span className="text-xs font-mono text-muted-foreground">Model: PotholeNet v3.1</span>
            </div>

            <h3 className="text-base font-bold text-foreground">
              📍 {item.targetZone}
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.explanation}
            </p>

            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Key Predictor Factors
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {item.inputs.map((inp, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-muted/40 border border-border/50">
                    <span className="text-[10px] text-muted-foreground block">{inp.name}</span>
                    <span className="font-bold text-foreground">{inp.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs flex items-center justify-between">
              <span className="font-bold text-orange-700 dark:text-orange-400">
                Action: {item.recommendedAction}
              </span>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs">
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
