import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { PhotoGalleryManager } from '@/components/provider/PhotoGalleryManager';
import { AnalyticsCharts } from '@/components/provider/AnalyticsCharts';
import { useProvider } from '@/contexts/ProviderContext';
import { LocationPicker } from '@/components/provider/LocationPicker';
import { ScheduleEditor } from '@/components/provider/ScheduleEditor';
import type { WeeklySchedule } from '@/data/providers';
import { cn } from '@/lib/utils';
import { useReviewStats } from '@/hooks/useReviews';
import { useUpcomingAppointmentsCount } from '@/hooks/useAppointments';

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
  
  const { data: reviewStats } = useReviewStats(providerData?.id);
  const { data: appointmentsCount = 0 } = useUpcomingAppointmentsCount(providerData?.id);
  
  const stats = {
    profileViews: 0,
    phoneClicks: 0,
    appointments: appointmentsCount,
    rating: reviewStats?.averageRating || 0,
    reviewsCount: reviewStats?.totalReviews || 0,
  };

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    address: '',
    description: '',
    schedule: null as WeeklySchedule | null,
    accessible: true,
    emergency: false,
    lat: 35.1975,
    lng: -0.6300,
    photos: [] as string[],
  });

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending');
  const [previousStatus, setPreviousStatus] = useState<VerificationStatus | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
      
      setFormData({
        name: providerData.name || '',
        specialty: providerData.specialty || '',
        phone: providerData.phone || '',
        address: providerData.address || '',
        description: providerData.description || '',
        schedule: providerData.schedule || null,
        accessible: providerData.accessible ?? true,
        emergency: providerData.emergency ?? false,
        lat: providerData.lat || 35.1975,
        lng: providerData.lng || -0.6300,
        photos: providerData.gallery || [],
      });
      setHasUnsavedChanges(false);
    }
  }, [providerData]);

  const hasSchedule = formData.schedule && Object.keys(formData.schedule).length > 0;
  const profileFields = calculateProfileCompletion({
    name: formData.name,
    type: providerData?.type || 'doctor',
    specialty: formData.specialty,
    email: providerData?.email || '',
    phone: formData.phone,
    address: formData.address,
    description: formData.description,
    schedule: hasSchedule ? 'configured' : '',
    license: '',
    photos: formData.photos,
    languages: providerData?.languages || ['fr', 'ar'],
    accessible: formData.accessible,
    emergency: formData.emergency,
  });
  const isProfileComplete = profileFields.filter(f => f.required && !f.completed).length === 0;
  const profileProgress = profileFields.length > 0 
    ? (profileFields.filter(f => f.completed).length / profileFields.length) * 100 
    : 0;

  const handleFormChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProviderData({
        name: formData.name,
        specialty: formData.specialty,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        schedule: formData.schedule,
        accessible: formData.accessible,
        emergency: formData.emergency,
        lat: formData.lat,
        lng: formData.lng,
        gallery: formData.photos,
      });
      
      setHasUnsavedChanges(false);
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

  const handleLocationUpdate = async () => {
    try {
      await updateProviderData({
        lat: formData.lat,
        lng: formData.lng,
      });
      
      setHasUnsavedChanges(false);
      toast({
        title: "Localisation mise à jour",
        description: "Votre position a été enregistrée.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la localisation.",
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
        {/* Pending Verification Banner */}
        {isPending && (
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
                  <AvatarImage src={formData.photos[0] || "/placeholder.svg"} />
                  <AvatarFallback>{formData.name?.substring(0, 2).toUpperCase() || 'PR'}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">{formData.name || 'Nouveau Professionnel'}</h1>
                  <p className="text-muted-foreground">{formData.specialty || 'Spécialité non définie'}</p>
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
              <Button>
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
        <Tabs defaultValue="overview" className="space-y-6">
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
                      onClick={() => {
                        const tabsList = document.querySelector('[role="tablist"]');
                        const verificationTab = tabsList?.querySelector('[value="verification"]') as HTMLButtonElement;
                        verificationTab?.click();
                      }}
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
                    >
                      <Calendar className="h-6 w-6" />
                      <span>Gérer les RDV</span>
                      {isPending && <Lock className="h-3 w-3" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2"
                      disabled={isPending}
                    >
                      <Megaphone className="h-6 w-6" />
                      <span>Créer une annonce</span>
                      {isPending && <Lock className="h-3 w-3" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2"
                      disabled={isPending}
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

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Profile Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Informations du profil</CardTitle>
                  <CardDescription>
                    {isPending ? 'Ces informations seront visibles après validation.' : 'Visibles sur votre profil public.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nom de l'établissement</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleFormChange('name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="specialty">Spécialité</Label>
                        <Input
                          id="specialty"
                          value={formData.specialty}
                          onChange={(e) => handleFormChange('specialty', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleFormChange('phone', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Adresse</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleFormChange('address', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        placeholder="Décrivez votre établissement, vos services, votre expérience..."
                      />
                    </div>

                    <ScheduleEditor
                      value={formData.schedule}
                      onChange={(schedule) => handleFormChange('schedule', schedule)}
                      isEmergency={formData.emergency}
                    />

                    <div className="flex gap-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="accessible"
                          checked={formData.accessible}
                          onCheckedChange={(checked) => handleFormChange('accessible', !!checked)}
                        />
                        <Label htmlFor="accessible" className="font-normal">Accès PMR</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="emergency"
                          checked={formData.emergency}
                          onCheckedChange={(checked) => handleFormChange('emergency', !!checked)}
                        />
                        <Label htmlFor="emergency" className="font-normal">Urgences 24/7</Label>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Enregistrer
                          {hasUnsavedChanges && <span className="ml-2 text-xs">●</span>}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Sidebar with Location & Photos */}
              <div className="space-y-6">
                {/* Location Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4" />
                      Localisation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-[200px] rounded-lg overflow-hidden border relative">
                      {isPending && (
                        <div className="absolute inset-0 bg-background/80 z-10 flex items-center justify-center">
                          <div className="text-center">
                            <Lock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              Visible après validation
                            </p>
                          </div>
                        </div>
                      )}
                      <LocationPicker 
                        lat={formData.lat} 
                        lng={formData.lng} 
                        onLocationChange={(lat, lng) => {
                          handleFormChange('lat', lat);
                          handleFormChange('lng', lng);
                        }}
                      />
                    </div>
                    <Button 
                      type="button" 
                      className="w-full" 
                      size="sm"
                      onClick={handleLocationUpdate} 
                      disabled={isSaving}
                    >
                      Mettre à jour
                    </Button>
                  </CardContent>
                </Card>

                {/* Photo Gallery Preview */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Image className="h-4 w-4" />
                      Photos ({formData.photos.length}/10)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PhotoGalleryManager
                      photos={formData.photos}
                      onPhotosChange={(photos) => handleFormChange('photos', photos)}
                      maxPhotos={10}
                      className="border-0 shadow-none p-0"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <EnhancedVerificationCenter
              providerId={providerData?.id || ''}
              providerName={formData.name}
              currentStatus={verificationStatus}
              profileComplete={isProfileComplete}
              onStatusChange={setVerificationStatus}
            />
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <AppointmentsManager
              providerId={providerData?.id || ''}
              providerName={formData.name}
              isVerified={isVerified}
            />
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads">
            <MedicalAdsManager
              providerId={providerData?.id || ''}
              providerName={formData.name}
              isVerified={isVerified}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsCharts providerId={providerData?.id || ''} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
