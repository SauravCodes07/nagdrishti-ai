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
  Building,
} from "lucide-react";

// Nagpur municipal bounding box coordinates
export const NAGPUR_BOUNDS = {
  minLat: 20.90,
  maxLat: 21.40,
  minLng: 78.80,
  maxLng: 79.40,
};

export function isInsideNagpur(lat, lng) {
  const numLat = Number(lat);
  const numLng = Number(lng);
  return (
    numLat >= NAGPUR_BOUNDS.minLat &&
    numLat <= NAGPUR_BOUNDS.maxLat &&
    numLng >= NAGPUR_BOUNDS.minLng &&
    numLng <= NAGPUR_BOUNDS.maxLng
  );
}

export const POPULAR_NAGPUR_HUBS = [
  { name: "Zero Mile Stone", lat: 21.1458, lng: 79.0882, category: "Center" },
  { name: "Sitabuldi Interchange", lat: 21.1465, lng: 79.0825, category: "Transit" },
  { name: "Dharampeth Square", lat: 21.1472, lng: 79.0664, category: "West" },
  { name: "Sadar Residency Rd", lat: 21.1605, lng: 79.0830, category: "North" },
  { name: "Mahal Gandhi Gate", lat: 21.1470, lng: 79.1020, category: "East" },
  { name: "Lakadganj Square", lat: 21.1550, lng: 79.1300, category: "East" },
  { name: "Dhantoli Lokmat Sq", lat: 21.1330, lng: 79.0810, category: "Central" },
  { name: "Medical Square", lat: 21.1310, lng: 79.0980, category: "South" },
  { name: "Futala Lake Walkway", lat: 21.1530, lng: 79.0480, category: "West" },
  { name: "Wardha Rd Airport T1", lat: 21.0920, lng: 79.0630, category: "South" },
];

export default function LocationSearchInput({
  label,
  value,
  onChange,
  allowCurrentLocation = false,
  placeholder = "Search address or landmark in Nagpur...",
  dotColor = "teal", // "teal" | "red"
}) {
  const [query, setQuery] = useState(value?.name || "");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [boundsWarning, setBoundsWarning] = useState("");
  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync internal query when value prop changes externally
  useEffect(() => {
    if (value && value.name) {
      setQuery(value.name);
      if (value.lat && value.lng) {
        if (!isInsideNagpur(value.lat, value.lng)) {
          setBoundsWarning(
            `Coordinates (${Number(value.lat).toFixed(4)}, ${Number(value.lng).toFixed(4)}) are outside the supported Nagpur municipal area.`
          );
        } else {
          setBoundsWarning("");
        }
      }
    }
  }, [value]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchNominatim = useCallback(async (text) => {
    const cleanText = text.trim();
    if (!cleanText || cleanText.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    try {
      // 1. Primary query: OpenStreetMap Nominatim scoped to Nagpur area bounding box
      // viewbox=left,top,right,bottom (lng_min, lat_max, lng_max, lat_min)
      const primaryUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cleanText
      )}&viewbox=78.80,21.40,79.40,20.90&bounded=1&countrycodes=in&limit=6&addressdetails=1`;

      const response = await fetch(primaryUrl, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "NagDrishti-AI-Nagpur/1.0",
        },
      });

      let data = [];
      if (response.ok) {
        data = await response.json();
      }

      // 2. Fallback query: append ', Nagpur' if bounded query returns fewer than 2 results
      if (!data || data.length < 2) {
        try {
          const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            `${cleanText}, Nagpur, Maharashtra`
          )}&limit=5&addressdetails=1`;
          const fallbackRes = await fetch(fallbackUrl, {
            headers: {
              "Accept": "application/json",
              "User-Agent": "NagDrishti-AI-Nagpur/1.0",
            },
          });
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            if (Array.isArray(fallbackData)) {
              // Deduplicate by place_id
              const existingIds = new Set(data.map((item) => item.place_id));
              for (const item of fallbackData) {
                if (!existingIds.has(item.place_id)) {
                  data.push(item);
                }
              }
            }
          }
        } catch (_) {}
      }

      // Format results
      const formatted = (data || []).map((item) => {
        const parts = (item.display_name || "").split(",");
        const title = parts[0] || item.name || "Nagpur Location";
        const subtitle = parts.slice(1, 4).join(",").trim();

        return {
          id: item.place_id,
          name: title,
          fullAddress: item.display_name,
          subtitle: subtitle || "Nagpur, Maharashtra",
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type || "place",
        };
      });

      setResults(formatted);
      setIsOpen(true);
    } catch (err) {
      console.warn("Nominatim geocoding error:", err);
      // Filter popular hubs locally as offline fallback
      const fallbackLocal = POPULAR_NAGPUR_HUBS.filter((h) =>
        h.name.toLowerCase().includes(cleanText.toLowerCase())
      ).map((h) => ({
        id: `local-${h.name}`,
        name: h.name,
        subtitle: `${h.category} Zone, Nagpur`,
        lat: h.lat,
        lng: h.lng,
      }));
      setResults(fallbackLocal);
      setIsOpen(true);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    setBoundsWarning("");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text.length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        searchNominatim(text);
      }, 350);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelectLocation = (loc) => {
    setQuery(loc.name);
    setIsOpen(false);
    setResults([]);

    if (!isInsideNagpur(loc.lat, loc.lng)) {
      setBoundsWarning(
        `Selected location "${loc.name}" (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}) is outside supported Nagpur municipal area (20.90°N–21.40°N, 78.80°E–79.40°E).`
      );
    } else {
      setBoundsWarning("");
    }

    if (onChange) {
      onChange({
        name: loc.name,
        lat: Number(loc.lat),
        lng: Number(loc.lng),
        fullAddress: loc.fullAddress,
      });
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setBoundsWarning("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setBoundsWarning("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        if (!isInsideNagpur(userLat, userLng)) {
          setBoundsWarning(
            `Your current location (${userLat.toFixed(4)}, ${userLng.toFixed(4)}) is outside the supported Nagpur municipal area.`
          );
          setLocating(false);
          return;
        }

        // Try reverse geocoding for friendly name
        let locationName = `My Location (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`;
        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLng}`,
            {
              headers: {
                "Accept": "application/json",
                "User-Agent": "NagDrishti-AI-Nagpur/1.0",
              },
            }
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            const road = revData.address?.road || revData.address?.suburb || revData.address?.neighbourhood;
            if (road) {
              locationName = `Current Location: ${road}`;
            }
          }
        } catch (_) {}

        setQuery(locationName);
        if (onChange) {
          onChange({
            name: locationName,
            lat: userLat,
            lng: userLng,
          });
        }
        setLocating(false);
        setIsOpen(false);
      },
      (err) => {
        console.warn("Geolocation failed:", err);
        setBoundsWarning("Unable to retrieve your location. Please check browser permissions.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setBoundsWarning("");
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div ref={containerRef} className="space-y-1.5 relative w-full">
      {/* Label and GPS action */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1] flex items-center gap-1.5">
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
            className="text-[11px] font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Locate via GPS"
          >
            <Crosshair className={`w-3 h-3 ${locating ? "animate-spin" : ""}`} />
            <span>{locating ? "Acquiring GPS..." : "Use Current Location"}</span>
          </button>
        )}
      </div>

      {/* Input Field */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#0B0F17] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-normal focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6] transition"
        />

        <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
          {searching && <RefreshCw className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6] animate-spin" />}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bounds Warning Banner */}
      {boundsWarning && (
        <div className="p-2.5 rounded-xl bg-[#FEF3C7] dark:bg-amber-500/10 border border-[#F59E0B]/40 text-[#854D0E] dark:text-[#FDE68A] text-xs font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#F59E0B] mt-0.5" />
          <span>{boundsWarning}</span>
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1 space-y-1">
          <div className="px-3 py-1 text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider border-b border-[#E2E8F0] dark:border-[#243244]">
            Nagpur Places & Addresses
          </div>

          {results.map((item) => (
            <button
              key={item.id || `${item.lat}-${item.lng}`}
              type="button"
              onClick={() => handleSelectLocation(item)}
              className="w-full p-2.5 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-left flex items-start justify-between gap-2 transition cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                  {item.name}
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
                  {item.subtitle}
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#0F766E] dark:text-[#14B8A6] bg-[#CCFBF1] dark:bg-teal-500/15 px-1.5 py-0.5 rounded shrink-0">
                {Number(item.lat).toFixed(3)}, {Number(item.lng).toFixed(3)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Quick Landmark Suggestions below input */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium">Quick pick:</span>
        {POPULAR_NAGPUR_HUBS.slice(0, 4).map((hub) => (
          <button
            key={hub.name}
            type="button"
            onClick={() => handleSelectLocation(hub)}
            className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-[#F1F5F9] dark:bg-[#162235] hover:bg-[#CCFBF1] dark:hover:bg-teal-500/20 text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F766E] dark:hover:text-[#5EEAD4] border border-[#E2E8F0] dark:border-[#243244] transition cursor-pointer"
          >
            {hub.name.split(" ")[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
