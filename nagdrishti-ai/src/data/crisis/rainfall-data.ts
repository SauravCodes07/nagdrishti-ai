export interface HourlyRainfall {
  time: string;
  rainfallMm: number;
  intensity: 'LIGHT' | 'MODERATE' | 'HEAVY' | 'EXTREME';
  forecast: number;
}

export interface ZoneRainfallForecast {
  zoneId: string;
  zoneName: string;
  currentMm: number;
  forecast3hMm: number;
  forecast6hMm: number;
  trend: 'RISING' | 'STABLE' | 'FALLING';
}

export const HOURLY_RAINFALL: HourlyRainfall[] = [
  { time: '06:00 AM', rainfallMm: 12, intensity: 'LIGHT', forecast: 15 },
  { time: '08:00 AM', rainfallMm: 24, intensity: 'MODERATE', forecast: 28 },
  { time: '10:00 AM', rainfallMm: 45, intensity: 'HEAVY', forecast: 50 },
  { time: '12:00 PM', rainfallMm: 62, intensity: 'HEAVY', forecast: 68 },
  { time: '02:00 PM', rainfallMm: 78, intensity: 'EXTREME', forecast: 85 },
  { time: '04:00 PM', rainfallMm: 72, intensity: 'EXTREME', forecast: 70 },
  { time: '06:00 PM (Est)', rainfallMm: 58, intensity: 'HEAVY', forecast: 55 },
  { time: '08:00 PM (Est)', rainfallMm: 34, intensity: 'MODERATE', forecast: 30 },
  { time: '10:00 PM (Est)', rainfallMm: 18, intensity: 'LIGHT', forecast: 15 },
];

export const ZONE_RAINFALL_FORECAST: ZoneRainfallForecast[] = [
  { zoneId: 'dharampeth', zoneName: 'Dharampeth', currentMm: 78, forecast3hMm: 95, forecast6hMm: 110, trend: 'RISING' },
  { zoneId: 'sitabuldi', zoneName: 'Sitabuldi', currentMm: 74, forecast3hMm: 88, forecast6hMm: 98, trend: 'RISING' },
  { zoneId: 'mankapur', zoneName: 'Mankapur', currentMm: 68, forecast3hMm: 78, forecast6hMm: 85, trend: 'RISING' },
  { zoneId: 'pardi', zoneName: 'Pardi', currentMm: 65, forecast3hMm: 72, forecast6hMm: 80, trend: 'RISING' },
  { zoneId: 'mahal', zoneName: 'Mahal', currentMm: 62, forecast3hMm: 70, forecast6hMm: 75, trend: 'STABLE' },
  { zoneId: 'hanuman_nagar', zoneName: 'Hanuman Nagar', currentMm: 52, forecast3hMm: 58, forecast6hMm: 62, trend: 'STABLE' },
  { zoneId: 'sadar', zoneName: 'Sadar', currentMm: 48, forecast3hMm: 52, forecast6hMm: 55, trend: 'STABLE' },
  { zoneId: 'wardha_road', zoneName: 'Wardha Road', currentMm: 40, forecast3hMm: 42, forecast6hMm: 45, trend: 'FALLING' },
];

export const CURRENT_WEATHER_SUMMARY = {
  city: 'Nagpur, Maharashtra',
  status: 'Heavy Downpour Warning',
  temperatureC: 26,
  humidity: 94,
  windSpeedKmh: 28,
  total24hRainfallMm: 142,
  peakRainfallRateMmHr: 48,
  dopplerRadarStatus: 'Active - High Reflectivity over West Nagpur',
  lastUpdated: '2 mins ago'
};
