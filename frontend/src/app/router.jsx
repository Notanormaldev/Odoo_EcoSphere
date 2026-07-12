import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import AppLayout from '@shared/ui/Layout/AppLayout';
import LoadingScreen from '@shared/ui/LoadingScreen';

// Auth pages
import LoginPage    from '@pages/auth/LoginPage';
import RegisterPage from '@pages/auth/RegisterPage';
import VerifyEmail  from '@pages/auth/VerifyEmail';
import AuthCallback from '@pages/auth/AuthCallback';

// Lazy load main pages
const DashboardPage         = lazy(() => import('@pages/DashboardPage'));
const EnvironmentalPage     = lazy(() => import('@pages/EnvironmentalPage'));
const SocialPage            = lazy(() => import('@pages/SocialPage'));
const GovernancePage        = lazy(() => import('@pages/GovernancePage'));
const GamificationPage      = lazy(() => import('@pages/GamificationPage'));
const ReportsPage           = lazy(() => import('@pages/ReportsPage'));
const SettingsPage          = lazy(() => import('@pages/SettingsPage'));
const ChatbotPage           = lazy(() => import('@pages/ChatbotPage'));
const ProfilePage           = lazy(() => import('@pages/ProfilePage'));
const NotFoundPage          = lazy(() => import('@pages/NotFoundPage'));

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Guest routes */}
          <Route path="/login"          element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register"       element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/auth/callback"  element={<AuthCallback />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"              element={<DashboardPage />} />
            <Route path="environmental/*"        element={<EnvironmentalPage />} />
            <Route path="social/*"               element={<SocialPage />} />
            <Route path="governance/*"           element={<GovernancePage />} />
            <Route path="gamification/*"         element={<GamificationPage />} />
            <Route path="reports/*"              element={<ReportsPage />} />
            <Route path="settings/*"             element={<SettingsPage />} />
            <Route path="chatbot"                element={<ChatbotPage />} />
            <Route path="profile"                element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
