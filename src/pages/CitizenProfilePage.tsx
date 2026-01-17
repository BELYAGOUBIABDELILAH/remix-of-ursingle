import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, Mail, Phone, MapPin, Calendar, Shield, Bell, Lock, 
  Heart, Clock, CheckCircle2, XCircle, AlertCircle, Edit2, 
  Trash2, Star, Navigation, ExternalLink
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { CityHealthProvider, PROVIDER_TYPE_LABELS } from '@/data/providers';
import { getProviderById } from '@/services/firestoreProviderService';
import { useFavorites, useRemoveFavorite } from '@/hooks/useFavorites';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { usePatientAppointments, useCancelAppointment } from '@/hooks/useAppointments';
import { Appointment } from '@/types/appointments';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Profile completion calculation
const calculateProfileCompletion = (profile: any) => {
  let score = 0;
  if (profile?.full_name) score += 25;
  if (profile?.email) score += 25;
  if (profile?.phone) score += 25;
  if (profile?.address) score += 15;
  if (profile?.dateOfBirth) score += 10;
  return score;
};

export default function CitizenProfilePage() {
  const { profile, updateProfile, logout, isAuthenticated, hasRole } = useAuth();
  const { preferences, updatePreferences } = useNotifications();
  const navigate = useNavigate();
  
  // TanStack Query hooks for favorites - synchronized with FavoritesPage
  const { data: favoriteIds = [], isLoading: favoritesLoading } = useFavorites();
  const { mutate: removeFavorite, isPending: isRemovingFavorite } = useRemoveFavorite();
  const { data: allProviders = [] } = useVerifiedProviders();
  
  // Filter providers to get only favorites
  const favorites = allProviders.filter(p => favoriteIds.includes(p.id));
  
  // TanStack Query hooks for appointments - using Firestore
  const { data: appointments = [], isLoading: appointmentsLoading } = usePatientAppointments();
  const { mutate: cancelAppointmentMutation, isPending: isCancellingAppointment } = useCancelAppointment();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    dateOfBirth: ''
  });
  const [providerCache, setProviderCache] = useState<Record<string, CityHealthProvider | null>>({});

  // Redirect if not authenticated or is a provider
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    // Use hasRole() for consistent role checking
    if (hasRole('provider')) {
      navigate('/provider/dashboard');
      return;
    }
  }, [isAuthenticated, hasRole, navigate]);

  // Load form data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        dateOfBirth: profile.date_of_birth || ''
      });
    }
  }, [profile]);

  // Load provider details for appointments
  useEffect(() => {
    const loadProviders = async () => {
      const providerIds = [...new Set(appointments.map(a => a.providerId))];
      const cache: Record<string, CityHealthProvider | null> = {};
      for (const id of providerIds) {
        if (!providerCache[id]) {
          cache[id] = await getProviderById(id);
        }
      }
      if (Object.keys(cache).length > 0) {
        setProviderCache(prev => ({ ...prev, ...cache }));
      }
    };
    if (appointments.length > 0) {
      loadProviders();
    }
  }, [appointments]);

  if (!profile) return null;

  const profileCompletion = calculateProfileCompletion({ ...profile, ...formData });
  const initials = profile.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const handleSave = async () => {
    await updateProfile({ 
      full_name: formData.full_name,
      phone: formData.phone,
      address: formData.address,
      date_of_birth: formData.dateOfBirth,
    });
    toast.success('Profil mis à jour');
    setIsEditing(false);
  };

  const handleRemoveFavorite = (providerId: string) => {
    removeFavorite(providerId, {
      onSuccess: () => {
        toast.success('Retiré des favoris');
      },
      onError: () => {
        toast.error('Erreur lors de la suppression');
      }
    });
  };

  const handleCancelAppointment = (appointmentId: string) => {
    cancelAppointmentMutation(appointmentId, {
      onSuccess: () => {
        toast.success('Rendez-vous annulé');
      },
      onError: () => {
        toast.error('Erreur lors de l\'annulation');
      }
    });
  };

  // Filter appointments by date for upcoming vs past
  const now = new Date();
  const upcomingAppointments = appointments.filter(a => 
    new Date(a.dateTime) > now && a.status !== 'cancelled' && a.status !== 'completed'
  );
  const pastAppointments = appointments.filter(a => 
    new Date(a.dateTime) <= now || a.status === 'cancelled' || a.status === 'completed'
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl bg-primary/10">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{profile.full_name || 'Mon Profil'}</h1>
            <p className="text-muted-foreground mb-3">{profile.email}</p>
            {profileCompletion < 100 && (
              <div className="max-w-md">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Profil complété à {profileCompletion}%</span>
                  <span className="text-muted-foreground">Complétez pour débloquer toutes les fonctionnalités</span>
                </div>
                <Progress value={profileCompletion} className="h-2" />
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Rendez-vous</span>
              {upcomingAppointments.length > 0 && (
                <Badge variant="secondary" className="ml-1">{upcomingAppointments.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favoris</span>
              {favorites.length > 0 && (
                <Badge variant="secondary" className="ml-1">{favorites.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>Gérez vos informations de profil</CardDescription>
                </div>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="Votre nom complet"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="pl-10 bg-muted"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="+213 XX XX XX XX"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date de naissance</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Adresse</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="Votre adresse à Sidi Bel Abbès"
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave}>Enregistrer</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>Gérez vos paramètres de sécurité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="mr-2 h-4 w-4" />
                  Changer le mot de passe
                </Button>
                <Separator />
                <div className="space-y-2">
                  <Button variant="destructive" onClick={logout} className="w-full">
                    Se déconnecter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Rendez-vous à venir
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun rendez-vous à venir</p>
                    <Button variant="link" onClick={() => navigate('/search')}>
                      Trouver un prestataire
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-3">
                      {upcomingAppointments.map((apt) => {
                        const provider = providerCache[apt.providerId];
                        return (
                          <Card key={apt.id} className="border-primary/20">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold">{apt.providerName || provider?.name || 'Prestataire'}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(apt.dateTime).toLocaleDateString('fr-FR', {
                                      weekday: 'long',
                                      day: 'numeric',
                                      month: 'long',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleCancelAppointment(apt.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Annuler
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Historique des rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pastAppointments.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">Aucun rendez-vous passé</p>
                ) : (
                  <ScrollArea className="max-h-[300px]">
                    <div className="space-y-2">
                      {pastAppointments.map((apt) => {
                        const provider = providerCache[apt.providerId];
                        return (
                          <div key={apt.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <p className="font-medium text-sm">{apt.providerName || provider?.name || 'Prestataire'}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(apt.dateTime).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <Badge variant={apt.status === 'cancelled' ? 'destructive' : 'secondary'}>
                              {apt.status === 'cancelled' ? 'Annulé' : 'Terminé'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Mes prestataires favoris
                </CardTitle>
                <CardDescription>Accès rapide à vos prestataires préférés</CardDescription>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun favori pour l'instant</p>
                    <Button variant="link" onClick={() => navigate('/providers-map')}>
                      Découvrir les prestataires
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {favorites.map((provider) => (
                      <Card key={provider.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-sm">{provider.name}</h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {PROVIDER_TYPE_LABELS[provider.type]?.icon} {PROVIDER_TYPE_LABELS[provider.type]?.fr}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFavorite(provider.id);
                              }}
                            >
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            </Button>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <span>{provider.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{provider.address}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => navigate(`/provider/${provider.id}`)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Voir
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`, '_blank');
                              }}
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Y aller
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notifications push</Label>
                      <p className="text-sm text-muted-foreground">Notifications dans le navigateur</p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) => updatePreferences({ pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notifications email</Label>
                      <p className="text-sm text-muted-foreground">Emails de notification</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => updatePreferences({ emailNotifications: checked })}
                    />
                  </div>

                  <Separator />

                  <h4 className="font-medium">Types de notifications</h4>

                  <div className="flex items-center justify-between">
                    <Label>Rappels de rendez-vous</Label>
                    <Switch
                      checked={preferences.appointments}
                      onCheckedChange={(checked) => updatePreferences({ appointments: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Messages</Label>
                    <Switch
                      checked={preferences.messages}
                      onCheckedChange={(checked) => updatePreferences({ messages: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Rappels de santé</Label>
                    <Switch
                      checked={preferences.profileUpdates}
                      onCheckedChange={(checked) => updatePreferences({ profileUpdates: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
