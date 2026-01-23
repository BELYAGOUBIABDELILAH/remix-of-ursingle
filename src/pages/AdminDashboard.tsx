import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CheckCircle, XCircle, Eye, Users, Building2, TrendingUp,
  AlertCircle, Activity, Search, Settings, Shield, Megaphone, Mail, Loader2,
  Bell, BellRing
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VerificationQueue } from '@/components/admin/VerificationQueue';
import { MedicalAdsModeration } from '@/components/admin/MedicalAdsModeration';
import { AdminNotificationsPanel } from '@/components/admin/AdminNotificationsPanel';
import { notificationService } from '@/services/notificationService';
import { getUnreadCount } from '@/services/adminNotificationService';
import { usePendingProviders, useAllProviders, useUpdateVerification } from '@/hooks/useProviders';
import { CityHealthProvider } from '@/data/providers';

interface PendingProvider extends CityHealthProvider {
  submittedAt?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sentNotifications, setSentNotifications] = useState<any[]>([]);
  const [adminNotifCount, setAdminNotifCount] = useState(0);

  // Use TanStack Query for provider data
  const { data: pendingProvidersRaw = [], isLoading: loadingPending } = usePendingProviders();
  const { data: allProviders = [], isLoading: loadingAll } = useAllProviders();
  const updateVerification = useUpdateVerification();
  
  const loading = loadingPending || loadingAll;

  // Transform pending providers
  const pendingProviders: PendingProvider[] = pendingProvidersRaw.map(p => ({
    ...p,
    status: 'pending' as const,
    submittedAt: new Date().toISOString()
  }));

  // Calculate stats from real data
  const stats = {
    totalUsers: allProviders.length, // Real count from providers
    totalProviders: allProviders.length,
    pendingApprovals: pendingProviders.length,
    pendingVerifications: pendingProviders.length,
    pendingAds: 0,
    monthlyGrowth: 0, // Would need historical data to calculate
    activeUsers: allProviders.filter(p => p.isPublic).length,
    verifiedProviders: allProviders.filter(p => p.verificationStatus === 'verified').length,
  };

  // Recent activity from pending providers (real data)
  const recentActivity: Array<{ type: 'registration' | 'approval' | 'report' | 'update'; user: string; action: string; time: string }> = 
    pendingProviders.length > 0 
      ? pendingProviders.slice(0, 4).map(p => ({
          type: 'registration' as const,
          user: p.name,
          action: 'Nouvelle inscription',
          time: 'En attente'
        }))
      : [
          { type: 'registration', user: 'Aucune activité', action: 'Aucune nouvelle inscription', time: '-' }
        ];

  useEffect(() => {
    setSentNotifications(notificationService.getSentNotifications());
    
    // Get admin notification count
    getUnreadCount().then(setAdminNotifCount).catch(() => setAdminNotifCount(0));
  }, []);

  const handleApprove = async (id: string) => {
    const provider = pendingProviders.find(p => p.id === id);
    
    try {
      // Update Firestore via mutation
      await updateVerification.mutateAsync({ providerId: id, status: 'verified', isPublic: true });
      
      // Send notification
      if (provider) {
        notificationService.sendVerificationNotification({
          type: 'verification_approved',
          providerEmail: provider.phone,
          providerName: provider.name
        });
      }

      toast({
        title: "Profil approuvé",
        description: "Le professionnel est maintenant visible dans les recherches.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver ce profil.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    const provider = pendingProviders.find(p => p.id === id);
    
    try {
      // Update Firestore via mutation - rejected providers stay hidden
      await updateVerification.mutateAsync({ providerId: id, status: 'rejected', isPublic: false });
      
      // Send notification
      if (provider) {
        notificationService.sendVerificationNotification({
          type: 'verification_rejected',
          providerEmail: provider.phone,
          providerName: provider.name,
          reason: 'Documents non conformes ou informations incomplètes'
        });
      }

      toast({
        title: "Profil rejeté",
        description: "Le professionnel ne sera pas visible dans les recherches.",
        variant: "destructive",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter ce profil.",
        variant: "destructive",
      });
    }
  };

  const filteredProviders = pendingProviders.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Tableau de bord Admin</h1>
              <p className="text-muted-foreground">Gestion de la plateforme CityHealth</p>
            </div>
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> +{stats.monthlyGrowth}% ce mois
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Professionnels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.totalProviders}</p>
                  <p className="text-xs text-muted-foreground">{stats.verifiedProviders} vérifiés</p>
                </div>
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>En attente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-orange-500">{stats.pendingApprovals}</p>
                  <p className="text-xs text-muted-foreground">À vérifier</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Vérifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-500">{stats.pendingVerifications}</p>
                  <p className="text-xs text-muted-foreground">Demandes</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Annonces</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-purple-500">{stats.pendingAds}</p>
                  <p className="text-xs text-muted-foreground">À modérer</p>
                </div>
                <Megaphone className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="approvals">
              Inscriptions ({stats.pendingApprovals})
            </TabsTrigger>
            <TabsTrigger value="verifications">
              <Shield className="h-4 w-4 mr-1" />
              Vérifications
            </TabsTrigger>
            <TabsTrigger value="ads">
              <Megaphone className="h-4 w-4 mr-1" />
              Annonces
            </TabsTrigger>
            <TabsTrigger value="notifications">
              {adminNotifCount > 0 ? (
                <BellRing className="h-4 w-4 mr-1 text-red-500" />
              ) : (
                <Bell className="h-4 w-4 mr-1" />
              )}
              Alertes
              {adminNotifCount > 0 && (
                <Badge variant="destructive" className="ml-1.5 h-5 px-1.5">
                  {adminNotifCount > 9 ? '9+' : adminNotifCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
            <TabsTrigger value="settings">Configuration</TabsTrigger>
          </TabsList>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Demandes d'inscription</CardTitle>
                    <CardDescription>Vérifier et approuver les nouveaux professionnels depuis Firestore</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        className="pl-10 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredProviders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-medium">Aucune inscription en attente</p>
                    <p className="text-sm">Tous les profils ont été traités.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Professionnel</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Adresse</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProviders.map((provider) => (
                        <TableRow key={provider.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{provider.name}</p>
                              {provider.specialty && (
                                <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{provider.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{provider.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">{provider.address}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">En attente</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleApprove(provider.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleReject(provider.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>Dernières actions sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className={`w-2 h-2 mt-2 rounded-full ${
                        activity.type === 'approval' ? 'bg-green-500' :
                        activity.type === 'report' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verifications Tab */}
          <TabsContent value="verifications">
            <VerificationQueue />
          </TabsContent>

          {/* Medical Ads Tab */}
          <TabsContent value="ads">
            <MedicalAdsModeration />
          </TabsContent>

          {/* Notifications Tab - Admin Alerts */}
          <TabsContent value="notifications" className="space-y-6">
            {/* Admin Notifications Panel */}
            <AdminNotificationsPanel />
            
            {/* Sent Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Emails envoyés
                </CardTitle>
                <CardDescription>Historique des notifications email aux prestataires</CardDescription>
              </CardHeader>
              <CardContent>
                {sentNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune notification envoyée</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sentNotifications.map((notif, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg">
                        <Mail className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1">
                          <p className="font-medium">{notif.providerName}</p>
                          <p className="text-sm text-muted-foreground">{notif.type}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notif.sentAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques globales</CardTitle>
                <CardDescription>Vue d'ensemble de la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-3xl font-bold">{stats.totalProviders}</p>
                    <p className="text-sm text-muted-foreground">Total prestataires</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-500">{stats.verifiedProviders}</p>
                    <p className="text-sm text-muted-foreground">Vérifiés</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-3xl font-bold text-orange-500">{stats.pendingApprovals}</p>
                    <p className="text-sm text-muted-foreground">En attente</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-3xl font-bold text-red-500">
                      {allProviders.filter(p => p.verificationStatus === 'rejected').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Rejetés</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Paramètres de la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Paramètres à venir...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
