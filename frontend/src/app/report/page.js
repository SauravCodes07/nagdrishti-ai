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
  ChevronRight,
  Info,
} from "lucide-react";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { submitReport } from "../../lib/api";

const HAZARD_CATEGORIES = [
  { id: "waterlogging", label: "Waterlogging", icon: "🌊", desc: "Submerged roadway or pooling" },
  { id: "pothole", label: "Pothole / Road Damage", icon: "🕳️", desc: "Damaged asphalt or cave-in" },
  { id: "underpass", label: "Flooded Underpass", icon: "🚗", desc: "Deep water under bridge/culvert" },
  { id: "drain", label: "Blocked Storm Drain", icon: "🚧", desc: "Clogged municipal inlet/gutter" },
  { id: "fallen_tree", label: "Fallen Tree / Wire", icon: "⚡", desc: "Live wire or road blockage" },
];

const SEVERITY_LEVELS = [
  { id: "Low", label: "Low", color: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
  { id: "Medium", label: "Medium", color: "border-amber-500 text-amber-400 bg-amber-500/10" },
  { id: "High", label: "High", color: "border-orange-500 text-orange-400 bg-orange-500/10" },
  { id: "Severe", label: "Severe", color: "border-red-500 text-red-400 bg-red-500/10" },
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
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-teal-400 tracking-wider">
              <Camera className="w-3.5 h-3.5" />
              <span>Crowdsourced Incident Dispatch</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              Report Flood, Waterlogging or Road Hazard
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Your evidence photo triggers Hugging Face Vision AI to verify waterpooling and prioritize municipal QRT deployment.
          </p>
        </div>

        {submittedReport ? (
          /* Submission Success & Hugging Face Vision AI Feedback Card */
          <div className="bg-[#131B2A] border border-teal-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto shadow-md border border-teal-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="text-center space-y-1.5 max-w-lg mx-auto">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Hazard Report #{submittedReport.id} Registered
              </span>
              <h2 className="text-2xl font-black text-white">
                Incident Successfully Logged!
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your report has been auto-assigned to the Nagpur Municipal Disaster Desk and injected into the live city crisis model.
              </p>
            </div>

            {/* Hugging Face AI Analysis Card */}
            <div className="bg-[#0B0F17] border border-[#1E293B] rounded-3xl p-5 space-y-3 max-w-lg mx-auto">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-teal-400">
                  <Bot className="w-4 h-4" />
                  <span>Hugging Face AI Vision Analysis</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400">
                  ResNet / Vision Transformer
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Waterlogging Detected:</span>
                  <strong className={submittedReport.waterlogging_detected ? "text-red-400" : "text-slate-200"}>
                    {submittedReport.waterlogging_detected ? "Confirmed (True)" : "Not Detected"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AI Model Confidence:</span>
                  <strong className="text-teal-400">
                    {submittedReport.waterlogging_confidence
                      ? `${(submittedReport.waterlogging_confidence * 100).toFixed(1)}%`
                      : "Queued for Batch Inference"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Municipal Ward:</span>
                  <strong className="text-white">
                    {submittedReport.zone_name || (submittedReport.zone ? `Ward #${submittedReport.zone}` : "Nagpur Central")}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Moderation Status:</span>
                  <strong className="text-amber-400">
                    {submittedReport.verification_status || "Pending Officer Review"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="max-w-xs mx-auto">
              <button
                onClick={() => {
                  setSubmittedReport(null);
                  setPhotoFile(null);
                  setPhotoPreview(null);
                  setDescription("");
                }}
                className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-lg shadow-teal-600/30 active:scale-95 transition"
              >
                Submit Another Hazard Report
              </button>
            </div>
          </div>
        ) : (
          /* Structured 2-Column Responsive Form */
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Form Column */}
            <div className="lg:col-span-7 space-y-5">
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Category Selector */}
              <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-3">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  <span>1. Select Hazard Category</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {HAZARD_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3.5 rounded-2xl text-xs font-bold text-left flex items-start gap-3 transition border ${
                          isSelected
                            ? "bg-teal-500/10 border-teal-500 text-teal-300 shadow-md ring-1 ring-teal-500/30"
                            : "bg-[#0B0F17] border-[#1E293B] text-slate-300 hover:bg-[#1E293B]"
                        }`}
                      >
                        <span className="text-xl mt-0.5">{cat.icon}</span>
                        <div>
                          <div className="font-black text-white">{cat.label}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{cat.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Photo Capture / Upload */}
              <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-3">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  <span>2. Attach Evidence Photo (Triggers AI Vision)</span>
                </label>
                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#1E293B] bg-black max-h-56 flex items-center justify-center">
                    <img
                      src={photoPreview}
                      alt="Hazard Preview"
                      className="w-full h-52 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/90 text-white hover:bg-red-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-[#334155] bg-[#0B0F17] hover:border-teal-500 transition cursor-pointer text-center space-y-2 group">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">
                        Take Photo or Browse Device
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        JPG, PNG up to 10MB • Used for automated waterlogging depth detection
                      </div>
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
              <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-3">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  <span>3. Observed Hazard Severity</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SEVERITY_LEVELS.map((lvl) => {
                    const isSelected = severity === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setSeverity(lvl.id)}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition ${
                          isSelected
                            ? `${lvl.color} shadow-sm ring-1 ring-teal-500/30`
                            : "bg-[#0B0F17] border-[#1E293B] text-slate-400 hover:bg-[#1E293B]"
                        }`}
                      >
                        {lvl.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-5 space-y-5">
              {/* 4. GPS Coordinates */}
              <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                    <span>4. GPS Coordinates</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={locating}
                    className="text-[11px] font-bold text-teal-400 flex items-center gap-1 hover:underline"
                  >
                    <Locate className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} />
                    <span>Auto-Detect GPS</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Latitude</span>
                    <input
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="21.1458"
                      className="w-full p-3 rounded-2xl bg-[#0B0F17] border border-[#1E293B] text-xs font-semibold text-white focus:outline-none focus:border-teal-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Longitude</span>
                    <input
                      type="text"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="79.0882"
                      className="w-full p-3 rounded-2xl bg-[#0B0F17] border border-[#1E293B] text-xs font-semibold text-white focus:outline-none focus:border-teal-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 5. Description Textarea */}
              <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-3">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  <span>5. Incident Description</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe landmark, water depth estimate, blocked traffic, or nearby electric hazards..."
                  className="w-full p-3 rounded-2xl bg-[#0B0F17] border border-[#1E293B] text-xs font-medium text-white focus:outline-none focus:border-teal-500 resize-none placeholder:text-slate-500 leading-relaxed"
                  required
                />
              </div>

              {/* Anonymous Toggle */}
              <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Submit As Anonymous Citizen
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                />
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-sm shadow-xl shadow-teal-600/30 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Processing Vision AI Inference...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span>Submit Hazard for Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </CitizenLayout>
  );
}
