import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// Dashboards & Crisis Views
const ModernDashboard = Loadable(lazy(() => import('../views/dashboards/modern')));
const LiveMapPage = Loadable(lazy(() => import('../views/crisis/live-map-page')));
const SafeRoutePage = Loadable(lazy(() => import('../views/crisis/safe-route-page')));
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
const Login2 = Loadable(lazy(() => import('../views/auth/auth2/login')));
const Register2 = Loadable(lazy(() => import('../views/auth/auth2/register')));
const ForgotPassword2 = Loadable(lazy(() => import('../views/auth/auth2/forgot-password')));
const TwoSteps2 = Loadable(lazy(() => import('../views/auth/auth2/two-steps')));
const Maintainance = Loadable(lazy(() => import('../views/auth/maintenance')));

const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', element: <ModernDashboard /> },
      { path: '/dashboards/modern', element: <ModernDashboard /> },
      { path: '/live-map', element: <LiveMapPage /> },
      { path: '/safe-route', element: <SafeRoutePage /> },
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
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/auth2/login', element: <Login2 /> },
      { path: '/auth/auth2/register', element: <Register2 /> },
      { path: '/auth/auth2/forgot-password', element: <ForgotPassword2 /> },
      { path: '/auth/auth2/two-steps', element: <TwoSteps2 /> },
      { path: '/auth/maintenance', element: <Maintainance /> },
      { path: '404', element: <Error /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;
