import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, AlertTriangle, CheckCircle, Loader2, Play, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { 
  migrateProvidersToFirestore, 
  forceMigrateProviders 
} from '@/scripts/migrateProvidersToFirestore';
import { hasProviders } from '@/services/firestoreProviderService';

interface MigrationResult {
  success: boolean;
  message: string;
  count: number;
}

type MigrationStatus = 'idle' | 'checking' | 'running' | 'completed' | 'error';

export default function AdminMigratePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [providerCount, setProviderCount] = useState(50);
  const [existingData, setExistingData] = useState<boolean | null>(null);
  const [status, setStatus] = useState<MigrationStatus>('idle');
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckExisting = useCallback(async () => {
    setIsChecking(true);
    try {
      const exists = await hasProviders();
      setExistingData(exists);
    } catch (error) {
      console.error('Failed to check existing providers:', error);
      setExistingData(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleMigrate = useCallback(async () => {
    setStatus('running');
    setResult(null);

    try {
      const migrationResult = await migrateProvidersToFirestore(providerCount);
      setResult(migrationResult);
      setStatus(migrationResult.success ? 'completed' : 'error');
    } catch (error) {
      setResult({
        success: false,
        message: `Migration failed: ${error}`,
        count: 0,
      });
      setStatus('error');
    }
  }, [providerCount]);

  const handleForceMigrate = useCallback(async () => {
    if (!confirm('Êtes-vous sûr de vouloir forcer la migration? Cela peut créer des doublons.')) {
      return;
    }
    
    setStatus('running');
    setResult(null);

    try {
      const migrationResult = await forceMigrateProviders(providerCount);
      setResult(migrationResult);
      setStatus(migrationResult.success ? 'completed' : 'error');
    } catch (error) {
      setResult({
        success: false,
        message: `Force migration failed: ${error}`,
        count: 0,
      });
      setStatus('error');
    }
  }, [providerCount]);

  const isRunning = status === 'running';
  const isCompleted = status === 'completed';
  const hasError = status === 'error';

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Accès refusé</AlertTitle>
            <AlertDescription>
              Vous devez être connecté pour accéder à cette page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/admin/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Migration des Prestataires</CardTitle>
                  <CardDescription>
                    Migrer les données mock vers Firestore
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pre-flight check */}
              <div className="space-y-3">
                <Label>Étape 1: Vérifier les données existantes</Label>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleCheckExisting}
                    disabled={isChecking || isRunning}
                  >
                    {isChecking ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Vérifier Firestore
                  </Button>
                  
                  {existingData !== null && (
                    <Badge variant={existingData ? 'destructive' : 'secondary'}>
                      {existingData ? 'Données existantes' : 'Base vide'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Provider count */}
              <div className="space-y-3">
                <Label htmlFor="provider-count">
                  Étape 2: Nombre de prestataires à générer
                </Label>
                <Input
                  id="provider-count"
                  type="number"
                  min={10}
                  max={200}
                  value={providerCount}
                  onChange={(e) => setProviderCount(Number(e.target.value))}
                  disabled={isRunning}
                  className="max-w-32"
                />
              </div>

              {/* Migration buttons */}
              <div className="space-y-3">
                <Label>Étape 3: Lancer la migration</Label>
                <div className="flex gap-3">
                  <Button
                    onClick={handleMigrate}
                    disabled={isRunning || existingData === null}
                    className="flex-1"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Migration en cours...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Démarrer la migration
                      </>
                    )}
                  </Button>
                  
                  {existingData && (
                    <Button
                      onClick={handleForceMigrate}
                      disabled={isRunning}
                      variant="destructive"
                    >
                      Forcer
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress */}
              {isRunning && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Migration en cours...</span>
                  </div>
                  <Progress value={50} className="h-3 animate-pulse" />
                </div>
              )}

              {/* Result */}
              {result && (
                <Alert variant={result.success ? 'default' : 'destructive'} className={result.success ? 'bg-green-50 border-green-200' : ''}>
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                  <AlertTitle className={result.success ? 'text-green-800' : ''}>
                    {result.success ? 'Migration terminée!' : 'Erreur'}
                  </AlertTitle>
                  <AlertDescription className={result.success ? 'text-green-700' : ''}>
                    {result.message}
                    {result.success && result.count > 0 && (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto ml-2 text-green-700 underline"
                        onClick={() => navigate('/search')}
                      >
                        Voir la recherche →
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Info card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ℹ️ Informations</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Cette migration va:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Générer {providerCount} prestataires mock</li>
                <li>Les sauvegarder dans la collection Firestore "providers"</li>
                <li>Définir verificationStatus = "verified" et isPublic = true</li>
                <li>Ajouter les timestamps createdAt et updatedAt</li>
              </ul>
              <p className="pt-2 text-destructive">
                ⚠️ Cette action ne peut pas être annulée automatiquement.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
