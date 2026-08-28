"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "../../lib/utils";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

/**
 * BlurFade — Motion Primitives / Magic UI scroll-triggered blur + slide entrance
 */
export default function BlurFade({
  children,
  className = "",
  variant,
  duration = 0.45,
  delay = 0,
  yOffset = 8,
  inView = true,
  inViewMargin = "-50px",
  blur = "6px",
}) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;
  const { shouldReduceMotion } = useReducedMotionConfig();

  const defaultVariants = {
    hidden: { y: shouldReduceMotion ? 0 : yOffset, opacity: 0, filter: shouldReduceMotion ? "none" : `blur(${blur})` },
    visible: { y: 0, opacity: 1, filter: "blur(0px)" },
  };

  const combinedVariants = variant || defaultVariants;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      exit="hidden"
      variants={combinedVariants}
      transition={{
        delay: 0.04 + delay,
        duration: shouldReduceMotion ? 0.15 : duration,
        ease: [0.22, 1, 0.36, 1], // easeOutQuart
      }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}
