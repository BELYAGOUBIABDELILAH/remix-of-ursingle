import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldX, ArrowLeft, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CitizenGuardProps {
  children: React.ReactNode;
}

export function CitizenGuard({ children }: CitizenGuardProps) {
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Vérification de l'authentification...</p>
      </div>
    );
  }

  // Redirect to citizen login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/citizen/login" replace />;
  }

  // Wait for profile to load
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement du profil...</p>
      </div>
    );
  }

  // Check userType is citizen (primary check)
  // Also allow legacy 'patient' role via hasRole for backward compatibility
  if (profile.userType !== 'citizen') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">Accès réservé aux citoyens</CardTitle>
            <CardDescription>
              Cette section est réservée aux comptes citoyens.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Connectez-vous avec un compte citoyen pour accéder à cette page.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <a href="/citizen/login">
                  <UserCircle className="h-4 w-4 mr-2" />
                  Connexion Citoyen
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

  return <>{children}</>;
}
