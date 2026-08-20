"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.18,
      ease: "easeIn",
    },
  },
};

const reducedVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

/**
 * PageTransition — Soft cross-fade/slide wrapper for page route changes
 */
export default function PageTransition({ children, routeKey = "page", className = "" }) {
  const { shouldReduceMotion } = useReducedMotionConfig();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        variants={shouldReduceMotion ? reducedVariants : pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className={`w-full ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
