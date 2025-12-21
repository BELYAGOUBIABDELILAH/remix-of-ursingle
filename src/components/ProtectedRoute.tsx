import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Loader2, ShieldX, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: UserRole;
}

// Access Denied component for unauthorized users
const AccessDenied = ({ requiredRole }: { requiredRole: UserRole }) => {
  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrateur',
    provider: 'Prestataire de santé',
    patient: 'Patient'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Accès refusé</CardTitle>
          <CardDescription>
            Cette page nécessite le rôle "{roleLabels[requiredRole]}" pour y accéder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Si vous pensez que c'est une erreur, veuillez contacter l'administrateur.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button asChild>
              <a href="/">Retour à l'accueil</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading, hasRole, profile } = useAuth();

  // Show loading state while checking Firebase Auth and fetching roles
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Vérification de l'authentification...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated (Firebase Auth check)
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Wait for profile/roles to load from Firestore
  if (!profile && requireRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement du profil...</p>
      </div>
    );
  }

  // Check role from Firestore user_roles collection (not localStorage)
  if (requireRole && !hasRole(requireRole)) {
    return <AccessDenied requiredRole={requireRole} />;
  }

  return <>{children}</>;
};
