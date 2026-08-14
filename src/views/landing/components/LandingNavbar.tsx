import React, { useState } from 'react';
import { Link } from 'react-router';
import { ShieldCheck, User, Menu, X, Sun, Moon, ArrowRight } from 'lucide-react';
import nagdrishtiLogo from '../../../assets/images/logos/nagdrishti-logo.png';
import { useTheme } from '../../../context/theme/ThemeContext';

export const LandingNavbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            className="p-1.5 rounded-lg border border-[#E5E5E5] dark:border-white/10 text-[#111111] dark:text-white"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5E5] dark:border-white/10 bg-white dark:bg-[#0B1320] p-4 space-y-3 shadow-lg">
          <div className="flex flex-col gap-2.5 text-xs font-bold text-[#111111] dark:text-gray-200">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#F7F7F7] dark:hover:bg-white/5"
            >
              How It Works
            </a>
            <a
              href="#route-intelligence"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#F7F7F7] dark:hover:bg-white/5"
            >
              Predictive Safe Routing
            </a>
            <a
              href="#geoai-satellite"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#F7F7F7] dark:hover:bg-white/5"
            >
              Copernicus Satellite & GeoAI
            </a>
            <a
              href="#year-round"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#F7F7F7] dark:hover:bg-white/5"
            >
              Year-Round Intelligence
            </a>
            <a
              href="#two-sided"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#F7F7F7] dark:hover:bg-white/5"
            >
              Citizen vs Admin
            </a>
          </div>

          <div className="pt-2 flex flex-col gap-2 border-t border-[#E5E5E5] dark:border-white/10">
            <Link
              to="/citizen"
              className="w-full text-center py-2.5 text-xs font-bold rounded-xl bg-[#F7F7F7] dark:bg-white/10 border border-[#E5E5E5] dark:border-white/10 text-[#111111] dark:text-white"
            >
              Explore Citizen App
            </Link>
            <Link
              to="/admin"
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
