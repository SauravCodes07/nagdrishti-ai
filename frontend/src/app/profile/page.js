"use client";

import Image from "next/image";
import Link from "next/link";
import {
  PhoneCall,
  Shield,
  Info,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Cpu,
  Layers,
  Heart,
} from "lucide-react";
import CitizenLayout from "../../components/layouts/CitizenLayout";

export default function CitizenProfilePage() {
  return (
    <CitizenLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase text-teal-400 tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Civic Protection & Helplines</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Nagpur Emergency Services & Safety Guide
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Direct helpline numbers, monsoon safety protocols, and AI system verification details.
          </p>
        </div>

        {/* 1. Emergency Helplines Card Grid */}
        <div className="bg-[#131B2A] border border-red-900/40 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400">
                <PhoneCall className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">
                  24/7 Nagpur Municipal Helplines
                </h2>
                <p className="text-xs text-slate-400">Instant direct calling for disaster relief</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-600/30">
              Immediate Response
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <a
              href="tel:07122567035"
              className="p-4 rounded-2xl bg-[#0B0F17] border border-red-900/40 hover:border-red-500 transition flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-red-400 uppercase font-black tracking-wider">NMC Flood Control</span>
                <PhoneCall className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-lg font-black text-white group-hover:text-red-400 transition">0712-2567035</div>
                <div className="text-[10px] text-slate-400">Municipal Headquarters Desk</div>
              </div>
            </a>

            <a
              href="tel:112"
              className="p-4 rounded-2xl bg-[#0B0F17] border border-[#1E293B] hover:border-teal-500 transition flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Police & All Emergency</span>
                <PhoneCall className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-lg font-black text-white group-hover:text-teal-400 transition">112</div>
                <div className="text-[10px] text-slate-400">National Emergency Response</div>
              </div>
            </a>

            <a
              href="tel:101"
              className="p-4 rounded-2xl bg-[#0B0F17] border border-[#1E293B] hover:border-teal-500 transition flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Fire & Flood Rescue</span>
                <PhoneCall className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-lg font-black text-white group-hover:text-teal-400 transition">101</div>
                <div className="text-[10px] text-slate-400">Disaster Rescue Coordination</div>
              </div>
            </a>
          </div>
        </div>

        {/* 2. Monsoon Safety Guidelines */}
        <div className="bg-[#131B2A] border border-[#1E293B] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#1E293B] pb-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Monsoon & Flood Safety Protocols</h2>
              <p className="text-xs text-slate-400">Essential rules for citizens navigating heavy downpours</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#1E293B] space-y-2">
              <div className="flex items-center gap-2 font-black text-teal-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Avoid Low-Lying Underpasses</span>
              </div>
              <p className="text-slate-300">
                Railway underpasses and drainage culverts can submerge 3–6 feet in minutes during intense cloudbursts. Always use NagDrishti AI safe routes to divert around high-risk basins.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#1E293B] space-y-2">
              <div className="flex items-center gap-2 font-black text-teal-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Stay Clear of Submerged Transformers</span>
              </div>
              <p className="text-slate-300">
                Never wade through standing water near electric poles, street light wiring, or ground-mounted junction boxes to prevent fatal electrocution risks.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#1E293B] space-y-2">
              <div className="flex items-center gap-2 font-black text-teal-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Drive in Center of Carriageway</span>
              </div>
              <p className="text-slate-300">
                Nagpur road crown geometry means water drains to curbs and shoulders first. Stay in the central lane and avoid rushing through deep standing water.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#1E293B] space-y-2">
              <div className="flex items-center gap-2 font-black text-teal-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Report Open Manholes & Inlets</span>
              </div>
              <p className="text-slate-300">
                Displaced drain covers pose severe threats to two-wheelers and pedestrians. Submit a photo report immediately so quick-response teams can secure the hazard.
              </p>
            </div>
          </div>
        </div>

        {/* 3. System Architecture & Officer Portal Link */}
        <div className="bg-gradient-to-r from-[#131B2A] to-[#0F1D2F] border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-950 p-1.5 flex items-center justify-center border border-teal-500/40 shadow-lg shrink-0">
              <Image
                src="/brand/nagdrishti-logo.png"
                alt="NagDrishti AI"
                width={50}
                height={50}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="font-black text-base text-white">NagDrishti AI Platform Architecture</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                OSMnx GIS Graph • Hugging Face Vision AI • Django REST Framework • OpenStreetMap
              </p>
            </div>
          </div>

          <Link
            href="/admin/login"
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-lg shadow-teal-600/30 flex items-center gap-2 active:scale-95 transition shrink-0"
          >
            <span>Municipal Officer Portal</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </CitizenLayout>
  );
}
