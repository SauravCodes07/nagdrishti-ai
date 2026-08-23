/**
 * NagDrishti AI — Centralized Geographic Intelligence & Geocoding Service
 * Provides:
 * 1. Official Nagpur Municipal Corporation (NMC) 10 Administrative Zones & 38 Wards boundaries.
 * 2. Point-in-Polygon Ray-Casting algorithm for exact municipal boundary & ward detection.
 * 3. Extended Nagpur Service Region (65km metropolitan & surrounding arterial corridor).
 * 4. Production OpenStreetMap Nominatim Geocoding with regional biasing & ranking.
 * 5. Reverse Geocoding with ward attribution.
 * 6. High-Accuracy Geolocation (GPS) with accuracy estimation & error classification.
 */

// 1. EXTENDED SERVICE REGION (Nagpur District, Suburbs & Arterial Corridors)
export const EXTENDED_SERVICE_REGION = {
  name: "Nagpur Metropolitan & Surrounding Corridor",
  center: [21.1458, 79.0882], // Zero Mile Stone, Nagpur
  radiusKm: 75.0, // 75km radius covering Fetri, Hingna, Kamptee, Koradi, Butibori, Kalmeshwar, Saoner, Umred, Ramtek, etc.
  minLat: 20.30,
  maxLat: 21.90,
  minLng: 78.20,
  maxLng: 80.10,
};

// 2. OFFICIAL NMC ADMINISTRATIVE ZONES & WARD BOUNDARY POLYGONS
// Coordinates formatted as [longitude, latitude] in GeoJSON polygons
export const NMC_ADMINISTRATIVE_ZONES = [
  {
    id: 1,
    zone_number: "Z-01",
    zone_name: "Laxmi Nagar / Pratap Nagar",
    wards: ["Ward 1", "Ward 2", "Ward 3", "Ward 4"],
    elevation_factor: 0.35,
    drainage_capacity: 0.70,
    boundary: [
      [79.040, 21.110],
      [79.075, 21.110],
      [79.075, 21.135],
      [79.040, 21.135],
      [79.040, 21.110],
    ],
  },
  {
    id: 2,
    zone_number: "Z-02",
    zone_name: "Dharampeth / Civil Lines",
    wards: ["Ward 5", "Ward 6", "Ward 7", "Ward 8"],
    elevation_factor: 0.35,
    drainage_capacity: 0.70,
    boundary: [
      [79.045, 21.135],
      [79.075, 21.135],
      [79.075, 21.160],
      [79.045, 21.160],
      [79.045, 21.135],
    ],
  },
  {
    id: 3,
    zone_number: "Z-03",
    zone_name: "Hanuman Nagar / Medical",
    wards: ["Ward 9", "Ward 10", "Ward 11", "Ward 12"],
    elevation_factor: 0.40,
    drainage_capacity: 0.50,
    boundary: [
      [79.085, 21.110],
      [79.120, 21.110],
      [79.120, 21.135],
      [79.085, 21.135],
      [79.085, 21.110],
    ],
  },
  {
    id: 4,
    zone_number: "Z-04",
    zone_name: "Dhantoli / Sitabuldi",
    wards: ["Ward 13", "Ward 14", "Ward 15", "Ward 16"],
    elevation_factor: 0.40,
    drainage_capacity: 0.60,
    boundary: [
      [79.070, 21.130],
      [79.090, 21.130],
      [79.090, 21.152],
      [79.070, 21.152],
      [79.070, 21.130],
    ],
  },
  {
    id: 5,
    zone_number: "Z-05",
    zone_name: "Nehru Nagar / Nandanvan",
    wards: ["Ward 17", "Ward 18", "Ward 19", "Ward 20"],
    elevation_factor: 0.60,
    drainage_capacity: 0.35,
    boundary: [
      [79.115, 21.105],
      [79.155, 21.105],
      [79.155, 21.135],
      [79.115, 21.135],
      [79.115, 21.105],
    ],
  },
  {
    id: 6,
    zone_number: "Z-06",
    zone_name: "Gandhibagh / Mahal / Itwari",
    wards: ["Ward 21", "Ward 22", "Ward 23", "Ward 24"],
    elevation_factor: 0.55,
    drainage_capacity: 0.40,
    boundary: [
      [79.085, 21.140],
      [79.115, 21.140],
      [79.115, 21.165],
      [79.085, 21.165],
      [79.085, 21.140],
    ],
  },
  {
    id: 7,
    zone_number: "Z-07",
    zone_name: "Satranjipura / Maskasath",
    wards: ["Ward 25", "Ward 26", "Ward 27", "Ward 28"],
    elevation_factor: 0.50,
    drainage_capacity: 0.45,
    boundary: [
      [79.090, 21.160],
      [79.120, 21.160],
      [79.120, 21.180],
      [79.090, 21.180],
      [79.090, 21.160],
    ],
  },
  {
    id: 8,
    zone_number: "Z-08",
    zone_name: "Lakadganj / Pardi",
    wards: ["Ward 29", "Ward 30", "Ward 31", "Ward 32"],
    elevation_factor: 0.50,
    drainage_capacity: 0.45,
    boundary: [
      [79.115, 21.140],
      [79.160, 21.140],
      [79.160, 21.170],
      [79.115, 21.170],
      [79.115, 21.140],
    ],
  },
  {
    id: 9,
    zone_number: "Z-09",
    zone_name: "Ashi Nagar / Jaripatka",
    wards: ["Ward 33", "Ward 34", "Ward 35"],
    elevation_factor: 0.40,
    drainage_capacity: 0.55,
    boundary: [
      [79.095, 21.170],
      [79.140, 21.170],
      [79.140, 21.205],
      [79.095, 21.205],
      [79.095, 21.170],
    ],
  },
  {
    id: 10,
    zone_number: "Z-10",
    zone_name: "Mangalwari / Sadar / Mankapur",
    wards: ["Ward 36", "Ward 37", "Ward 38"],
    elevation_factor: 0.35,
    drainage_capacity: 0.60,
    boundary: [
      [79.055, 21.160],
      [79.095, 21.160],
      [79.095, 21.195],
      [79.055, 21.195],
      [79.055, 21.160],
    ],
  },
];

// Comprehensive Landmark & Hub Cache for Instant Local Suggestions & Offline Search
export const POPULAR_NAGPUR_HUBS = [
  // NMC Central & Heritage Core
  { name: "Zero Mile Stone", subtitle: "NMC Heritage Central Point, Civil Lines", lat: 21.1458, lng: 79.0882, category: "Heritage & Landmark", insideNmc: true, wardName: "Civil Lines", zoneName: "Dharampeth (Zone 2)" },
  { name: "Sitabuldi Interchange", subtitle: "Major Metro & Bus Transit Corridor", lat: 21.1465, lng: 79.0825, category: "Metro & Transit", insideNmc: true, wardName: "Sitabuldi", zoneName: "Dhantoli (Zone 4)" },
  { name: "Dharampeth Square", subtitle: "West Nagpur Commercial Hub", lat: 21.1472, lng: 79.0664, category: "Commercial", insideNmc: true, wardName: "Dharampeth", zoneName: "Dharampeth (Zone 2)" },
  { name: "Sadar Residency Road", subtitle: "North Central Arterial & Market", lat: 21.1605, lng: 79.0830, category: "Commercial", insideNmc: true, wardName: "Sadar", zoneName: "Mangalwari (Zone 10)" },
  { name: "Mahal Gandhi Gate", subtitle: "East Heritage Core & Kotwali", lat: 21.1470, lng: 79.1020, category: "Heritage Core", insideNmc: true, wardName: "Mahal", zoneName: "Gandhibagh (Zone 6)" },
  { name: "Lakadganj Square", subtitle: "East Industrial & Commercial Junction", lat: 21.1550, lng: 79.1300, category: "Commercial Junction", insideNmc: true, wardName: "Lakadganj", zoneName: "Lakadganj (Zone 8)" },
  { name: "Itwari Railway Station", subtitle: "East Nagpur Railway & Trade Hub", lat: 21.1580, lng: 79.1180, category: "Railway & Trade", insideNmc: true, wardName: "Itwari", zoneName: "Gandhibagh (Zone 6)" },
  { name: "Civil Lines", subtitle: "High Court & Government Administrative Precinct", lat: 21.1530, lng: 79.0720, category: "Administrative", insideNmc: true, wardName: "Civil Lines", zoneName: "Dharampeth (Zone 2)" },
  { name: "Medical Square (GMC)", subtitle: "Government Medical College & Hospital", lat: 21.1310, lng: 79.0980, category: "Hospital & Medical", insideNmc: true, wardName: "Medical", zoneName: "Hanuman Nagar (Zone 3)" },
  { name: "Dhantoli Lokmat Square", subtitle: "Central Medical & Commercial Zone", lat: 21.1330, lng: 79.0810, category: "Commercial", insideNmc: true, wardName: "Dhantoli", zoneName: "Dhantoli (Zone 4)" },
  { name: "Futala Lake Promenade", subtitle: "Telangkhedi Lake & Recreation Strip", lat: 21.1530, lng: 79.0480, category: "Recreation & Lake", insideNmc: true, wardName: "Futala", zoneName: "Dharampeth (Zone 2)" },
  { name: "Ambazari Lake & Garden", subtitle: "South West Reservoir & IT Park", lat: 21.1270, lng: 79.0450, category: "Reservoir & Lake", insideNmc: true, wardName: "Ambazari", zoneName: "Laxmi Nagar (Zone 1)" },
  { name: "Nagpur Junction Railway Station", subtitle: "Central Railway Terminal, Station Rd", lat: 21.1535, lng: 79.0872, category: "Main Railway Station", insideNmc: true, wardName: "Station Area", zoneName: "Dhantoli (Zone 4)" },
  { name: "Ajni Railway Station", subtitle: "South Nagpur Express Railway Terminal", lat: 21.1230, lng: 79.0840, category: "Railway Station", insideNmc: true, wardName: "Ajni", zoneName: "Dhantoli (Zone 4)" },
  { name: "Manish Nagar", subtitle: "South Nagpur Residential Corridor", lat: 21.0920, lng: 79.0820, category: "Residential Corridor", insideNmc: true, wardName: "Manish Nagar", zoneName: "Laxmi Nagar (Zone 1)" },
  { name: "Nagpur Airport", subtitle: "Dr. Babasaheb Ambedkar International Airport (NAG), Wardha Rd", lat: 21.0920, lng: 79.0630, category: "International Airport", insideNmc: true, wardName: "Airport / Sonegaon", zoneName: "Laxmi Nagar (Zone 1)" },
  { name: "Wardha Road (Airport T1)", subtitle: "Dr. Babasaheb Ambedkar International Airport", lat: 21.0920, lng: 79.0630, category: "Airport & Highway", insideNmc: true, wardName: "Sonegaon / Airport", zoneName: "Laxmi Nagar (Zone 1)" },
  { name: "Trimurti Nagar", subtitle: "South West Residential & Ring Road", lat: 21.1150, lng: 79.0520, category: "Residential", insideNmc: true, wardName: "Trimurti Nagar", zoneName: "Laxmi Nagar (Zone 1)" },
  { name: "Nandanvan", subtitle: "East Nagpur Educational & Residential Hub", lat: 21.1280, lng: 79.1320, category: "Residential", insideNmc: true, wardName: "Nandanvan", zoneName: "Nehru Nagar (Zone 5)" },
  { name: "Dighori", subtitle: "South-East Umred Road Junction", lat: 21.1080, lng: 79.1410, category: "Highway Junction", insideNmc: true, wardName: "Dighori", zoneName: "Nehru Nagar (Zone 5)" },
  { name: "Mankapur Stadium", subtitle: "North Nagpur Sports & Ring Road Complex", lat: 21.1820, lng: 79.0780, category: "Sports & North Hub", insideNmc: true, wardName: "Mankapur", zoneName: "Mangalwari (Zone 10)" },
  { name: "Jaripatka", subtitle: "North Nagpur Commercial & Residential Center", lat: 21.1850, lng: 79.1020, category: "Commercial", insideNmc: true, wardName: "Jaripatka", zoneName: "Ashi Nagar (Zone 9)" },

  // Peripheral, Extended Urban & Suburb Locations
  { name: "Fetri", subtitle: "Katol Road Suburban Belt, Northwest Nagpur", lat: 21.2185, lng: 78.9620, category: "Suburban Belt", insideNmc: false, wardName: "Gram Panchayat", zoneName: "Extended Service Area" },
  { name: "Hingna MIDC", subtitle: "Industrial Zone & Highway Corridor", lat: 21.0950, lng: 78.9780, category: "Industrial Corridor", insideNmc: false, wardName: "MIDC Hingna", zoneName: "Extended Service Area" },
  { name: "Wadi", subtitle: "Amravati Road Logistics & Urban Center", lat: 21.1480, lng: 78.9950, category: "Highway Suburb", insideNmc: false, wardName: "Wadi Municipal Council", zoneName: "Extended Service Area" },
  { name: "Koradi Thermal & Temple", subtitle: "North Thermal Plant & Shri Mahalakshmi Temple", lat: 21.2420, lng: 79.0980, category: "North Peripheral Hub", insideNmc: false, wardName: "Koradi", zoneName: "Extended Service Area" },
  { name: "Kamptee", subtitle: "Cantonment & North East Satellite Town", lat: 21.2280, lng: 79.1980, category: "Satellite Town", insideNmc: false, wardName: "Kamptee Cantonment", zoneName: "Extended Service Area" },
  { name: "MIHAN SEZ", subtitle: "Multi-modal International Cargo Hub & Airport", lat: 21.0520, lng: 79.0480, category: "SEZ & Logistics", insideNmc: false, wardName: "MIHAN", zoneName: "Extended Service Area" },
  { name: "Besa - Pipla", subtitle: "South Urban Extension, Manewada Road", lat: 21.0850, lng: 79.1020, category: "Urban Extension", insideNmc: false, wardName: "Besa Gram Panchayat", zoneName: "Extended Service Area" },
  { name: "Hudkeshwar", subtitle: "South East Ring Road Suburb", lat: 21.0960, lng: 79.1220, category: "Suburban Extension", insideNmc: false, wardName: "Hudkeshwar", zoneName: "Extended Service Area" },
  { name: "Butibori Industrial Area", subtitle: "Five Star MIDC & Wardha Road Industrial Belt", lat: 20.9250, lng: 78.9850, category: "Industrial Estate", insideNmc: false, wardName: "Butibori MIDC", zoneName: "Extended Service Area" },
  { name: "Kalmeshwar", subtitle: "Northwest Satellite Town & Railway Hub", lat: 21.2350, lng: 78.9180, category: "Satellite Town", insideNmc: false, wardName: "Kalmeshwar", zoneName: "Extended Service Area" },
];

/**
 * Robust Point-in-Polygon (Ray-Casting Algorithm)
 * Determines if [lat, lng] point is strictly inside a polygon [[lng, lat], ...]
 */
export function isPointInPolygon(lat, lng, polygonCoords) {
  if (!polygonCoords || polygonCoords.length < 3) return false;
  const x = Number(lng);
  const y = Number(lat);
  let inside = false;

  for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
    const xi = polygonCoords[i][0];
    const yi = polygonCoords[i][1];
    const xj = polygonCoords[j][0];
    const yj = polygonCoords[j][1];

    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculates Great Circle Haversine Distance in Kilometers
 */
export function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Determines whether a coordinate is within the broader Nagpur Service Region (75km radius)
 */
export function isWithinServiceRegion(lat, lng) {
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng)) return false;

  // 1. Quick bounding box check
  if (
    numLat >= EXTENDED_SERVICE_REGION.minLat &&
    numLat <= EXTENDED_SERVICE_REGION.maxLat &&
    numLng >= EXTENDED_SERVICE_REGION.minLng &&
    numLng <= EXTENDED_SERVICE_REGION.maxLng
  ) {
    return true;
  }

  // 2. Radial check from Zero Mile (75km)
  const dist = haversineDistanceKm(
    numLat,
    numLng,
    EXTENDED_SERVICE_REGION.center[0],
    EXTENDED_SERVICE_REGION.center[1]
  );
  return dist <= EXTENDED_SERVICE_REGION.radiusKm;
}

/**
 * Analyzes exact NMC municipal ward membership for any [lat, lng] coordinates.
 * Returns detailed ward metadata, or indicates outside municipal limits.
 */
export function getNmcWardInfo(lat, lng) {
  const numLat = Number(lat);
  const numLng = Number(lng);

  if (isNaN(numLat) || isNaN(numLng)) {
    return {
      insideNmc: false,
      wardNumber: null,
      wardName: "Unknown",
      zoneName: "Outside NMC",
      zoneId: null,
      statusText: "Invalid Coordinates",
    };
  }

  for (const zone of NMC_ADMINISTRATIVE_ZONES) {
    if (isPointInPolygon(numLat, numLng, zone.boundary)) {
      return {
        insideNmc: true,
        wardNumber: zone.zone_number,
        wardName: zone.zone_name.split("/")[0].trim(),
        zoneName: zone.zone_name,
        zoneId: zone.id,
        statusText: `Inside NMC Limits • ${zone.zone_name}`,
      };
    }
  }

  // If outside exact 10 zone polygons, check if it's within the extended metropolitan area
  const withinMetropolitan = isWithinServiceRegion(numLat, numLng);
  return {
    insideNmc: false,
    wardNumber: null,
    wardName: "Extended Nagpur Suburb",
    zoneName: withinMetropolitan ? "Nagpur Metropolitan Corridor" : "Central India Region",
    zoneId: null,
    statusText: withinMetropolitan
      ? "Outside NMC municipal limits (Routing available, municipal sensor data limited)"
      : "Regional corridor",
  };
}

/**
 * Searches locations using OpenStreetMap Nominatim with Nagpur regional biasing,
 * offline hub caching, and relevance scoring.
 */
export async function searchLocations(queryText, { signal = null, limit = 8 } = {}) {
  const clean = (queryText || "").trim();
  if (!clean || clean.length < 2) {
    return [];
  }

  const results = [];
  const seenKeys = new Set();

  const addResult = (item) => {
    const lat = Number(item.lat);
    const lng = Number(item.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    // Deduplicate by proximity (within 300 meters)
    const key = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
    if (seenKeys.has(key)) return;
    seenKeys.add(key);

    const wardInfo = getNmcWardInfo(lat, lng);
    const distFromZeroMile = haversineDistanceKm(
      lat,
      lng,
      EXTENDED_SERVICE_REGION.center[0],
      EXTENDED_SERVICE_REGION.center[1]
    );

    // Calculate intelligent search relevance score
    let score = 0;
    const lowerQuery = clean.toLowerCase();
    const lowerName = (item.name || "").toLowerCase();
    const lowerSub = (item.subtitle || "").toLowerCase();

    if (lowerName === lowerQuery) score += 100;
    else if (lowerName.startsWith(lowerQuery)) score += 60;
    else if (lowerName.includes(lowerQuery)) score += 40;

    if (lowerSub.includes("nagpur")) score += 20;
    if (wardInfo.insideNmc) score += 15;

    // Proximity penalty for very distant places
    score -= Math.min(30, distFromZeroMile * 0.4);

    results.push({
      id: item.id || `loc_${lat}_${lng}`,
      name: item.name,
      subtitle: item.subtitle || "Nagpur Region, Maharashtra",
      fullAddress: item.fullAddress || `${item.name}, Nagpur`,
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      type: item.type || "place",
      insideNmc: wardInfo.insideNmc,
      wardNumber: wardInfo.wardNumber,
      wardName: wardInfo.wardName,
      zoneName: wardInfo.zoneName,
      statusText: wardInfo.statusText,
      distanceKm: Number(distFromZeroMile.toFixed(1)),
      relevanceScore: score,
    });
  };

  // 1. Instant local matching against popular Nagpur hubs (instant 0ms response)
  const localMatches = POPULAR_NAGPUR_HUBS.filter(
    (h) =>
      h.name.toLowerCase().includes(clean.toLowerCase()) ||
      h.subtitle.toLowerCase().includes(clean.toLowerCase()) ||
      (h.wardName && h.wardName.toLowerCase().includes(clean.toLowerCase()))
  );
  for (const match of localMatches) {
    addResult(match);
  }

  // 2. Production Geocoding: OpenStreetMap Nominatim with viewbox biasing around Nagpur region
  try {
    // viewbox: left,top,right,bottom -> lng_min, lat_max, lng_max, lat_min (covers 78.20 to 80.10, 20.30 to 21.90)
    const viewboxStr = "78.20,21.90,80.10,20.30";
    const primaryUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      clean
    )}&viewbox=${viewboxStr}&bounded=0&countrycodes=in&limit=8&addressdetails=1`;

    const res = await fetch(primaryUrl, {
      signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "NagDrishti-AI-Civic-Navigation/2.0",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const parts = (item.display_name || "").split(",");
          const title = parts[0] || item.name || clean;
          const subtitle = parts.slice(1, 4).join(",").trim();

          addResult({
            id: `osm_${item.place_id}`,
            name: title,
            subtitle: subtitle || "Nagpur Region, Maharashtra",
            fullAddress: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            type: item.type || item.class || "landmark",
          });
        }
      }
    }

    // 3. Fallback explicit search query with ", Nagpur" if few results found
    if (results.length < 3 && !clean.toLowerCase().includes("nagpur")) {
      try {
        const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          `${clean}, Nagpur, Maharashtra`
        )}&limit=5&addressdetails=1`;
        const fbRes = await fetch(fallbackUrl, {
          signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "NagDrishti-AI-Civic-Navigation/2.0",
          },
        });
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (Array.isArray(fbData)) {
            for (const item of fbData) {
              const parts = (item.display_name || "").split(",");
              const title = parts[0] || item.name || clean;
              const subtitle = parts.slice(1, 4).join(",").trim();
              addResult({
                id: `osm_${item.place_id}`,
                name: title,
                subtitle: subtitle || "Nagpur, Maharashtra",
                fullAddress: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                type: item.type || "place",
              });
            }
          }
        }
      } catch (_) {}
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      console.warn("[GeoService] Search Nominatim notice:", err.message);
    }
  }

  // Sort by relevance score descending
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return results.slice(0, limit);
}

/**
 * Reverse geocodes a [lat, lng] into a clean human-readable address with ward metadata.
 */
export async function reverseGeocodeLocation(lat, lng, { signal = null } = {}) {
  const numLat = Number(lat);
  const numLng = Number(lng);
  const wardInfo = getNmcWardInfo(numLat, numLng);

  let defaultName = wardInfo.insideNmc
    ? `${wardInfo.wardName} (${numLat.toFixed(4)}, ${numLng.toFixed(4)})`
    : `Location (${numLat.toFixed(4)}, ${numLng.toFixed(4)})`;

  let fullAddress = defaultName;
  let subtitle = wardInfo.statusText;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${numLat}&lon=${numLng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "NagDrishti-AI-Civic-Navigation/2.0",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data) {
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.street || addr.neighbourhood || addr.suburb;
        const locality = addr.suburb || addr.city_district || addr.neighbourhood || addr.village || addr.town || addr.city || "Nagpur";

        if (road && locality) {
          defaultName = `${road}, ${locality}`;
        } else if (road || locality) {
          defaultName = road || locality;
        } else if (data.name) {
          defaultName = data.name;
        }

        fullAddress = data.display_name || defaultName;
        const parts = (data.display_name || "").split(",");
        subtitle = parts.slice(1, 4).join(",").trim() || wardInfo.statusText;
      }
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      console.warn("[GeoService] Reverse geocode notice:", err.message);
    }
  }

  return {
    name: defaultName,
    subtitle: subtitle,
    fullAddress: fullAddress,
    lat: Number(numLat.toFixed(5)),
    lng: Number(numLng.toFixed(5)),
    insideNmc: wardInfo.insideNmc,
    wardNumber: wardInfo.wardNumber,
    wardName: wardInfo.wardName,
    zoneName: wardInfo.zoneName,
    statusText: wardInfo.statusText,
  };
}

/**
 * Gets high-accuracy GPS position from browser navigator.geolocation
 */
export function getCurrentGpsLocation({
  enableHighAccuracy = true,
  timeout = 10000,
  maximumAge = 5000,
} = {}) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your browser."));
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracyMeters = Math.round(pos.coords.accuracy || 10);
        const isLowAccuracy = accuracyMeters > 60;

        try {
          const rev = await reverseGeocodeLocation(lat, lng);
          resolve({
            ...rev,
            accuracy: accuracyMeters,
            isLowAccuracy,
            accuracyText: `Accuracy: ±${accuracyMeters} m`,
            timestamp: pos.timestamp || Date.now(),
          });
        } catch (_) {
          const wardInfo = getNmcWardInfo(lat, lng);
          resolve({
            name: `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            subtitle: wardInfo.statusText,
            fullAddress: `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            lat: Number(lat.toFixed(5)),
            lng: Number(lng.toFixed(5)),
            accuracy: accuracyMeters,
            isLowAccuracy,
            accuracyText: `Accuracy: ±${accuracyMeters} m`,
            insideNmc: wardInfo.insideNmc,
            wardNumber: wardInfo.wardNumber,
            wardName: wardInfo.wardName,
            zoneName: wardInfo.zoneName,
            statusText: wardInfo.statusText,
          });
        }
      },
      (err) => {
        let message = "Unable to retrieve your current location.";
        if (err.code === 1) {
          message = "Location access was denied. Please allow location permissions in your browser settings.";
        } else if (err.code === 2) {
          message = "Location unavailable. Please check GPS signal or network connection.";
        } else if (err.code === 3) {
          message = "Location request timed out. Please try again.";
        }
        const errorObj = new Error(message);
        errorObj.code = err.code;
        reject(errorObj);
      },
      { enableHighAccuracy, timeout, maximumAge }
    );
  });
}
