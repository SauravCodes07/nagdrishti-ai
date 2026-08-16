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
                  className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {serv.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Monsoon Safety Guidelines */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Urban Monsoon Safety Protocols
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAFETY_TIPS.map((tip, idx) => (
              <div
                key={tip.title}
                className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-5 shadow-sm space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 font-black text-xs flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{tip.title}</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-8">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Municipal Officer Portal Banner */}
        <div className="bg-slate-100 dark:bg-[#131B2A] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Municipal Officer Command Center
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Authorized municipal administrators, dewatering pump dispatches, and priority moderation
            </p>
          </div>

          <Link
            href="/admin/login"
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md flex items-center gap-2 active:scale-95 transition whitespace-nowrap"
          >
            <Lock className="w-4 h-4" />
            <span>Officer Sign In</span>
          </Link>
        </div>
      </div>
    </CitizenLayout>
  );
}
