import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProvider } from '@/contexts/ProviderContext';
import { Loader2, ShieldX, ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProviderRouteGuardProps {
  children: React.ReactNode;
  requireVerified?: boolean; // If true, only verified providers can access
}

// No Provider Account component
const NoProviderAccount = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Aucun compte professionnel</CardTitle>
          <CardDescription>
            Vous n'avez pas encore de compte professionnel sur CityHealth.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Pour accéder à l'espace professionnel, vous devez d'abord créer un compte prestataire.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <a href="/provider/register">
                <Building2 className="h-4 w-4 mr-2" />
                Créer mon compte professionnel
              </a>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Not Verified component
const NotVerifiedAccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">Compte en attente</CardTitle>
          <CardDescription>
            Votre compte n'est pas encore vérifié.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Cette fonctionnalité est réservée aux comptes vérifiés. 
            Votre demande est en cours de traitement.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <a href="/provider/dashboard">Retour au tableau de bord</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export function ProviderRouteGuard({ children, requireVerified = false }: ProviderRouteGuardProps) {
  const { user, isAuthenticated, isLoading: authLoading, hasRole } = useAuth();
  const { 
    provider, 
    isLoading: providerLoading, 
    hasProviderAccount, 
    isVerified 
  } = useProvider();

  const isLoading = authLoading || providerLoading;

  // Show loading state while checking auth and provider data
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement de votre espace professionnel...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/provider/login" replace />;
  }

  // Check role FIRST and RETURN early if no provider role
  if (!hasRole('provider')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Accès refusé</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Cette page est réservée aux prestataires de santé enregistrés.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <a href="/provider/register">
                  <Building2 className="h-4 w-4 mr-2" />
                  Devenir prestataire
                </a>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Then check if provider account exists in Firestore
  if (!hasProviderAccount) {
    return <NoProviderAccount />;
  }

  // If verification required, check status
  if (requireVerified && !isVerified) {
    return <NotVerifiedAccess />;
  }

  return <>{children}</>;
}
