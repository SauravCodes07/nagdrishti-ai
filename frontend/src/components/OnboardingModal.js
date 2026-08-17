"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Camera,
  Bell,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
  PhoneCall,
  Activity,
  Layers,
  Sparkles,
  Droplets,
  CheckCircle2,
} from "lucide-react";

const ONBOARDING_SLIDES = [
  {
    id: 1,
    badge: "Live Flood Intelligence",
    title: "Real-Time Crisis & Risk Map",
    subtitle: "Continuous monitoring of all 10 Nagpur administrative zones",
    description:
      "Track live rainfall telemetry, drainage basin inundation, and dynamic ward risk scores calculated using real municipal sensor data.",
    icon: MapPin,
    accent: "teal",
    renderGraphic: () => (
      <div className="relative w-full h-44 sm:h-48 rounded-2xl bg-gradient-to-b from-[#0F172A] to-[#111C2E] border border-[#243244] overflow-hidden flex items-center justify-center p-4">
        {/* Civic Grid Background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#14B8A6_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Radar concentric rings */}
        <div className="absolute w-36 h-36 rounded-full border border-teal-500/20 animate-ping opacity-30" />
        <div className="absolute w-28 h-28 rounded-full border border-teal-500/30" />
        <div className="absolute w-16 h-16 rounded-full border border-teal-500/40 bg-teal-500/10 flex items-center justify-center">
          <MapPin className="w-7 h-7 text-[#14B8A6] animate-bounce" />
        </div>

        {/* Floating Ward Badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-3 left-4 px-2.5 py-1 rounded-lg bg-[#0B1220]/90 border border-green-500/40 text-[10px] font-semibold text-green-400 flex items-center gap-1 shadow-lg"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          <span>Dharampeth: Low Risk (14%)</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-3 right-4 px-2.5 py-1 rounded-lg bg-[#0B1220]/90 border border-red-500/40 text-[10px] font-semibold text-red-400 flex items-center gap-1 shadow-lg"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
          <span>Gandhibagh: Severe Alert (82%)</span>
        </motion.div>
      </div>
    ),
  },
  {
    id: 2,
    badge: "AI-Powered Routing",
    title: "Flood-Safe Road Navigation",
    subtitle: "Dynamic A* pathfinding on OpenStreetMap road network",
    description:
      "Search any location across Nagpur. Our routing algorithm automatically penalizes flooded underpasses and high-risk zones, giving you safe, dry corridors.",
    icon: Navigation,
    accent: "saffron",
    renderGraphic: () => (
      <div className="relative w-full h-44 sm:h-48 rounded-2xl bg-gradient-to-b from-[#0F172A] to-[#111C2E] border border-[#243244] overflow-hidden flex items-center justify-center p-4">
        {/* Animated Road Corridors */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Safe vs Blocked Route Paths */}
        <svg className="w-full h-full" viewBox="0 0 300 150">
          {/* Flooded zone circle */}
          <circle cx="150" cy="75" r="32" fill="rgba(220, 38, 38, 0.15)" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="150" y="80" fill="#F87171" fontSize="9" textAnchor="middle" fontWeight="bold">FLOODED BASIN</text>

          {/* Blocked straight path (red dashed) */}
          <path d="M 40 75 L 260 75" stroke="#DC2626" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />

          {/* Safe bypass path (teal/saffron solid) */}
          <motion.path
            d="M 40 75 Q 150 15 260 75"
            fill="none"
            stroke="#14B8A6"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
          />

          {/* Origin and Destination markers */}
          <circle cx="40" cy="75" r="6" fill="#14B8A6" stroke="#FFFFFF" strokeWidth="2" />
          <text x="40" y="98" fill="#5EEAD4" fontSize="9" textAnchor="middle" fontWeight="600">Origin</text>

          <circle cx="260" cy="75" r="6" fill="#E8730A" stroke="#FFFFFF" strokeWidth="2" />
          <text x="260" y="98" fill="#FDBA74" fontSize="9" textAnchor="middle" fontWeight="600">Destination</text>
        </svg>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-[10px] font-semibold text-[#5EEAD4]">
          ✓ Safe Bypass Active (+0.4 km)
        </div>
      </div>
    ),
  },
  {
    id: 3,
    badge: "Civic Vision AI",
    title: "Instant Hazard Reporting",
    subtitle: "One-tap waterlogging reports with automatic AI verification",
    description:
      "Encounter flooded roads? Snap a quick photo. Hugging Face Vision AI automatically verifies flood depth and dispatches alerts directly to municipal response teams.",
    icon: Camera,
    accent: "teal",
    renderGraphic: () => (
      <div className="relative w-full h-44 sm:h-48 rounded-2xl bg-gradient-to-b from-[#0F172A] to-[#111C2E] border border-[#243244] overflow-hidden flex items-center justify-center p-4">
        {/* Camera HUD Grid */}
        <div className="relative w-48 h-32 rounded-xl border border-teal-500/40 bg-teal-950/20 flex flex-col items-center justify-center p-3 shadow-inner">
          {/* Viewfinder crosshairs */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-teal-400" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-teal-400" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-teal-400" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-teal-400" />

          <Camera className="w-8 h-8 text-[#14B8A6] mb-1.5 animate-pulse" />
          
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/20 border border-green-500/40 text-[10px] font-bold text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>AI Verified: High Waterlogging</span>
          </div>

          <span className="text-[9px] text-[#94A3B8] mt-1 font-mono">Confidence: 94.8% (CLIP Vision)</span>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    badge: "24/7 City Safety",
    title: "Emergency Alerts & SOS Dispatch",
    subtitle: "Proactive broadcast alerts & direct municipal emergency dialer",
    description:
      "Get warned before flash storms strike your ward. Instant one-tap access to Nagpur Municipal Corporation Flood Control Room, Police, and Water Rescue.",
    icon: Bell,
    accent: "red",
    renderGraphic: () => (
      <div className="relative w-full h-44 sm:h-48 rounded-2xl bg-gradient-to-b from-[#0F172A] to-[#111C2E] border border-[#243244] overflow-hidden flex flex-col items-center justify-center p-4 space-y-2">
        {/* Emergency SOS Ticker */}
        <div className="w-full max-w-xs p-2.5 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white">NMC 24/7 Flood Helpline</p>
              <p className="text-[10px] text-red-400 font-mono">0712-2567035</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
            Direct
          </span>
        </div>

        <div className="w-full max-w-xs p-2.5 rounded-xl bg-[#0B1220] border border-[#243244] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white">National Emergency Police</p>
              <p className="text-[10px] text-[#94A3B8] font-mono">Dial 112</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#1E293B] text-[#94A3B8] text-[10px] font-medium">
            24/7
          </span>
        </div>
      </div>
    ),
  },
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 280 : -280,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 280 : -280,
    opacity: 0,
  }),
};

export default function OnboardingModal({ forceOpen = false, onClose }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (forceOpen) {
      setIsOpen(true);
      return;
    }
    const seen = localStorage.getItem("onboarding_seen");
    if (!seen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleFinish = (target = "/login") => {
    try {
      localStorage.setItem("onboarding_seen", "true");
    } catch (_) {}
    setIsOpen(false);
    if (onClose) onClose();
    if (target) {
      router.push(target);
    }
  };

  const handleSkip = () => {
    handleFinish(null);
  };

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleFinish("/login");
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  if (!isOpen) return null;

  const slide = ONBOARDING_SLIDES[currentSlide];
  const isLast = currentSlide === ONBOARDING_SLIDES.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full max-w-lg bg-[#FFFFFF] dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-[#243244] rounded-3xl p-6 sm:p-7 shadow-2xl text-[#0F172A] dark:text-[#F8FAFC] space-y-5 overflow-hidden">
        {/* Top Controls: Slide count & Skip */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#243244]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#CCFBF1] dark:bg-teal-500/20 text-[#0F766E] dark:text-[#5EEAD4] border border-[#0F766E]/20">
              {slide.badge}
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="px-3 py-1 rounded-lg text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition cursor-pointer flex items-center gap-1"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Animated Slide Content */}
        <div className="min-h-[340px] flex flex-col justify-between">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="space-y-4"
            >
              {/* Visual Graphic */}
              <div>{slide.renderGraphic()}</div>

              {/* Title & Description */}
              <div className="space-y-1.5 text-center sm:text-left pt-1">
                <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                  {slide.title}
                </h3>
                <p className="text-xs font-medium text-[#0F766E] dark:text-[#14B8A6]">
                  {slide.subtitle}
                </p>
                <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed pt-0.5">
                  {slide.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation & Dots */}
        <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#243244] flex items-center justify-between">
          {/* Dot Indicators */}
          <div className="flex items-center gap-1.5">
            {ONBOARDING_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setDirection(idx > currentSlide ? 1 : -1);
                  setCurrentSlide(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide
                    ? "w-6 bg-[#0F766E] dark:bg-[#14B8A6]"
                    : "w-2 bg-[#CBD5E1] dark:bg-[#334155] hover:bg-[#94A3B8]"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentSlide > 0 && (
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition cursor-pointer"
                title="Previous Slide"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            {isLast ? (
              <button
                onClick={() => handleFinish("/login")}
                className="h-11 px-5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer pt-0.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="h-11 px-5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#2DD4BF] text-white dark:text-[#042F2E] font-semibold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5 cursor-pointer pt-0.5"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
