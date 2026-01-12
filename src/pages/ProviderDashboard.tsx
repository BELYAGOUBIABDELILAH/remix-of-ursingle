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
  Upload, Settings, BarChart3, Clock, Megaphone, Shield,
  AlertTriangle, XCircle, CheckCircle2, Loader2, Lock,
  Globe, Users, Search, RefreshCw, Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { ProfileProgressBar, calculateProfileCompletion } from '@/components/provider/ProfileProgressBar';
import { VerificationRequest, type VerificationStatus } from '@/components/provider/VerificationRequest';
import { MedicalAdsManager } from '@/components/provider/MedicalAdsManager';
import { useProvider } from '@/contexts/ProviderContext';
import { LocationPicker } from '@/components/provider/LocationPicker';
import { ScheduleEditor } from '@/components/provider/ScheduleEditor';
import type { WeeklySchedule } from '@/data/providers';
import { cn } from '@/lib/utils';
import { useReviewStats } from '@/hooks/useReviews';
import { useUpcomingAppointmentsCount } from '@/hooks/useAppointments';

export default function ProviderDashboard() {
  const { toast } = useToast();
  
  // Use centralized ProviderContext - single source of truth with update capability
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
  
  // Real stats from hooks
  const { data: reviewStats } = useReviewStats(providerData?.id);
  const { data: appointmentsCount = 0 } = useUpcomingAppointmentsCount(providerData?.id);
  
  const stats = {
    profileViews: 0, // Keep mocked until analytics
    phoneClicks: 0,
    appointments: appointmentsCount,
    rating: reviewStats?.averageRating || 0,
    reviewsCount: reviewStats?.totalReviews || 0,
  };

  // Form state - initialized from provider data
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

  // Sync form data when provider data loads
  useEffect(() => {
    if (providerData) {
      const newStatus = 
        providerData.verificationStatus === 'verified' ? 'approved' :
        providerData.verificationStatus === 'rejected' ? 'rejected' :
        'pending';
      
      // Detect status change and notify user
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
      
      // Update form data from provider
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

  const [recentActivity] = useState([
    { type: 'view', date: '2025-01-10', count: 0 },
    { type: 'contact', date: '2025-01-09', count: 0 },
    { type: 'appointment', date: '2025-01-08', count: 0 },
  ]);

  // Calculate profile completion based on form data
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

  // Handle form field changes
  const handleFormChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Save profile changes to Firestore
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProviderData({
        name: formData.name,
        specialty: formData.specialty,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        accessible: formData.accessible,
        emergency: formData.emergency,
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

  // Save location changes
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
        {/* Pending Verification Banner - Prominent */}
        {isPending && (
          <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertTitle className="text-amber-600 text-lg">
              Votre compte a été créé et est en attente de confirmation
            </AlertTitle>
            <AlertDescription className="text-amber-700 mt-2">
              <p className="mb-4">
                Notre équipe vérifiera vos informations dans les 24 à 48 heures. 
                En attendant, vous pouvez compléter et modifier votre profil.
              </p>
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Accéder à votre espace</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Modifier vos informations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Gérer vos services</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Télécharger des documents</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Visibilité publique (après validation)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Demandes de patients (après validation)</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Rejected Verification Banner */}
        {isRejected && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-5 w-5" />
            <AlertTitle>Vérification refusée</AlertTitle>
            <AlertDescription>
              Votre demande de vérification a été refusée. Veuillez vérifier vos documents et soumettre une nouvelle demande.
              Votre profil n'est pas visible dans les recherches publiques.
            </AlertDescription>
          </Alert>
        )}

        {/* Verified Success Banner */}
        {isVerified && (
          <Alert className="mb-6 border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <AlertTitle className="text-green-600">Compte vérifié</AlertTitle>
            <AlertDescription className="text-green-700">
              Votre profil est maintenant visible dans les recherches publiques et sur la carte.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg" />
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
                    En attente de confirmation
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="mt-1">
                    <XCircle className="h-3 w-3 mr-1" />
                    Refusé
                  </Badge>
                )}
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

        {/* Profile Progress */}
        <div className="mb-8">
          <ProfileProgressBar fields={profileFields} />
        </div>

        {/* Locked Features Card - Only show when pending */}
        {isPending && (
          <Card className="mb-8 border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                Fonctionnalités verrouillées
              </CardTitle>
              <CardDescription>
                Ces fonctionnalités seront disponibles après la validation de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Globe className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Visibilité publique</p>
                    <p className="text-sm text-muted-foreground">Apparaître dans la recherche</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Search className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Carte interactive</p>
                    <p className="text-sm text-muted-foreground">Être visible sur la carte</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Users className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Demandes patients</p>
                    <p className="text-sm text-muted-foreground">Recevoir des rendez-vous</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid - Show zeros when pending */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className={cn(isPending && "opacity-60")}>
            <CardHeader className="pb-3">
              <CardDescription>Vues du profil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{isVerified ? stats.profileViews : 0}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {isPending ? <Lock className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {isPending ? 'En attente' : '+12% ce mois'}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(isPending && "opacity-60")}>
            <CardHeader className="pb-3">
              <CardDescription>Appels reçus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{isVerified ? stats.phoneClicks : 0}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {isPending ? <Lock className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {isPending ? 'En attente' : '+8% ce mois'}
                  </p>
                </div>
                <Phone className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(isPending && "opacity-60")}>
            <CardHeader className="pb-3">
              <CardDescription>Rendez-vous</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{isVerified ? stats.appointments : 0}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {isPending ? <Lock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                    {isPending ? 'En attente' : 'Cette semaine'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(isPending && "opacity-60")}>
            <CardHeader className="pb-3">
              <CardDescription>Note moyenne</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{isVerified ? stats.rating : '-'}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {isPending ? <Lock className="h-3 w-3" /> : <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                    {isPending ? 'En attente' : `${stats.reviewsCount} avis`}
                  </p>
                </div>
                <Star className="h-8 w-8 text-primary fill-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(isPending && "opacity-60")}>
            <CardHeader className="pb-3">
              <CardDescription>Taux de réponse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{isVerified ? '94%' : '-'}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {isPending ? <Lock className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {isPending ? 'En attente' : 'Excellent'}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Mon Profil</TabsTrigger>
            <TabsTrigger value="location">
              <MapPin className="h-4 w-4 mr-1" />
              Localisation
            </TabsTrigger>
            <TabsTrigger value="verification">
              <Shield className="h-4 w-4 mr-1" />
              Vérification
            </TabsTrigger>
            <TabsTrigger value="ads" disabled={isPending}>
              <Megaphone className="h-4 w-4 mr-1" />
              Annonces
              {isPending && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="analytics" disabled={isPending}>
              Statistiques
              {isPending && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations. {isPending && 'Ces informations seront visibles après validation.'}
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
                      <Label htmlFor="emergency" className="font-normal">Service d'urgence 24/7</Label>
                    </div>
                  </div>

                  <div>
                    <Label>Photos du cabinet</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="photos"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          handleFormChange('photos', files.map(f => URL.createObjectURL(f)));
                        }}
                      />
                      <Label htmlFor="photos" className="cursor-pointer">
                        {formData.photos.length > 0 
                          ? `${formData.photos.length} photo(s) sélectionnée(s)`
                          : 'Cliquez pour ajouter des photos'
                        }
                      </Label>
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
                        Enregistrer les modifications
                        {hasUnsavedChanges && <span className="ml-2 text-xs">●</span>}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab - Uses shared CityHealthMap */}
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Localisation de votre établissement</CardTitle>
                <CardDescription>
                  Vérifiez que votre position sur la carte est correcte
                  {isPending && '. Votre position sera visible après validation.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Latitude</Label>
                      <Input 
                        value={formData.lat} 
                        onChange={(e) => handleFormChange('lat', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Longitude</Label>
                      <Input 
                        value={formData.lng}
                        onChange={(e) => handleFormChange('lng', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="h-[400px] rounded-lg overflow-hidden border relative">
                    {isPending && (
                      <div className="absolute inset-0 bg-background/80 z-10 flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            Votre position sera visible sur la carte publique après validation
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

                  <Button type="button" className="w-full" onClick={handleLocationUpdate} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Mettre à jour la localisation
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <VerificationRequest
              providerId={providerData?.id || ''}
              providerName={formData.name}
              currentStatus={verificationStatus}
              profileComplete={isProfileComplete}
              onStatusChange={setVerificationStatus}
            />
          </TabsContent>

          {/* Medical Ads Tab */}
          <TabsContent value="ads">
            <MedicalAdsManager
              providerId={providerData?.id || ''}
              providerName={formData.name}
              isVerified={isVerified}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                  <CardDescription>Aperçu de votre engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {activity.type === 'view' && <Eye className="h-5 w-5 text-primary" />}
                          {activity.type === 'contact' && <Phone className="h-5 w-5 text-primary" />}
                          {activity.type === 'appointment' && <Calendar className="h-5 w-5 text-primary" />}
                          <div>
                            <p className="font-medium">
                              {activity.type === 'view' && 'Vues du profil'}
                              {activity.type === 'contact' && 'Contacts'}
                              {activity.type === 'appointment' && 'Rendez-vous'}
                            </p>
                            <p className="text-sm text-muted-foreground">{activity.date}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{activity.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
