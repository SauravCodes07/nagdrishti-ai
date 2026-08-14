import React from 'react';
import { Link } from 'react-router';
import nagdrishtiLogo from '../../../assets/images/logos/nagdrishti-logo.png';
import { ShieldCheck, Heart } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#070D18] border-t border-[#E5E5E5] dark:border-white/10 pt-12 pb-8 text-xs text-[#666666] dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-slate-900/5 dark:bg-slate-800/40 p-1 flex items-center justify-center border border-[#E5E5E5] dark:border-white/10 shrink-0 shadow-xs">
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
                <span className="text-[10px] text-[#666666] dark:text-gray-400 font-medium">
                  Predict. Protect. Navigate.
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#666666] dark:text-gray-400 max-w-md leading-relaxed">
              AI-powered urban crisis management and year-round safe navigation system for Nagpur Municipal Corporation (NMC) and citizens. Real-time predictive intelligence for waterlogging, road hazards, civil construction, and emergency response.
            </p>

            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 pt-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Nagpur Zero Mile Telemetry Active</span>
            </div>
          </div>

          {/* Quick Links Col */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-[#111111] dark:text-white uppercase tracking-wider">
              Platform Links
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/citizen" className="hover:text-[#FF8A00] transition-colors">
                  Citizen Mobile Experience
                </Link>
              </li>
              <li>
                <Link to="/citizen/route" className="hover:text-[#FF8A00] transition-colors">
                  Predictive Safe Route Planner
                </Link>
              </li>
              <li>
                <Link to="/citizen/map" className="hover:text-[#FF8A00] transition-colors">
                  Citizen Live Map
                </Link>
              </li>
              <li>
                <Link to="/citizen/report" className="hover:text-[#FF8A00] transition-colors">
                  Report Urban Hazard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#FF8A00] transition-colors">
                  Crisis Command Center
                </Link>
              </li>
              <li>
                <Link to="/admin/satellite" className="hover:text-[#FF8A00] transition-colors">
                  Satellite Intelligence
                </Link>
              </li>
              <li>
                <Link to="/admin/construction" className="hover:text-[#FF8A00] transition-colors">
                  Year-Round Construction Watch
                </Link>
              </li>
            </ul>
          </div>

          {/* Attribution & Data Sources Col */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-[#111111] dark:text-white uppercase tracking-wider">
              Data & AI Attribution
            </h4>
            <ul className="space-y-1.5 text-[11px] text-[#666666] dark:text-gray-400">
              <li>• Weather: Open-Meteo API (Live Nagpur telemetry)</li>
              <li>• Maps & Basemaps: OpenStreetMap contributors & Mapbox GL</li>
              <li>• Earth Observation: Copernicus Sentinel-1 SAR & Sentinel-2 MSI</li>
              <li>• GeoAI Pipeline: Hugging Face IBM/NASA Prithvi EO-100M</li>
              <li>• Spatial Database: PostgreSQL + PostGIS 3.4</li>
              <li>• Civic Jurisdiction: Nagpur Municipal Corporation (NMC)</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-6 border-t border-[#E5E5E5] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© 2026 NagDrishti AI. Built with <Heart className="inline size-3 text-[#E53935]" /> for the citizens of Nagpur.</p>
          <div className="flex items-center gap-4">
            <span>Predict. Protect. Navigate.</span>
            <span className="font-mono text-[#FF8A00] font-bold">v1.0-PROD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
