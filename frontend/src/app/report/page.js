"use client";

import { useState } from "react";
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Bot,
  LocateFixed,
  X,
  Sparkles,
  Scan,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { submitReport } from "../../lib/api";
import {
  ScrollReveal,
  HoverLiftCard,
  MagneticButton,
  AnimatedCounter,
} from "../../components/motion";

import LocationSearchInput from "../../components/LocationSearchInput";
import { getCurrentGpsLocation, getNmcWardInfo } from "../../lib/geoService";

const HAZARD_CATEGORIES = [
  { id: "waterlogging", label: "Waterlogging", icon: "🌊" },
  { id: "pothole", label: "Severe Pothole", icon: "🕳️" },
  { id: "overflow", label: "Drain Overflow", icon: "⚠️" },
  { id: "blockage", label: "Road Blockage", icon: "🚧" },
];

export default function ReportHazardPage() {
  const [selectedLocation, setSelectedLocation] = useState({
    name: "Dharampeth Square",
    lat: 21.1472,
    lng: 79.0664,
  });
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

  const handleLocationChange = (loc) => {
    if (loc && loc.lat && loc.lng) {
      setLat(loc.lat);
      setLng(loc.lng);
      setSelectedLocation(loc);
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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Report a Hazard
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
            Submit geotagged photo evidence of waterlogging or damaged roads for automated Vision AI analysis and municipal verification.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!detectionResult ? (
            <motion.form
              key="report-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-5"
            >
              {/* Category Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
                  1. Hazard Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {HAZARD_CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-1.5 cursor-pointer ${
                        category === cat.id
                          ? "bg-[#CCFBF1] dark:bg-teal-500/15 border-[#0F766E] dark:border-[#14B8A6] text-[#0F766E] dark:text-[#5EEAD4]"
                          : "bg-[#F8FAFC] dark:bg-[#0B0F17] border-[#E2E8F0] dark:border-[#243244] text-[#475569] dark:text-[#CBD5E1] hover:border-[#CBD5E1] dark:hover:border-[#334155]"
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-xs font-semibold">{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Location Picker */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
                  2. Incident Location & Ward
                </label>
                <LocationSearchInput
                  label="Search Nagpur Location or Use GPS"
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  allowCurrentLocation={true}
                  placeholder="Search landmark, ward, or street in Nagpur..."
                  dotColor="teal"
                />
              </div>

              {/* Photo Upload Input with AI Scanning Overlay */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
                  3. Photo Evidence
                </label>

                <div className="relative border-2 border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-xl p-5 text-center hover:border-[#0F766E] dark:hover:border-[#14B8A6] transition-colors bg-[#F8FAFC] dark:bg-[#0B0F17] overflow-hidden">
                  {photoPreview ? (
                    <div className="relative rounded-lg overflow-hidden max-h-56 flex items-center justify-center bg-black">
                      <img src={photoPreview} alt="Evidence" className="max-h-56 w-auto object-contain" />
                      
                      {/* AI Scanning Beam while submitting */}
                      {submitting && (
                        <motion.div
                          animate={{ top: ["0%", "92%", "0%"] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2DD4BF] to-transparent shadow-[0_0_12px_#14B8A6] pointer-events-none"
                        />
                      )}

                      {!submitting && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview(null);
                          }}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-[#DC2626] transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-3">
                      <div className="mx-auto w-12 h-12 rounded-xl bg-[#CCFBF1] dark:bg-teal-500/15 flex items-center justify-center text-[#0F766E] dark:text-[#5EEAD4] mb-2 border border-[#0F766E]/20">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] block">
                        Click to upload photo
                      </span>
                      <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                        JPEG, PNG, or WebP road evidence
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
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
                  4. Location Context & Notes
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Railway underpass submerged ~2 feet deep. Vehicles turning back..."
                  rows={3}
                  className="w-full text-xs font-normal bg-[#FFFFFF] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-3 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6] placeholder:text-[#94A3B8] resize-none leading-relaxed"
                />
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anon"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-[#0F766E] rounded"
                />
                <label htmlFor="anon" className="text-xs text-[#475569] dark:text-[#CBD5E1] font-normal cursor-pointer">
                  Submit anonymously (omit personal contact details from public municipal logs)
                </label>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="p-3.5 rounded-xl bg-[#FEF2F2] dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs font-medium text-[#991B1B] dark:text-[#F87171] flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Action */}
              <MagneticButton>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Upload className={`w-4 h-4 ${submitting ? "animate-spin" : ""}`} />
                  <span>{submitting ? "Analyzing Photo with Vision AI..." : "Submit Hazard Report"}</span>
                </button>
              </MagneticButton>
            </motion.form>
          ) : (
            /* Submission Feedback & Vision AI Results */
            <motion.div
              key="results-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-5"
            >
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#DCFCE7] dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] dark:text-[#4ADE80] shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    Hazard Report #{detectionResult.id} Registered
                  </h3>
                  <p className="text-xs text-[#166534] dark:text-[#86EFAC] mt-0.5">
                    Assigned to <strong className="text-[#0F766E] dark:text-[#5EEAD4]">{detectionResult.zone_name || "Nagpur City"}</strong>.
                  </p>
                </div>
              </div>

              {/* Vision AI Results Box */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] space-y-3">
                <div className="flex items-center gap-2 text-[#0F766E] dark:text-[#14B8A6]">
                  <Bot className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Vision AI Detection Results
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] flex items-center justify-between">
                    <span className="text-[#475569] dark:text-[#CBD5E1] font-medium">Pothole Hazard:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        detectionResult.pothole_detected
                          ? "bg-[#FEE2E2] text-[#991B1B]"
                          : "bg-[#DCFCE7] text-[#166534]"
                      }`}
                    >
                      {detectionResult.pothole_detected ? "DETECTED" : "CLEAR"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] flex items-center justify-between">
                    <span className="text-[#475569] dark:text-[#CBD5E1] font-medium">Waterlogging:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        detectionResult.waterlogging_detected
                          ? "bg-[#FEE2E2] text-[#991B1B]"
                          : "bg-[#DCFCE7] text-[#166534]"
                      }`}
                    >
                      {detectionResult.waterlogging_detected ? "CONFIRMED" : "CLEAR"}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#111C2E] text-xs flex justify-between items-center border border-[#E2E8F0] dark:border-[#243244]">
                  <span className="text-[#475569] dark:text-[#CBD5E1]">Verification Status:</span>
                  <span className="font-semibold text-[#0F766E] dark:text-[#14B8A6]">
                    {detectionResult.verification_status || "Pending Verification"}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setDetectionResult(null);
                  setPhotoFile(null);
                  setPhotoPreview(null);
                  setDescription("");
                }}
                className="w-full h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs transition cursor-pointer shadow-sm"
              >
                Submit Another Report
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CitizenLayout>
  );
}
