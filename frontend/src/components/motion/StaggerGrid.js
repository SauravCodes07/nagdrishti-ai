"use client";

import { motion } from "framer-motion";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  show: (staggerTime = 0.06) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerTime,
    },
  }),
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * StaggerGrid — Container component that choreographs children entrances with stagger
 */
export default function StaggerGrid({
  children,
  className = "",
  stagger = 0.06,
  viewportAmount = 0.15,
  once = true,
  ...props
}) {
  const { shouldReduceMotion } = useReducedMotionConfig();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerContainerVariants}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: viewportAmount }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "", ...props }) {
  const { shouldReduceMotion } = useReducedMotionConfig();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={staggerItemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}
