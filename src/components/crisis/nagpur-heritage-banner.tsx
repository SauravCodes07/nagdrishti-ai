import React from 'react';
import { MapPin } from 'lucide-react';
import { Badge } from '../ui/badge';

export const NagpurHeritageBanner: React.FC = () => {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-bhagwa/10 via-amber-500/10 to-orange-600/10 border border-bhagwa/20 p-4 sm:p-5 shadow-sm mb-6">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-bhagwa text-white text-[10px] font-bold tracking-wider uppercase">
              ORANGE CITY CIVIC INTELLIGENCE
            </Badge>
            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
              <MapPin className="size-3 text-bhagwa" /> Zero Mile Stone, Nagpur (21.1458° N)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
            Nagpur AI Urban Crisis Management System
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Protecting Deekshabhoomi, Sitabuldi, Futala Lake, and 12 civic zones with real-time AI rainfall prediction and flood mitigation.
          </p>
        </div>

        {/* Heritage Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-card border border-border text-foreground shadow-2xs">
            📍 Deekshabhoomi
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-card border border-border text-foreground shadow-2xs">
            🏰 Sitabuldi Fort
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-card border border-border text-foreground shadow-2xs">
            🌊 Futala Lake
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-card border border-border text-foreground shadow-2xs">
            📍 Zero Mile
          </span>
        </div>
      </div>
    </div>
  );
};
