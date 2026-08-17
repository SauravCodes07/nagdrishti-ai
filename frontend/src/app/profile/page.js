"use client";

import {
  PhoneCall,
  Shield,
  ExternalLink,
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
          <h1 className="text-2xl sm:text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Civic Helplines & Safety
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
            24/7 verified emergency numbers, monsoon advisory guidelines, and municipal disaster coordination for Nagpur
          </p>
        </div>

        {/* Emergency Contacts Directory */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-[#DC2626]" />
            <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Emergency Helplines
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EMERGENCY_SERVICES.map((serv) => (
              <div
                key={serv.title}
                className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-red-200 dark:border-red-900/40 rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] dark:bg-red-500/20 dark:text-[#F87171]">
                      {serv.badge}
                    </span>
                    <PhoneCall className="w-4 h-4 text-[#DC2626]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{serv.title}</h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{serv.desc}</p>
                </div>

                <a
                  href={`tel:${serv.phone.replace(/[^0-9]/g, "")}`}
                  className="w-full h-10 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
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
            <Shield className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Urban Flash Flood Safety Guidelines
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAFETY_TIPS.map((tip, idx) => (
              <div
                key={tip.title}
                className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] text-xs font-bold flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{tip.title}</h3>
                </div>
                <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed pl-8.5 font-normal">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Onboarding Walkthrough & Officer Command Portal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  App Walkthrough & Onboarding
                </h3>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Review the 4-slide feature guide covering GIS risk maps, flood-safe A* routing, AI vision, and SOS helplines.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem("onboarding_seen");
                  window.location.href = "/";
                } catch (_) {}
              }}
              className="h-10 px-5 rounded-xl bg-[#F1F5F9] dark:bg-[#162235] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs flex items-center justify-center gap-2 transition border border-[#CBD5E1] dark:border-[#334155] cursor-pointer"
            >
              <span>View Onboarding Tour</span>
            </button>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Municipal Officer Portal
                </h3>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Access priority dispatch queues, moderate citizen photo reports, and manage SMS & WhatsApp alert dispatches.
              </p>
            </div>

            <Link
              href="/admin/login"
              className="h-10 px-5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs shrink-0 flex items-center justify-center gap-2 transition"
            >
              <span>Officer Login</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
