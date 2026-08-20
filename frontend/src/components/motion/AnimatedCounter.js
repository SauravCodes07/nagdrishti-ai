"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, useTransform, motion } from "framer-motion";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

/**
 * AnimatedCounter — Smoothly counts up from 0 to target value on mount/viewport-enter
 */
export default function AnimatedCounter({
  value = 0,
  decimals = 0,
  duration = 1.2,
  prefix = "",
  suffix = "",
  className = "",
  once = true,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.3 });
  const { shouldReduceMotion } = useReducedMotionConfig();

  const numericValue = typeof value === "number" ? value : parseFloat(value) || 0;
  const count = useMotionValue(0);
  
  // Spring physics for smooth deceleration
  const spring = useSpring(count, {
    stiffness: 70,
    damping: 18,
    mass: 0.6,
  });

  const display = useTransform(spring, (latest) => {
    return `${prefix}${latest.toFixed(decimals)}${suffix}`;
  });

  useEffect(() => {
    if (shouldReduceMotion) {
      count.set(numericValue);
      return;
    }
    if (isInView) {
      count.set(numericValue);
    }
  }, [isInView, numericValue, count, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <span ref={ref} className={className}>
        {prefix}
        {numericValue.toFixed(decimals)}
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      <motion.span>{display}</motion.span>
    </span>
  );
}
