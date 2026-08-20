"use client";

import { motion } from "framer-motion";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

/**
 * AnimatedIcon — Micro-interaction wrapper for Lucide and SVG icons
 */
export default function AnimatedIcon({
  icon: Icon,
  className = "",
  type = "wiggle", // "wiggle" | "rotate" | "scale" | "pulse"
  size = 18,
  ...props
}) {
  const { shouldReduceMotion } = useReducedMotionConfig();

  const getHoverAnimation = () => {
    if (shouldReduceMotion) return {};
    switch (type) {
      case "wiggle":
        return {
          rotate: [-8, 8, -4, 4, 0],
          transition: { duration: 0.4, ease: "easeInOut" },
        };
      case "rotate":
        return {
          rotate: 45,
          scale: 1.1,
          transition: { duration: 0.25, ease: "easeOut" },
        };
      case "pulse":
        return {
          scale: [1, 1.2, 1],
          transition: { duration: 0.3, ease: "easeInOut" },
        };
      case "scale":
      default:
        return {
          scale: 1.15,
          transition: { duration: 0.18, ease: "easeOut" },
        };
    }
  };

  return (
    <motion.div
      className="inline-flex items-center justify-center cursor-pointer"
      whileHover={getHoverAnimation()}
      whileTap={!shouldReduceMotion ? { scale: 0.9 } : undefined}
      {...props}
    >
      <Icon className={className} size={size} />
    </motion.div>
  );
}
