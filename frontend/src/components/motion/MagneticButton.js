"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

/**
 * MagneticButton — Follows cursor within a small radius and springs back on leave
 */
export default function MagneticButton({
  children,
  className = "",
  onClick,
  maxDistance = 8,
  disabled = false,
  ...props
}) {
  const ref = useRef(null);
  const [isPointerDevice, setIsPointerDevice] = useState(false);
  const { shouldReduceMotion } = useReducedMotionConfig();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 350, damping: 22, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 350, damping: 22, mass: 0.3 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsPointerDevice(mq.matches);
    const handler = (e) => setIsPointerDevice(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = (e) => {
    if (!ref.current || !isPointerDevice || disabled || shouldReduceMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * 0.25;
    const deltaY = (e.clientY - centerY) * 0.25;

    const clampedX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
    const clampedY = Math.max(-maxDistance, Math.min(maxDistance, deltaY));

    x.set(clampedX);
    y.set(clampedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const canAnimate = isPointerDevice && !disabled && !shouldReduceMotion;

  return (
    <motion.div
      ref={ref}
      style={{
        x: canAnimate ? springX : 0,
        y: canAnimate ? springY : 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
      whileTap={!disabled && !shouldReduceMotion ? { scale: 0.96 } : undefined}
      whileHover={canAnimate ? { scale: 1.02 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div onClick={onClick} className={className} {...props}>
        {children}
      </div>
    </motion.div>
  );
}
