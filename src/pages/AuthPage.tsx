import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const loginSchema = z.object({
  email: z.string().email('Email invalide').max(255),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').max(100),
});

const signupSchema = z.object({
  email: z.string().email('Email invalide').max(255),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100)
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre'),
  fullName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
});

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  
  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    
    try {
      const validated = loginSchema.parse({ email: loginEmail, password: loginPassword });
      setIsLoading(true);
      await login(validated.email, validated.password);
      toast.success('Bienvenue sur CityHealth!', {
        description: `Heureux de vous revoir${profile?.full_name ? `, ${profile.full_name}` : ''}!`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) errors[err.path[0].toString()] = err.message;
        });
        setLoginErrors(errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});
    
    try {
      const validated = signupSchema.parse({ 
        email: signupEmail, 
        password: signupPassword,
        fullName 
      });
      setIsLoading(true);
      await signup(validated.email, validated.password, validated.fullName);
      toast.success('Compte créé avec succès! Bienvenue sur CityHealth.');
      setSignupEmail('');
      setSignupPassword('');
      setFullName('');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) errors[err.path[0].toString()] = err.message;
        });
        setSignupErrors(errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Veuillez entrer votre email');
      return;
    }
    
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotEmailSent(true);
      toast.success('Email de réinitialisation envoyé! Vérifiez votre boîte de réception.');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        toast.error('Aucun compte associé à cet email');
      } else {
        toast.error('Erreur lors de l\'envoi. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Mot de passe oublié</CardTitle>
            <CardDescription>
              {forgotEmailSent 
                ? 'Un email de réinitialisation a été envoyé' 
                : 'Entrez votre email pour recevoir un lien de réinitialisation'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {forgotEmailSent ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    📧 Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmailSent(false);
                    setForgotEmail('');
                  }}
                >
                  Retour à la connexion
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Envoyer le lien'}
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setShowForgotPassword(false)}
                >
                  Retour à la connexion
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>CityHealth</CardTitle>
          <CardDescription>Connectez-vous pour accéder à votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                  {loginErrors.email && (
                    <p className="text-sm text-destructive">{loginErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Mot de passe oublié?
                    </button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  {loginErrors.password && (
                    <p className="text-sm text-destructive">{loginErrors.password}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Se connecter'}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Ou</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  Continuer avec Google
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nom complet</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  {signupErrors.fullName && (
                    <p className="text-sm text-destructive">{signupErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                  {signupErrors.email && (
                    <p className="text-sm text-destructive">{signupErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                  {signupErrors.password && (
                    <p className="text-sm text-destructive">{signupErrors.password}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Min. 8 caractères, une majuscule, un chiffre
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'S\'inscrire'}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Ou</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  Continuer avec Google
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;