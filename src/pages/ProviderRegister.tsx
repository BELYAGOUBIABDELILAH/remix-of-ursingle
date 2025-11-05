import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Upload, Building2, MapPin, Phone, Mail, Globe, Clock, FileText } from 'lucide-react';
import { SPECIALTIES, PROVIDER_TYPES, AREAS } from '@/data/providers';

export default function ProviderRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    providerName: '',
    type: '',
    specialty: '',
    email: '',
    phone: '',
    
    // Location
    address: '',
    area: '',
    
    // Services
    description: '',
    languages: [] as string[],
    emergency: false,
    accessible: false,
    
    // Schedule
    schedule: '',
    
    // Documents
    license: null as File | null,
    photos: [] as File[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock registration - in real app, upload to backend
    toast({
      title: "Demande envoyée !",
      description: "Votre demande d'inscription est en cours de vérification. Vous recevrez un email sous 24-48h.",
    });
    
    // Store pending registration in localStorage for demo
    const pendingRegistrations = JSON.parse(localStorage.getItem('ch_pending_registrations') || '[]');
    pendingRegistrations.push({
      ...formData,
      id: Date.now().toString(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem('ch_pending_registrations', JSON.stringify(pendingRegistrations));
    
    setTimeout(() => navigate('/'), 2000);
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Inscription Professionnel</h1>
          <p className="text-muted-foreground">Rejoignez CityHealth et développez votre visibilité</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {s}
              </div>
              {s < 4 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && 'Informations de base'}
                {step === 2 && 'Localisation'}
                {step === 3 && 'Services et disponibilité'}
                {step === 4 && 'Documents et photos'}
              </CardTitle>
              <CardDescription>
                Étape {step} sur 4
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="providerName">Nom du cabinet / établissement *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="providerName"
                        placeholder="Ex: Cabinet Dr. Benali"
                        className="pl-10"
                        value={formData.providerName}
                        onChange={(e) => setFormData({...formData, providerName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({...formData, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVIDER_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type === 'doctor' ? 'Médecin' : 
                               type === 'clinic' ? 'Clinique' :
                               type === 'pharmacy' ? 'Pharmacie' :
                               type === 'lab' ? 'Laboratoire' : 'Hôpital'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="specialty">Spécialité</Label>
                      <Select
                        value={formData.specialty}
                        onValueChange={(value) => setFormData({...formData, specialty: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALTIES.map((spec) => (
                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="contact@example.com"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Téléphone *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+213 XX XX XX XX"
                          className="pl-10"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Adresse complète *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder="Numéro, rue, quartier"
                        className="pl-10"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="area">Quartier *</Label>
                    <Select
                      value={formData.area}
                      onValueChange={(value) => setFormData({...formData, area: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        {AREAS.map((area) => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Services */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description des services *</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez vos services, équipements, approche médicale..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label>Langues parlées</Label>
                    <div className="flex gap-4 mt-2">
                      {['Français', 'Arabe', 'Anglais'].map((lang) => (
                        <div key={lang} className="flex items-center space-x-2">
                          <Checkbox
                            id={lang}
                            checked={formData.languages.includes(lang)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({...formData, languages: [...formData.languages, lang]});
                              } else {
                                setFormData({...formData, languages: formData.languages.filter(l => l !== lang)});
                              }
                            }}
                          />
                          <Label htmlFor={lang} className="font-normal">{lang}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emergency"
                        checked={formData.emergency}
                        onCheckedChange={(checked) => setFormData({...formData, emergency: !!checked})}
                      />
                      <Label htmlFor="emergency" className="font-normal">Service d'urgence</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="accessible"
                        checked={formData.accessible}
                        onCheckedChange={(checked) => setFormData({...formData, accessible: !!checked})}
                      />
                      <Label htmlFor="accessible" className="font-normal">Accès PMR</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="schedule">Horaires d'ouverture *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="schedule"
                        placeholder="Ex: Lun-Ven: 8h-18h, Sam: 8h-12h"
                        rows={3}
                        className="pl-10"
                        value={formData.schedule}
                        onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Documents */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="license">Licence professionnelle / Agrément *</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <Input
                        id="license"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => setFormData({...formData, license: e.target.files?.[0] || null})}
                        required
                      />
                      <Label htmlFor="license" className="cursor-pointer">
                        {formData.license ? formData.license.name : 'Cliquez pour télécharger (PDF, JPG, PNG)'}
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="photos">Photos du cabinet (optionnel)</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <Input
                        id="photos"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => setFormData({...formData, photos: Array.from(e.target.files || [])})}
                      />
                      <Label htmlFor="photos" className="cursor-pointer">
                        {formData.photos.length > 0 ? `${formData.photos.length} photo(s) sélectionnée(s)` : 'Cliquez pour ajouter des photos'}
                      </Label>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      📋 Votre demande sera examinée par notre équipe sous 24-48h. 
                      Vous recevrez un email de confirmation une fois votre profil validé.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Précédent
                  </Button>
                )}
                {step < 4 ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    Suivant
                  </Button>
                ) : (
                  <Button type="submit" className="ml-auto">
                    Soumettre la demande
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
