<div align="center">

  <img src="public/nagdrishti-logo.png" alt="NagDrishti AI Logo" width="180" />

  # NagDrishti AI

  ### 🌧️ AI-Powered Nagpur Urban Crisis Management System

  <p align="center">
    <strong>Real-time rainfall prediction, dynamic waterlogging risk mapping, safe route navigation, and automated civic emergency response for the citizens and authorities of Nagpur.</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-19-blue.svg" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF.svg" alt="Vite 8" />
    <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Leaflet-GIS_Mapping-green.svg" alt="Leaflet Maps" />
    <img src="https://img.shields.io/badge/Deployment-Vercel_Ready-black.svg" alt="Vercel Ready" />
  </p>

</div>

---

## 🌟 Executive Summary

**NagDrishti AI** (दृष्टि / Vision for Nagpur) is a mission-critical, AI-driven civic intelligence platform designed for **Nagpur Municipal Corporation (NMC)** and citizens. During heavy monsoon events and cloudbursts, NagDrishti AI predicts localized rainfall risks, identifies severe waterlogging zones, computes safest detour routes avoiding submerged bottlenecks, and automates emergency resource deployment (dewatering pumps, NDRF teams, traffic diversions).

---

## 🎯 Core Capabilities & Modules

### 1. 🗺️ Live Crisis Map — Nagpur
- **Interactive Multi-Layer GIS Grid**: Real-time visualization of 10 administrative zones of Nagpur (Dharampeth, Laxmi Nagar, Hanuman Nagar, Dhantoli, Nehru Nagar, Gandhibagh, Satranjipura, Lakadganj, Ashi Nagar, Mangalwari).
- **Dynamic Risk Heatmaps**: Color-coded risk indicators:
  - 🔴 **Severe Risk**: Immediate flooding, water depth > 3.0 ft, road impassable.
  - 🟠 **High Risk**: Waterlogging 1.5 - 3.0 ft, traffic stalled.
  - 🟡 **Medium Risk**: Water accumulation 0.5 - 1.5 ft, slow traffic.
  - 🟢 **Low Risk**: Normal drainage flow, clear transit.
- **Layer Toggles**: Waterlogging hotspots, live rainfall radar, traffic congestion, storm drainage flow, citizen verified photos, and deployed emergency response teams.

### 2. 🚗 Safe Route Planner (`/safe-route`)
- Dynamic route engine calculating **Recommended Route**, **Alternative Route**, and **Avoid Route** between major Nagpur landmarks (e.g., Sitabuldi, Airport, Medical Square, IT Park, Wadi).
- Real-time safety score, waterlogging depth analysis, traffic speed, distance, and ETA calculation.

### 3. 🤖 AI Risk Predictions (`/ai-predictions`)
- Machine learning risk modeling analyzing rainfall intensity (mm/hr), historical drainage capacity, elevation profiles, and soil percolation indices.
- Explanatory AI recommendations for zonal ward engineers.

### 4. 🚨 Real-time Alerts & Citizen Notifications (`/alerts`)
- Multi-tier alert broadcast system for severe flood warnings, bridge closures (Nag River crossings), electric pole hazards, and road cave-in notices.
- Push alerts with direct SMS/WhatsApp emergency helpline integrations.

### 5. 👥 Citizen Reporting Portal (`/citizen-reports`)
- Crowd-sourced, geo-tagged hazard submission with photo upload, automated severity classification, and municipal verification workflow.

### 6. 🚑 Emergency Response & Resource Deployment (`/emergency-response` & `/resources`)
- Centralized dispatch tracking high-capacity dewatering pumps, NDRF flood rescue teams, traffic police barricades, and mobile earth-movers across all 10 zones.

### 7. 🎬 Heavy Rainfall Simulation Mode
- Interactive 8-stage monsoon crisis simulator demonstrating real-time response escalation:
  1. Normal baseline conditions
  2. Rainfall onset (20 mm)
  3. AI risk detection & warning
  4. Localized waterlogging emergence (55 mm)
  5. Traffic congestion buildup
  6. Citizen reports influx
  7. AI automated emergency dispatch
  8. Full municipal mitigation & dewatering

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4, Lucide Icons, Modern Indian Civic Theme (Bhagwa/Saffron `#FF7722` + Deep Navy `#0B192C` + Warm White)
- **Mapping & GIS**: Leaflet, OpenStreetMap, GeoJSON zonal coordinates for Nagpur
- **Visual Analytics**: Recharts, Framer Motion
- **State & Simulation**: React Context API (`DemoSimulationContext`)
- **Hosting & CI/CD**: Vercel (Single-Page Application with rewrites)

---

## 💻 Local Development

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/SauravCodes07/nagdrishti-ai.git

# 2. Navigate to project root
cd nagdrishti-ai

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 🚀 Production Build & Vercel Deployment

### Build Command

```bash
npm run build
```

This compiles TypeScript and produces a production-optimized bundle in `./dist`.

### Vercel Project Settings

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | `Vite` |
| **Root Directory** | `./` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

---

## 📱 Mobile-First Responsive Design

NagDrishti AI is built mobile-first to ensure citizens on foot or in vehicles and field officers on mobile devices have instantaneous access to:
- Sticky mobile navigation with **Dashboard**, **Live Map**, **Alerts**, **Reports**, and **More** drawer.
- Zero horizontal overflow across viewports from 320px (iPhone SE) to 1920px (Ultra-wide displays).
- Touch-friendly tap targets and high-contrast alert indicators.

---

## 🛡️ Security & Privacy

- No external third-party authentication dependencies or exposed secrets.
- Full client-side simulation & demo resilience.
- Compliant with civic privacy standards for citizen report submissions.

---

## 🏛️ Acknowledgments

Developed for **Nagpur Municipal Corporation (NMC)** Smart City Urban Crisis Intelligence Initiative.
