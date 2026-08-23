"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [cursorState, setCursorState] = useState("default"); // "default" | "hover" | "text" | "hidden"
  const [isVisible, setIsVisible] = useState(false);

  // Raw mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth lagging spring physics for trailing follower
  const springConfig = { damping: 24, stiffness: 280, mass: 0.5 };
  const followerX = useSpring(mouseX, springConfig);
  const followerY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setEnabled(mediaQuery.matches);

    const handleMediaChange = (e) => setEnabled(e.matches);
    try {
      mediaQuery.addEventListener("change", handleMediaChange);
    } catch (_) {
      mediaQuery.addListener(handleMediaChange);
    }

    if (!mediaQuery.matches) return;

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      const interactive = target.closest(
        "a, button, [role='button'], input[type='submit'], input[type='button'], select, .interactive-hover, .leaflet-interactive, .cursor-pointer"
      );

      const textInput = target.closest("input[type='text'], input[type='password'], input[type='email'], textarea");

      if (interactive) {
        setCursorState("hover");
      } else if (textInput) {
        setCursorState("text");
      } else {
        setCursorState("default");
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      try {
        mediaQuery.removeEventListener("change", handleMediaChange);
      } catch (_) {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  if (!enabled || !isVisible) return null;

  return (
    <>
      {/* 1. Precise Center Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 bg-[#0F766E] dark:bg-[#14B8A6] shadow-[0_0_8px_rgba(20,184,166,0.8)]"
        style={{
          x: mouseX,
          y: mouseY,
          opacity: cursorState === "hidden" ? 0 : 1,
          scale: cursorState === "hover" ? 0.5 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* 2. Smooth Physics Trailing Follower */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[99998] -translate-x-1/2 -translate-y-1/2 border transition-colors duration-200"
        style={{
          x: followerX,
          y: followerY,
          width: cursorState === "hover" ? 44 : cursorState === "text" ? 20 : 28,
          height: cursorState === "hover" ? 44 : cursorState === "text" ? 28 : 28,
          borderColor:
            cursorState === "hover"
              ? "rgba(20, 184, 166, 0.75)"
              : "rgba(15, 118, 110, 0.35)",
          backgroundColor:
            cursorState === "hover"
              ? "rgba(20, 184, 166, 0.12)"
              : "rgba(20, 184, 166, 0.04)",
          backdropFilter: cursorState === "hover" ? "blur(1px)" : "none",
        }}
        animate={{
          scale: cursorState === "hover" ? 1.15 : 1,
        }}
        transition={{
          scale: { type: "spring", stiffness: 400, damping: 25 },
        }}
      />
    </>
  );
}
