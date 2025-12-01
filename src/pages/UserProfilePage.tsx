import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Calendar, Shield, Bell, Lock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useNotifications } from '@/hooks/useNotifications';

export default function UserProfilePage() {
  const { profile, updateProfile, logout } = useAuth();
  const { preferences, updatePreferences } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');

  if (!profile) return null;

  const handleSave = async () => {
    await updateProfile({ full_name: fullName });
    setIsEditing(false);
  };

  const initials = profile.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles et préférences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations de profil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">Changer la photo</Button>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG. Max 2MB</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
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
                    <p className="text-xs text-muted-foreground">
                      L'email ne peut pas être modifié
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Rôles</Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                      <Shield className="h-4 w-4 text-primary" />
                      {profile.roles.map(role => (
                        <span key={role} className="capitalize px-2 py-1 bg-primary/10 rounded text-sm">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave}>Enregistrer</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Modifier</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Notifications push</Label>
                      <p className="text-sm text-muted-foreground">Recevoir des notifications dans le navigateur</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) => updatePreferences({ pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Notifications email</Label>
                      <p className="text-sm text-muted-foreground">Recevoir des emails de notification</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => updatePreferences({ emailNotifications: checked })}
                    />
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-4">Types de notifications</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="appointments">Rendez-vous</Label>
                        <Switch
                          id="appointments"
                          checked={preferences.appointments}
                          onCheckedChange={(checked) => updatePreferences({ appointments: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="messages">Messages</Label>
                        <Switch
                          id="messages"
                          checked={preferences.messages}
                          onCheckedChange={(checked) => updatePreferences({ messages: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="profile-updates">Mises à jour du profil</Label>
                        <Switch
                          id="profile-updates"
                          checked={preferences.profileUpdates}
                          onCheckedChange={(checked) => updatePreferences({ profileUpdates: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="verification">Statut de vérification</Label>
                        <Switch
                          id="verification"
                          checked={preferences.verificationStatus}
                          onCheckedChange={(checked) => updatePreferences({ verificationStatus: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>Gérez vos paramètres de sécurité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mot de passe</Label>
                    <Button variant="outline" className="w-full justify-start">
                      <Lock className="mr-2 h-4 w-4" />
                      Changer le mot de passe
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Zone de danger</h4>
                    <div className="space-y-4">
                      <Button variant="destructive" onClick={logout} className="w-full">
                        Se déconnecter
                      </Button>
                      <Button variant="outline" className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground">
                        Supprimer le compte
                      </Button>
                    </div>
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
