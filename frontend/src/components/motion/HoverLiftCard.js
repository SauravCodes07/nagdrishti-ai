"use client";

import { motion } from "framer-motion";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

/**
 * HoverLiftCard — Tactile card lift with subtle glow and border response
 */
export default function HoverLiftCard({
  children,
  className = "",
  liftDistance = -5,
  scale = 1.015,
  riskCategory = null,
  onClick,
  ...props
}) {
  const { shouldReduceMotion } = useReducedMotionConfig();

  const getBorderGlow = () => {
    switch (riskCategory?.toLowerCase()) {
      case "severe":
        return "hover:border-red-500/50 dark:hover:border-red-500/60 hover:shadow-[0_8px_24px_rgba(220,38,38,0.15)]";
      case "high":
        return "hover:border-orange-500/50 dark:hover:border-orange-500/60 hover:shadow-[0_8px_24px_rgba(234,88,12,0.15)]";
      case "medium":
        return "hover:border-amber-500/50 dark:hover:border-amber-500/60 hover:shadow-[0_8px_24px_rgba(217,119,6,0.12)]";
      default:
        return "hover:border-teal-500/40 dark:hover:border-teal-500/50 hover:shadow-[0_8px_24px_rgba(15,118,110,0.12)]";
    }
  };

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: liftDistance,
              scale: scale,
              transition: { duration: 0.2, ease: "easeOut" },
            }
      }
      whileTap={
        shouldReduceMotion
          ? undefined
          : {
              scale: 0.985,
              transition: { duration: 0.1 },
            }
      }
      onClick={onClick}
      className={`transition-colors duration-200 ${getBorderGlow()} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
