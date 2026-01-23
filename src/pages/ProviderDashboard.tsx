import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Eye, Phone, MapPin, TrendingUp, Calendar, Star, 
  Settings, BarChart3, Clock, Megaphone, Shield,
  AlertTriangle, XCircle, CheckCircle2, Loader2, Lock,
  Globe, Users, Search, RefreshCw, Save, LayoutDashboard,
  Image
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { CircularProgress } from '@/components/ui/circular-progress';
import { ProfileProgressBar, calculateProfileCompletion } from '@/components/provider/ProfileProgressBar';
import { EnhancedVerificationCenter, type VerificationStatus } from '@/components/provider/EnhancedVerificationCenter';
import { MedicalAdsManager } from '@/components/provider/MedicalAdsManager';
import { AppointmentsManager } from '@/components/provider/AppointmentsManager';
import { AnalyticsCharts } from '@/components/provider/AnalyticsCharts';
import { SensitiveFieldsEditor } from '@/components/provider/SensitiveFieldsEditor';
import { NonSensitiveFieldsEditor } from '@/components/provider/NonSensitiveFieldsEditor';
import { VerificationRevokedBanner } from '@/components/provider/VerificationRevokedBanner';
import { ProviderSettingsModal } from '@/components/provider/ProviderSettingsModal';
import { useProvider } from '@/contexts/ProviderContext';
import { useUpdateProviderWithVerification } from '@/hooks/useProviders';
import type { WeeklySchedule, CityHealthProvider } from '@/data/providers';
import { cn } from '@/lib/utils';
import { useReviewStats } from '@/hooks/useReviews';
import { useUpcomingAppointmentsCount } from '@/hooks/useAppointments';

// Extended provider type with revocation fields
interface ExtendedProvider extends CityHealthProvider {
  verificationRevokedAt?: Date | string;
  verificationRevokedReason?: string;
}

export default function ProviderDashboard() {
  const { toast } = useToast();
  
  const { 
    provider: providerData, 
    isLoading, 
    isVerified, 
    isPending, 
    isRejected,
    verificationStatus: contextVerificationStatus,
    updateProviderData,
    isSaving,
    refetch 
  } = useProvider();
  
  const { mutateAsync: updateWithVerification, isPending: isVerificationSaving } = useUpdateProviderWithVerification();
  
  const { data: reviewStats } = useReviewStats(providerData?.id);
  const { data: appointmentsCount = 0 } = useUpcomingAppointmentsCount(providerData?.id);
  
  const stats = {
    profileViews: 0,
    phoneClicks: 0,
    appointments: appointmentsCount,
    rating: reviewStats?.averageRating || 0,
    reviewsCount: reviewStats?.totalReviews || 0,
  };

  // Sensitive fields state (legal/identity)
  const [sensitiveData, setSensitiveData] = useState({
    name: '',
    facilityNameFr: '',
    facilityNameAr: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    area: '',
    postalCode: '',
    lat: 35.1975,
    lng: -0.6300,
    legalRegistrationNumber: '',
    contactPersonName: '',
    contactPersonRole: '',
    providerType: '',
  });
  
  // Original sensitive data for comparison
  const [originalSensitiveData, setOriginalSensitiveData] = useState(sensitiveData);

  // Non-sensitive fields state (profile/customization)
  const [nonSensitiveData, setNonSensitiveData] = useState({
    description: '',
    specialty: '',
    schedule: null as WeeklySchedule | null,
    accessible: true,
    emergency: false,
    photos: [] as string[],
    services: [] as string[],
    specialties: [] as string[],
    insurances: [] as string[],
    accessibility: [] as string[],
    languages: ['fr', 'ar'] as string[],
    homeVisitAvailable: false,
    consultationFee: '',
    socialLinks: {} as { facebook?: string; instagram?: string; twitter?: string; linkedin?: string; website?: string },
  });
  
  const [originalNonSensitiveData, setOriginalNonSensitiveData] = useState(nonSensitiveData);

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending');
  const [previousStatus, setPreviousStatus] = useState<VerificationStatus | null>(null);
  
  // Track if verification was revoked
  const extendedProvider = providerData as ExtendedProvider | null;
  const wasVerificationRevoked = !!extendedProvider?.verificationRevokedReason && isPending;

  // Ref to the tabs for programmatic navigation
  const tabsRef = useRef<HTMLDivElement>(null);
  
  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    if (providerData) {
      const newStatus = 
        providerData.verificationStatus === 'verified' ? 'approved' :
        providerData.verificationStatus === 'rejected' ? 'rejected' :
        'pending';
      
      if (previousStatus !== null && previousStatus !== newStatus) {
        if (newStatus === 'approved') {
          sonnerToast.success('🎉 Félicitations ! Votre compte a été vérifié !', {
            description: 'Votre profil est maintenant visible dans les recherches publiques.',
            duration: 10000,
          });
        } else if (newStatus === 'rejected') {
          sonnerToast.error('Vérification refusée', {
            description: 'Veuillez vérifier vos documents et soumettre une nouvelle demande.',
            duration: 10000,
          });
        }
      }
      
      setPreviousStatus(verificationStatus);
      setVerificationStatus(newStatus);
      
      // Populate sensitive fields
      const newSensitiveData = {
        name: providerData.name || '',
        facilityNameFr: providerData.facilityNameFr || '',
        facilityNameAr: providerData.facilityNameAr || '',
        phone: providerData.phone || '',
        email: providerData.email || '',
        address: providerData.address || '',
        city: providerData.city || '',
        area: providerData.area || '',
        postalCode: providerData.postalCode || '',
        lat: providerData.lat || 35.1975,
        lng: providerData.lng || -0.6300,
        legalRegistrationNumber: providerData.legalRegistrationNumber || '',
        contactPersonName: providerData.contactPersonName || '',
        contactPersonRole: providerData.contactPersonRole || '',
        providerType: providerData.type || '',
      };
      setSensitiveData(newSensitiveData);
      setOriginalSensitiveData(newSensitiveData);
      
      // Populate non-sensitive fields
      const newNonSensitiveData = {
        description: providerData.description || '',
        specialty: providerData.specialty || '',
        schedule: providerData.schedule || null,
        accessible: providerData.accessible ?? true,
        emergency: providerData.emergency ?? false,
        photos: providerData.gallery || [],
        services: providerData.services || [],
        specialties: providerData.specialties || [],
        insurances: providerData.insurances || [],
        accessibility: providerData.accessibilityFeatures || [],
        languages: providerData.languages || ['fr', 'ar'],
        homeVisitAvailable: providerData.homeVisitAvailable ?? false,
        consultationFee: String(providerData.consultationFee || ''),
        socialLinks: providerData.socialLinks || {},
      };
      setNonSensitiveData(newNonSensitiveData);
      setOriginalNonSensitiveData(newNonSensitiveData);
    }
  }, [providerData]);

  // Calculate profile completion
  const hasSchedule = nonSensitiveData.schedule && Object.keys(nonSensitiveData.schedule).length > 0;
  const profileFields = calculateProfileCompletion({
    name: sensitiveData.name,
    type: providerData?.type || 'doctor',
    specialty: nonSensitiveData.specialty,
    email: sensitiveData.email,
    phone: sensitiveData.phone,
    address: sensitiveData.address,
    description: nonSensitiveData.description,
    schedule: hasSchedule ? 'configured' : '',
    license: sensitiveData.legalRegistrationNumber,
    photos: nonSensitiveData.photos,
    languages: providerData?.languages || ['fr', 'ar'],
    accessible: nonSensitiveData.accessible,
    emergency: nonSensitiveData.emergency,
  });
  const isProfileComplete = profileFields.filter(f => f.required && !f.completed).length === 0;
  const profileProgress = profileFields.length > 0 
    ? (profileFields.filter(f => f.completed).length / profileFields.length) * 100 
    : 0;

  // Check for unsaved changes in non-sensitive data
  const hasNonSensitiveChanges = JSON.stringify(nonSensitiveData) !== JSON.stringify(originalNonSensitiveData);

  // Handler for sensitive field changes
  const handleSensitiveChange = (field: keyof typeof sensitiveData, value: string | number) => {
    setSensitiveData(prev => ({ ...prev, [field]: value }));
  };

  // Handler for non-sensitive field changes
  const handleNonSensitiveChange = <K extends keyof typeof nonSensitiveData>(
    field: K, 
    value: typeof nonSensitiveData[K]
  ) => {
    setNonSensitiveData(prev => ({ ...prev, [field]: value }));
  };

  // Save sensitive fields with verification check
  const handleSaveSensitive = async () => {
    if (!providerData?.id) return;
    
    try {
      const result = await updateWithVerification({
        providerId: providerData.id,
        updates: {
          name: sensitiveData.name,
          facilityNameFr: sensitiveData.facilityNameFr,
          facilityNameAr: sensitiveData.facilityNameAr,
          phone: sensitiveData.phone,
          email: sensitiveData.email,
          address: sensitiveData.address,
          city: sensitiveData.city,
          area: sensitiveData.area,
          postalCode: sensitiveData.postalCode,
          lat: sensitiveData.lat,
          lng: sensitiveData.lng,
          legalRegistrationNumber: sensitiveData.legalRegistrationNumber,
          contactPersonName: sensitiveData.contactPersonName,
          contactPersonRole: sensitiveData.contactPersonRole,
        },
        currentVerificationStatus: providerData.verificationStatus as 'pending' | 'verified' | 'rejected',
      });
      
      if (result.verificationRevoked) {
        sonnerToast.warning('Vérification révoquée', {
          description: `Votre statut vérifié a été révoqué suite à la modification de: ${result.modifiedSensitiveFields.join(', ')}`,
          duration: 10000,
        });
      } else {
        toast({
          title: "Informations légales mises à jour",
          description: "Vos modifications ont été enregistrées.",
        });
      }
      
      // Update original data to reflect saved state
      setOriginalSensitiveData(sensitiveData);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    }
  };

  // Save non-sensitive fields (no verification impact)
  const handleSaveNonSensitive = async () => {
    try {
      await updateProviderData({
        description: nonSensitiveData.description,
        specialty: nonSensitiveData.specialty,
        schedule: nonSensitiveData.schedule,
        accessible: nonSensitiveData.accessible,
        emergency: nonSensitiveData.emergency,
        gallery: nonSensitiveData.photos,
        services: nonSensitiveData.services,
        specialties: nonSensitiveData.specialties,
        insurances: nonSensitiveData.insurances,
        accessibilityFeatures: nonSensitiveData.accessibility,
        languages: nonSensitiveData.languages as ('fr' | 'ar' | 'en')[],
        homeVisitAvailable: nonSensitiveData.homeVisitAvailable,
        consultationFee: nonSensitiveData.consultationFee ? Number(nonSensitiveData.consultationFee) : null,
        socialLinks: nonSensitiveData.socialLinks,
      });
      
      setOriginalNonSensitiveData(nonSensitiveData);
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Actualisation",
      description: "Données actualisées.",
    });
  };

  // Helper function to navigate to any tab
  const navigateToTab = (tabValue: string) => {
    const tabsList = document.querySelector('[role="tablist"]');
    const tab = tabsList?.querySelector(`[value="${tabValue}"]`) as HTMLButtonElement;
    tab?.click();
  };

  const navigateToVerificationTab = () => {
    navigateToTab('verification');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Verification Revoked Banner */}
        {wasVerificationRevoked && (
          <VerificationRevokedBanner
            revokedReason={extendedProvider?.verificationRevokedReason}
            revokedAt={extendedProvider?.verificationRevokedAt}
            onGoToVerification={navigateToVerificationTab}
          />
        )}

        {/* Pending Verification Banner (only if not revoked) */}
        {isPending && !wasVerificationRevoked && (
          <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertTitle className="text-amber-600 text-lg">
              Compte en attente de vérification
            </AlertTitle>
            <AlertDescription className="text-amber-700 mt-2">
              <p className="mb-3">
                Complétez votre profil et téléchargez vos documents dans l'onglet Vérification pour accélérer le processus.
              </p>
              <div className="grid gap-2 sm:grid-cols-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Modifier le profil</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Télécharger documents</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Fonctionnalités après validation</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Rejected Banner */}
        {isRejected && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-5 w-5" />
            <AlertTitle>Vérification refusée</AlertTitle>
            <AlertDescription>
              Veuillez corriger vos documents et soumettre une nouvelle demande dans l'onglet Vérification.
            </AlertDescription>
          </Alert>
        )}

        {/* Verified Banner */}
        {isVerified && (
          <Alert className="mb-6 border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <AlertTitle className="text-green-600">Compte vérifié ✓</AlertTitle>
            <AlertDescription className="text-green-700">
              Votre profil est maintenant visible publiquement. Vous avez accès à toutes les fonctionnalités.
            </AlertDescription>
          </Alert>
        )}

        {/* Header with Circular Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Circular Progress */}
              <CircularProgress 
                value={profileProgress} 
                size={100}
                strokeWidth={8}
              >
                {isProfileComplete && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
                )}
              </CircularProgress>
              
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={nonSensitiveData.photos[0] || "/placeholder.svg"} />
                  <AvatarFallback>{sensitiveData.name?.substring(0, 2).toUpperCase() || 'PR'}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">{sensitiveData.name || 'Nouveau Professionnel'}</h1>
                  <p className="text-muted-foreground">{nonSensitiveData.specialty || 'Spécialité non définie'}</p>
                  {isVerified ? (
                    <Badge className="mt-1 bg-green-500 hover:bg-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Vérifié
                    </Badge>
                  ) : isPending ? (
                    <Badge variant="secondary" className="mt-1 bg-amber-500/20 text-amber-600">
                      <Clock className="h-3 w-3 mr-1" />
                      En attente
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="mt-1">
                      <XCircle className="h-3 w-3 mr-1" />
                      Refusé
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={() => setShowSettingsModal(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats - Only for verified */}
        {isVerified && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats.profileViews}</p>
                    <p className="text-xs text-muted-foreground">Vues</p>
                  </div>
                  <Eye className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats.phoneClicks}</p>
                    <p className="text-xs text-muted-foreground">Appels</p>
                  </div>
                  <Phone className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats.appointments}</p>
                    <p className="text-xs text-muted-foreground">RDV</p>
                  </div>
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats.rating || '-'}</p>
                    <p className="text-xs text-muted-foreground">{stats.reviewsCount} avis</p>
                  </div>
                  <Star className="h-6 w-6 text-primary fill-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">94%</p>
                    <p className="text-xs text-muted-foreground">Réponse</p>
                  </div>
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Locked Features Preview */}
        {isPending && (
          <Card className="mb-8 border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5 text-muted-foreground" />
                Fonctionnalités après vérification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { icon: Globe, label: 'Visibilité publique' },
                  { icon: Users, label: 'Recevoir des RDV' },
                  { icon: Megaphone, label: 'Créer des annonces' },
                  { icon: BarChart3, label: 'Statistiques' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6" ref={tabsRef}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="profile">
              Profil
            </TabsTrigger>
            <TabsTrigger value="verification">
              <Shield className="h-4 w-4 mr-1.5" />
              Vérification
            </TabsTrigger>
            <TabsTrigger value="appointments" disabled={isPending}>
              <Calendar className="h-4 w-4 mr-1.5" />
              Rendez-vous
              {isPending && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="ads" disabled={isPending}>
              <Megaphone className="h-4 w-4 mr-1.5" />
              Annonces
              {isPending && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="analytics" disabled={isPending}>
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Statistiques
              {isPending && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Profile Progress Card */}
              <ProfileProgressBar fields={profileFields} />
              
              {/* Verification Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Statut de vérification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isPending && (
                      <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-lg">
                        <Clock className="h-6 w-6 text-amber-500 animate-pulse" />
                        <div>
                          <p className="font-medium">En cours de vérification</p>
                          <p className="text-sm text-muted-foreground">24-48h de délai</p>
                        </div>
                      </div>
                    )}
                    {isVerified && (
                      <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        <div>
                          <p className="font-medium">Profil vérifié</p>
                          <p className="text-sm text-muted-foreground">Visible publiquement</p>
                        </div>
                      </div>
                    )}
                    {isRejected && (
                      <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-lg">
                        <XCircle className="h-6 w-6 text-red-500" />
                        <div>
                          <p className="font-medium">Vérification refusée</p>
                          <p className="text-sm text-muted-foreground">Documents à corriger</p>
                        </div>
                      </div>
                    )}
                    <Button 
                      className="w-full" 
                      variant={isVerified ? 'outline' : 'default'}
                      onClick={navigateToVerificationTab}
                    >
                      {isVerified ? 'Voir les documents' : 'Gérer la vérification'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => {
                        const tabsList = document.querySelector('[role="tablist"]');
                        const profileTab = tabsList?.querySelector('[value="profile"]') as HTMLButtonElement;
                        profileTab?.click();
                      }}
                    >
                      <Settings className="h-6 w-6" />
                      <span>Modifier le profil</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2"
                      disabled={isPending}
                      onClick={() => navigateToTab('appointments')}
                    >
                      <Calendar className="h-6 w-6" />
                      <span>Gérer les RDV</span>
                      {isPending && <Lock className="h-3 w-3" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2"
                      disabled={isPending}
                      onClick={() => navigateToTab('ads')}
                    >
                      <Megaphone className="h-6 w-6" />
                      <span>Créer une annonce</span>
                      {isPending && <Lock className="h-3 w-3" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2"
                      disabled={isPending}
                      onClick={() => navigateToTab('analytics')}
                    >
                      <BarChart3 className="h-6 w-6" />
                      <span>Voir les stats</span>
                      {isPending && <Lock className="h-3 w-3" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab - Split into Sensitive and Non-Sensitive Sections */}
          <TabsContent value="profile">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column: Sensitive Fields (Legal Info) */}
              <div>
                <SensitiveFieldsEditor
                  data={sensitiveData}
                  originalData={originalSensitiveData}
                  isVerified={isVerified}
                  isSaving={isVerificationSaving}
                  onDataChange={handleSensitiveChange}
                  onSave={handleSaveSensitive}
                />
              </div>

              {/* Right Column: Non-Sensitive Fields (Profile) */}
              <div>
                <NonSensitiveFieldsEditor
                  data={nonSensitiveData}
                  isVerified={isVerified}
                  isSaving={isSaving}
                  hasChanges={hasNonSensitiveChanges}
                  onDataChange={handleNonSensitiveChange}
                  onSave={handleSaveNonSensitive}
                />
              </div>
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <EnhancedVerificationCenter
              providerId={providerData?.id || ''}
              providerName={sensitiveData.name}
              currentStatus={verificationStatus}
              profileComplete={isProfileComplete}
              onStatusChange={setVerificationStatus}
            />
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <AppointmentsManager
              providerId={providerData?.id || ''}
              providerName={sensitiveData.name}
              isVerified={isVerified}
            />
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads">
            <MedicalAdsManager
              providerId={providerData?.id || ''}
              providerName={sensitiveData.name}
              isVerified={isVerified}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsCharts providerId={providerData?.id || ''} />
          </TabsContent>
        </Tabs>

        {/* Settings Modal */}
        <ProviderSettingsModal
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
          providerEmail={sensitiveData.email}
        />
      </div>
    </div>
  );
}
