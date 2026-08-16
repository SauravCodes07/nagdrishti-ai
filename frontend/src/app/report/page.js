"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { submitReport, getRiskZones } from "../../lib/api";
import {
  Camera,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  Crosshair,
  Sparkles,
  Info,
  ArrowLeft,
  X,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_LOCATIONS = [
  { name: "Sitabuldi (Central)", lat: 21.1465, lng: 79.0825 },
  { name: "Dharampeth (West)", lat: 21.1472, lng: 79.0664 },
  { name: "Lakadganj (East)", lat: 21.1550, lng: 79.1300 },
  { name: "Mahal (South-East)", lat: 21.1430, lng: 79.1080 },
  { name: "Sadar (North)", lat: 21.1605, lng: 79.0830 },
  { name: "Mankapur (North-West)", lat: 21.1850, lng: 79.0720 },
];

export default function ReportHazardPage() {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [lat, setLat] = useState(21.1458);
  const [lng, setLng] = useState(79.0882);
  const [selectedPreset, setSelectedPreset] = useState("Sitabuldi (Central)");
  const [description, setDescription] = useState("");
  const [hazardType, setHazardType] = useState("Severe Waterlogging");

  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fileInputRef = useRef(null);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const detectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your device browser.");
      return;
    }
    setLocating(true);
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(5)));
        setLng(Number(pos.coords.longitude.toFixed(5)));
        setSelectedPreset("GPS Device Location");
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setErrorMsg("Could not detect GPS location. Selected closest Nagpur ward.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handlePresetChange = (presetName) => {
    setSelectedPreset(presetName);
    const found = PRESET_LOCATIONS.find((p) => p.name === presetName);
    if (found) {
      setLat(found.lat);
      setLng(found.lng);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const fullDesc = `[${hazardType}] ${description}`.trim();
      const res = await submitReport({
        lat,
        lng,
        description: fullDesc,
        photoFile,
      });
      setResult(res);
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit hazard report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CitizenLayout>
      <div className="p-4 space-y-4">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-[#111111] tracking-tight">
              Report Flood Hazard
            </h1>
            <p className="text-xs text-[#666666] font-medium">
              Submit photo & location for instant AI detection & municipal response
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-[#FFC107]/20 flex items-center justify-center text-[#111111]">
            <AlertTriangle className="w-4 h-4 text-[#FF8A00]" />
          </div>
        </div>

        {/* Success / Result View */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#111111]">
                    Hazard Report Logged!
                  </h3>
                  <div className="text-xs text-[#666666]">
                    Report #{result.id || "NMC-LIVE"} • Status: {result.verification_status || "Pending"}
                  </div>
                </div>
              </div>

              {/* Hugging Face AI Detection Result Card */}
              <div className="p-3.5 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[#111111]">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF8A00]" />
                    <span>Hugging Face AI Vision Engine</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      result.ai_confidence
                        ? result.is_waterlogged
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                        : "bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    {result.ai_confidence
                      ? result.is_waterlogged
                        ? "Waterlogging Confirmed"
                        : "No Water Detected"
                      : "AI Token Queued"}
                  </span>
                </div>

                {result.ai_confidence ? (
                  <div className="space-y-1 text-[#666666]">
                    <div className="flex justify-between">
                      <span>Model Confidence:</span>
                      <span className="font-bold text-[#111111]">
                        {(result.ai_confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    {result.water_severity && (
                      <div className="flex justify-between">
                        <span>Severity Estimate:</span>
                        <span className="font-bold text-[#111111] capitalize">
                          {result.water_severity}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-[#666666]">
                    Photo recorded and queued for municipal officer verification. Zone risk weights automatically adjusted.
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  href="/map"
                  className="flex-1 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold text-center hover:bg-black transition"
                >
                  View on Map
                </Link>
                <button
                  onClick={() => {
                    setResult(null);
                    handleRemovePhoto();
                    setDescription("");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] text-xs font-bold text-[#111111] hover:bg-neutral-100 transition"
                >
                  Submit Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Form */}
        {!result && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. Photo Upload Box */}
            <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-xs space-y-3">
              <label className="text-xs font-black text-[#111111] block">
                1. Incident Photo <span className="text-[#666666] font-normal">(Recommended)</span>
              </label>

              {photoPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-[#E5E5E5] max-h-52 bg-black flex items-center justify-center">
                  <img
                    src={photoPreview}
                    alt="Hazard preview"
                    className="w-full h-full object-cover max-h-52"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E5E5E5] hover:border-[#FFC107] transition-all rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-[#F7F7F7] hover:bg-amber-50/20"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E5E5] text-[#FF8A00] flex items-center justify-center mb-2 shadow-2xs">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#111111]">
                    Tap to upload or take a photo
                  </span>
                  <span className="text-[10px] text-[#666666] mt-0.5">
                    JPG, PNG up to 10MB • AI scans flood level
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {/* 2. Hazard Type Selector */}
            <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-xs space-y-3">
              <label className="text-xs font-black text-[#111111] block">
                2. Hazard Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Severe Waterlogging",
                  "Drain Overflow / Manhole",
                  "Road Block / Tree Fall",
                  "Electrical Wire Hazard",
                ].map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setHazardType(type)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold text-left transition border ${
                      hazardType === type
                        ? "bg-[#FFC107] text-[#111111] border-[#FFC107] shadow-xs"
                        : "bg-[#F7F7F7] text-[#666666] border-[#E5E5E5] hover:bg-neutral-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Location Selector */}
            <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#111111]">
                  3. Location in Nagpur
                </label>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locating}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#FF8A00] hover:underline"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} />
                  <span>{locating ? "Detecting..." : "Detect GPS"}</span>
                </button>
              </div>

              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full text-xs font-semibold bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-3 text-[#111111] focus:outline-hidden focus:border-[#FFC107]"
              >
                {PRESET_LOCATIONS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.lat.toFixed(4)}, {p.lng.toFixed(4)})
                  </option>
                ))}
                {selectedPreset === "GPS Device Location" && (
                  <option value="GPS Device Location">
                    GPS Device Location ({lat}, {lng})
                  </option>
                )}
              </select>
            </div>

            {/* 4. Description (Optional) */}
            <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-xs space-y-2">
              <label className="text-xs font-black text-[#111111] block">
                4. Description / Landmark <span className="text-[#666666] font-normal">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 2ft standing water near metro pillar #45, traffic stranded..."
                rows={2}
                className="w-full text-xs bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-3 text-[#111111] placeholder:text-[#999999] focus:outline-hidden focus:border-[#FFC107]"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* THE SINGLE PRIMARY ACTION CTA ON THIS SCREEN */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#FF8A00] hover:bg-[#E67C00] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting & Analyzing...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Submit Hazard Report</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </CitizenLayout>
  );
}
