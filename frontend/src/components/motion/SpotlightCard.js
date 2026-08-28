"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "../../lib/utils";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

/**
 * SpotlightCard — Aceternity UI / Magic UI dynamic mouse-following radial spotlight card
 * Creates a subtle interactive beam that follows the cursor over the card surface and border.
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

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springConfig = { stiffness: 400, damping: 30 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

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
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => {
    if (isPointerDevice && !shouldReduceMotion) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(-1000);
    mouseY.set(-1000);
  };

  const effectiveSpotlight = getCategorySpotlight();

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={shouldReduceMotion ? undefined : { y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
      className={cn(
        "relative rounded-2xl border border-[#E2E8F0] dark:border-[#243244] bg-[#FFFFFF] dark:bg-[#111C2E] overflow-hidden transition-shadow duration-300 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-xl",
        riskCategory?.toLowerCase() === "severe" && "hover:border-red-500/50 dark:hover:border-red-500/60",
        riskCategory?.toLowerCase() === "high" && "hover:border-orange-500/50 dark:hover:border-orange-500/60",
        riskCategory?.toLowerCase() === "medium" && "hover:border-amber-500/50 dark:hover:border-amber-500/60",
        !riskCategory && "hover:border-teal-500/40 dark:hover:border-teal-500/50",
        className
      )}
      {...props}
    >
      {/* Radial Spotlight Overlay */}
      {isPointerDevice && !shouldReduceMotion && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 z-10"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(${spotlightRadius}px circle at ${smoothX.get()}px ${smoothY.get()}px, ${effectiveSpotlight}, transparent 80%)`,
          }}
        />
      )}

      {/* Card Content Container */}
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
}
