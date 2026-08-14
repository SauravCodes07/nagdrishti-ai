import React, { useState } from 'react';
import { WATERLOGGING_AI_PREDICTIONS, ROAD_DAMAGE_AI_PREDICTIONS } from '../../data/crisis/ai-predictions-data';
import { Sparkles, Sliders, Code } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

const AIPredictionsPage: React.FC = () => {
  // Scenario Simulator interactive sliders
  const [simRainfall, setSimRainfall] = useState(78);
  const [simDrainageBlock, setSimDrainageBlock] = useState(58);
  const [simTrafficLoad, setSimTrafficLoad] = useState(82);

  // Dynamic calculation for scenario simulator
  const calculatedRiskScore = Math.min(99, Math.round((simRainfall * 0.45) + (simDrainageBlock * 0.35) + (simTrafficLoad * 0.20)));
  let calculatedSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE' = 'LOW';
  if (calculatedRiskScore >= 85) calculatedSeverity = 'SEVERE';
  else if (calculatedRiskScore >= 70) calculatedSeverity = 'HIGH';
  else if (calculatedRiskScore >= 45) calculatedSeverity = 'MEDIUM';

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-bhagwa text-white font-mono text-[10px] flex items-center gap-1">
              <Sparkles className="size-3" /> HYDRORISK-XGBOOST ML ENGINE
            </Badge>
            <span className="text-xs text-muted-foreground">• 96% Model Confidence Score</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            AI Crisis Prediction Engine & Model Specs
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Machine learning models predicting waterlogging submergence, road cavitation, and optimal civic action.
          </p>
        </div>

        <Badge className="bg-emerald-500 text-white font-bold text-xs px-3 py-1 font-mono">
          35 Mins Predictive Lead Time
        </Badge>
      </div>

      {/* Interactive Scenario Simulator */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-700/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-bhagwa text-white flex items-center justify-center font-bold">
              <Sliders className="size-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Interactive AI Scenario Simulator
              </h3>
              <p className="text-xs text-slate-300">
                Adjust environmental parameters to see real-time ML risk predictions
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Calculated ML Risk</span>
            <span className={`text-2xl font-black font-mono ${
              calculatedSeverity === 'SEVERE' ? 'text-rose-400' : calculatedSeverity === 'HIGH' ? 'text-orange-400' : 'text-amber-400'
            }`}>
              {calculatedRiskScore} / 100 [{calculatedSeverity}]
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Rainfall Slider */}
          <div className="space-y-2 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between text-xs font-bold">
              <span>Rainfall Intensity</span>
              <span className="text-bhagwa font-mono">{simRainfall} mm/hr</span>
            </div>
            <input
              type="range"
              min="10"
              max="140"
              value={simRainfall}
              onChange={e => setSimRainfall(Number(e.target.value))}
              className="w-full accent-bhagwa cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Model Weight: 45%</span>
          </div>

          {/* Drainage Blockage Slider */}
          <div className="space-y-2 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between text-xs font-bold">
              <span>Drainage Blockage %</span>
              <span className="text-cyan-400 font-mono">{simDrainageBlock}% Blocked</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simDrainageBlock}
              onChange={e => setSimDrainageBlock(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Model Weight: 35%</span>
          </div>

          {/* Traffic Load Slider */}
          <div className="space-y-2 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between text-xs font-bold">
              <span>Traffic Corridor Load</span>
              <span className="text-amber-400 font-mono">{simTrafficLoad}% Congestion</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={simTrafficLoad}
              onChange={e => setSimTrafficLoad(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Model Weight: 20%</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs flex items-center justify-between">
          <span>
            🤖 <strong>Simulated AI Action Recommendation:</strong>{' '}
            {calculatedSeverity === 'SEVERE'
              ? 'Deploy 500HP Dewatering Pump Unit + Full Traffic Barricade'
              : calculatedSeverity === 'HIGH'
              ? 'Station Mobile Pump + Deploy Traffic Diversion'
              : 'Standby Monitoring'}
          </span>
        </div>
      </div>

      {/* Model Cards */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-foreground">
          Production AI Models & Input Weights
        </h2>

        {/* Waterlogging Model */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-bhagwa bg-bhagwa/10 px-2.5 py-1 rounded">
                MODEL #1: WATERLOGGING PREDICTOR
              </span>
              <h3 className="text-lg font-bold text-foreground mt-1">
                {WATERLOGGING_AI_PREDICTIONS[0].modelName}
              </h3>
            </div>

            <Badge className="bg-rose-500 text-white font-mono font-bold text-xs px-3 py-1">
              Risk: {WATERLOGGING_AI_PREDICTIONS[0].riskScore}/100 [{WATERLOGGING_AI_PREDICTIONS[0].severity}]
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {WATERLOGGING_AI_PREDICTIONS[0].explanation}
          </p>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Input Parameter Feature Weights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              {WATERLOGGING_AI_PREDICTIONS[0].inputs.map((inp, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{inp.name}</span>
                  <span className="font-bold text-foreground block">{inp.value}</span>
                  <span className="text-[10px] font-mono font-bold text-bhagwa">Weight: {inp.weight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Road Damage Model */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-orange-600 bg-orange-500/10 px-2.5 py-1 rounded">
                MODEL #2: ROAD DAMAGE & POTHOLE PREDICTOR
              </span>
              <h3 className="text-lg font-bold text-foreground mt-1">
                {ROAD_DAMAGE_AI_PREDICTIONS[0].modelName}
              </h3>
            </div>

            <Badge className="bg-orange-500 text-white font-mono font-bold text-xs px-3 py-1">
              Damage Risk: {ROAD_DAMAGE_AI_PREDICTIONS[0].riskScore}/100 [{ROAD_DAMAGE_AI_PREDICTIONS[0].severity}]
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {ROAD_DAMAGE_AI_PREDICTIONS[0].explanation}
          </p>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Input Parameter Feature Weights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              {ROAD_DAMAGE_AI_PREDICTIONS[0].inputs.map((inp, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[10px] text-muted-foreground block">{inp.name}</span>
                  <span className="font-bold text-foreground block">{inp.value}</span>
                  <span className="text-[10px] font-mono font-bold text-orange-600">Weight: {inp.weight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Python API Abstraction Documentation */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Code className="size-5 text-bhagwa" />
            <h3 className="font-bold text-base text-foreground">
              Python ML API Architecture Integration
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Clean JSON payload contract separating frontend simulation state from future Python / FastAPI ML endpoints.
          </p>
          <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 text-[11px] font-mono overflow-x-auto border border-slate-800">
{`// GET /api/v1/predict?city=nagpur
{
  "status": "SUCCESS",
  "model_version": "XGBoost-HydroRisk-2.4",
  "execution_time_ms": 42,
  "predictions": [
    {
      "zone_id": "dharampeth",
      "risk_score": 92,
      "risk_level": "SEVERE",
      "waterlogging_probability": 0.92,
      "rainfall_mm": 78,
      "recommended_action": "Deploy Pump Unit #4"
    }
  ]
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AIPredictionsPage;
