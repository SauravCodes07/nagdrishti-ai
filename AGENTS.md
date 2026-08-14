# AGENTS.md — NagDrishti AI Developer & Agent Reference

This document provides essential architecture context, conventions, and guidelines for working on **NagDrishti AI — AI-Powered Nagpur Urban Crisis Management System**.

---

## 🌧️ Project Overview

**NagDrishti AI** is a real-time civic intelligence and crisis management SPA built for Nagpur Municipal Corporation (NMC) and citizens.

- **Framework**: Vite 8 + React 19 SPA
- **Language**: TypeScript (Strict type-checking with `tsc`)
- **Routing**: `react-router` (Client-side `createBrowserRouter`)
- **Styling**: Tailwind CSS v4 + Lucide Icons + Outfit/Inter fonts
- **Branding**: Bhagwa/Saffron (`#FF7722`) + Deep Navy (`#0B192C`) + Warm White
- **Mapping & GIS**: Leaflet + OpenStreetMap with Nagpur GeoJSON Zonal Coordinates
- **Charts & Visualizations**: Recharts, Framer Motion
- **State & Simulation**: React Context API (`DemoSimulationContext`)
- **Deployment**: Vercel Ready (`vercel.json` SPA rewrites)

---

## 📁 Repository Structure

```
/src
├── assets/                  # Logos, icons, backgrounds
│   └── images/logos/        # Official NagDrishti AI logo
├── components/
│   ├── crisis/              # Crisis command widgets (Live map, alerts, safe route, rainfall chart, simulation bar)
│   ├── ui/                  # UI primitives (cards, badges, buttons, sheets, dialogs)
│   └── shared/              # Shared layout helpers
├── context/
│   ├── DemoSimulationContext.tsx # 8-stage heavy rainfall crisis simulation
│   └── shadcntheme/         # Dark/Light theme provider
├── data/
│   └── crisis/              # Nagpur zones, rainfall records, citizen reports, AI predictions, incident data
├── layouts/
│   ├── full/                # Main layout (Sidebar + Header + Mobile Bottom Nav + Footer)
│   └── blank/               # Minimal layout (404, maintenance)
├── routes/
│   └── Router.tsx           # All 19 NagDrishti AI crisis routes
├── views/
│   ├── crisis/              # Feature pages (Live map, safe route, rainfall, waterlogging, alerts, emergency response, AI predictions, etc.)
│   └── dashboards/modern/   # Nagpur Crisis Command Center dashboard
└── lib/utils.ts             # cn() utility helper
```

---

## 🛠️ Build & Dev Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build (tsc + vite build)
npm run build
```

---

## 📱 Mobile-First Requirements
- Maintain bottom sticky navigation on mobile with Dashboard, Live Map, Alerts, Reports, and More.
- Ensure all crisis cards and GIS map controls adapt cleanly without horizontal overflow across 320px–1920px viewports.
