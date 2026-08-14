import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ShieldCheck, User, Menu, X, Sun, Moon, ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import nagdrishtiLogo from '../../../assets/images/logos/nagdrishti-logo.png';
import { useTheme } from '../../../context/theme/ThemeContext';

export const LandingNavbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredInstallPrompt(null);
    } else {
      alert('To install NagDrishti AI on your mobile device, open browser settings (three dots or share button) and select "Add to Home screen".');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0B1320]/90 backdrop-blur-md border-b border-[#E5E5E5] dark:border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="size-10 rounded-xl bg-slate-900/5 dark:bg-slate-800/40 p-1 flex items-center justify-center border border-[#E5E5E5] dark:border-white/10 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <img
              src={nagdrishtiLogo}
              alt="NagDrishti AI"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight font-outfit text-[#111111] dark:text-white">
                NagDrishti
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 bg-[#FFC107] text-[#111111] rounded shadow-xs tracking-wider">
                AI
              </span>
            </div>
            <span className="text-[10px] font-medium text-[#666666] dark:text-gray-400 leading-none">
              Urban Intelligence for Nagpur
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#666666] dark:text-gray-300">
          <a href="#how-it-works" className="hover:text-[#FF8A00] transition-colors">
            How It Works
          </a>
          <a href="#route-intelligence" className="hover:text-[#FF8A00] transition-colors">
            Safe Routing
          </a>
          <a href="#geoai-satellite" className="hover:text-[#FF8A00] transition-colors">
            GeoAI & Satellite
          </a>
          <a href="#year-round" className="hover:text-[#FF8A00] transition-colors">
            Year-Round
          </a>
          <a href="#two-sided" className="hover:text-[#FF8A00] transition-colors">
            Citizen vs Admin
          </a>
        </nav>

        {/* Right Actions (Theme + CTAs) */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="size-9 rounded-xl flex items-center justify-center border border-[#E5E5E5] dark:border-white/10 text-[#666666] dark:text-gray-300 hover:bg-[#F7F7F7] dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Toggle Dark/Light"
          >
            {theme === 'dark' ? <Sun className="size-4 text-[#FFC107]" /> : <Moon className="size-4 text-[#666666]" />}
          </button>

          <Link
            to="/citizen"
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-[#F7F7F7] dark:bg-white/5 border border-[#E5E5E5] dark:border-white/10 text-[#111111] dark:text-white hover:border-[#FF8A00] transition-all shadow-xs"
          >
            <User className="size-3.5 text-[#FF8A00]" />
            <span>Citizen App</span>
          </Link>

          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#FFC107] text-white hover:opacity-90 transition-all shadow-btn-shadow"
          >
            <ShieldCheck className="size-3.5" />
            <span>Command Center</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="size-8 rounded-lg flex items-center justify-center border border-[#E5E5E5] dark:border-white/10"
          >
            {theme === 'dark' ? <Sun className="size-4 text-[#FFC107]" /> : <Moon className="size-4 text-[#666666]" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-[#E5E5E5] dark:border-white/10 text-[#111111] dark:text-white cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu — Includes PWA Install option ONLY while open */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5E5] dark:border-white/10 bg-white dark:bg-[#0B1320] p-4 space-y-3 shadow-2xl animate-fadeIn">
          <div className="flex flex-col gap-1.5 text-xs font-bold text-[#111111] dark:text-gray-200">
            <Link
              to="/citizen"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-[#F7F7F7] dark:hover:bg-white/5 flex items-center justify-between"
            >
              <span>🏠 Home (Citizen App)</span>
              <span className="text-[10px] text-[#FF8A00] font-mono font-bold">MOBILE</span>
            </Link>
            <Link
              to="/citizen/map"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-[#F7F7F7] dark:hover:bg-white/5"
            >
              🗺️ Explore Live Map
            </Link>
            <Link
              to="/citizen/route"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-[#F7F7F7] dark:hover:bg-white/5"
            >
              🧭 Safe Route Planner
            </Link>
            <Link
              to="/citizen/alerts"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-[#F7F7F7] dark:hover:bg-white/5"
            >
              🔔 Safety Alerts
            </Link>
            <Link
              to="/citizen/report"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-[#F7F7F7] dark:hover:bg-white/5"
            >
              📸 Report Hazard
            </Link>
            <Link
              to="/citizen/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-[#F7F7F7] dark:hover:bg-white/5"
            >
              👤 Profile & Saved Places
            </Link>
          </div>

          <div className="pt-2 flex flex-col gap-2 border-t border-[#E5E5E5] dark:border-white/10">
            {/* PWA Install Button — Mobile Navigation Drawer ONLY */}
            {!isAppInstalled ? (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                <Download className="size-4 text-emerald-600" />
                <span>Install NagDrishti App (PWA)</span>
              </button>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl bg-emerald-500/5 text-emerald-600 border border-emerald-500/20">
                <CheckCircle2 className="size-4" />
                <span>NagDrishti App Installed</span>
              </div>
            )}

            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-xs font-bold rounded-xl bg-[#FF8A00] text-white shadow-xs"
            >
              Open Command Center
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
