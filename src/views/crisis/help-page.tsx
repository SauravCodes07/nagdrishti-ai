import React from 'react';
import { Phone, Sparkles } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

const HelpPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-white dark:bg-[#111C2E] p-4 sm:p-6 rounded-2xl border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#FFC107] text-[#111111] font-mono text-[10px] font-black">
              CIVIC SUPPORT & HELPLINES
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Help & Emergency Support Center
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 mt-0.5">
            Emergency hotlines, hackathon product guide, and Nagpur Municipal Corporation contact directory.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Helplines Card */}
        <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#111111] dark:text-white flex items-center gap-2">
            <Phone className="size-5 text-[#FF8A00]" /> Emergency Hotlines
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#111111] dark:text-white block">NMC Disaster Control Room</span>
                <span className="text-[#666666] dark:text-gray-400 text-[10px]">24x7 Waterlogging & Flood Cell</span>
              </div>
              <span className="font-mono font-bold text-[#FF8A00] text-sm">155304 / 0712-2567029</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#111111] dark:text-white block">Nagpur Traffic Control Room</span>
                <span className="text-[#666666] dark:text-gray-400 text-[10px]">Flyover & Underpass Diversions</span>
              </div>
              <span className="font-mono font-bold text-[#FFC107] text-sm">0712-2566600</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#111111] dark:text-white block">National Disaster Response (NDRF)</span>
                <span className="text-[#666666] dark:text-gray-400 text-[10px]">Rescue Craft & Submergence Evacuation</span>
              </div>
              <span className="font-mono font-bold text-[#E53935] text-sm">1077</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/10 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#111111] dark:text-white block">Police Emergency Helpline</span>
                <span className="text-[#666666] dark:text-gray-400 text-[10px]">Toll-Free Emergency Line</span>
              </div>
              <span className="font-mono font-bold text-[#111111] dark:text-white text-sm">112</span>
            </div>
          </div>
        </div>

        {/* Product Guide & Story */}
        <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#111111] dark:text-white flex items-center gap-2">
            <Sparkles className="size-5 text-[#FF8A00]" /> Product Story & Architecture
          </h3>

          <div className="p-4 rounded-xl bg-[#FFF8E1] dark:bg-[#FFC107]/10 border border-[#FFC107]/30 text-xs space-y-2">
            <span className="font-bold text-[#FF8A00] block text-sm">
              Core Crisis Management Flow:
            </span>
            <p className="text-[#111111] dark:text-white leading-relaxed font-semibold">
              🌧️ RAINFALL → 🤖 AI PREDICTION → 🗺️ RISK MAP → 🚨 ALERT → 🚗 SAFE ROUTE → 🚑 CIVIC RESPONSE
            </p>
            <p className="text-[#666666] dark:text-gray-400 text-[11px] leading-relaxed">
              Designed specifically for Nagpur Municipal Corporation to predict urban flooding 35 minutes in advance and dispatch high-capacity pumps & repair teams before crisis escalation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
