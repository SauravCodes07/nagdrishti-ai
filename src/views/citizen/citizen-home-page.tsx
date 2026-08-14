import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Search, Navigation, AlertTriangle, MapPin, CloudRain, PlusCircle, Wind, Droplets, HardHat } from 'lucide-react';
import { fetchNagpurWeather, WeatherData } from '../../services/weather/weatherService';
import { getActiveConstructionProjects } from '../../services/construction/constructionService';
import { getIncidents } from '../../services/incidents/incidentService';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { searchNagpurLocations, GeocodingResult, VERIFIED_NAGPUR_LOCATIONS } from '../../services/geocoding/geocodingService';

export const CitizenHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [searchDestination, setSearchDestination] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchNagpurWeather().then(data => {
      setWeather(data);
    });
  }, []);

  useEffect(() => {
    if (!searchDestination || searchDestination.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      searchNagpurLocations(searchDestination).then(setSuggestions);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchDestination]);

  const constructions = getActiveConstructionProjects().slice(0, 2);
  const criticalIncidents = getIncidents().filter(i => i.severity === 'SEVERE' || i.severity === 'HIGH').slice(0, 3);

  const handleQuickDestinationSelect = (name: string) => {
    navigate(`/citizen/route?destination=${encodeURIComponent(name)}`);
  };

  return (
    <div className="space-y-4">
      {/* 1. Live City Condition & Risk Status Banner */}
      <div className="bg-gradient-to-r from-white to-[#FFF8E1] dark:from-[#111C2E] dark:to-[#1a2538] rounded-2xl p-4 border border-[#E5E5E5] dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22A447] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22A447]"></span>
            </span>
            <span className="text-xs font-bold text-[#111111] dark:text-white">
              Nagpur • Zero Mile
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#22A447]/15 text-[#22A447] border border-[#22A447]/30">
              🟢 Area Risk: Low
            </span>
            {weather?.isLive && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20 font-mono">
                LIVE
              </span>
            )}
          </div>
        </div>

        {/* Real Weather Telemetry Snippet */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[#FF8A00] text-white flex items-center justify-center shadow-xs">
              <CloudRain className="size-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-outfit text-[#111111] dark:text-white">
                  {weather ? `${weather.temperature}°C` : '28°C'}
                </span>
                <span className="text-xs font-bold text-[#FF8A00]">
                  🌧️ {weather ? `${weather.rainfallMm} mm` : '4.2 mm'}
                </span>
              </div>
              <p className="text-[11px] text-[#666666] dark:text-gray-400">
                {weather ? weather.weatherDescription : 'Slight Rain / Overcast'}
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] text-[#666666] dark:text-gray-400 space-y-0.5">
            <div className="flex items-center justify-end gap-1">
              <Droplets className="size-3 text-blue-500" />
              <span>{weather ? `${weather.relativeHumidity}%` : '78%'} Hum</span>
            </div>
            <div className="flex items-center justify-end gap-1">
              <Wind className="size-3 text-teal-500" />
              <span>{weather ? `${weather.windSpeed} km/h` : '14 km/h'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Destination Search Bar ("Where do you want to go?") */}
      <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-4 border border-[#E5E5E5] dark:border-white/10 shadow-sm space-y-3">
        <label className="text-xs font-bold text-[#111111] dark:text-white flex items-center gap-1.5">
          <Navigation className="size-4 text-[#FF8A00]" /> Where do you want to go safely?
        </label>

        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 size-4 text-[#666666] dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search destination (e.g., Civil Lines, AIIMS, Sitabuldi)..."
            value={searchDestination}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setSearchDestination(e.target.value);
              setShowSuggestions(true);
            }}
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10 text-xs font-medium text-[#111111] dark:text-white placeholder:text-[#666666] focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#111C2E] border border-[#E5E5E5] dark:border-white/15 rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-[#E5E5E5] dark:divide-white/5">
              {suggestions.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setShowSuggestions(false);
                    handleQuickDestinationSelect(item.name);
                  }}
                  className="w-full p-2.5 text-left text-xs hover:bg-[#FFF8E1] dark:hover:bg-white/5 flex items-start gap-2 cursor-pointer transition-colors"
                >
                  <MapPin className="size-3.5 text-[#FF8A00] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#111111] dark:text-white">{item.name}</div>
                    <div className="text-[10px] text-[#666666] dark:text-gray-400 line-clamp-1">{item.displayName}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Destination Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {VERIFIED_NAGPUR_LOCATIONS.slice(0, 5).map((loc) => (
            <button
              key={loc.id}
              onClick={() => handleQuickDestinationSelect(loc.name)}
              className="px-2.5 py-1.5 rounded-lg bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10 text-[11px] font-semibold text-[#111111] dark:text-gray-200 whitespace-nowrap hover:border-[#FF8A00] transition-colors cursor-pointer"
            >
              📍 {loc.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <Button
          onClick={() => {
            const dest = searchDestination ? `?destination=${encodeURIComponent(searchDestination)}` : '';
            navigate(`/citizen/route${dest}`);
          }}
          className="w-full bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold h-11 text-xs gap-2 shadow-xs cursor-pointer"
        >
          <Navigation className="size-4" /> Calculate AI Safe Route
        </Button>
      </div>

      {/* 3. Quick Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/citizen/map"
          className="bg-white dark:bg-[#111C2E] p-3.5 rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-2xs flex items-center gap-3 hover:border-[#FFC107] transition-all group"
        >
          <div className="size-10 rounded-lg bg-[#FFF8E1] dark:bg-[#FFC107]/15 text-[#FF8A00] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MapPin className="size-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#111111] dark:text-white">Live Map</h4>
            <p className="text-[10px] text-[#666666] dark:text-gray-400">Potholes & Water</p>
          </div>
        </Link>

        <Link
          to="/citizen/report"
          className="bg-white dark:bg-[#111C2E] p-3.5 rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-2xs flex items-center gap-3 hover:border-[#22A447] transition-all group"
        >
          <div className="size-10 rounded-lg bg-emerald-500/10 text-[#22A447] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <PlusCircle className="size-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#111111] dark:text-white">Report Hazard</h4>
            <p className="text-[10px] text-[#666666] dark:text-gray-400">1-Min Photo Pin</p>
          </div>
        </Link>
      </div>

      {/* 4. Year-Round Construction & Road Closures Advisory */}
      <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-4 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <HardHat className="size-4 text-[#FF8A00]" />
            <h3 className="font-bold text-xs text-[#111111] dark:text-white">
              Year-Round Construction Watch
            </h3>
          </div>
          <Badge className="bg-[#FFF8E1] text-[#111111] dark:bg-[#FFC107]/20 dark:text-white border-[#FFC107]/40 text-[9px]">
            {constructions.length} Active Works
          </Badge>
        </div>

        <div className="space-y-2.5">
          {constructions.map((c) => (
            <div
              key={c.id}
              className="p-2.5 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/5 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-[#111111] dark:text-white">
                  🚧 {c.projectName}
                </span>
                <span className="text-[9px] font-mono text-rose-600 font-bold">
                  {c.trafficImpact} IMPACT
                </span>
              </div>
              <p className="text-[10px] text-[#666666] dark:text-gray-400">
                {c.laneClosures} • {c.detourAdvice}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Critical Nearby Alerts */}
      <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-4 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="size-4 text-[#E53935]" />
            <h3 className="font-bold text-xs text-[#111111] dark:text-white">
              Nearby Verified Road Alerts
            </h3>
          </div>
          <Link to="/citizen/alerts" className="text-[10px] font-bold text-[#FF8A00] hover:underline">
            View All ({criticalIncidents.length})
          </Link>
        </div>

        <div className="space-y-2">
          {criticalIncidents.map((inc) => (
            <div
              key={inc.id}
              className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10 flex items-start gap-2.5"
            >
              <span className="text-base mt-0.5">
                {inc.type === 'WATERLOGGING' ? '💧' : inc.type === 'ROAD_DAMAGE' ? '⚠️' : '🚗'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h5 className="font-bold text-xs text-[#111111] dark:text-white truncate">
                    {inc.title}
                  </h5>
                  <span className="text-[9px] font-bold text-[#E53935] font-mono shrink-0">
                    {inc.severity}
                  </span>
                </div>
                <p className="text-[10px] text-[#666666] dark:text-gray-300 mt-0.5">
                  📍 {inc.locationName}
                </p>
                <p className="text-[10px] font-semibold text-[#FF8A00] mt-1">
                  💡 {inc.recommendedAction}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitizenHomePage;
