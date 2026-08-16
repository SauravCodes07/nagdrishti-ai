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
            Report Road Hazard & Flood
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
            Submit geotagged photos of waterlogging, potholes, or blocked drains. Inferences are verified by Hugging Face Vision AI and dispatched to Nagpur Municipal Corporation QRT.
          </p>
        </div>

        {!detectionResult ? (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                1. Select Incident Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {HAZARD_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                      category === cat.id
                        ? "bg-[#FFF7ED] dark:bg-[#FF8A00]/15 border-[#FF8A00] text-slate-900 dark:text-white shadow-sm"
                        : "bg-slate-50 dark:bg-[#0B0F17] border-slate-200 dark:border-[#1E293B] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-[#334155]"
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs font-bold">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* GPS Location Fields */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                  2. Incident Coordinates (GPS)
                </label>
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={locating}
                  className="text-xs font-bold text-[#EA580C] dark:text-[#FF8A00] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} />
                  <span>{locating ? "Detecting GPS..." : "Auto-Detect My GPS"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Latitude</span>
                  <input
                    type="number"
                    step="0.00001"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                    className="w-full bg-transparent text-sm font-black text-slate-900 dark:text-white font-mono focus:outline-none mt-0.5"
                    required
                  />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Longitude</span>
                  <input
                    type="number"
                    step="0.00001"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value))}
                    className="w-full bg-transparent text-sm font-black text-slate-900 dark:text-white font-mono focus:outline-none mt-0.5"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload Input */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                3. Hazard Photo Evidence (Vision AI Verification)
              </label>

              <div className="relative border-2 border-dashed border-slate-300 dark:border-[#334155] rounded-3xl p-6 text-center hover:border-[#FF8A00] transition-colors bg-slate-50 dark:bg-[#0B0F17]">
                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden max-h-64 flex items-center justify-center bg-black">
                    <img src={photoPreview} alt="Evidence" className="max-h-64 w-auto object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/90 text-white hover:bg-red-600 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-4">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FFF7ED] dark:bg-[#FF8A00]/10 flex items-center justify-center text-[#EA580C] dark:text-[#FF8A00] mb-3 border border-[#FF8A00]/20">
                      <Camera className="w-7 h-7" />
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      Take a Photo or Browse Device
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                      JPEG, PNG, or WebP road photo evidence
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

            {/* Description Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                4. Location Context & Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., Narendra Nagar railway underpass submerged ~2 feet deep. Cars turning back, 1 auto stuck..."
                rows={3}
                className="w-full text-xs font-medium bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] rounded-2xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF8A00] placeholder:text-slate-400 resize-none leading-relaxed"
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-[#FF8A00] rounded"
              />
              <label htmlFor="anon" className="text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer">
                Submit anonymously (omit citizen contact details from municipal public logs)
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-black text-sm shadow-xl shadow-[#FF8A00]/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Upload className={`w-4 h-4 ${submitting ? "animate-spin" : ""}`} />
              <span>{submitting ? "Analyzing with Hugging Face Vision AI..." : "Submit Incident Report"}</span>
            </button>
          </form>
        ) : (
          /* Submission Feedback & Vision AI Results */
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Hazard Report #{detectionResult.id} Registered!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Your report was auto-assigned to <strong className="text-[#EA580C] dark:text-[#FF8A00]">{detectionResult.zone_name || "Nagpur City"}</strong>.
                </p>
              </div>
            </div>

            {/* Hugging Face AI Inferences */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] space-y-4">
              <div className="flex items-center gap-2 text-[#EA580C] dark:text-[#FF8A00]">
                <Bot className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Hugging Face AI Vision Analysis
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-bold">Pothole Hazard:</span>
                  <span
                    className={`font-black px-2.5 py-1 rounded text-[11px] ${
                      detectionResult.pothole_detected
                        ? "bg-red-500 text-white"
                        : "bg-emerald-500 text-white"
                    }`}
                  >
                    {detectionResult.pothole_detected ? "DETECTED" : "CLEAR"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-bold">Waterlogging Flood:</span>
                  <span
                    className={`font-black px-2.5 py-1 rounded text-[11px] ${
                      detectionResult.waterlogging_detected
                        ? "bg-red-500 text-white"
                        : "bg-emerald-500 text-white"
                    }`}
                  >
                    {detectionResult.waterlogging_detected ? "CONFIRMED INUNDATION" : "CLEAR"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#131B2A] text-slate-700 dark:text-slate-300 text-xs flex justify-between items-center">
                <span>Verification State:</span>
                <span className="font-bold text-[#EA580C] dark:text-[#FF8A00]">
                  {detectionResult.verification_status || "Pending Verification"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setDetectionResult(null);
                setPhotoFile(null);
                setPhotoPreview(null);
                setDescription("");
              }}
              className="w-full py-4 rounded-2xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
            >
              Submit Another Report
            </button>
          </div>
        )}
      </div>
    </CitizenLayout>
  );
}
