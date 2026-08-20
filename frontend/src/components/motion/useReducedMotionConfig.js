"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Hook to retrieve normalized motion settings respecting prefers-reduced-motion
 * Automatically shrinks or disables translations, scalings, and infinite loops for users
 * who prefer reduced motion.
 */
export function useReducedMotionConfig() {
  const shouldReduceMotion = useReducedMotion();

  return {
    shouldReduceMotion,
    // Safe spring physics preset
    spring: shouldReduceMotion
      ? { duration: 0.1 }
      : { type: "spring", stiffness: 380, damping: 28, mass: 0.8 },
    // Soft ease preset for general reveals
    easeTransition: shouldReduceMotion
      ? { duration: 0.1 }
      : { duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] },
    // Fast micro-interaction preset (<=180ms)
    fastTransition: shouldReduceMotion
      ? { duration: 0.05 }
      : { duration: 0.18, ease: "easeOut" },
    // Helper to get conditional transform values
    transformValue: (normalValue, reducedValue = 0) =>
      shouldReduceMotion ? reducedValue : normalValue,
  };
}

export default useReducedMotionConfig;
