import React from 'react';
import { Cpu, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Link } from 'react-router';

export const ResponsePriority: React.FC = () => {
  const priorities = [
    {
      rank: 1,
      location: 'Dharampeth Basin',
      riskTitle: 'Severe Waterlogging Risk (92%)',
      subtext: 'Gokulpeth Market underpass water depth reaching 3.5 ft.',
      recommended: 'Deploy 500HP Dewatering Pump Unit #4 + Divert Traffic via West High Court Road',
      actionLabel: 'Deploy Dewatering Pump',
      badgeClass: 'bg-[#E53935] text-white font-bold',
      borderColor: 'border-[#E53935]/30 bg-white dark:bg-[#0B1320]'
    },
    {
      rank: 2,
      location: 'Sitabuldi Interchange',
      riskTitle: 'Severe Traffic Gridlock & Overflow (89%)',
      subtext: 'Flyover ramp experiencing 94% standstill and 2 ft standing water.',
      recommended: 'Barricade Low-Lying Ramp + Deploy Traffic Police Squad 3',
      actionLabel: 'Barricade & Divert',
      badgeClass: 'bg-[#E53935] text-white font-bold',
      borderColor: 'border-[#E53935]/30 bg-white dark:bg-[#0B1320]'
    },
    {
      rank: 3,
      location: 'Wardha Road (Airport Stretch)',
      riskTitle: 'Road Damage & Pothole Risk (78%)',
      subtext: 'Continuous submergence causing sub-base asphalt cavitation.',
      recommended: 'Deploy PWD Mobile Cold-Mix Patching Unit + Hazard Cones',
      actionLabel: 'Dispatch Repair Unit',
      badgeClass: 'bg-[#FF8A00] text-white font-bold',
      borderColor: 'border-[#FF8A00]/30 bg-white dark:bg-[#0B1320]'
    }
  ];

  return (
    <div className="bg-white dark:bg-[#111C2E] rounded-2xl p-4 sm:p-5 border border-[#E5E5E5] dark:border-white/10 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#FFC107]/20 text-[#111111] dark:text-[#FFC107]">
            <Cpu className="size-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#111111] dark:text-white tracking-tight flex items-center gap-2">
              AI Actionable Response Priorities
              <Badge className="bg-[#FFC107] text-[#111111] text-[10px] font-mono font-black">
                XGBoost ML v2.4
              </Badge>
            </h3>
            <p className="text-xs text-[#666666] dark:text-gray-400">
              Autonomous decision engine optimizing civic resource allocation
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          render={<Link to="/ai-predictions" />}
          className="text-xs font-bold gap-1 border-[#E5E5E5] text-[#111111] dark:text-white"
        >
          Model Specs <ArrowRight className="size-3.5" />
        </Button>
      </div>

      <div className="space-y-3 flex-1">
        {priorities.map(item => (
          <div
            key={item.rank}
            className={`p-3.5 rounded-xl border ${item.borderColor} transition-all hover:border-[#FFC107] shadow-2xs flex flex-col gap-2`}
          >
            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <span className="size-7 rounded-xl bg-[#FFC107] text-[#111111] font-black text-xs flex items-center justify-center font-mono shadow-xs">
                  #{item.rank}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#111111] dark:text-white">
                    {item.location}
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${item.badgeClass}`}>
                    {item.riskTitle}
                  </span>
                </div>
              </div>

              <Badge variant="outline" className="text-[10px] border-[#22A447]/40 text-[#22A447] bg-[#22A447]/10 font-bold">
                <ShieldCheck className="size-3 mr-1" /> Action Ready
              </Badge>
            </div>

            <p className="text-xs text-[#666666] dark:text-gray-400">
              {item.subtext}
            </p>

            <div className="p-2.5 rounded-lg bg-[#F7F7F7] dark:bg-slate-900 border border-[#E5E5E5] dark:border-white/10 text-xs">
              <span className="font-bold text-[#FF8A00] block mb-0.5">
                🤖 AI Recommended Action:
              </span>
              <span className="text-[#111111] dark:text-white font-medium">
                {item.recommended}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
