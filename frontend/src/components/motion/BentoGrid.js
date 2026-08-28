"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import SpotlightCard from "./SpotlightCard";

/**
 * BentoGrid — Aceternity UI / Magic UI responsive bento layout container
 */
export function BentoGrid({ className = "", children }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * BentoCard — Aceternity UI / Magic UI bento card item with dynamic spotlight and hover lift
 */
export function BentoCard({
  className = "",
  title,
  description,
  header,
  icon: Icon,
  badge,
  actionText = "Explore",
  actionHref,
  children,
  riskCategory = null,
  spotlightColor,
  ...props
}) {
  return (
    <SpotlightCard
      riskCategory={riskCategory}
      spotlightColor={spotlightColor}
      className={cn(
        "row-span-1 rounded-2xl group/bento transition duration-200 shadow-input dark:shadow-none p-6 flex flex-col justify-between space-y-4 border border-[#E2E8F0] dark:border-[#243244] bg-[#FFFFFF] dark:bg-[#111C2E]",
        className
      )}
      {...props}
    >
      {header && <div className="w-full">{header}</div>}

      <div className="group-hover/bento:translate-x-1 transition duration-200 space-y-2">
        <div className="flex items-center justify-between">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] dark:bg-teal-500/15 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center border border-[#0F766E]/20">
              <Icon className="w-5 h-5" />
            </div>
          )}
          {badge && (
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#CCFBF1] dark:bg-teal-500/20 text-[#0F766E] dark:text-[#5EEAD4]">
              {badge}
            </span>
          )}
        </div>

        {title && (
          <div className="font-bold text-base sm:text-lg text-[#0F172A] dark:text-[#F8FAFC]">
            {title}
          </div>
        )}

        {description && (
          <p className="font-normal text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {children}
    </SpotlightCard>
  );
}

export default BentoGrid;
