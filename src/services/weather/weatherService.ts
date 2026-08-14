/**
 * NagDrishti AI — Real Weather & Rainfall Service
 * Integrates directly with Open-Meteo API for Nagpur coordinates (21.1458° N, 79.0882° E)
 * Source Attribution: Open-Meteo (https://open-meteo.com/)
 */

export interface WeatherData {
  source: 'OPEN_METEO_LIVE' | 'DEMO_CACHE';
  isLive: boolean;
  latitude: number;
  longitude: number;
  temperature: number; // °C
  apparentTemperature: number; // °C
  rainfallMm: number; // Current precipitation in mm
  precipitationProbability: number; // %
  relativeHumidity: number; // %
  windSpeed: number; // km/h
  weatherCode: number;
  weatherDescription: string;
  isRaining: boolean;
  alertLevel: 'NORMAL' | 'MODERATE' | 'HEAVY' | 'CRITICAL';
  timestamp: string;
  hourlyForecast: {
    time: string;
    precipitationMm: number;
    probability: number;
    temperature: number;
  }[];
  dailyForecast: {
    date: string;
    precipitationSum: number;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
  }[];
}

// Nagpur Zero Mile Stone Coordinates
export const NAGPUR_COORDINATES = {
  latitude: 21.1458,
  longitude: 79.0882,
  elevationMeters: 310,
  cityName: 'Nagpur',
  state: 'Maharashtra',
  country: 'India'
};

const getWeatherDescription = (code: number): string => {
  switch (code) {
    case 0: return 'Clear Sky';
    case 1: return 'Mainly Clear';
    case 2: return 'Partly Cloudy';
    case 3: return 'Overcast';
    case 45: case 48: return 'Foggy / Mist';
    case 51: case 53: case 55: return 'Light Drizzle';
    case 61: return 'Slight Rain';
    case 63: return 'Moderate Rain';
    case 65: return 'Heavy Rain';
    case 80: case 81: case 82: return 'Rain Showers / Cloudburst';
    case 95: case 96: case 99: return 'Thunderstorm with Gusts';
    default: return 'Fair Conditions';
  }
};

const getAlertLevel = (rainfallMm: number, precipitationProb: number): 'NORMAL' | 'MODERATE' | 'HEAVY' | 'CRITICAL' => {
  if (rainfallMm >= 60 || (rainfallMm >= 40 && precipitationProb > 80)) return 'CRITICAL';
  if (rainfallMm >= 30 || precipitationProb >= 75) return 'HEAVY';
  if (rainfallMm >= 10 || precipitationProb >= 50) return 'MODERATE';
  return 'NORMAL';
};

// Fallback Cache for Nagpur when offline
const FALLBACK_WEATHER: WeatherData = {
  source: 'DEMO_CACHE',
  isLive: false,
  latitude: NAGPUR_COORDINATES.latitude,
  longitude: NAGPUR_COORDINATES.longitude,
  temperature: 28.5,
  apparentTemperature: 31.2,
  rainfallMm: 4.2,
  precipitationProbability: 35,
  relativeHumidity: 78,
  windSpeed: 14.5,
  weatherCode: 61,
  weatherDescription: 'Slight Rain / Overcast',
  isRaining: true,
  alertLevel: 'MODERATE',
  timestamp: new Date().toISOString(),
  hourlyForecast: [
    { time: '12:00', precipitationMm: 1.2, probability: 30, temperature: 29 },
    { time: '14:00', precipitationMm: 4.5, probability: 65, temperature: 28 },
    { time: '16:00', precipitationMm: 12.0, probability: 85, temperature: 27 },
    { time: '18:00', precipitationMm: 24.5, probability: 90, temperature: 26 },
    { time: '20:00', precipitationMm: 18.2, probability: 75, temperature: 26 },
    { time: '22:00', precipitationMm: 6.0, probability: 45, temperature: 27 },
  ],
  dailyForecast: [
    { date: 'Today', precipitationSum: 28.5, maxTemp: 31, minTemp: 24, weatherCode: 63 },
    { date: 'Tomorrow', precipitationSum: 42.0, maxTemp: 30, minTemp: 23, weatherCode: 65 },
    { date: 'Day 3', precipitationSum: 15.0, maxTemp: 32, minTemp: 25, weatherCode: 61 },
    { date: 'Day 4', precipitationSum: 5.5, maxTemp: 33, minTemp: 26, weatherCode: 2 },
    { date: 'Day 5', precipitationSum: 0.0, maxTemp: 34, minTemp: 26, weatherCode: 1 },
  ]
};

let cachedWeatherData: WeatherData | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export const fetchNagpurWeather = async (forceRefresh = false): Promise<WeatherData> => {
  const now = Date.now();
  if (!forceRefresh && cachedWeatherData && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedWeatherData;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${NAGPUR_COORDINATES.latitude}&longitude=${NAGPUR_COORDINATES.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FKolkata&forecast_days=6`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP ${response.status}`);
    }

    const data = await response.json();
    const current = data.current || {};
    const rainfallMm = Number(current.precipitation ?? current.rain ?? 0);
    const weatherCode = Number(current.weather_code ?? 0);
    const hourly = data.hourly || {};
    const daily = data.daily || {};

    const currentHourIndex = new Date().getHours();
    const precipProb = hourly.precipitation_probability ? hourly.precipitation_probability[currentHourIndex] ?? 40 : 40;

    // Slice next 8 hours
    const hourlyForecast = [];
    const times = hourly.time || [];
    const hourlyPrecip = hourly.precipitation || [];
    const hourlyProb = hourly.precipitation_probability || [];
    const hourlyTemps = hourly.temperature_2m || [];

    for (let i = currentHourIndex; i < Math.min(times.length, currentHourIndex + 8); i++) {
      const timeStr = times[i] ? new Date(times[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : `${i}:00`;
      hourlyForecast.push({
        time: timeStr,
        precipitationMm: Number(hourlyPrecip[i] || 0),
        probability: Number(hourlyProb[i] || 0),
        temperature: Math.round(Number(hourlyTemps[i] || current.temperature_2m || 28))
      });
    }

    // Process daily forecast
    const dailyForecast = [];
    const dailyTimes = daily.time || [];
    const dailyPrecipSum = daily.precipitation_sum || [];
    const dailyMaxTemps = daily.temperature_2m_max || [];
    const dailyMinTemps = daily.temperature_2m_min || [];
    const dailyCodes = daily.weather_code || [];

    for (let d = 0; d < Math.min(5, dailyTimes.length); d++) {
      const dateObj = new Date(dailyTimes[d]);
      const dateName = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      dailyForecast.push({
        date: dateName,
        precipitationSum: Number(dailyPrecipSum[d] || 0),
        maxTemp: Math.round(Number(dailyMaxTemps[d] || 32)),
        minTemp: Math.round(Number(dailyMinTemps[d] || 24)),
        weatherCode: Number(dailyCodes[d] || 0)
      });
    }

    const normalized: WeatherData = {
      source: 'OPEN_METEO_LIVE',
      isLive: true,
      latitude: NAGPUR_COORDINATES.latitude,
      longitude: NAGPUR_COORDINATES.longitude,
      temperature: Math.round(Number(current.temperature_2m || 28)),
      apparentTemperature: Math.round(Number(current.apparent_temperature || 30)),
      rainfallMm: Math.round(rainfallMm * 10) / 10,
      precipitationProbability: precipProb,
      relativeHumidity: Math.round(Number(current.relative_humidity_2m || 75)),
      windSpeed: Math.round(Number(current.wind_speed_10m || 12)),
      weatherCode,
      weatherDescription: getWeatherDescription(weatherCode),
      isRaining: rainfallMm > 0.1,
      alertLevel: getAlertLevel(rainfallMm, precipProb),
      timestamp: new Date().toISOString(),
      hourlyForecast: hourlyForecast.length > 0 ? hourlyForecast : FALLBACK_WEATHER.hourlyForecast,
      dailyForecast: dailyForecast.length > 0 ? dailyForecast : FALLBACK_WEATHER.dailyForecast
    };

    cachedWeatherData = normalized;
    lastFetchTime = now;
    return normalized;
  } catch (err) {
    console.warn('[WeatherService] Live Open-Meteo fetch failed, using fallback:', err);
    return {
      ...FALLBACK_WEATHER,
      timestamp: new Date().toISOString()
    };
  }
};
