"use client";

import {
  PhoneCall,
  Shield,
  HelpCircle,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  ExternalLink,
  Info,
  MapPin,
  Lock,
} from "lucide-react";
import Link from "next/link";
import CitizenLayout from "../../components/layouts/CitizenLayout";

const EMERGENCY_SERVICES = [
  {
    title: "NMC 24/7 Flood & Disaster Control Room",
    phone: "0712-2567035",
    desc: "Nagpur Municipal Corporation emergency waterlogging and drainage helpline.",
    badge: "Official Municipal Desk",
  },
  {
    title: "Police Emergency Response",
    phone: "112",
    desc: "National emergency dialer for road blockages, accidents, and life safety.",
    badge: "24/7 National Dispatch",
  },
  {
    title: "Fire & Flood Rescue",
    phone: "101",
    desc: "Rapid deployment for deep water rescue, fallen trees, and flash evacuations.",
    badge: "Disaster Response",
  },
  {
    title: "Ambulance / Medical Emergency",
    phone: "108",
    desc: "Emergency medical transport and hospital routing in crisis zones.",
    badge: "Medical Response",
  },
];

const SAFETY_TIPS = [
  {
    title: "Never drive through moving water",
    desc: "Just 15 cm of moving water can stall a vehicle; 30 cm can carry away small cars. Utilize NagDrishti safe routing.",
  },
  {
    title: "Avoid submerged railway underpasses",
    desc: "Nagpur underpasses (e.g. Narendra Nagar, Anand Talkies) accumulate water rapidly during cloudbursts.",
  },
  {
    title: "Keep away from electrical poles and open drains",
    desc: "Inundated roads conceal open manholes and live electrical leakage hazards during torrential downpours.",
  },
  {
    title: "Report hazards with photo evidence",
    desc: "Crowdsourced photos immediately alert municipal response pumps and update routing calculations for other citizens.",
  },
];

export default function HelpSafetyPage() {
  return (
    <CitizenLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Civic Helplines & Monsoon Safety
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
            24/7 verified emergency numbers, monsoon advisory guidelines, and municipal disaster coordination for Nagpur
          </p>
        </div>

        {/* Emergency Contacts Directory */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Official Nagpur Emergency Helplines
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EMERGENCY_SERVICES.map((serv) => (
              <div
                key={serv.title}
                className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-red-500/40 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                      {serv.badge}
                    </span>
                    <PhoneCall className="w-4 h-4 text-red-500" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{serv.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{serv.desc}</p>
                </div>

                <a
                  href={`tel:${serv.phone.replace(/[^0-9]/g, "")}`}
                  className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/30 transition active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {serv.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Monsoon Survival Guidelines */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#EA580C] dark:text-[#FF8A00]" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Urban Flash Flood Safety Guidelines
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAFETY_TIPS.map((tip, idx) => (
              <div
                key={tip.title}
                className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-xl bg-[#FFF7ED] dark:bg-[#FF8A00]/15 text-[#EA580C] dark:text-[#FF8A00] text-xs font-black flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">{tip.title}</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-8 font-medium">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Officer Command Portal Link */}
        <div className="bg-gradient-to-r from-[#FFF7ED] to-slate-50 dark:from-[#FF8A00]/10 dark:to-[#131B2A] border border-[#FF8A00]/30 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#EA580C] dark:text-[#FF8A00]" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Municipal Officer Command Portal
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Access the priority dispatch queue, moderate citizen photo reports, and trigger Twilio SMS/WhatsApp dispatches.
            </p>
          </div>

          <Link
            href="/admin/login"
            className="px-5 py-3 rounded-2xl bg-[#EA580C] dark:bg-[#FF8A00] hover:bg-[#C2410C] dark:hover:bg-[#FFA726] text-white dark:text-slate-950 font-black text-xs shrink-0 flex items-center justify-center gap-2 shadow-md shadow-[#FF8A00]/25 transition active:scale-95"
          >
            <span>Officer Login</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </CitizenLayout>
  );
}
