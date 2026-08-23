"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Search,
  Crosshair,
  X,
  RefreshCw,
  AlertCircle,
  Check,
  Shield,
  Compass,
  Navigation,
} from "lucide-react";
import {
  searchLocations,
  getGeographicCoverage,
  getNmcWardInfo,
  getCurrentGpsLocation,
  isInsideNagpurDistrict,
  isInsideNmc,
  isWithinServiceRegion,
  POPULAR_NAGPUR_HUBS,
  GEOGRAPHIC_COVERAGE_STATE,
} from "../lib/geoService";

export {
  POPULAR_NAGPUR_HUBS,
  getGeographicCoverage,
  getNmcWardInfo,
  isInsideNagpurDistrict,
  isInsideNmc,
  isWithinServiceRegion,
  GEOGRAPHIC_COVERAGE_STATE,
};

export default function LocationSearchInput({
  label,
  value,
  onChange,
  allowCurrentLocation = false,
  placeholder = "Search address, square, village or landmark (e.g. Yerla, Katol, Sitabuldi)...",
  dotColor = "teal", // "teal" | "red"
}) {
  const [query, setQuery] = useState(value?.name || "");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null); // { type: 'info' | 'warn' | 'error', text: string }
  const [gpsAccuracy, setGpsAccuracy] = useState(null);

  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Sync internal query and coverage notice when value prop changes externally
  useEffect(() => {
    if (value) {
      if (value.name && value.name !== query) {
        setQuery(value.name);
      }
      if (value.lat && value.lng) {
        const coverage = getGeographicCoverage(value.lat, value.lng, value.rawAddressDetails || null);
        setStatusNotice(coverage.notice);
      }
    }
  }, [value]);

  // Dismiss dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup pending requests on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const performSearch = useCallback(async (text) => {
    const cleanText = text.trim();
    if (!cleanText || cleanText.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSearching(true);
    setStatusNotice(null);

    try {
      const data = await searchLocations(cleanText, { signal: controller.signal, limit: 8 });
      setResults(data);
      setIsOpen(true);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.warn("[LocationSearchInput] Search error:", err);
      }
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    setStatusNotice(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text.length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(text);
      }, 300);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelectLocation = (loc) => {
    setQuery(loc.name);
    setIsOpen(false);
    setResults([]);

    const coverage = getGeographicCoverage(loc.lat, loc.lng, loc.rawAddressDetails || null);
    setStatusNotice(coverage.notice);

    if (onChange) {
      onChange({
        name: loc.name,
        lat: Number(loc.lat),
        lng: Number(loc.lng),
        fullAddress: loc.fullAddress || loc.name,
        coverageState: coverage.coverageState,
        insideDistrict: coverage.insideDistrict,
        insideNmc: coverage.insideNmc,
        wardNumber: coverage.wardNumber,
        wardName: coverage.wardName,
        zoneName: coverage.zoneName,
        statusText: coverage.statusText,
        badgeText: coverage.badgeText,
        riskIntelligenceLevel: coverage.riskIntelligenceLevel,
        source: loc.source || "search",
        accuracy: null,
      });
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    setStatusNotice(null);
    setGpsAccuracy(null);

    try {
      const loc = await getCurrentGpsLocation({ enableHighAccuracy: true, timeout: 10000 });
      setQuery(loc.name);
      setGpsAccuracy(loc.accuracyText);

      if (loc.isLowAccuracy) {
        setStatusNotice({
          type: "warn",
          text: `GPS accuracy is currently low (±${loc.accuracy} m). Move outdoors or enable precise location.`,
        });
      } else {
        setStatusNotice(loc.notice);
      }

      if (onChange) {
        onChange({
          name: loc.name,
          lat: loc.lat,
          lng: loc.lng,
          fullAddress: loc.fullAddress,
          coverageState: loc.coverageState,
          insideDistrict: loc.insideDistrict,
          insideNmc: loc.insideNmc,
          wardNumber: loc.wardNumber,
          wardName: loc.wardName,
          zoneName: loc.zoneName,
          statusText: loc.statusText,
          badgeText: loc.badgeText,
          riskIntelligenceLevel: loc.riskIntelligenceLevel,
          source: "gps",
          accuracy: loc.accuracy,
        });
      }
    } catch (err) {
      setStatusNotice({
        type: "error",
        text: err.message || "Failed to detect current GPS location.",
      });
    } finally {
      setLocating(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setStatusNotice(null);
    setGpsAccuracy(null);
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div ref={containerRef} className="relative space-y-1.5 w-full">
      {/* Label and Quick Utilities */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              dotColor === "red" ? "bg-[#DC2626]" : "bg-[#0F766E] dark:bg-[#14B8A6]"
            }`}
          />
          <span>{label}</span>
        </label>

        {allowCurrentLocation && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="text-[11px] font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
            title="Detect GPS coordinates from device"
          >
            <Crosshair className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} />
            <span>{locating ? "Acquiring GPS..." : "Use Current Location"}</span>
          </button>
        )}
      </div>

      {/* Input Field */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-[#64748B] dark:text-[#94A3B8] pointer-events-none">
          {searching ? (
            <RefreshCw className="w-4 h-4 animate-spin text-[#0F766E] dark:text-[#14B8A6]" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
            else if (!query) {
              // Pre-populate with top popular hubs across Nagpur district
              setResults(POPULAR_NAGPUR_HUBS.slice(0, 7));
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-9 bg-[#FFFFFF] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs sm:text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6] transition shadow-xs"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-1 rounded-md text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition cursor-pointer"
            title="Clear input"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* GPS Accuracy Indicator & Status Notices */}
      {gpsAccuracy && (
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#0F766E] dark:text-[#14B8A6]">
          <Crosshair className="w-3 h-3" />
          <span>{gpsAccuracy}</span>
        </div>
      )}

      {statusNotice && (
        <div
          className={`p-2.5 rounded-lg text-xs flex items-start gap-2 border ${
            statusNotice.type === "error"
              ? "bg-[#FEF2F2] dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-[#991B1B] dark:text-[#F87171]"
              : statusNotice.type === "warn"
              ? "bg-[#FEF9C3] dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-[#854D0E] dark:text-[#FDE047]"
              : "bg-[#F0FDFA] dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/30 text-[#0F766E] dark:text-[#5EEAD4]"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span className="leading-tight">{statusNotice.text}</span>
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {searching && results.length === 0 && (
            <div className="p-4 text-center text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0F766E] dark:text-[#14B8A6]" />
              <span>Searching Nagpur District geocoder...</span>
            </div>
          )}

          {!searching && results.length === 0 && (
            <div className="p-4 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
              No locations found matching &quot;{query}&quot;. Try place names like &quot;Yerla&quot;, &quot;Katol Road&quot;, &quot;Sitabuldi&quot;, or &quot;Ramtek&quot;.
            </div>
          )}

          {results.length > 0 && (
            <div className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
              <div className="px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#0B0F17] text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                <span>Nagpur District Results</span>
                <span>{results.length} found</span>
              </div>

              {results.map((loc) => {
                const isSelected = value && value.lat === loc.lat && value.lng === loc.lng;
                const isUrban = loc.coverageState === "NAGPUR_URBAN" || loc.insideNmc;
                const isRural = loc.coverageState === "NAGPUR_RURAL" || (loc.insideDistrict && !loc.insideNmc);

                return (
                  <button
                    key={loc.id || `${loc.lat}_${loc.lng}`}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    className={`w-full p-3 text-left hover:bg-[#F8FAFC] dark:hover:bg-[#162235] transition flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected ? "bg-[#CCFBF1]/40 dark:bg-teal-500/10" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isUrban
                            ? "bg-[#DCFCE7] dark:bg-emerald-500/20 text-[#166534] dark:text-[#4ADE80]"
                            : isRural
                            ? "bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4]"
                            : "bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]"
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">
                            {loc.name}
                          </span>
                          {isUrban ? (
                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-[#DCFCE7] text-[#166534] dark:bg-emerald-500/20 dark:text-[#4ADE80] border border-emerald-500/20">
                              {loc.wardNumber ? `${loc.wardNumber} • ` : ""}NMC
                            </span>
                          ) : isRural ? (
                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-[#CCFBF1] text-[#0F766E] dark:bg-teal-500/20 dark:text-[#5EEAD4] border border-teal-500/20">
                              Nagpur Rural
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium uppercase px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#475569] dark:bg-slate-800 dark:text-[#CBD5E1] border border-slate-300 dark:border-slate-700">
                              External Area
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                          {loc.subtitle || loc.fullAddress}
                        </p>
                      </div>
                    </div>

                    {loc.distanceKm !== undefined && (
                      <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] shrink-0">
                        {loc.distanceKm} km
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
