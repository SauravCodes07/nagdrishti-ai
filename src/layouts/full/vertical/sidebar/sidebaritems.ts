export interface ChildItem {
  id?: number | string;
  name: string;
  icon?: LucideIcon;
  items?: ChildItem[];
  item?: unknown;
  url?: string;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  badgeContent?: string;
  isActive?: boolean;
  external?: boolean;
  isPro?: boolean;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: LucideIcon;
  id?: number | string;
  to?: string;
  item?: MenuItem[];
  items?: ChildItem[];
  url?: string;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  badgeContent?: string;
  isActive?: boolean;
  isPro?: boolean;
}

import { uniqueId } from "lodash";

import {
  LayoutDashboard,
  MapPin,
  Navigation,
  CloudRain,
  Waves,
  AlertTriangle,
  Car,
  Layers,
  FileSpreadsheet,
  BellRing,
  Siren,
  Truck,
  Cpu,
  History,
  BarChart3,
  Settings,
  UserCheck,
  HelpCircle,
  HardHat,
  Satellite,
  User,
  LucideIcon
} from "lucide-react";

const sidebaritems: MenuItem[] = [
  {
    heading: "MAIN",
    items: [
      {
        id: uniqueId(),
        name: "Citizen Experience",
        icon: User,
        url: "/citizen",
        badge: true,
        badgeContent: "PUBLIC",
        badgeType: "bg-[#FFC107] text-[#111111] font-bold"
      },
      {
        id: uniqueId(),
        name: "Command Dashboard",
        icon: LayoutDashboard,
        url: "/admin",
      },
      {
        id: uniqueId(),
        name: "Live Crisis Map",
        icon: MapPin,
        url: "/live-map",
        badge: true,
        badgeContent: "LIVE",
        badgeType: "bg-emerald-500 text-white font-bold animate-pulse"
      },
      {
        id: uniqueId(),
        name: "Safe Route Planner",
        icon: Navigation,
        url: "/safe-route",
      }
    ],
  },
  {
    heading: "YEAR-ROUND INTELLIGENCE",
    items: [
      {
        id: uniqueId(),
        name: "Construction Intelligence",
        icon: HardHat,
        url: "/construction",
        badge: true,
        badgeContent: "YEAR-ROUND",
        badgeType: "bg-amber-500 text-white font-semibold text-[9px]"
      },
      {
        id: uniqueId(),
        name: "Satellite Earth Observation",
        icon: Satellite,
        url: "/satellite",
        badge: true,
        badgeContent: "SAR RADAR",
        badgeType: "bg-blue-500 text-white font-semibold text-[9px]"
      },
      {
        id: uniqueId(),
        name: "Rainfall Monitor",
        icon: CloudRain,
        url: "/rainfall",
      },
      {
        id: uniqueId(),
        name: "Waterlogging Risk",
        icon: Waves,
        url: "/waterlogging",
      },
      {
        id: uniqueId(),
        name: "Road Risk & Potholes",
        icon: AlertTriangle,
        url: "/road-risk",
      },
      {
        id: uniqueId(),
        name: "Traffic Monitor",
        icon: Car,
        url: "/traffic",
      },
      {
        id: uniqueId(),
        name: "Drainage & Elevation",
        icon: Layers,
        url: "/drainage",
      }
    ],
  },
  {
    heading: "INCIDENT MANAGEMENT",
    items: [
      {
        id: uniqueId(),
        name: "Citizen Reports",
        icon: FileSpreadsheet,
        url: "/citizen-reports",
      },
      {
        id: uniqueId(),
        name: "Alerts & Notifications",
        icon: BellRing,
        url: "/alerts",
      },
      {
        id: uniqueId(),
        name: "Emergency Response",
        icon: Siren,
        url: "/emergency-response",
      },
      {
        id: uniqueId(),
        name: "Resource Management",
        icon: Truck,
        url: "/resources",
      }
    ],
  },
  {
    heading: "AI & ANALYTICS",
    items: [
      {
        id: uniqueId(),
        name: "AI Predictions",
        icon: Cpu,
        url: "/ai-predictions",
        badge: true,
        badgeContent: "PRITHVI AI",
        badgeType: "bg-[#FF8A00] text-white font-semibold"
      },
      {
        id: uniqueId(),
        name: "Historical Data",
        icon: History,
        url: "/historical-data",
      },
      {
        id: uniqueId(),
        name: "Reports & Analytics",
        icon: BarChart3,
        url: "/reports",
      }
    ],
  },
  {
    heading: "SYSTEM",
    items: [
      {
        id: uniqueId(),
        name: "Settings",
        icon: Settings,
        url: "/settings",
      },
      {
        id: uniqueId(),
        name: "Users & Roles",
        icon: UserCheck,
        url: "/users",
      },
      {
        id: uniqueId(),
        name: "Help & Support",
        icon: HelpCircle,
        url: "/help",
      }
    ],
  }
];

export default sidebaritems;
