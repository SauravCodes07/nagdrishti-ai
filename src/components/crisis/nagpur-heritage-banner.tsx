import React from 'react';
import { MapPin } from 'lucide-react';
import { Badge } from '../ui/badge';

export const NagpurHeritageBanner: React.FC = () => {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#FFF8E1] via-[#FFF9E6] to-[#FFFDF0] dark:from-[#111C2E] dark:to-[#1E293B] border border-[#FFC107]/40 p-4 sm:p-5 shadow-xs mb-6">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#FFC107] text-[#111111] text-[10px] font-black tracking-wider uppercase">
              ORANGE CITY CIVIC INTELLIGENCE
            </Badge>
            <span className="text-xs text-[#666666] dark:text-gray-400 font-mono flex items-center gap-1">
              <MapPin className="size-3 text-[#FF8A00]" /> Zero Mile Stone, Nagpur (21.1458° N)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#111111] dark:text-white">
            Nagpur AI Urban Crisis Management System
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 max-w-2xl">
            Protecting Deekshabhoomi, Sitabuldi, Futala Lake, and 12 civic zones with real-time AI rainfall prediction and flood mitigation.
          </p>
        </div>

        {/* Heritage Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10 text-[#111111] dark:text-white shadow-2xs">
            📍 Deekshabhoomi
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10 text-[#111111] dark:text-white shadow-2xs">
            🏰 Sitabuldi Fort
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10 text-[#111111] dark:text-white shadow-2xs">
            🌊 Futala Lake
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10 text-[#111111] dark:text-white shadow-2xs">
            📍 Zero Mile
          </span>
        </div>
      </div>
    </div>
  );
};
