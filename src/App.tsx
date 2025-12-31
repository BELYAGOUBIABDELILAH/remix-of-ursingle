import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProviderProvider } from "@/contexts/ProviderContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProviderRouteGuard } from "@/components/ProviderRouteGuard";
import AntigravityIndex from "./pages/AntigravityIndex";
import AuthPage from "./pages/AuthPage";
import WhyPage from "./pages/WhyPage";
import HowPage from "./pages/HowPage";
import CartePage from "./pages/CartePage";
import ContactPage from "./pages/ContactPage";
import FavoritesPage from "./pages/FavoritesPage";
import NotFound from "./pages/NotFound";
import Import from "./pages/Import";
import SearchPage from "./pages/SearchPage";
import ProvidersPage from "./pages/ProvidersPage";
import Settings from "./pages/Settings";
import ManagePage from "./pages/ManagePage";
import FloatingSidebar from "./components/FloatingSidebar";
import EmergencyPage from "./pages/EmergencyPage";
import ProviderProfilePage from "./pages/ProviderProfilePage";
import ProviderRegister from "./pages/ProviderRegister";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import AIHealthChat from "./pages/AIHealthChat";
import RegistrationStatus from "./pages/RegistrationStatus";
import RegistrationThankYou from "./pages/RegistrationThankYou";
import ProvidersMapPage from "./pages/ProvidersMapPage";
import MedicalAssistantPage from "./pages/MedicalAssistantPage";
import CitizenProfilePage from "./pages/CitizenProfilePage";
import BloodDonationPage from "./pages/BloodDonationPage";
import AdminMigratePage from "./pages/AdminMigratePage";
import { AIChatbot } from "./components/AIChatbot";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { migrateProvidersToFirestore } from "@/scripts/migrateProvidersToFirestore";

const queryClient = new QueryClient();

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

// Initialize Firestore with mock data if empty
const FirestoreInit = () => {
  useEffect(() => {
    migrateProvidersToFirestore(50).then(result => {
      if (result.count > 0) {
        console.log('Firestore initialized:', result.message);
      }
    }).catch(err => {
      console.error('Firestore init error:', err);
    });
  }, []);
  return null;
};

// Verification redirect wrapper for providers
const VerificationGuard = ({ children }: { children: React.ReactNode }) => {
  const { profile, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Check if user is a provider with pending verification
  // Note: verificationStatus would be added to profile when backend is connected
  const isPendingProvider = isAuthenticated && 
    profile?.roles?.includes('provider') && 
    (profile as any)?.verificationStatus === 'pending';
  
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
      <Route 
        path="/why" 
        element={
          <PageTransition>
            <WhyPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/how" 
        element={
          <PageTransition>
            <HowPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/manage" 
        element={
          <PageTransition>
            <ManagePage />
          </PageTransition>
        } 
      />
      <Route 
        path="/import" 
        element={
          <PageTransition>
            <Import />
          </PageTransition>
        } 
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
      <Route 
        path="/settings" 
        element={
          <PageTransition>
            <Settings />
          </PageTransition>
        } 
      />
      <Route 
        path="/carte"
        element={
          <PageTransition>
            <CartePage />
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
        path="/favorites" 
        element={
          <PageTransition>
            <FavoritesPage />
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
      <Route 
        path="/providers-map" 
        element={
          <PageTransition>
            <ProvidersMapPage />
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
            <AdminMigratePage />
          </PageTransition>
        } 
      />
      {/* Redirect routes for backwards compatibility */}
      <Route path="/map" element={<Navigate to="/carte" replace />} />
      <Route path="/urgences" element={<Navigate to="/carte?mode=emergency" replace />} />
      <Route 
        path="*" 
        element={
          <PageTransition>
            <NotFound />
          </PageTransition>
        } 
      />
    </Routes>
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
                  <FirestoreInit />
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
