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
      badgeClass: 'bg-rose-500 text-white font-bold',
      borderColor: 'border-rose-500/40 bg-rose-500/5'
    },
    {
      rank: 2,
      location: 'Sitabuldi Interchange',
      riskTitle: 'Severe Traffic Gridlock & Overflow (89%)',
      subtext: 'Flyover ramp experiencing 94% standstill and 2 ft standing water.',
      recommended: 'Barricade Low-Lying Ramp + Deploy Traffic Police Squad 3',
      actionLabel: 'Barricade & Divert',
      badgeClass: 'bg-rose-500 text-white font-bold',
      borderColor: 'border-rose-500/30 bg-rose-500/5'
    },
    {
      rank: 3,
      location: 'Wardha Road (Airport Stretch)',
      riskTitle: 'Road Damage & Pothole Risk (78%)',
      subtext: 'Continuous submergence causing sub-base asphalt cavitation.',
      recommended: 'Deploy PWD Mobile Cold-Mix Patching Unit + Hazard Cones',
      actionLabel: 'Dispatch Repair Unit',
      badgeClass: 'bg-orange-500 text-white font-bold',
      borderColor: 'border-orange-500/30 bg-orange-500/5'
    }
  ];

  return (
    <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-bhagwa/10 text-bhagwa">
            <Cpu className="size-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground tracking-tight flex items-center gap-2">
              AI Actionable Response Priorities
              <Badge className="bg-bhagwa text-white text-[10px] font-mono">
                XGBoost ML v2.4
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              Autonomous decision engine optimizing civic resource allocation
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          render={<Link to="/ai-predictions" />}
          className="text-xs font-semibold gap-1"
        >
          Model Specs <ArrowRight className="size-3.5" />
        </Button>
      </div>

      <div className="space-y-3 flex-1">
        {priorities.map(item => (
          <div
            key={item.rank}
            className={`p-3.5 rounded-xl border ${item.borderColor} transition-all hover:shadow-md flex flex-col gap-2`}
          >
            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <span className="size-7 rounded-xl bg-bhagwa text-white font-black text-xs flex items-center justify-center font-mono shadow-sm">
                  #{item.rank}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {item.location}
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${item.badgeClass}`}>
                    {item.riskTitle}
                  </span>
                </div>
              </div>

              <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 bg-emerald-500/10 font-bold">
                <ShieldCheck className="size-3 mr-1" /> Action Ready
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              {item.subtext}
            </p>

            <div className="p-2 rounded-lg bg-background border border-border/60 text-xs">
              <span className="font-bold text-bhagwa block mb-0.5">
                🤖 AI Recommended Action:
              </span>
              <span className="text-foreground font-medium">
                {item.recommended}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
