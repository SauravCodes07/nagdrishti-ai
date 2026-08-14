import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));
const CitizenLayout = Loadable(lazy(() => import('../layouts/citizen/CitizenLayout')));

// 1. Premium Public Landing Page
const LandingPage = Loadable(lazy(() => import('../views/landing/LandingPage')));

// 2. Citizen Views (Mobile-First)
const CitizenHomePage = Loadable(lazy(() => import('../views/citizen/citizen-home-page')));
const CitizenSafeRoutePage = Loadable(lazy(() => import('../views/citizen/citizen-safe-route-page')));
const CitizenLiveMapPage = Loadable(lazy(() => import('../views/citizen/citizen-live-map-page')));
const CitizenAlertsPage = Loadable(lazy(() => import('../views/citizen/citizen-alerts-page')));
const CitizenReportPage = Loadable(lazy(() => import('../views/citizen/citizen-report-page')));
const CitizenProfilePage = Loadable(lazy(() => import('../views/citizen/citizen-profile-page')));

// 3. Admin Command Center Dashboards & Crisis Views (Laptop-First)
const ModernDashboard = Loadable(lazy(() => import('../views/dashboards/modern')));
const LiveMapPage = Loadable(lazy(() => import('../views/crisis/live-map-page')));
const SafeRoutePage = Loadable(lazy(() => import('../views/crisis/safe-route-page')));
const SatelliteIntelligencePage = Loadable(lazy(() => import('../views/crisis/satellite-intelligence-page')));
const ConstructionPage = Loadable(lazy(() => import('../views/crisis/construction-page')));
const RainfallPage = Loadable(lazy(() => import('../views/crisis/rainfall-page')));
const WaterloggingPage = Loadable(lazy(() => import('../views/crisis/waterlogging-page')));
const RoadRiskPage = Loadable(lazy(() => import('../views/crisis/road-risk-page')));
const TrafficPage = Loadable(lazy(() => import('../views/crisis/traffic-page')));
const DrainagePage = Loadable(lazy(() => import('../views/crisis/drainage-page')));
const CitizenReportsPage = Loadable(lazy(() => import('../views/crisis/citizen-reports-page')));
const AlertsPage = Loadable(lazy(() => import('../views/crisis/alerts-page')));
const EmergencyResponsePage = Loadable(lazy(() => import('../views/crisis/emergency-response-page')));
const ResourcesPage = Loadable(lazy(() => import('../views/crisis/resources-page')));
const AIPredictionsPage = Loadable(lazy(() => import('../views/crisis/ai-predictions-page')));
const HistoricalDataPage = Loadable(lazy(() => import('../views/crisis/historical-data-page')));
const ReportsPage = Loadable(lazy(() => import('../views/crisis/reports-page')));
const SettingsPage = Loadable(lazy(() => import('../views/crisis/settings-page')));
const UsersPage = Loadable(lazy(() => import('../views/crisis/users-page')));
const HelpPage = Loadable(lazy(() => import('../views/crisis/help-page')));

const Error = Loadable(lazy(() => import('../views/auth/error')));
const Maintainance = Loadable(lazy(() => import('../views/auth/maintenance')));

const Router = [
  // 1. Premium Public Landing Page Entry
  {
    path: '/',
    element: <LandingPage />,
  },

  // 2. Citizen Mobile-First Experience
  {
    path: '/citizen',
    element: <CitizenLayout />,
    children: [
      { path: '/citizen', element: <CitizenHomePage /> },
      { path: '/citizen/route', element: <CitizenSafeRoutePage /> },
      { path: '/citizen/map', element: <CitizenLiveMapPage /> },
      { path: '/citizen/alerts', element: <CitizenAlertsPage /> },
      { path: '/citizen/report', element: <CitizenReportPage /> },
      { path: '/citizen/profile', element: <CitizenProfilePage /> },
    ],
  },

  // 3. Admin Command Center Experience (Desktop/Laptop-First)
  {
    path: '/admin',
    element: <FullLayout />,
    children: [
      { path: '/admin', element: <ModernDashboard /> },
      { path: '/admin/dashboard', element: <ModernDashboard /> },
      { path: '/admin/live-map', element: <LiveMapPage /> },
      { path: '/admin/safe-route', element: <SafeRoutePage /> },
      { path: '/admin/satellite', element: <SatelliteIntelligencePage /> },
      { path: '/admin/construction', element: <ConstructionPage /> },
      { path: '/admin/rainfall', element: <RainfallPage /> },
      { path: '/admin/waterlogging', element: <WaterloggingPage /> },
      { path: '/admin/road-risk', element: <RoadRiskPage /> },
      { path: '/admin/traffic', element: <TrafficPage /> },
      { path: '/admin/drainage', element: <DrainagePage /> },
      { path: '/admin/citizen-reports', element: <CitizenReportsPage /> },
      { path: '/admin/alerts', element: <AlertsPage /> },
      { path: '/admin/emergency-response', element: <EmergencyResponsePage /> },
      { path: '/admin/resources', element: <ResourcesPage /> },
      { path: '/admin/ai-predictions', element: <AIPredictionsPage /> },
      { path: '/admin/historical-data', element: <HistoricalDataPage /> },
      { path: '/admin/reports', element: <ReportsPage /> },
      { path: '/admin/settings', element: <SettingsPage /> },
      { path: '/admin/users', element: <UsersPage /> },
      { path: '/admin/help', element: <HelpPage /> },
    ],
  },

  // Direct root aliases for Admin navigation consistency
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/dashboards/modern', element: <ModernDashboard /> },
      { path: '/live-map', element: <LiveMapPage /> },
      { path: '/safe-route', element: <SafeRoutePage /> },
      { path: '/satellite', element: <SatelliteIntelligencePage /> },
      { path: '/construction', element: <ConstructionPage /> },
      { path: '/rainfall', element: <RainfallPage /> },
      { path: '/waterlogging', element: <WaterloggingPage /> },
      { path: '/road-risk', element: <RoadRiskPage /> },
      { path: '/traffic', element: <TrafficPage /> },
      { path: '/drainage', element: <DrainagePage /> },
      { path: '/citizen-reports', element: <CitizenReportsPage /> },
      { path: '/alerts', element: <AlertsPage /> },
      { path: '/emergency-response', element: <EmergencyResponsePage /> },
      { path: '/resources', element: <ResourcesPage /> },
      { path: '/ai-predictions', element: <AIPredictionsPage /> },
      { path: '/historical-data', element: <HistoricalDataPage /> },
      { path: '/reports', element: <ReportsPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/users', element: <UsersPage /> },
      { path: '/help', element: <HelpPage /> },
    ],
  },

  // Fallback & Error Pages
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/maintenance', element: <Maintainance /> },
      { path: '/auth/maintenance', element: <Maintainance /> },
      { path: '404', element: <Error /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;
