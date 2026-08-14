import React, { useState } from 'react';
import { SENTINEL_OBSERVATIONS } from '../../services/satellite/satelliteService';
import { Sparkles, Calendar } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';

export const SatelliteIntelligencePage: React.FC = () => {
  const [selectedObsId, setSelectedObsId] = useState<string>(SENTINEL_OBSERVATIONS[0].id);

  const activeObs = SENTINEL_OBSERVATIONS.find(o => o.id === selectedObsId) || SENTINEL_OBSERVATIONS[0];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFC107] text-[#111111]">
              COPERNICUS EARTH OBSERVATION
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              [SENTINEL-1 C-SAR & SENTINEL-2 MSI]
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Satellite Flood & Urban Change Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Cloud-penetrating Synthetic Aperture Radar (SAR) and multi-spectral earth observation data processed via Google Earth Engine & Hugging Face GeoAI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs py-1 px-2.5">
            🛰️ SAR Radar Active
          </Badge>
        </div>
      </div>

      {/* Observation Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SENTINEL_OBSERVATIONS.map((obs) => {
          const isSelected = selectedObsId === obs.id;
          return (
            <div
              key={obs.id}
              onClick={() => setSelectedObsId(obs.id)}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-[#111C2E] shadow-2xs space-y-2",
                isSelected
                  ? "border-[#FF8A00] ring-2 ring-[#FF8A00]/20 shadow-md"
                  : "border-[#E5E5E5] dark:border-white/10 hover:border-[#FFC107]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-[#FFF8E1] dark:bg-[#FFC107]/20 text-[#111111] dark:text-white border border-[#FFC107]/40">
                  {obs.satellite === 'SENTINEL_1_SAR' ? '📡 SENTINEL-1 SAR (Radar)' : '🛰️ SENTINEL-2 (Optical)'}
                </span>
                <span className="text-[11px] text-[#666666] dark:text-gray-400 flex items-center gap-1 font-mono">
                  <Calendar className="size-3 text-[#FF8A00]" /> {obs.acquisitionDate}
                </span>
              </div>

              <h3 className="font-bold text-sm text-[#111111] dark:text-white">
                {obs.instrument}
              </h3>

              <p className="text-xs text-[#666666] dark:text-gray-400">
                Resolution: <span className="font-mono font-bold text-[#111111] dark:text-white">{obs.resolutionMeters}m</span> • Swath: <span className="font-mono font-bold text-[#111111] dark:text-white">{obs.coverageAreaSqKm} sq km</span>
              </p>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-bold text-emerald-600">
                  {obs.detectedFeatures.length} Anomalies Segmented
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Dive Active Observation Analysis */}
      <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E5] dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#FF8A00]">
                SCENE ID: {activeObs.id}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white mt-1">
              {activeObs.satellite === 'SENTINEL_1_SAR'
                ? 'Surface Water Pooling & Radar Backscatter Inundation'
                : 'Land Surface Spectral Anomaly & Urban Change'}
            </h2>
            <p className="text-xs text-[#666666] dark:text-gray-400 mt-0.5">
              Source: {activeObs.sourceAttribution} • Processed: {activeObs.processedTimestamp}
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black font-mono text-[#111111] dark:text-white">
              {activeObs.detectedFeatures.reduce((acc, f) => acc + f.areaHectares, 0).toFixed(1)}
              <span className="text-xs text-[#666666] dark:text-gray-400 font-normal"> ha</span>
            </div>
            <span className="text-[10px] text-[#666666] dark:text-gray-400 font-bold uppercase">
              Total Detected Extent
            </span>
          </div>
        </div>

        {/* Detected Geospatial Polygon Features */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-[#666666] dark:text-gray-400 uppercase tracking-wider">
            Segmented Satellite Inundation Polygons ({activeObs.detectedFeatures.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeObs.detectedFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#E5E5E5] dark:border-white/10 bg-[#F7F7F7] dark:bg-[#0B1320] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[9px] font-mono font-bold px-2 py-0.5 rounded",
                      feat.severity === 'CRITICAL'
                        ? "bg-[#E53935] text-white"
                        : feat.severity === 'HIGH'
                        ? "bg-[#FF8A00] text-white"
                        : "bg-[#22A447] text-white"
                    )}
                  >
                    {feat.severity} ({feat.confidenceScorePct}% Conf)
                  </span>
                  <span className="text-xs font-mono font-bold text-[#111111] dark:text-white">
                    {feat.areaHectares} ha
                  </span>
                </div>

                <h4 className="font-bold text-sm text-[#111111] dark:text-white">
                  {feat.zoneName}
                </h4>

                <p className="text-[11px] text-[#666666] dark:text-gray-300 leading-relaxed">
                  {feat.notes}
                </p>

                <div className="text-[10px] text-[#FF8A00] font-bold font-mono pt-1">
                  Target Zone: {feat.zoneId}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earth Engine & Prithvi GeoAI Architecture Documentation Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#FFF8E1] to-white dark:from-[#FFC107]/10 dark:to-transparent border border-[#FFC107]/30 text-xs space-y-2">
          <div className="flex items-center gap-2 text-[#FF8A00] font-bold">
            <Sparkles className="size-4" />
            <span>GeoAI Foundation Model Architecture</span>
          </div>
          <p className="text-[11px] text-[#111111] dark:text-gray-300 leading-relaxed">
            NagDrishti AI integrates Copernicus Sentinel-1 Synthetic Aperture Radar (SAR) with the <strong>IBM/NASA Prithvi Earth Observation (ViT) Foundation Model</strong> hosted on Hugging Face. Radar backscatter specular reflection drops (&lt; -16 dB in VV+VH bands) enable cloud-resistant flood extent segmentation even during active monsoon downpours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SatelliteIntelligencePage;
