"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

/**
 * BackgroundGrid — Magic UI / Aceternity UI layered grid/dot background with radial fade mask
 */
export default function BackgroundGrid({
  className = "",
  pattern = "grid", // "grid" | "dots"
  glow = true,
  children,
}) {
  const { shouldReduceMotion } = useReducedMotionConfig();

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      {/* Background Pattern Layer */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          pattern === "dots" ? "bg-dot-pattern" : "bg-grid-pattern",
          "[mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]"
        )}
      />

      {/* Ambient Pulsing Glow Orbs */}
      {glow && !shouldReduceMotion && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-teal-500/20 dark:bg-teal-400/15 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.12, 0.22, 0.12],
              x: [0, -25, 0],
              y: [0, 25, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="pointer-events-none absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-amber-500/15 dark:bg-teal-600/15 blur-3xl"
          />
        </>
      )}

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
