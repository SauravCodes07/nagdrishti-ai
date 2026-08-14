import { Waves, AlertTriangle, Car, Truck, LucideIcon, Home, User, Settings, ShieldCheck } from 'lucide-react';
import user1 from "@/assets/images/profile/user-1.png";
import user2 from "@/assets/images/profile/user-2.png";
import user3 from "@/assets/images/profile/user-3.png";

export interface MessageType {
  title: string;
  avatar: string;
  subtitle: string;
  color: string;
  time: string;
  badgeColor: string;
  isRead?: boolean;
}

export const MessagesLink: MessageType[] = [
  {
    avatar: user1,
    color: "bg-destructive",
    title: "NMC Emergency Control Room",
    subtitle: "Dewatering Pump #4 deployed to Dharampeth",
    time: "2 mins ago",
    badgeColor: "bg-destructive",
    isRead: false,
  },
  {
    avatar: user2,
    color: "bg-bhagwa",
    title: "Traffic Police HQ",
    subtitle: "Diversion posted at Sitabuldi Ramps",
    time: "8 mins ago",
    badgeColor: "bg-bhagwa",
    isRead: false,
  },
  {
    avatar: user3,
    color: "bg-emerald-500",
    title: "PWD Rapid Repair Squad",
    subtitle: "Wardha Rd pothole patch completed",
    time: "15 mins ago",
    badgeColor: "bg-emerald-500",
    isRead: true,
  }
];

export interface NotificationType {
  title: string;
  icon: LucideIcon;
  subtitle: string;
  bgcolor: string;
  color: string;
  time: string;
  isRead?: boolean;
}

export const Notification: NotificationType[] = [
  {
    icon: Waves,
    bgcolor: "bg-rose-500/10",
    color: 'text-rose-600',
    title: "Severe Waterlogging Predicted",
    subtitle: "Dharampeth Basin 92% risk — 3.5 ft water expected at Gokulpeth Underpass",
    time: "Just now",
    isRead: false,
  },
  {
    icon: AlertTriangle,
    bgcolor: "bg-orange-500/10",
    color: 'text-orange-600',
    title: "Road Damage Reported",
    subtitle: "Wardha Road Airport Corridor — Asphalt failure & deep potholes pin-pointed",
    time: "10 mins ago",
    isRead: false,
  },
  {
    icon: Car,
    bgcolor: "bg-amber-500/10",
    color: 'text-amber-600',
    title: "Traffic Congestion Surge",
    subtitle: "Sitabuldi Flyover Ramp 94% standstill — Traffic police dispatch active",
    time: "18 mins ago",
    isRead: false,
  },
  {
    icon: Truck,
    bgcolor: "bg-emerald-500/10",
    color: 'text-emerald-600',
    title: "Pump Successfully Deployed",
    subtitle: "500HP Dewatering Pump #2 active at Mankapur Canal Junction",
    time: "32 mins ago",
    isRead: true,
  }
];

export interface profileType {
  avatar: LucideIcon;
  title: string;
  href: string;
  badge: boolean;
}

export const profileDD: profileType[] = [
  {
    avatar: Home,
    title: 'Command Dashboard',
    href: '/',
    badge: false
  },
  {
    avatar: ShieldCheck,
    title: 'Live Crisis Map',
    href: '/live-map',
    badge: true
  },
  {
    avatar: User,
    title: 'NMC Profile',
    href: '/users',
    badge: false
  },
  {
    avatar: Settings,
    title: 'System Settings',
    href: '/settings',
    badge: false
  }
];
