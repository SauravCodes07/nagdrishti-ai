"use client";

import { useState } from "react";
import {
  X,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Bot,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] dark:bg-[#111C2E] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-xl border border-[#E2E8F0] dark:border-[#243244] relative max-h-[90vh] overflow-y-auto text-[#0F172A] dark:text-[#F8FAFC]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2.5 rounded-xl bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] border border-[#0F766E]/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Report Road Hazard / Flood</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              AI Vision automatically verifies potholes and waterlogging
            </p>
          </div>
        </div>

        {!detectionResult ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* GPS Location Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-full text-xs font-normal bg-[#FFFFFF] dark:bg-[#0B1220] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6]"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  className="w-full text-xs font-normal bg-[#FFFFFF] dark:bg-[#0B1220] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6]"
                  required
                />
              </div>
            </div>

            {/* Photo Upload Area */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">
                Photo Evidence (Vision AI Analysis)
              </label>
              <div className="relative border-2 border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-xl p-4 text-center hover:border-[#0F766E] dark:hover:border-[#14B8A6] transition-colors bg-[#F8FAFC] dark:bg-[#0B1220]">
                {photoPreview ? (
                  <div className="relative rounded-lg overflow-hidden max-h-48 flex items-center justify-center bg-black">
                    <img src={photoPreview} alt="Evidence Preview" className="max-h-48 w-auto object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-[#DC2626] transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-3">
                    <Camera className="w-8 h-8 text-[#0F766E] dark:text-[#14B8A6] mx-auto mb-2" />
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] block">
                      Click to upload photo
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                      JPEG, PNG, or WebP road image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Hazard Description */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">
                Description & Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the severity: water depth, stalled vehicles, blocked drain..."
                rows={3}
                className="w-full text-xs font-normal bg-[#FFFFFF] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-3 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6] placeholder:text-[#94A3B8] resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs font-medium text-[#991B1B] dark:text-[#F87171] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#162235] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#E2E8F0] font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs sm:text-sm shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <Upload className={`w-4 h-4 ${submitting ? "animate-spin" : ""}`} />
                <span>{submitting ? "Analyzing..." : "Submit Hazard Report"}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Submission Feedback & Vision AI Results */
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-[#DCFCE7] dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] dark:text-[#4ADE80] shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Hazard Report #{detectionResult.id} Registered
                </h3>
                <p className="text-xs text-[#166534] dark:text-[#86EFAC] mt-0.5">
                  Assigned to <strong className="text-[#0F766E] dark:text-[#5EEAD4]">{detectionResult.zone_name || "Nagpur Zone"}</strong>.
                </p>
              </div>
            </div>

            {/* Hugging Face AI Results Box */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] space-y-3">
              <div className="flex items-center space-x-2 text-[#0F766E] dark:text-[#14B8A6]">
                <Bot className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Vision AI Inference Results
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244]">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-medium block">Pothole:</span>
                  <span
                    className={`font-semibold text-xs px-2 py-0.5 rounded inline-block mt-1 ${
                      detectionResult.pothole_detected
                        ? "bg-[#FEE2E2] text-[#991B1B] dark:bg-red-500/20 dark:text-[#F87171]"
                        : "bg-[#DCFCE7] text-[#166534] dark:bg-emerald-500/20 dark:text-[#4ADE80]"
                    }`}
                  >
                    {detectionResult.pothole_detected ? "DETECTED" : "CLEAR"}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244]">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-medium block">Waterlogging:</span>
                  <span
                    className={`font-semibold text-xs px-2 py-0.5 rounded inline-block mt-1 ${
                      detectionResult.waterlogging_detected
                        ? "bg-[#FEE2E2] text-[#991B1B] dark:bg-red-500/20 dark:text-[#F87171]"
                        : "bg-[#DCFCE7] text-[#166534] dark:bg-emerald-500/20 dark:text-[#4ADE80]"
                    }`}
                  >
                    {detectionResult.waterlogging_detected ? "CONFIRMED" : "CLEAR"}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] text-xs flex justify-between items-center">
                <span className="text-[#475569] dark:text-[#CBD5E1]">Moderation Status:</span>
                <span className="font-semibold text-[#0F766E] dark:text-[#14B8A6]">
                  {detectionResult.verification_status || "Pending Verification"}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs transition cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
