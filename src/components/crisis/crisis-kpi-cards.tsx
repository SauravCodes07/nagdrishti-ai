import React from 'react';
import { useDemoSimulation } from '../../context/DemoSimulationContext';
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2, Siren, Truck } from 'lucide-react';
import { cn } from '../../lib/utils';

export const CrisisKpiCards: React.FC = () => {
  const { kpis, stage } = useDemoSimulation();

  const cards = [
    {
      title: 'Severe Risk Zones',
      value: kpis.severeZonesCount,
      subtitle: 'Critical Flood Watch',
      icon: ShieldAlert,
      color: 'text-[#E53935]',
      bgColor: 'bg-[#E53935]/10',
      borderColor: 'border-[#E53935]/30 hover:border-[#E53935]',
      badgeColor: 'bg-[#E53935] text-white',
      trend: '+2 in 10m',
      isUp: true
    },
    {
      title: 'High Risk Zones',
      value: kpis.highZonesCount,
      subtitle: 'Heavy Runoff Watch',
      icon: AlertTriangle,
      color: 'text-[#FF8A00]',
      bgColor: 'bg-[#FF8A00]/10',
      borderColor: 'border-[#FF8A00]/30 hover:border-[#FF8A00]',
      badgeColor: 'bg-[#FF8A00] text-white',
      trend: '+4 in 15m',
      isUp: true
    },
    {
      title: 'Medium Risk Zones',
      value: kpis.mediumZonesCount,
      subtitle: 'Moderate Vulnerability',
      icon: AlertCircle,
      color: 'text-[#FFC107]',
      bgColor: 'bg-[#FFC107]/15',
      borderColor: 'border-[#FFC107]/40 hover:border-[#FFC107]',
      badgeColor: 'bg-[#FFC107] text-[#111111]',
      trend: 'Stable',
      isUp: false
    },
    {
      title: 'Low Risk Zones',
      value: kpis.lowZonesCount,
      subtitle: 'Elevated & Safe',
      icon: CheckCircle2,
      color: 'text-[#22A447]',
      bgColor: 'bg-[#22A447]/10',
      borderColor: 'border-[#22A447]/30 hover:border-[#22A447]',
      badgeColor: 'bg-[#22A447] text-white',
      trend: 'Normal',
      isUp: false
    },
    {
      title: 'Active Incidents',
      value: kpis.activeIncidentsCount,
      subtitle: 'Logged & Verified',
      icon: Siren,
      color: 'text-[#E53935]',
      bgColor: 'bg-[#E53935]/10',
      borderColor: 'border-[#E53935]/30 hover:border-[#E53935]',
      badgeColor: 'bg-[#E53935] text-white animate-pulse',
      trend: `Stage ${stage} Peak`,
      isUp: true
    },
    {
      title: 'Resources Deployed',
      value: kpis.resourcesDeployedCount,
      subtitle: 'Pumps & Response Teams',
      icon: Truck,
      color: 'text-[#FF8A00]',
      bgColor: 'bg-[#FF8A00]/10',
      borderColor: 'border-[#FF8A00]/30 hover:border-[#FF8A00]',
      badgeColor: 'bg-[#FF8A00] text-white',
      trend: '78% Capacity',
      isUp: true
    }
  ];

  return (
    <div className="w-full">
      {/* Mobile Horizontal Swipe Carousel / Desktop Grid */}
      <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-2 sm:pb-0 no-scrollbar snap-x snap-mandatory">
        {cards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div
              key={idx}
              className={cn(
                "min-w-[200px] sm:min-w-0 flex-1 bg-card rounded-2xl p-4 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 snap-align-start flex flex-col justify-between group",
                card.borderColor
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", card.bgColor, card.color)}>
                  <IconComp className="size-5" />
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full font-mono", card.badgeColor)}>
                  {card.trend}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">units</span>
                </div>
                <h4 className="text-xs font-bold text-foreground mt-0.5 truncate">
                  {card.title}
                </h4>
                <p className="text-[11px] text-muted-foreground truncate">
                  {card.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
