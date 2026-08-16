"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Camera,
  MapPin,
  Upload,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  Bot,
  Locate,
  Shield,
  EyeOff,
} from "lucide-react";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { submitReport } from "../../lib/api";

const HAZARD_CATEGORIES = [
  { id: "waterlogging", label: "Waterlogging", icon: "🌊" },
  { id: "pothole", label: "Pothole / Road Damage", icon: "🕳️" },
  { id: "underpass", label: "Flooded Underpass", icon: "🚗" },
  { id: "drain", label: "Blocked Storm Drain", icon: "🚧" },
  { id: "fallen_tree", label: "Fallen Tree / Wire", icon: "⚡" },
];

const SEVERITY_LEVELS = [
  { id: "Low", label: "Low", color: "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
  { id: "Medium", label: "Medium", color: "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10" },
  { id: "High", label: "High", color: "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-500/10" },
  { id: "Severe", label: "Severe", color: "border-red-500 text-red-600 dark:text-red-400 bg-red-500/10" },
];

export default function CitizenReportPage() {
  const [selectedCategory, setSelectedCategory] = useState("waterlogging");
  const [severity, setSeverity] = useState("High");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [lat, setLat] = useState("21.1458");
  const [lng, setLng] = useState("79.0882");
  const [locating, setLocating] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePhotoSelect = (e) => {
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
        setLat(pos.coords.latitude.toFixed(5));
        setLng(pos.coords.longitude.toFixed(5));
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        alert("Could not fetch GPS coordinates: " + err.message);
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const payload = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        description: `[${selectedCategory.toUpperCase()}] Severity: ${severity}. ${description}`,
        photoFile: photoFile,
        is_anonymous: isAnonymous,
      };

      const result = await submitReport(payload);
      setSubmittedReport(result);
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit hazard report. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CitizenLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            Report Flood or Hazard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            AI-assisted incident reporting for Nagpur municipal dispatch
          </p>
        </div>

        {submittedReport ? (
          /* Submission Success & Hugging Face Vision AI Feedback Card */
          <div className="bg-white dark:bg-[#131B2A] border border-teal-500/30 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                Hazard Report #{submittedReport.id} Logged
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Submission Received!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your report has been dispatched to the municipal crisis control desk.
              </p>
            </div>

            {/* Hugging Face AI Analysis Card */}
            <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-teal-600 dark:text-teal-400">
                  <Bot className="w-4 h-4" />
                  <span>Hugging Face AI Vision Analysis</span>
                </div>
                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">
                  ResNet / Vision Transformer
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Waterlogging Detected:</span>
                  <strong className={submittedReport.waterlogging_detected ? "text-red-500" : "text-slate-700 dark:text-slate-300"}>
                    {submittedReport.waterlogging_detected ? "Confirmed (True)" : "Not Detected"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">AI Confidence:</span>
                  <strong className="text-teal-600 dark:text-teal-400">
                    {submittedReport.waterlogging_confidence
                      ? `${(submittedReport.waterlogging_confidence * 100).toFixed(1)}%`
                      : "AI Token Unavailable / Queued"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Assigned Ward:</span>
                  <strong className="text-slate-900 dark:text-white">
                    {submittedReport.zone ? `Ward #${submittedReport.zone}` : "Nagpur Central"}
                  </strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmittedReport(null);
                setPhotoFile(null);
                setPhotoPreview(null);
                setDescription("");
              }}
              className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-lg shadow-teal-600/30 active:scale-95 transition"
            >
              Submit Another Report
            </button>
          </div>
        ) : (
          /* Report Submission Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Category Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                1. Select Hazard Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {HAZARD_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3 rounded-2xl text-xs font-bold text-left flex items-center gap-2.5 transition border ${
                        isSelected
                          ? "bg-teal-500/10 dark:bg-teal-950/40 border-teal-500 text-teal-700 dark:text-teal-300 shadow-sm"
                          : "bg-white dark:bg-[#131B2A] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Photo Capture / Upload */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                2. Attach Evidence Photo
              </label>
              {photoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-48 flex items-center justify-center">
                  <img
                    src={photoPreview}
                    alt="Hazard Preview"
                    className="w-full h-44 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131B2A] hover:border-teal-500 transition cursor-pointer text-center space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Take Photo or Upload from Device
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-300">
                    JPG, PNG up to 10MB • Triggers AI Vision Validation
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* 3. Severity Level */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                3. Observed Severity Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SEVERITY_LEVELS.map((lvl) => {
                  const isSelected = severity === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSeverity(lvl.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-black border transition ${
                        isSelected
                          ? `${lvl.color} shadow-sm ring-2 ring-teal-500/20`
                          : "bg-white dark:bg-[#131B2A] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. GPS Coordinates */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  4. Location Coordinates (GPS)
                </label>
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={locating}
                  className="text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
                >
                  <Locate className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} />
                  <span>Auto-Detect GPS</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="Latitude (e.g. 21.1458)"
                  className="p-3 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:border-teal-500"
                  required
                />
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="Longitude (e.g. 79.0882)"
                  className="p-3 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>

            {/* 5. Description Textarea */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                5. Incident Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe landmark, water depth, traffic impediment, or safety risk..."
                className="w-full p-3 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 resize-none"
                required
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Submit Anonymously
                </span>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>

            {/* Prominent Teal Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-sm shadow-xl shadow-teal-600/30 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Processing AI Vision Verification...</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span>Submit Hazard for Verification</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </CitizenLayout>
  );
}
