/**
 * NagDrishti AI — Geographic Point of Interest (POI) & Progressive Detail Provider
 * Provides zoom-dependent contextual intelligence for Nagpur (Transport, Healthcare, Public Safety, Education, Landmarks)
 */

export interface POIItem {
  id: string;
  name: string;
  category: 'TRANSPORT' | 'HEALTH' | 'SAFETY' | 'EDUCATION' | 'LANDMARK' | 'INFRASTRUCTURE';
  subType: string;
  coordinates: [number, number]; // [lat, lng]
  minZoom: number; // Zoom level at which this POI becomes visible
  address?: string;
  icon: string;
  color: string;
}

export const NAGPUR_PROGRESSIVE_POIS: POIItem[] = [
  // 1. Major Landmarks & Transit (Visible from Zoom 11+)
  {
    id: 'poi-zero-mile',
    name: 'Zero Mile Stone & Heritage Center',
    category: 'LANDMARK',
    subType: 'Historical Monument',
    coordinates: [21.1458, 79.0882],
    minZoom: 11,
    address: 'Civil Lines, Nagpur',
    icon: '🏛️',
    color: '#FF8A00'
  },
  {
    id: 'poi-airport',
    name: 'Dr. Babasaheb Ambedkar International Airport',
    category: 'TRANSPORT',
    subType: 'Airport',
    coordinates: [21.0922, 79.0478],
    minZoom: 11,
    address: 'Wardha Road, Sonegaon',
    icon: '✈️',
    color: '#0284c7'
  },
  {
    id: 'poi-nagpur-junction',
    name: 'Nagpur Central Railway Junction',
    category: 'TRANSPORT',
    subType: 'Railway Station',
    coordinates: [21.1524, 79.0889],
    minZoom: 11,
    address: 'Railway Station Road, Sitabuldi',
    icon: '🚆',
    color: '#0284c7'
  },
  {
    id: 'poi-deekshabhoomi',
    name: 'Deekshabhoomi Stupa Monument',
    category: 'LANDMARK',
    subType: 'Spiritual Heritage',
    coordinates: [21.1275, 79.0664],
    minZoom: 11,
    address: 'South Ambazari Road, Bajaj Nagar',
    icon: '☸️',
    color: '#8b5cf6'
  },

  // 2. Metro Stations (Visible from Zoom 13+)
  {
    id: 'poi-metro-sitabuldi',
    name: 'Sitabuldi Interchange Metro Station',
    category: 'TRANSPORT',
    subType: 'Metro Interchange',
    coordinates: [21.1448, 79.0845],
    minZoom: 13,
    address: 'Sitabuldi, Central Nagpur',
    icon: '🚇',
    color: '#FFC107'
  },
  {
    id: 'poi-metro-dharampeth',
    name: 'Dharampeth College Metro Station',
    category: 'TRANSPORT',
    subType: 'Metro Station',
    coordinates: [21.1415, 79.0630],
    minZoom: 13,
    address: 'West High Court Road, Dharampeth',
    icon: '🚇',
    color: '#FFC107'
  },
  {
    id: 'poi-metro-jhansi-rani',
    name: 'Jhansi Rani Square Metro Station',
    category: 'TRANSPORT',
    subType: 'Metro Station',
    coordinates: [21.1420, 79.0760],
    minZoom: 13,
    address: 'Jhansi Rani Square, Sitabuldi',
    icon: '🚇',
    color: '#FFC107'
  },
  {
    id: 'poi-metro-airport',
    name: 'Airport Metro Station',
    category: 'TRANSPORT',
    subType: 'Metro Station',
    coordinates: [21.0965, 79.0520],
    minZoom: 13,
    address: 'Wardha Road, Nagpur',
    icon: '🚇',
    color: '#FFC107'
  },
  {
    id: 'poi-metro-kalamna',
    name: 'Kalamna Metro Station (Phase 2 Alignment)',
    category: 'TRANSPORT',
    subType: 'Metro Station',
    coordinates: [21.1680, 79.1410],
    minZoom: 13,
    address: 'Bhandara Road, Kalamna',
    icon: '🚇',
    color: '#FFC107'
  },

  // 3. Hospitals & Critical Care (Visible from Zoom 13+)
  {
    id: 'poi-aiims-nagpur',
    name: 'AIIMS Nagpur Super Speciality Hospital',
    category: 'HEALTH',
    subType: 'Government Hospital',
    coordinates: [21.0378, 79.0322],
    minZoom: 13,
    address: 'MIHAN SEZ, South Nagpur',
    icon: '🏥',
    color: '#E53935'
  },
  {
    id: 'poi-gmc-nagpur',
    name: 'Government Medical College & Hospital (GMC)',
    category: 'HEALTH',
    subType: 'Trauma Center & Hospital',
    coordinates: [21.1340, 79.0980],
    minZoom: 13,
    address: 'Hanuman Nagar, Medical Square',
    icon: '🏥',
    color: '#E53935'
  },
  {
    id: 'poi-kingsway-hospital',
    name: 'Kingsway Hospitals',
    category: 'HEALTH',
    subType: 'Emergency Multispeciality',
    coordinates: [21.1550, 79.0865],
    minZoom: 13,
    address: 'Near Central Railway Station, Mohan Nagar',
    icon: '🏥',
    color: '#E53935'
  },
  {
    id: 'poi-orange-city-hospital',
    name: 'Orange City Hospital & Research Institute',
    category: 'HEALTH',
    subType: 'Trauma & Emergency Hospital',
    coordinates: [21.1150, 79.0620],
    minZoom: 13,
    address: 'Pannase Layout, Veer Sawarkar Square, Khamla',
    icon: '🏥',
    color: '#E53935'
  },

  // 4. Public Safety, Police & Fire Stations (Visible from Zoom 14+)
  {
    id: 'poi-police-hq',
    name: 'Nagpur City Police Commissionerate HQ',
    category: 'SAFETY',
    subType: 'Police HQ',
    coordinates: [21.1510, 79.0765],
    minZoom: 14,
    address: 'Civil Lines, Nagpur',
    icon: '👮',
    color: '#1e40af'
  },
  {
    id: 'poi-fire-hq',
    name: 'NMC Fire & Emergency Services HQ',
    category: 'SAFETY',
    subType: 'Fire Brigade Station',
    coordinates: [21.1470, 79.0790],
    minZoom: 14,
    address: 'Civil Lines, Central Nagpur',
    icon: '🚒',
    color: '#E53935'
  },
  {
    id: 'poi-sitabuldi-police',
    name: 'Sitabuldi Police Station',
    category: 'SAFETY',
    subType: 'Police Station',
    coordinates: [21.1435, 79.0820],
    minZoom: 14,
    address: 'Sitabuldi Main Market, Nagpur',
    icon: '👮',
    color: '#1e40af'
  },

  // 5. Higher Education & Research (Visible from Zoom 14+)
  {
    id: 'poi-vnit',
    name: 'Visvesvaraya National Institute of Technology (VNIT)',
    category: 'EDUCATION',
    subType: 'National Engineering Institute',
    coordinates: [21.1240, 79.0520],
    minZoom: 14,
    address: 'South Ambazari Road, Nagpur',
    icon: '🎓',
    color: '#059669'
  },
  {
    id: 'poi-lit-nagpur',
    name: 'Laxminarayan Innovation Technological University (LITU)',
    category: 'EDUCATION',
    subType: 'State University',
    coordinates: [21.1390, 79.0490],
    minZoom: 14,
    address: 'Amravati Road, Ram Nagar',
    icon: '🎓',
    color: '#059669'
  },

  // 6. Drainage & Water Control Infrastructure (Visible from Zoom 14+)
  {
    id: 'poi-ambazari-spillway',
    name: 'Ambazari Lake Spillway Gate & Nag River Origin',
    category: 'INFRASTRUCTURE',
    subType: 'Flood Control Spillway',
    coordinates: [21.1295, 79.0440],
    minZoom: 14,
    address: 'Ambazari Overflow Dam, Ambazari Road',
    icon: '🌊',
    color: '#0284c7'
  },
  {
    id: 'poi-gorewada-dam',
    name: 'Gorewada Reservoir & Water Treatment Facility',
    category: 'INFRASTRUCTURE',
    subType: 'Water Reservoir',
    coordinates: [21.1960, 79.0410],
    minZoom: 13,
    address: 'Gorewada Road, North-West Nagpur',
    icon: '💧',
    color: '#0284c7'
  }
];

/**
 * Get POIs that should be visible at current map zoom level and filtered by active category
 */
export const getProgressivePOIsInViewport = (
  zoom: number,
  categoryFilter: 'ALL' | 'TRANSPORT' | 'HEALTH' | 'SAFETY' | 'EDUCATION' | 'LANDMARK' | 'INFRASTRUCTURE' = 'ALL',
  bounds?: { north: number; south: number; east: number; west: number }
): POIItem[] => {
  return NAGPUR_PROGRESSIVE_POIS.filter(poi => {
    // 1. Zoom threshold check
    if (zoom < poi.minZoom) return false;

    // 2. Category check
    if (categoryFilter !== 'ALL' && poi.category !== categoryFilter) return false;

    // 3. Optional bounding box check
    if (bounds) {
      const [lat, lng] = poi.coordinates;
      if (lat < bounds.south || lat > bounds.north || lng < bounds.west || lng > bounds.east) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Find nearest POIs within radius around a specific coordinate
 */
export const getNearbyPOIs = (
  coordinates: [number, number],
  radiusKm = 2.5,
  categoryFilter?: POIItem['category']
): (POIItem & { distanceKm: number })[] => {
  const [lat1, lon1] = coordinates;

  return NAGPUR_PROGRESSIVE_POIS.map(poi => {
    const [lat2, lon2] = poi.coordinates;
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;

    return {
      ...poi,
      distanceKm: parseFloat(dist.toFixed(2))
    };
  })
    .filter(item => {
      if (categoryFilter && item.category !== categoryFilter) return false;
      return item.distanceKm <= radiusKm;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
};
