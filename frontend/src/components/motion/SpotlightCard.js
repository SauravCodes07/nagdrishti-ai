"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

/**
 * SpotlightCard — Aceternity UI / Magic UI dynamic mouse-following radial spotlight card
 * High-performance hardware-accelerated CSS variable mouse tracking with zero React re-renders on move.
 */
export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(20, 184, 166, 0.15)", // Default Teal
  spotlightRadius = 280,
  riskCategory = null,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPointerDevice, setIsPointerDevice] = useState(false);
  const { shouldReduceMotion } = useReducedMotionConfig();
  const rafId = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsPointerDevice(mq.matches);
    const handler = (e) => setIsPointerDevice(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const getCategorySpotlight = () => {
    if (!riskCategory) return spotlightColor;
    switch (riskCategory.toLowerCase()) {
      case "severe":
        return "rgba(220, 38, 38, 0.22)"; // Red
      case "high":
        return "rgba(249, 115, 22, 0.22)"; // Orange
      case "medium":
        return "rgba(234, 179, 8, 0.20)"; // Amber
      case "low":
        return "rgba(22, 163, 74, 0.18)"; // Green
      default:
        return spotlightColor;
    }
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current || !isPointerDevice || shouldReduceMotion) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafId.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      cardRef.current.style.setProperty("--mouse-x", `${x}px`);
      cardRef.current.style.setProperty("--mouse-y", `${y}px`);
    });
  };

  const handleMouseEnter = () => {
    if (isPointerDevice && !shouldReduceMotion) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (rafId.current) cancelAnimationFrame(rafId.current);
  };

  const effectiveSpotlight = getCategorySpotlight();

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.18, ease: "easeOut" } }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
      style={{
        "--mouse-x": "-1000px",
        "--mouse-y": "-1000px",
        "--spotlight-color": effectiveSpotlight,
        "--spotlight-radius": `${spotlightRadius}px`,
      }}
      className={cn(
        "relative rounded-2xl border border-[#E2E8F0] dark:border-[#243244] bg-[#FFFFFF] dark:bg-[#111C2E] overflow-hidden transition-shadow duration-200 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-xl",
        riskCategory?.toLowerCase() === "severe" && "hover:border-red-500/50 dark:hover:border-red-500/60",
        riskCategory?.toLowerCase() === "high" && "hover:border-orange-500/50 dark:hover:border-orange-500/60",
        riskCategory?.toLowerCase() === "medium" && "hover:border-amber-500/50 dark:hover:border-amber-500/60",
        !riskCategory && "hover:border-teal-500/40 dark:hover:border-teal-500/50",
        className
      )}
      {...props}
    >
      {/* Hardware-accelerated Radial Spotlight Overlay */}
      {isPointerDevice && !shouldReduceMotion && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-200 z-10"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(var(--spotlight-radius) circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 80%)`,
          }}
        />
      )}

      {/* Card Content Container */}
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
}
