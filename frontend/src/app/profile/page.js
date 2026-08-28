"use client";

import { useEffect, useState } from "react";
import {
  User,
  Shield,
  PhoneCall,
  ExternalLink,
  Lock,
  LogOut,
  Sun,
  Moon,
  Compass,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  FileText,
  Mail,
  Camera,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import CitizenLayout from "../../components/layouts/CitizenLayout";
import { useAuth } from "../../context/AuthContext";
import { getReports } from "../../lib/api";
import { useTheme } from "../../components/ThemeProvider";
import {
  ScrollReveal,
  HoverLiftCard,
  StaggerGrid,
  StaggerItem,
  SpotlightCard,
  BorderBeam,
  ShimmerButton,
  BlurFade,
} from "../../components/motion";

const EMERGENCY_SERVICES = [
  {
    title: "NMC 24/7 Flood & Disaster Control Room",
    phone: "0712-2567035",
    desc: "Nagpur Municipal Corporation emergency waterlogging and drainage helpline.",
    badge: "Official Municipal Desk",
    isPrimary: true,
  },
  {
    title: "Police Emergency Response",
    phone: "112",
    desc: "National emergency dialer for road blockages, accidents, and life safety.",
    badge: "24/7 National Dispatch",
    isPrimary: false,
  },
  {
    title: "Fire & Flood Rescue",
    phone: "101",
    desc: "Rapid deployment for deep water rescue, fallen trees, and flash evacuations.",
    badge: "Disaster Response",
    isPrimary: false,
  },
  {
    title: "Ambulance / Medical Emergency",
    phone: "108",
    desc: "Emergency medical transport and hospital routing in crisis zones.",
    badge: "Medical Response",
    isPrimary: false,
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

export default function CitizenProfilePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getReports()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setUserReports(data.slice(0, 5));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.warn("Logout error:", err);
      router.push("/login");
    }
  };

  const handleRestartTour = () => {
    try {
      localStorage.removeItem("onboarding_seen");
      window.location.href = "/";
    } catch (_) {}
  };

  return (
    <CitizenLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <BlurFade delay={0.05}>
          <h1 className="text-2xl sm:text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Citizen Profile & Safety Desk
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] font-normal mt-0.5">
            Manage your account credentials, preferences, and verified emergency municipal contacts
          </p>
        </BlurFade>

        {/* User Identity Card */}
        <BlurFade delay={0.1}>
          <SpotlightCard className="p-6 sm:p-7 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0] dark:border-[#243244]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#CCFBF1] dark:bg-teal-500/20 text-[#0F766E] dark:text-[#5EEAD4] font-bold text-xl flex items-center justify-center border border-[#0F766E]/20 shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.username ? user.username.charAt(0).toUpperCase() : "C"}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {user?.name || user?.username || "Verified Citizen"}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] dark:bg-green-500/20 dark:text-[#4ADE80] text-[10px] font-bold border border-green-500/30">
                      Active Citizen Session
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    @{user?.username || "citizen"} • {user?.email || "Nagpur Civic Portal"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="Toggle Theme"
                >
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Moon className="w-3.5 h-3.5 text-[#0F766E]" />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-xl bg-[#FEF2F2] dark:bg-red-500/15 hover:bg-[#FEE2E2] dark:hover:bg-red-500/25 border border-red-200 dark:border-red-500/30 text-xs font-semibold text-[#991B1B] dark:text-[#F87171] transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </motion.button>
              </div>
            </div>

            {/* Quick Stats / Info Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8]">Role</span>
                <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC] capitalize">{user?.role || "Citizen"}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8]">Auth Provider</span>
                <p className="font-bold text-[#0F766E] dark:text-[#14B8A6]">
                  {user?.email && user?.picture ? "Google Account" : "Standard Auth"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8]">Coverage Area</span>
                <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">Nagpur Metro</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#243244] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8]">Session Security</span>
                <p className="font-bold text-green-600 dark:text-green-400">CSRF Protected</p>
              </div>
            </div>
          </SpotlightCard>
        </BlurFade>

        {/* Emergency Contacts Directory */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-[#DC2626]" />
            <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              24/7 Emergency Helplines
            </h2>
          </div>

          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EMERGENCY_SERVICES.map((serv) => (
              <StaggerItem key={serv.title}>
                <SpotlightCard
                  riskCategory="Severe"
                  className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-red-200 dark:border-red-900/40 shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-3 flex flex-col justify-between h-full relative overflow-hidden"
                >
                  {serv.isPrimary && <BorderBeam size={130} duration={8} colorFrom="#DC2626" colorTo="#F87171" />}
                  
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

                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    href={`tel:${serv.phone.replace(/[^0-9]/g, "")}`}
                    className="w-full h-10 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call {serv.phone}</span>
                  </motion.a>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>

        {/* Monsoon Survival Guidelines */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Urban Flash Flood Safety Guidelines
            </h2>
          </div>

          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAFETY_TIPS.map((tip, idx) => (
              <StaggerItem key={tip.title}>
                <SpotlightCard className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] shadow-[0_1px_3px_rgba(15,23,42,0.06)] space-y-2 h-full">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] text-xs font-bold flex items-center justify-center font-mono">
                      0{idx + 1}
                    </span>
                    <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{tip.title}</h3>
                  </div>
                  <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed pl-8.5 font-normal">
                    {tip.desc}
                  </p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>

        {/* Onboarding Tour & Officer Desk Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SpotlightCard className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] flex flex-col justify-between gap-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  App Walkthrough Tour
                </h3>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Replay the 4-slide interactive feature guide covering GIS risk maps, flood-safe A* routing, and AI vision.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleRestartTour}
              className="h-10 px-5 rounded-xl bg-[#F1F5F9] dark:bg-[#162235] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs flex items-center justify-center gap-2 transition border border-[#CBD5E1] dark:border-[#334155] cursor-pointer"
            >
              <span>Replay Onboarding Tour</span>
            </motion.button>
          </SpotlightCard>

          <SpotlightCard className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] flex flex-col justify-between gap-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Municipal Officer Desk
                </h3>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Disaster response officers can sign into the Command Desk to moderate photo reports and dispatch pumps.
              </p>
            </div>

            <Link href="/admin/login">
              <ShimmerButton background="var(--primary)" className="w-full h-10 text-xs font-semibold">
                <span>Officer Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </ShimmerButton>
            </Link>
          </SpotlightCard>
        </div>
      </div>
    </CitizenLayout>
  );
}
