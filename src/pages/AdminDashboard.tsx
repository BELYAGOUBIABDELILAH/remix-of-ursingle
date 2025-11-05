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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle, XCircle, Eye, Users, Building2, TrendingUp,
  AlertCircle, Activity, Search, Filter, BarChart3, Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [stats] = useState({
    totalUsers: 15847,
    totalProviders: 342,
    pendingApprovals: 23,
    monthlyGrowth: 12,
    activeUsers: 8934,
    verifiedProviders: 298,
  });

  const [pendingProviders, setPendingProviders] = useState(() => {
    const stored = localStorage.getItem('ch_pending_registrations');
    return stored ? JSON.parse(stored) : [
      {
        id: '1',
        providerName: 'Cabinet Dr. Merabet',
        type: 'doctor',
        specialty: 'Cardiologie',
        email: 'merabet@example.com',
        phone: '+213 48 50 10 20',
        submittedAt: '2025-01-10T10:30:00',
        status: 'pending'
      },
      {
        id: '2',
        providerName: 'Clinique El Amal',
        type: 'clinic',
        email: 'elamal@example.com',
        phone: '+213 48 50 11 21',
        submittedAt: '2025-01-09T14:20:00',
        status: 'pending'
      }
    ];
  });

  const [recentActivity] = useState([
    { type: 'registration', user: 'Dr. Ahmed B.', action: 'Nouvelle inscription', time: 'Il y a 2h' },
    { type: 'approval', user: 'Admin', action: 'Profil approuvé: Pharmacie Centrale', time: 'Il y a 3h' },
    { type: 'report', user: 'Patient #4521', action: 'Signalement: Avis inapproprié', time: 'Il y a 5h' },
    { type: 'update', user: 'Dr. Sara M.', action: 'Mise à jour du profil', time: 'Il y a 6h' },
  ]);

  const handleApprove = (id: string) => {
    const updated = pendingProviders.map(p => 
      p.id === id ? { ...p, status: 'approved' } : p
    );
    setPendingProviders(updated);
    localStorage.setItem('ch_pending_registrations', JSON.stringify(updated));
    
    toast({
      title: "Profil approuvé",
      description: "Le professionnel a été notifié par email.",
    });
  };

  const handleReject = (id: string) => {
    const updated = pendingProviders.map(p => 
      p.id === id ? { ...p, status: 'rejected' } : p
    );
    setPendingProviders(updated);
    localStorage.setItem('ch_pending_registrations', JSON.stringify(updated));
    
    toast({
      title: "Profil rejeté",
      description: "Le professionnel a été notifié par email.",
      variant: "destructive",
    });
  };

  const filteredProviders = pendingProviders.filter(p => {
    const matchesSearch = p.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              <CardDescription>Utilisateurs actifs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Dernières 24h</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="approvals">
              Approbations ({stats.pendingApprovals})
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
            <TabsTrigger value="moderation">Modération</TabsTrigger>
            <TabsTrigger value="settings">Configuration</TabsTrigger>
          </TabsList>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Demandes d'inscription</CardTitle>
                    <CardDescription>Vérifier et approuver les nouveaux professionnels</CardDescription>
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
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="approved">Approuvés</SelectItem>
                        <SelectItem value="rejected">Rejetés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Professionnel</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProviders.map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{provider.providerName}</p>
                            {provider.specialty && (
                              <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {provider.type === 'doctor' ? 'Médecin' :
                             provider.type === 'clinic' ? 'Clinique' :
                             provider.type === 'pharmacy' ? 'Pharmacie' :
                             provider.type === 'lab' ? 'Laboratoire' : 'Hôpital'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{provider.email}</p>
                            <p className="text-muted-foreground">{provider.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(provider.submittedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              provider.status === 'pending' ? 'secondary' :
                              provider.status === 'approved' ? 'default' : 'destructive'
                            }
                          >
                            {provider.status === 'pending' ? 'En attente' :
                             provider.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {provider.status === 'pending' && (
                              <>
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
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques d'utilisation</CardTitle>
                  <CardDescription>Métriques clés de la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Recherches par jour</span>
                        <span className="text-sm text-muted-foreground">~2,400</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{width: '85%'}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Taux de conversion</span>
                        <span className="text-sm text-muted-foreground">23%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{width: '23%'}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Satisfaction utilisateur</span>
                        <span className="text-sm text-muted-foreground">92%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{width: '92%'}} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Spécialités</CardTitle>
                  <CardDescription>Les plus recherchées</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Médecine générale', 'Dentisterie', 'Cardiologie', 'Pédiatrie', 'Gynécologie'].map((spec, idx) => (
                      <div key={spec} className="flex items-center justify-between">
                        <span className="text-sm">{spec}</span>
                        <Badge variant="secondary">{345 - idx * 50}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation">
            <Card>
              <CardHeader>
                <CardTitle>Modération de contenu</CardTitle>
                <CardDescription>Gérer les signalements et le contenu</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Aucun signalement en attente</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuration de la plateforme</CardTitle>
                <CardDescription>Paramètres système et maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Mode maintenance</p>
                    <p className="text-sm text-muted-foreground">Désactiver temporairement la plateforme</p>
                  </div>
                  <Button variant="outline">Activer</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Critères de vérification</p>
                    <p className="text-sm text-muted-foreground">Modifier les exigences d'approbation</p>
                  </div>
                  <Button variant="outline">Configurer</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Notifications email</p>
                    <p className="text-sm text-muted-foreground">Gérer les modèles d'emails</p>
                  </div>
                  <Button variant="outline">Modifier</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
