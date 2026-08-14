import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  MapPin,
  BellRing,
  FileSpreadsheet,
  Menu,
  CloudRain,
  Waves,
  AlertTriangle,
  Car,
  Layers,
  Siren,
  Truck,
  Cpu,
  History,
  BarChart3,
  Navigation,
  Settings,
  HelpCircle,
  X,
  Sparkles
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { cn } from '../../lib/utils';
import nagdrishtiLogo from '@/assets/images/logos/nagdrishti-logo.png';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const mainTabs = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Live Map', path: '/live-map', icon: MapPin },
    { label: 'Alerts', path: '/alerts', icon: BellRing, badge: '3' },
    { label: 'Reports', path: '/citizen-reports', icon: FileSpreadsheet },
  ];

  const moreMenuItems = [
    { label: 'Safe Route Planner', path: '/safe-route', icon: Navigation, isHighlight: true },
    { label: 'Rainfall Monitor', path: '/rainfall', icon: CloudRain },
    { label: 'Waterlogging Risk', path: '/waterlogging', icon: Waves },
    { label: 'Road Risk', path: '/road-risk', icon: AlertTriangle },
    { label: 'Traffic Monitor', path: '/traffic', icon: Car },
    { label: 'Drainage & Elevation', path: '/drainage', icon: Layers },
    { label: 'Emergency Response', path: '/emergency-response', icon: Siren },
    { label: 'Resource Management', path: '/resources', icon: Truck },
    { label: 'AI Predictions', path: '/ai-predictions', icon: Cpu, isBadge: 'AI' },
    { label: 'Historical Data', path: '/historical-data', icon: History },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Help & Support', path: '/help', icon: HelpCircle },
  ];

  return (
    <>
      {/* Sticky Bottom Navigation Bar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border shadow-lg md:hidden">
        <div className="flex items-center justify-around h-16 px-1 max-w-md mx-auto">
          {mainTabs.map(tab => {
            const isActive = location.pathname === tab.path;
            const IconComp = tab.icon;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[44px] transition-colors relative",
                  isActive ? "text-bhagwa font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <IconComp className={cn("size-5 transition-transform", isActive && "scale-110")} />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-5 h-0.5 bg-bhagwa rounded-full" />
                )}
              </Link>
            );
          })}

          {/* More Menu Trigger */}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[44px] transition-colors relative text-muted-foreground hover:text-foreground"
            )}
          >
            <Menu className="size-5" />
            <span className="text-[10px] mt-1 tracking-tight">More</span>
          </button>
        </div>
      </nav>

      {/* Drawer / Sheet for More Navigation Options */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 overflow-hidden flex flex-col bg-background">
          <SheetHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5 text-left">
              <div className="size-9 rounded-xl bg-slate-900/5 dark:bg-slate-800/40 p-1 flex items-center justify-center border border-border shrink-0 shadow-xs">
                <img
                  src={nagdrishtiLogo}
                  alt="NagDrishti AI Logo"
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-foreground font-outfit flex items-center gap-1.5">
                  NagDrishti <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-bhagwa text-white rounded">AI</span>
                </SheetTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="size-3 text-bhagwa" /> AI Urban Crisis Navigation
                </p>
              </div>
            </div>
            <button
              onClick={() => setMoreOpen(false)}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="size-5" />
            </button>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {moreMenuItems.map(item => {
                const isActive = location.pathname === item.path;
                const IconComp = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer min-h-[48px]",
                      isActive
                        ? "bg-bhagwa/10 border-bhagwa/40 text-bhagwa font-bold shadow-sm"
                        : item.isHighlight
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold"
                        : "bg-card border-border hover:bg-muted text-foreground"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      isActive ? "bg-bhagwa text-white" : "bg-muted text-muted-foreground"
                    )}>
                      <IconComp className="size-4" />
                    </div>
                    <div className="flex-1 truncate">
                      <span className="block truncate">{item.label}</span>
                      {item.isBadge && (
                        <span className="text-[9px] font-bold text-bhagwa uppercase">
                          {item.isBadge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
