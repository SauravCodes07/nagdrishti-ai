"use client";

import { motion } from "framer-motion";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

/**
 * ScrollReveal — Viewport-triggered fade & slide entrance
 */
export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.35,
  direction = "up", // "up" | "down" | "left" | "right" | "none"
  distance = 20,
  amount = 0.2,
  once = true,
  ...props
}) {
  const { shouldReduceMotion } = useReducedMotionConfig();

  const getInitialOffset = () => {
    if (shouldReduceMotion) return { x: 0, y: 0 };
    switch (direction) {
      case "up":
        return { x: 0, y: distance };
      case "down":
        return { x: 0, y: -distance };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const initial = {
    opacity: 0,
    ...getInitialOffset(),
  };

  const animate = {
    opacity: 1,
    x: 0,
    y: 0,
  };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once, amount }}
      transition={{
        duration: shouldReduceMotion ? 0.1 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
