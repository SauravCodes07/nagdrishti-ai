"use client";

import { createContext, useContext, useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

const MouseEnterContext = createContext([false, () => {}]);

/**
 * Card3DContainer — Aceternity UI 3D Tilt perspective container
 */
export function Card3DContainer({
  children,
  className = "",
  containerClassName = "",
  maxTilt = 12,
  ...props
}) {
  const containerRef = useRef(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);
  const [isPointerDevice, setIsPointerDevice] = useState(false);
  const { shouldReduceMotion } = useReducedMotionConfig();

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateXSpring = useSpring(useTransform(mouseY, [0, 1], [maxTilt, -maxTilt]), {
    stiffness: 280,
    damping: 25,
  });
  const rotateYSpring = useSpring(useTransform(mouseX, [0, 1], [-maxTilt, maxTilt]), {
    stiffness: 280,
    damping: 25,
  });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsPointerDevice(mq.matches);
    const handler = (e) => setIsPointerDevice(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !isPointerDevice || shouldReduceMotion) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - left) / width;
    const yPct = (e.clientY - top) / height;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseEnter = () => {
    if (isPointerDevice && !shouldReduceMotion) setIsMouseEntered(true);
  };

  const handleMouseLeave = () => {
    setIsMouseEntered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const canAnimate = isPointerDevice && !shouldReduceMotion;

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        className={cn("flex items-center justify-center [perspective:1000px]", containerClassName)}
        style={{ perspective: "1000px" }}
      >
        <motion.div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transformStyle: "preserve-3d",
            rotateX: canAnimate ? rotateXSpring : 0,
            rotateY: canAnimate ? rotateYSpring : 0,
          }}
          className={cn("relative transition-all duration-200 ease-out", className)}
          {...props}
        >
          {children}
        </motion.div>
      </div>
    </MouseEnterContext.Provider>
  );
}

/**
 * Card3DBody — Content body inside 3D tilt
 */
export function Card3DBody({ children, className = "", ...props }) {
  return (
    <div
      className={cn("h-full w-full [transform-style:preserve-3d]", className)}
      style={{ transformStyle: "preserve-3d" }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card3DItem — Child element with translation along Z-axis for depth
 */
export function Card3DItem({
  as: Tag = "div",
  children,
  className = "",
  translateX = 0,
  translateY = 0,
  translateZ = 20,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...props
}) {
  const [isMouseEntered] = useContext(MouseEnterContext);
  const { shouldReduceMotion } = useReducedMotionConfig();

  const transformStyle =
    isMouseEntered && !shouldReduceMotion
      ? `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
      : "translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)";

  return (
    <Tag
      className={cn("transition-transform duration-300 ease-out", className)}
      style={{
        transform: transformStyle,
        transformStyle: "preserve-3d",
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default Card3DContainer;
