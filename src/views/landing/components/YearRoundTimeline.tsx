import React, { useState } from 'react';
import { CloudRain, Leaf, HardHat } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Link } from 'react-router';

export const YearRoundTimeline: React.FC = () => {
  const [selectedSeason, setSelectedSeason] = useState<'MONSOON' | 'POST_MONSOON' | 'YEAR_ROUND'>('YEAR_ROUND');

  const seasons = [
    {
      id: 'MONSOON',
      title: 'Monsoon Season (June – September)',
      shortTitle: '🌧️ Monsoon',
      tagline: 'Predictive Flood & Waterlogging Management',
      icon: <CloudRain className="size-5 text-blue-500" />,
      color: 'border-blue-500/40 bg-blue-500/5',
      features: [
        { title: 'Underpass Submergence Watch', desc: 'Predicts water depth at Gokulpeth, Narendra Nagar, and Anand Talkies railway underpasses before cars enter.' },
        { title: 'Copernicus Sentinel-1 SAR Radar', desc: 'Penetrates thick monsoon clouds to map lake basin overflows (Ambazari, Futala, Gorewada).' },
        { title: 'Emergency Dewatering Deployment', desc: 'Automated dispatch suggestions for NMC heavy diesel pumps and rescue boats.' }
      ]
    },
    {
      id: 'POST_MONSOON',
      title: 'Post-Monsoon & Autumn (October – December)',
      shortTitle: '🍂 Post-Monsoon',
      tagline: 'Asphalt Degradation & Pothole Rehabilitation',
      icon: <Leaf className="size-5 text-amber-500" />,
      color: 'border-amber-500/40 bg-amber-500/5',
      features: [
        { title: 'Pothole & Cavitation Mapping', desc: 'Crowdsourced citizen reports and road quality scanning to map post-rain surface wear.' },
        { title: 'PWD Road Resurfacing Tracking', desc: 'Monitor hot-mix asphalt patching and road quality recovery scores across zones.' },
        { title: 'Festival Traffic Routing', desc: 'Predictive diversions for Dhammachakra Pravartan Din at Deekshabhoomi and Diwali markets.' }
      ]
    },
    {
      id: 'YEAR_ROUND',
      title: 'Year-Round Civil Works & Mobility (365 Days)',
      shortTitle: '🏗️ Year-Round',
      tagline: 'Infrastructure Construction & Continuous Safe Navigation',
      icon: <HardHat className="size-5 text-[#FF8A00]" />,
      color: 'border-[#FF8A00]/40 bg-[#FFF8E1] dark:bg-[#FFC107]/10',
      features: [
        { title: 'Maha Metro Phase 2 Monitoring', desc: 'Live lane closure and detour advice for 43.8 km of new metro corridors (Kamptee & Hingna).' },
        { title: 'Flyover & Drainage Upgrades', desc: 'Year-round registry of Pardi double-decker flyover and Wardha Road storm culvert rebuilds.' },
        { title: 'Turn-by-Turn Safe Routing', desc: 'Daily commute optimization factoring construction choke points, potholes, and traffic.' }
      ]
    }
  ];

  const activeSeason = seasons.find(s => s.id === selectedSeason) || seasons[2];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC107]/15 border border-[#FFC107]/40 text-[#111111] dark:text-[#FFC107] text-xs font-mono font-bold">
          <HardHat className="size-3.5 text-[#FF8A00]" /> 365-DAY PLATFORM
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] dark:text-white tracking-tight font-outfit">
          Not Just for the Rain. Built for the Entire Year.
        </h2>
        <p className="text-sm sm:text-base text-[#666666] dark:text-gray-300">
          Nagpur's roads face heavy monsoon rains in July, post-monsoon pothole cavitation in October, and massive Maha Metro Phase 2 civil construction year-round. NagDrishti protects your daily journey in every season.
        </p>
      </div>

      {/* Season Selection Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {seasons.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSeason(s.id as any)}
            className={cn(
              "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border",
              selectedSeason === s.id
                ? "bg-[#FF8A00] text-white border-[#FF8A00] shadow-md"
                : "bg-white dark:bg-[#111C2E] text-[#111111] dark:text-gray-200 border-[#E5E5E5] dark:border-white/10 hover:border-[#FFC107]"
            )}
          >
            {s.icon}
            <span>{s.shortTitle}</span>
          </button>
        ))}
      </div>

      {/* Season Showcase Card */}
      <div className="bg-white dark:bg-[#111C2E] p-6 sm:p-8 rounded-3xl border border-[#E5E5E5] dark:border-white/10 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E5] dark:border-white/10 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-[#FF8A00] uppercase tracking-wider">
              {activeSeason.tagline}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111] dark:text-white mt-1">
              {activeSeason.title}
            </h3>
          </div>

          <Link
            to="/admin/construction"
            className="text-xs font-bold text-[#FF8A00] hover:underline flex items-center gap-1"
          >
            Explore Year-Round Registry →
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeSeason.features.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#F7F7F7] dark:bg-[#0B1320] border border-[#E5E5E5] dark:border-white/5 space-y-2 hover:border-[#FF8A00] transition-all"
            >
              <div className="size-8 rounded-xl bg-white dark:bg-slate-800 border border-[#E5E5E5] dark:border-white/10 flex items-center justify-center text-[#FF8A00] font-bold text-xs shadow-2xs">
                0{idx + 1}
              </div>
              <h4 className="font-bold text-sm text-[#111111] dark:text-white">
                {feat.title}
              </h4>
              <p className="text-xs text-[#666666] dark:text-gray-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
