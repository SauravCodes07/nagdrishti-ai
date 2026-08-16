"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Sun,
  Moon,
  Monitor,
  PhoneCall,
  Shield,
  Info,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Heart,
} from "lucide-react";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { useTheme } from "../../components/ThemeProvider";

export default function CitizenProfilePage() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <CitizenLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            App Settings & Help
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Personalize theme preferences and access emergency services
          </p>
        </div>

        {/* 1. Theme Preferences Card */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Display Theme
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose appearance mode (saved automatically)
              </p>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
              Active: {theme}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => setTheme("light")}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition active:scale-95 ${
                theme === "light"
                  ? "bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-300 font-black shadow-sm"
                  : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="text-xs">Light</span>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition active:scale-95 ${
                theme === "dark"
                  ? "bg-teal-500/10 border-teal-500 text-teal-400 font-black shadow-sm"
                  : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              <Moon className="w-5 h-5 text-indigo-400" />
              <span className="text-xs">Dark</span>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition active:scale-95 ${
                theme === "system"
                  ? "bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400 font-black shadow-sm"
                  : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              <Monitor className="w-5 h-5 text-teal-500" />
              <span className="text-xs">System</span>
            </button>
          </div>
        </div>

        {/* 2. Emergency Contacts Directory */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-black text-slate-900 dark:text-white">
            Nagpur Emergency Contacts
          </h2>

          <div className="space-y-2">
            <a
              href="tel:07122567035"
              className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-center justify-between text-red-700 dark:text-red-300 font-bold text-xs hover:bg-red-100 transition"
            >
              <div>
                <div className="text-[10px] text-red-500 uppercase">NMC Flood Disaster Control</div>
                <div className="text-sm font-black">0712-2567035</div>
              </div>
              <PhoneCall className="w-4 h-4 text-red-600" />
            </a>

            <a
              href="tel:112"
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 transition"
            >
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Police / Emergency Response</div>
                <div className="text-sm font-black">112</div>
              </div>
              <PhoneCall className="w-4 h-4 text-teal-600" />
            </a>

            <a
              href="tel:101"
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 transition"
            >
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Fire & Flood Rescue</div>
                <div className="text-sm font-black">101</div>
              </div>
              <PhoneCall className="w-4 h-4 text-teal-600" />
            </a>
          </div>
        </div>

        {/* 3. Flood Safety Guidelines */}
        <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Monsoon Safety Tips
            </h2>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 flex-shrink-0" />
              <span>Avoid driving through waterlogged underpasses or submerged roads.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 flex-shrink-0" />
              <span>Stay clear of electric poles, transformers, and submerged wiring during downpours.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 flex-shrink-0" />
              <span>Use NagDrishti AI safe routes to navigate around high-risk catchment basins.</span>
            </div>
          </div>
        </div>

        {/* 4. App Info & Officer Portal link */}
        <div className="p-4 rounded-3xl bg-teal-500/10 border border-teal-500/20 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-950 p-1 flex items-center justify-center mx-auto shadow-md border border-teal-500/30">
            <Image
              src="/brand/nagdrishti-logo.png"
              alt="NagDrishti AI"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div className="text-xs font-black text-slate-900 dark:text-white">
            NagDrishti AI — Nagpur Urban Crisis Shield
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Built with OSMnx GIS Engine • Hugging Face Vision AI • Django DRF • Next.js 16
          </p>
          <div className="pt-1">
            <Link
              href="/admin/login"
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center justify-center gap-1"
            >
              <span>Municipal Officer Login</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
