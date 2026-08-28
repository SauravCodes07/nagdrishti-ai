"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.16,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
    },
  },
};

const reducedVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.08 } },
  exit: { opacity: 0, transition: { duration: 0.08 } },
};

/**
 * PageTransition — Ultra-fast zero-delay crossfade for client-side route changes
 */
export default function PageTransition({ children, routeKey = "page", className = "" }) {
  const { shouldReduceMotion } = useReducedMotionConfig();

  return (
    <motion.div
      key={routeKey}
      variants={shouldReduceMotion ? reducedVariants : pageVariants}
      initial="initial"
      animate="enter"
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
