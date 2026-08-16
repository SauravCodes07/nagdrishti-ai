"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Camera,
  Upload,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Bot,
  Sparkles,
  RefreshCw,
  LocateFixed,
  X,
  FileCheck2,
} from "lucide-react";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { submitReport } from "../../lib/api";

const HAZARD_CATEGORIES = [
  { id: "waterlogging", label: "Deep Waterlogging", icon: "🌊" },
  { id: "pothole", label: "Severe Pothole / Crater", icon: "🕳️" },
  { id: "overflow", label: "Drain / Nullah Overflow", icon: "⚠️" },
  { id: "blockage", label: "Fallen Tree / Roadblock", icon: "🚧" },
];

export default function ReportHazardPage() {
  const [lat, setLat] = useState(21.1472);
  const [lng, setLng] = useState(79.0664);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("waterlogging");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(parseFloat(pos.coords.latitude.toFixed(5)));
        setLng(parseFloat(pos.coords.longitude.toFixed(5)));
        setLocating(false);
      },
      (err) => {
        alert("Could not detect location: " + err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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
      const fullDesc = `[${category.toUpperCase()}] ${description}`;
      const data = await submitReport({
        lat,
        lng,
        description: fullDesc,
        photoFile,
        is_anonymous: isAnonymous,
      });
      setDetectionResult(data);
    } catch (err) {
      setError(err.message || "Failed to submit hazard report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CitizenLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Report Road Hazard or Waterlogging
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
            Submit photo evidence of road hazards. Hugging Face AI Vision automatically verifies depth and dispatches municipal units.
          </p>
        </div>

        {!detectionResult ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Category & Photo Upload */}
            <div className="md:col-span-6 space-y-4">
              {/* Category Picker */}
              <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Incident Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {HAZARD_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`p-3 rounded-2xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                        category === c.id
                          ? "bg-teal-50 dark:bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-300 shadow-sm"
                          : "bg-slate-50 dark:bg-[#0B0F17] border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B]"
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span className="leading-tight">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Evidence Dropzone */}
              <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Photo Evidence (AI Vision Input)
                  </label>
                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">Hugging Face ViT</span>
                </div>

                <div className="relative border-2 border-dashed border-slate-300 dark:border-[#334155] rounded-2xl p-4 text-center hover:border-teal-500 transition-colors bg-slate-50 dark:bg-[#0B0F17]">
                  {photoPreview ? (
                    <div className="relative rounded-xl overflow-hidden max-h-56 flex items-center justify-center bg-black">
                      <img src={photoPreview} alt="Evidence Preview" className="max-h-56 w-auto object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/90 text-white hover:bg-red-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-6">
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-2">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        Take Photo or Browse Image
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        Supports JPEG, PNG or WebP
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
            </div>

            {/* Right Column: Location & Details Form */}
            <div className="md:col-span-6 space-y-4">
              {/* Location Coordinates */}
              <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Incident Coordinates (GPS)
                  </label>
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={locating}
                    className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <LocateFixed className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} />
                    <span>{locating ? "Locating..." : "Auto-Detect GPS"}</span>
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
                      className="w-full mt-1 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] rounded-xl px-3 py-2.5 text-slate-900 dark:text-white text-xs font-mono font-semibold focus:outline-none focus:border-teal-500"
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
                      className="w-full mt-1 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] rounded-xl px-3 py-2.5 text-slate-900 dark:text-white text-xs font-mono font-semibold focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Incident Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Deep waterlogging near Sitabuldi station underpass, traffic stalled..."
                  rows={4}
                  className="w-full text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] rounded-2xl p-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 placeholder:text-slate-400 leading-relaxed resize-none font-medium"
                />

                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded accent-teal-600"
                  />
                  <span>Submit report anonymously</span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-sm shadow-xl shadow-teal-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running Vision AI Inference & Submitting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Submit Incident to Municipal Desk</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Submission Results & AI Inference Card */
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Report Registered & Queued!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Incident #{detectionResult.id} has been logged and assigned to{" "}
                  <strong className="text-teal-600 dark:text-teal-400 font-bold">
                    {detectionResult.zone_name || "Nagpur Urban Zone"}
                  </strong>.
                </p>
              </div>
            </div>

            {/* Hugging Face AI Vision Results */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] space-y-3">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                <Bot className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Hugging Face Vision AI Analysis
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Waterlogging Flood:</span>
                  <span
                    className={`font-black px-2 py-0.5 rounded text-[11px] ${
                      detectionResult.waterlogging_detected
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {detectionResult.waterlogging_detected
                      ? `DETECTED (${Math.round((detectionResult.waterlogging_confidence || 0.85) * 100)}%)`
                      : "NOT DETECTED"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Pothole Severity:</span>
                  <span
                    className={`font-black px-2 py-0.5 rounded text-[11px] ${
                      detectionResult.pothole_detected
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {detectionResult.pothole_detected
                      ? `DETECTED (${Math.round((detectionResult.pothole_confidence || 0.8) * 100)}%)`
                      : "NOT DETECTED"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setDetectionResult(null);
                setPhotoFile(null);
                setPhotoPreview(null);
                setDescription("");
              }}
              className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-sm shadow-lg shadow-teal-600/30 transition active:scale-95"
            >
              Submit Another Hazard Report
            </button>
          </div>
        )}
      </div>
    </CitizenLayout>
  );
}
