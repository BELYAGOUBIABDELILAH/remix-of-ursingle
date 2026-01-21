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
import { AdminGuard } from "@/components/guards/AdminGuard";
import { CitizenGuard } from "@/components/guards/CitizenGuard";
import AntigravityIndex from "./pages/AntigravityIndex";
import MapMother from "./components/map/MapMother";
import ProvidersMapChild from "./components/map/children/ProvidersMapChild";
import EmergencyMapChild from "./components/map/children/EmergencyMapChild";
import BloodMapChild from "./components/map/children/BloodMapChild";
import { AIChatbot } from "./components/AIChatbot";
import FloatingSidebar from "./components/FloatingSidebar";

import LoadingSpinner from "./components/LoadingSpinner";

// Lazy-loaded pages for code splitting
const CitizenLoginPage = lazy(() => import("./pages/CitizenLoginPage"));
const CitizenRegisterPage = lazy(() => import("./pages/CitizenRegisterPage"));
const ProviderLoginPage = lazy(() => import("./pages/ProviderLoginPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
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
    profile?.userType === 'provider' && 
    profile?.verification_status === 'pending';
  
  // Allowed paths for pending providers
  const allowedPaths = ['/registration-status', '/provider/register', '/settings', '/provider/login', '/citizen/login', '/admin/login', '/'];
  const isAllowedPath = allowedPaths.some(path => location.pathname.startsWith(path));
  
  if (isPendingProvider && !isAllowedPath) {
    return <Navigate to="/registration-status" replace />;
  }
  
  return <>{children}</>;
};

// Auth redirect - redirects /auth to appropriate login page
const AuthRedirect = () => {
  return <Navigate to="/citizen/login" replace />;
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
        
        {/* Legacy /auth redirects to citizen login */}
        <Route path="/auth" element={<AuthRedirect />} />
        
        {/* ============================================ */}
        {/* CITIZEN ROUTES */}
        {/* ============================================ */}
        <Route path="/citizen/login" element={<PageTransition><CitizenLoginPage /></PageTransition>} />
        <Route path="/citizen/register" element={<PageTransition><CitizenRegisterPage /></PageTransition>} />
        <Route 
          path="/citizen/dashboard" 
          element={
            <PageTransition>
              <CitizenGuard>
                <PatientDashboard />
              </CitizenGuard>
            </PageTransition>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PageTransition>
              <CitizenGuard>
                <CitizenProfilePage />
              </CitizenGuard>
            </PageTransition>
          } 
        />
        <Route 
          path="/favorites" 
          element={
            <PageTransition>
              <CitizenGuard>
                <FavoritesPage />
              </CitizenGuard>
            </PageTransition>
          } 
        />
        {/* Legacy /dashboard redirects to citizen dashboard */}
        <Route path="/dashboard" element={<Navigate to="/citizen/dashboard" replace />} />
        
        {/* ============================================ */}
        {/* PROVIDER ROUTES */}
        {/* ============================================ */}
        <Route path="/provider/login" element={<PageTransition><ProviderLoginPage /></PageTransition>} />
        <Route 
          path="/provider/register/*" 
          element={
            <PageTransition>
              <ProviderRegister />
            </PageTransition>
          } 
        />
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
        <Route path="/provider" element={<Navigate to="/provider/dashboard" replace />} />
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
        
        {/* ============================================ */}
        {/* ADMIN ROUTES */}
        {/* ============================================ */}
        <Route path="/admin/login" element={<PageTransition><AdminLoginPage /></PageTransition>} />
        <Route 
          path="/admin/dashboard" 
          element={
            <PageTransition>
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            </PageTransition>
          } 
        />
        <Route 
          path="/admin/migrate" 
          element={
            <PageTransition>
              <AdminGuard>
                <AdminMigratePage />
              </AdminGuard>
            </PageTransition>
          } 
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* ============================================ */}
        {/* PUBLIC ROUTES */}
        {/* ============================================ */}
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
        <Route 
          path="/provider/:id" 
          element={
            <PageTransition>
              <ProviderProfilePage />
            </PageTransition>
          } 
        />
        <Route 
          path="/contact" 
          element={
            <PageTransition>
              <ContactPage />
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
          path="/blood-donation" 
          element={
            <PageTransition>
              <BloodDonationPage />
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
        <Route 
          path="/medical-assistant" 
          element={
            <PageTransition>
              <MedicalAssistantPage />
            </PageTransition>
          } 
        />
        
        {/* ============================================ */}
        {/* MAP ROUTES */}
        {/* ============================================ */}
        <Route path="/map" element={<MapMother />}>
          <Route index element={<Navigate to="/map/providers" replace />} />
          <Route path="providers" element={<ProvidersMapChild />} />
          <Route path="emergency" element={<EmergencyMapChild />} />
          <Route path="blood" element={<BloodMapChild />} />
        </Route>
        
        {/* ============================================ */}
        {/* DOCUMENTATION ROUTES */}
        {/* ============================================ */}
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
        
        {/* ============================================ */}
        {/* LEGACY REDIRECTS */}
        {/* ============================================ */}
        <Route path="/why" element={<Navigate to="/docs/getting-started/why-cityhealth" replace />} />
        <Route path="/how" element={<Navigate to="/docs/getting-started/how-it-works" replace />} />
        <Route path="/carte" element={<Navigate to="/map/providers" replace />} />
        <Route path="/providers-map" element={<Navigate to="/map/providers" replace />} />
        <Route path="/urgences" element={<Navigate to="/map/emergency" replace />} />
        
        {/* ============================================ */}
        {/* 404 */}
        {/* ============================================ */}
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
