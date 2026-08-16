"use client";

import { useState } from "react";
import {
  X,
  Camera,
  Upload,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { submitReport } from "../lib/api";

export default function ReportHazardModal({
  isOpen,
  onClose,
  initialLocation,
  onPickOnMap,
  onReportSubmitted,
}) {
  const [lat, setLat] = useState(initialLocation ? initialLocation.lat : 21.1472);
  const [lng, setLng] = useState(initialLocation ? initialLocation.lng : 79.0664);
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);

  if (!isOpen) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description && !photoFile) {
      setError("Please provide a photo or description of the hazard.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setDetectionResult(null);

    try {
      const data = await submitReport({
        lat,
        lng,
        description,
        photoFile,
      });

      setDetectionResult(data);
      if (onReportSubmitted) {
        onReportSubmitted(data);
      }
    } catch (err) {
      setError(err.message || "Failed to submit hazard report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-fadeIn font-sans max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Report Road Hazard / Flood</h2>
            <p className="text-xs text-slate-500">
              AI Vision automatically verifies potholes & waterlogging
            </p>
          </div>
        </div>

        {!detectionResult ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Location selector */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hazard Coordinates</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onPickOnMap) onPickOnMap();
                  }}
                  className="text-blue-600 hover:underline text-[11px] font-semibold"
                >
                  Pick from Map
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                    className="w-full mt-0.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value))}
                    className="w-full mt-0.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs font-semibold"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hazard Photo (Required for AI Vision Inference)
              </label>
              
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-amber-500 transition-colors bg-slate-50/50">
                {photoPreview ? (
                  <div className="relative rounded-xl overflow-hidden max-h-48 flex items-center justify-center bg-black">
                    <img src={photoPreview} alt="Hazard Preview" className="max-h-48 w-auto object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white text-xs hover:bg-slate-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Take Photo or Browse Image
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      JPEG, PNG or WebP road photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Description textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Incident Notes / Location Details
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., Deep pothole near Dharampeth square causing water buildup after rain..."
                rows={3}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FF8A00] text-slate-950 font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Hugging Face AI Vision...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Submit Incident & Run AI Verification</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Detection Results Card */
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-900">Incident Successfully Submitted!</h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Report #{detectionResult.id} has been registered and auto-assigned to{" "}
                  <strong>{detectionResult.zone_name || "Nagpur City"}</strong>.
                </p>
              </div>
            </div>

            {/* AI Results */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800">
              <div className="flex items-center space-x-2 text-amber-400">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Hugging Face AI Vision Analysis
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Pothole status */}
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Pothole Hazard:</span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        detectionResult.pothole_detected
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : detectionResult.pothole_detected === null
                          ? "bg-slate-700 text-slate-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {detectionResult.pothole_detected === null
                        ? "AI Unavailable"
                        : detectionResult.pothole_detected
                        ? `DETECTED (${Math.round((detectionResult.pothole_confidence || 0) * 100)}%)`
                        : "NOT DETECTED"}
                    </span>
                  </div>
                </div>

                {/* Waterlogging status */}
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Waterlogging Flood:</span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        detectionResult.waterlogging_detected
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : detectionResult.waterlogging_detected === null
                          ? "bg-slate-700 text-slate-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {detectionResult.waterlogging_detected === null
                        ? "AI Unavailable"
                        : detectionResult.waterlogging_detected
                        ? `DETECTED (${Math.round((detectionResult.waterlogging_confidence || 0) * 100)}%)`
                        : "NOT DETECTED"}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Verification Status:</span>
                  <span className="font-semibold text-amber-300">
                    {detectionResult.verification_status} (Queued for Municipal Review)
                  </span>
                </div>
              </div>
            </div>

            {/* Done Button */}
            <button
              onClick={() => {
                setDetectionResult(null);
                setPhotoFile(null);
                setPhotoPreview(null);
                setDescription("");
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition-colors"
            >
              Done & Return to Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
