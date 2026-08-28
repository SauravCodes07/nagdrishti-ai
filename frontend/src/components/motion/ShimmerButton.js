"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "../../lib/utils";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

/**
 * ShimmerButton — Magic UI shimmering CTA button with magnetic spring physics
 */
export default function ShimmerButton({
  children,
  className = "",
  shimmerColor = "#ffffff",
  shimmerSize = "0.05em",
  shimmerDuration = "3s",
  borderRadius = "12px",
  background = "var(--primary)",
  onClick,
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
    const deltaX = (e.clientX - centerX) * 0.22;
    const deltaY = (e.clientY - centerY) * 0.22;
    x.set(Math.max(-8, Math.min(8, deltaX)));
    y.set(Math.max(-8, Math.min(8, deltaY)));
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
    >
      <button
        style={{
          "--spread": "90deg",
          "--shimmer-color": shimmerColor,
          "--radius": borderRadius,
          "--speed": shimmerDuration,
          "--cut": shimmerSize,
          "--bg": background,
        }}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-5 py-2.5 [background:var(--bg)] [border-radius:var(--radius)] font-semibold text-sm text-white shadow-md active:translate-y-px transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-[1px]",
          className
        )}
        {...props}
      >
        {/* Shimmer animation slice */}
        {!shouldReduceMotion && (
          <div
            className={cn(
              "-z-30 blur-[2px]",
              "absolute inset-0 overflow-visible [container-type:size]"
            )}
          >
            <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
              <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
            </div>
          </div>
        )}

        {/* Content container */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>

        {/* Backdrop highlight */}
        <div
          className={cn(
            "insert-0 absolute size-full",
            "rounded-[inherit] px-4 py-1.5 text-sm font-medium",
            "transform-gpu transition-all duration-300 ease-in-out",
            "group-hover:shadow-[inset_0_-6px_10px_rgba(255,255,255,0.2)]",
            "group-active:shadow-[inset_0_-10px_10px_rgba(255,255,255,0.2)]"
          )}
        />
      </button>
    </motion.div>
  );
}
