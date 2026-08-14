import React from 'react';
import { NavLink } from 'react-router';
import { Home, Navigation, MapPin, BellRing, PlusCircle, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export const CitizenBottomNav: React.FC = () => {
  const navItems = [
    {
      label: 'Home',
      to: '/citizen',
      icon: Home,
      end: true
    },
    {
      label: 'Safe Route',
      to: '/citizen/route',
      icon: Navigation,
      highlight: true
    },
    {
      label: 'Live Map',
      to: '/citizen/map',
      icon: MapPin
    },
    {
      label: 'Report',
      to: '/citizen/report',
      icon: PlusCircle,
      isSpecial: true
    },
    {
      label: 'Alerts',
      to: '/citizen/alerts',
      icon: BellRing,
      badge: '3'
    },
    {
      label: 'Profile',
      to: '/citizen/profile',
      icon: User
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0B1320]/95 backdrop-blur-lg border-t border-[#E5E5E5] dark:border-white/10 shadow-lg px-2 py-1.5 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center min-w-[54px] py-1 px-1.5 rounded-xl transition-all relative text-center",
                  item.isSpecial
                    ? "text-[#FF8A00] font-bold"
                    : isActive
                    ? "text-[#FF8A00] font-bold dark:text-[#FFC107]"
                    : "text-[#666666] dark:text-gray-400 hover:text-[#111111] dark:hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.isSpecial ? (
                    <div className="size-9 -mt-4 rounded-full bg-gradient-to-tr from-[#FF8A00] to-[#FFC107] flex items-center justify-center text-white shadow-md ring-4 ring-white dark:ring-[#0B1320] active:scale-95 transition-transform">
                      <Icon className="size-5" />
                    </div>
                  ) : (
                    <div className="relative">
                      <Icon
                        className={cn(
                          "size-5 transition-transform",
                          isActive ? "scale-110" : ""
                        )}
                      />
                      {item.badge && (
                        <span className="absolute -top-1 -right-2 size-4 rounded-full bg-[#E53935] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                  <span className={cn("text-[10px] mt-0.5 tracking-tight", item.isSpecial ? "font-bold text-[#FF8A00]" : "")}>
                    {item.label}
                  </span>
                  {isActive && !item.isSpecial && (
                    <span className="absolute bottom-0 w-4 h-0.5 bg-[#FF8A00] rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
