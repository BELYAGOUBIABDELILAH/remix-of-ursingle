import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProviderProvider } from "@/contexts/ProviderContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProviderRouteGuard } from "@/components/ProviderRouteGuard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AntigravityIndex from "./pages/AntigravityIndex";
import MapMother from "./components/map/MapMother";
import ProvidersMapChild from "./components/map/children/ProvidersMapChild";
import EmergencyMapChild from "./components/map/children/EmergencyMapChild";
import BloodMapChild from "./components/map/children/BloodMapChild";
import { AIChatbot } from "./components/AIChatbot";
import FloatingSidebar from "./components/FloatingSidebar";

import LoadingSpinner from "./components/LoadingSpinner";

// Lazy-loaded pages for code splitting
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const ProvidersPage = lazy(() => import("./pages/ProvidersPage"));
const EmergencyPage = lazy(() => import("./pages/EmergencyPage"));
const ProviderProfilePage = lazy(() => import("./pages/ProviderProfilePage"));
const ProviderRegister = lazy(() => import("./pages/ProviderRegister"));
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));
const AIHealthChat = lazy(() => import("./pages/AIHealthChat"));
const RegistrationStatus = lazy(() => import("./pages/RegistrationStatus"));
const RegistrationThankYou = lazy(() => import("./pages/RegistrationThankYou"));
const MedicalAssistantPage = lazy(() => import("./pages/MedicalAssistantPage"));
const CitizenProfilePage = lazy(() => import("./pages/CitizenProfilePage"));
const BloodDonationPage = lazy(() => import("./pages/BloodDonationPage"));
const AdminMigratePage = lazy(() => import("./pages/AdminMigratePage"));
const DocsPage = lazy(() => import("./pages/DocsPage"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoadingSpinner size="lg" />
  </div>
);

// Page transition wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="transition-opacity duration-300 animate-fade-in">
      {children}
    </div>
  );
};


// Verification redirect wrapper for providers
const VerificationGuard = ({ children }: { children: React.ReactNode }) => {
  const { profile, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Check if user is a provider with pending verification
  const isPendingProvider = isAuthenticated && 
    profile?.roles?.includes('provider') && 
    profile?.verification_status === 'pending';
  
  // Allowed paths for pending providers
  const allowedPaths = ['/registration-status', '/provider/register', '/settings', '/auth', '/'];
  const isAllowedPath = allowedPaths.some(path => location.pathname.startsWith(path));
  
  if (isPendingProvider && !isAllowedPath) {
    return <Navigate to="/registration-status" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route 
          path="/" 
          element={
            <PageTransition>
              <AntigravityIndex />
            </PageTransition>
          } 
        />
        <Route 
          path="/auth" 
          element={
            <PageTransition>
              <AuthPage />
            </PageTransition>
          } 
        />
        {/* Redirect /why and /how to documentation */}
        <Route 
          path="/why" 
          element={<Navigate to="/docs/getting-started/why-cityhealth" replace />}
        />
        <Route 
          path="/how" 
          element={<Navigate to="/docs/getting-started/how-it-works" replace />}
        />
        <Route 
          path="/search" 
          element={
            <VerificationGuard>
              <PageTransition>
                <SearchPage />
              </PageTransition>
            </VerificationGuard>
          } 
        />
        <Route 
          path="/providers" 
          element={
            <PageTransition>
              <ProvidersPage />
            </PageTransition>
          } 
        />
        {/* Unified Map Routes - MapMother with nested children */}
        <Route path="/map" element={<MapMother />}>
          <Route index element={<Navigate to="/map/providers" replace />} />
          <Route path="providers" element={<ProvidersMapChild />} />
          <Route path="emergency" element={<EmergencyMapChild />} />
          <Route path="blood" element={<BloodMapChild />} />
        </Route>
        {/* Legacy /carte redirects to new map */}
        <Route path="/carte" element={<Navigate to="/map/providers" replace />} />
        <Route 
          path="/contact" 
          element={
            <PageTransition>
              <ContactPage />
            </PageTransition>
          } 
        />
        <Route 
          path="/favorites" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/emergency" 
          element={
            <PageTransition>
              <EmergencyPage />
            </PageTransition>
          } 
        />
        <Route 
          path="/provider/:id" 
          element={
            <PageTransition>
              <ProviderProfilePage />
            </PageTransition>
          } 
        />
        {/* New Registration Flow - uses local hook instead of context */}
        <Route 
          path="/provider/register/*" 
          element={
            <PageTransition>
              <ProviderRegister />
            </PageTransition>
          } 
        />
        <Route 
          path="/registration-status" 
          element={
            <PageTransition>
              <RegistrationStatus />
            </PageTransition>
          } 
        />
        <Route 
          path="/registration-thank-you" 
          element={
            <PageTransition>
              <RegistrationThankYou />
            </PageTransition>
          } 
        />
        {/* Provider Dashboard - uses ProviderRouteGuard for enhanced security */}
        <Route 
          path="/provider/dashboard" 
          element={
            <PageTransition>
              <ProviderRouteGuard>
                <ProviderDashboard />
              </ProviderRouteGuard>
            </PageTransition>
          } 
        />
        {/* /provider alias redirects to dashboard */}
        <Route 
          path="/provider" 
          element={<Navigate to="/provider/dashboard" replace />}
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <PageTransition>
              <ProtectedRoute requireRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <CitizenProfilePage />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <PageTransition>
              <ProtectedRoute requireRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/ai-health-chat" 
          element={
            <PageTransition>
              <AIHealthChat />
            </PageTransition>
          } 
        />
        {/* Legacy /providers-map redirects to new map */}
        <Route path="/providers-map" element={<Navigate to="/map/providers" replace />} />
        <Route 
          path="/medical-assistant" 
          element={
            <PageTransition>
              <MedicalAssistantPage />
            </PageTransition>
          } 
        />
        <Route 
          path="/blood-donation" 
          element={
            <PageTransition>
              <BloodDonationPage />
            </PageTransition>
          } 
        />
        <Route 
          path="/admin/migrate" 
          element={
            <PageTransition>
              <ProtectedRoute requireRole="admin">
                <AdminMigratePage />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        {/* Documentation Routes */}
        <Route 
          path="/docs" 
          element={
            <PageTransition>
              <DocsPage />
            </PageTransition>
          } 
        />
        <Route 
          path="/docs/:sectionId/:pageId" 
          element={
            <PageTransition>
              <DocsPage />
            </PageTransition>
          } 
        />
        {/* Redirect routes for backwards compatibility */}
        <Route path="/urgences" element={<Navigate to="/map/emergency" replace />} />
        <Route 
          path="*" 
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          } 
        />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ProviderProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  
                  <div className="min-h-screen bg-background text-foreground">
                    <FloatingSidebar />
                    <AIChatbot />
                    <AppRoutes />
                  </div>
                </BrowserRouter>
              </TooltipProvider>
            </ProviderProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;