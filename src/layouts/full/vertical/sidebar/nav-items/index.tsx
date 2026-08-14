import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { ChildItem } from "../sidebaritems";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface NavItemProps {
  item: ChildItem;
  hasChildren: boolean;
  className?: string;
  isActive?: boolean;
}

export default function NavItem({
  item,
  hasChildren,
  className,
  isActive,
}: NavItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 w-full group relative group-data-[state=collapsed]:px-2.5 px-3 py-2 my-0.5 transition-all duration-200 rounded-r-md text-[#666666] dark:text-gray-400 hover:text-[#111111] dark:hover:text-white",
        isActive && "bg-[#FFF8E1] dark:bg-[#FFC107]/15 text-[#111111] dark:text-white font-bold border-l-[3px] border-[#FFC107]",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && !isActive && (
          <motion.div
            layoutId="nav-hover-bg"
            className="absolute inset-0 bg-[#FFF8E1]/60 dark:bg-[#FFC107]/10 rounded-r-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        )}
      </AnimatePresence>

      <span className="relative flex items-center gap-2.5 w-full rounded-md">
        {/* Icon */}
        {item.icon && (
          <item.icon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              isActive ? "text-[#FF8A00] dark:text-[#FFC107]" : "text-[#666666] dark:text-gray-400 group-hover:text-[#111111] dark:group-hover:text-white",
              item.color
            )}
          />
        )}

        {/* Name */}
        <span className="font-medium text-xs tracking-tight hide-menu">{item.name}</span>

        {/* Badge */}
        {item.badge && (
          <span
            className={cn(
              "ms-auto hide-menu text-[10px] font-bold rounded-full px-2 py-0.5",
              item.badgeType === "filled"
                ? "bg-[#FFC107] text-[#111111]"
                : "border border-[#FFC107] text-[#111111] dark:text-[#FFC107]"
            )}
          >
            {item.badgeContent}
          </span>
        )}

        {/* Pro Badge */}
        {item.isPro && (
          <Badge className="ms-auto hide-menu text-[10px]! px-1.5 py-0.5 h-auto! bg-[#FFC107]! text-[#111111]! font-bold rounded-md">
            AI
          </Badge>
        )}

        {/* Chevron only if it has children */}
        {hasChildren && (
          <ChevronRight className="ms-auto h-4 w-4 transition-transform duration-200 group-open/nav:rotate-90 hide-menu opacity-60" />
        )}
      </span>
    </motion.div>
  );
}