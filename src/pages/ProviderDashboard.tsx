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
import { 
  Eye, Phone, MapPin, TrendingUp, Calendar, Star, 
  Upload, Settings, BarChart3, Clock, Megaphone, Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProfileProgressBar, calculateProfileCompletion } from '@/components/provider/ProfileProgressBar';
import { VerificationRequest, type VerificationStatus } from '@/components/provider/VerificationRequest';
import { MedicalAdsManager } from '@/components/provider/MedicalAdsManager';

export default function ProviderDashboard() {
  const { toast } = useToast();
  const [stats] = useState({
    profileViews: 1247,
    phoneClicks: 89,
    appointments: 23,
    rating: 4.7,
    reviewsCount: 142,
  });

  const [profile, setProfile] = useState({
    id: 'provider-1',
    name: 'Dr. Ahmed Benali',
    type: 'doctor',
    specialty: 'Cardiologie',
    email: 'dr.benali@example.com',
    phone: '+213 48 50 10 20',
    address: '15 Rue principale, Centre Ville',
    description: 'Cardiologue expérimenté avec plus de 15 ans de pratique. Spécialisé dans les maladies cardiovasculaires et la prévention.',
    schedule: 'Lun-Ven: 9h-17h\nSam: 9h-13h',
    license: 'license-2024-001.pdf',
    photos: [] as string[],
    languages: ['Français', 'Arabe'],
    accessible: true,
    emergency: false,
  });

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('none');

  useEffect(() => {
    // Load verification status from localStorage
    const registrations = JSON.parse(localStorage.getItem('ch_pending_registrations') || '[]');
    const currentProvider = registrations.find((r: any) => r.id === profile.id);
    if (currentProvider?.verificationStatus) {
      setVerificationStatus(currentProvider.verificationStatus);
    }
    if (currentProvider?.verified) {
      setVerificationStatus('approved');
    }
  }, [profile.id]);

  const [recentActivity] = useState([
    { type: 'view', date: '2025-01-10', count: 47 },
    { type: 'contact', date: '2025-01-09', count: 12 },
    { type: 'appointment', date: '2025-01-08', count: 5 },
  ]);

  const profileFields = calculateProfileCompletion(profile);
  const isProfileComplete = profileFields.filter(f => f.required && !f.completed).length === 0;
  const isVerified = verificationStatus === 'approved';

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profil mis à jour",
      description: "Vos modifications ont été enregistrées avec succès.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">{profile.specialty}</p>
                {isVerified ? (
                  <Badge className="mt-1 bg-green-500 hover:bg-green-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="mt-1">Non vérifié</Badge>
                )}
              </div>
            </div>
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
          </div>
        </div>

        {/* Profile Progress */}
        <div className="mb-8">
          <ProfileProgressBar fields={profileFields} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Vues du profil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.profileViews}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> +12% ce mois
                  </p>
                </div>
                <Eye className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Appels reçus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.phoneClicks}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> +8% ce mois
                  </p>
                </div>
                <Phone className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rendez-vous</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.appointments}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" /> Cette semaine
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Note moyenne</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.rating}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {stats.reviewsCount} avis
                  </p>
                </div>
                <Star className="h-8 w-8 text-primary fill-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Taux de réponse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">94%</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" /> Excellent
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
            <TabsTrigger value="verification">
              <Shield className="h-4 w-4 mr-1" />
              Vérification
            </TabsTrigger>
            <TabsTrigger value="ads">
              <Megaphone className="h-4 w-4 mr-1" />
              Annonces
            </TabsTrigger>
            <TabsTrigger value="analytics">Statistiques</TabsTrigger>
            <TabsTrigger value="reviews">Avis ({stats.reviewsCount})</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations publiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialty">Spécialité</Label>
                      <Input
                        id="specialty"
                        value={profile.specialty}
                        onChange={(e) => setProfile({...profile, specialty: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={profile.address}
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={profile.description}
                      onChange={(e) => setProfile({...profile, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="schedule">Horaires</Label>
                    <Textarea
                      id="schedule"
                      rows={3}
                      value={profile.schedule}
                      onChange={(e) => setProfile({...profile, schedule: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="accessible"
                        checked={profile.accessible}
                        onCheckedChange={(checked) => setProfile({...profile, accessible: !!checked})}
                      />
                      <Label htmlFor="accessible" className="font-normal">Accès PMR</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emergency"
                        checked={profile.emergency}
                        onCheckedChange={(checked) => setProfile({...profile, emergency: !!checked})}
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
                          setProfile({
                            ...profile, 
                            photos: files.map(f => URL.createObjectURL(f))
                          });
                        }}
                      />
                      <Label htmlFor="photos" className="cursor-pointer">
                        {profile.photos.length > 0 
                          ? `${profile.photos.length} photo(s) sélectionnée(s)`
                          : 'Cliquez pour ajouter des photos'
                        }
                      </Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Enregistrer les modifications
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <VerificationRequest
              providerId={profile.id}
              providerName={profile.name}
              currentStatus={verificationStatus}
              profileComplete={isProfileComplete}
              onStatusChange={setVerificationStatus}
            />
          </TabsContent>

          {/* Medical Ads Tab */}
          <TabsContent value="ads">
            <MedicalAdsManager
              providerId={profile.id}
              providerName={profile.name}
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

              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                  <CardDescription>Comparaison avec les autres professionnels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Visibilité</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{width: '87%'}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Taux de réponse</span>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{width: '94%'}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Satisfaction patient</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{width: '92%'}} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Avis patients</CardTitle>
                <CardDescription>Ce que vos patients disent de vous</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>P{i}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">Patient {i}</p>
                            <div className="flex">
                              {[...Array(5)].map((_, idx) => (
                                <Star key={idx} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">Il y a {i} jours</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Excellent professionnel, très à l'écoute et compétent. Je recommande vivement.
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
