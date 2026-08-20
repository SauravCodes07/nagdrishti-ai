"use client";

import { motion } from "framer-motion";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

/**
 * RiskPulse — Urgency-encoded breathing pulse ring for HIGH and SEVERE categories
 */
export default function RiskPulse({
  category = "Low",
  children,
  className = "",
  pulseColor = null,
}) {
  const { shouldReduceMotion } = useReducedMotionConfig();
  const cat = (category || "").toLowerCase();
  const isUrgent = cat === "severe" || cat === "high";

  const getPulseColor = () => {
    if (pulseColor) return pulseColor;
    if (cat === "severe") return "bg-red-500";
    if (cat === "high") return "bg-orange-500";
    return "bg-teal-500";
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {isUrgent && !shouldReduceMotion && (
        <motion.span
          className={`absolute -inset-1 rounded-full opacity-70 ${getPulseColor()} -z-10`}
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.8, 0.35],
          }}
          transition={{
            duration: cat === "severe" ? 1.4 : 2.0,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      {children}
    </div>
  );
}
