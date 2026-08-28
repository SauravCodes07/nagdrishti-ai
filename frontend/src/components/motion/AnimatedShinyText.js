"use client";

import { cn } from "../../lib/utils";
import { useReducedMotionConfig } from "./useReducedMotionConfig";

/**
 * AnimatedShinyText — Magic UI text shimmer sheen for badges, headlines, and accents
 */
export default function AnimatedShinyText({
  children,
  className = "",
  shimmerWidth = 100,
}) {
  const { shouldReduceMotion } = useReducedMotionConfig();

  if (shouldReduceMotion) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      style={{
        "--shiny-width": `${shimmerWidth}px`,
      }}
      className={cn(
        "mx-auto inline-block max-w-md text-slate-800 dark:text-neutral-200",
        // Shimmer effect
        "animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shiny-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
        // Shimmer gradient
        "bg-gradient-to-r from-transparent via-[#0F766E]/80 dark:via-[#5EEAD4] via-50% to-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}
