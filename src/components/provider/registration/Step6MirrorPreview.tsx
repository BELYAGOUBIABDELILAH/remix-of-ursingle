import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, Edit, Building2, MapPin, Stethoscope,
  Phone, Mail, Clock, Home, Loader2, PartyPopper, Eye, Star,
  Globe, Shield, AlertCircle
} from 'lucide-react';
import { ProviderFormData, PROVIDER_TYPE_LABELS, WeeklySchedule } from './types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ProfileScore {
  total: number;
  identity: number;
  institution: number;
  visibility: number;
  enhancement: number;
  isSearchable: boolean;
}

interface Step6Props {
  formData: ProviderFormData;
  profileScore: ProfileScore;
  resetForm: () => void;
  onPrev: () => void;
  onEditStep: (step: number) => void;
}

const DAYS_FR: Record<keyof WeeklySchedule, string> = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mer',
  thursday: 'Jeu',
  friday: 'Ven',
  saturday: 'Sam',
  sunday: 'Dim',
};

export function Step6MirrorPreview({ formData, profileScore, resetForm, onPrev, onEditStep }: Step6Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Save to localStorage with PENDING status and isPublic = false
    const registrations = JSON.parse(localStorage.getItem('ch_pending_registrations') || '[]');
    registrations.push({
      ...formData,
      id: `reg_${Date.now()}`,
      facilityNameFr: formData.facilityNameFr,
      facilityNameAr: formData.facilityNameAr,
      providerName: formData.facilityNameFr,
      type: formData.providerType,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      verificationStatus: 'pending',
      isPublic: false,
      isSearchable: profileScore.isSearchable,
      profileCompletionScore: profileScore.total,
    });
    localStorage.setItem('ch_pending_registrations', JSON.stringify(registrations));

    // Clear draft
    resetForm();

    setIsSubmitting(false);
    setIsSubmitted(true);

    toast({
      title: "Profil publié !",
      description: "Votre demande sera examinée sous 24-48h.",
    });
  };

  const providerTypeLabel = formData.providerType 
    ? PROVIDER_TYPE_LABELS[formData.providerType]?.fr 
    : '';

  if (isSubmitted) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <PartyPopper className="h-10 w-10 text-green-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Félicitations ! 🎉
          </h2>
          <p className="text-lg text-muted-foreground">
            Votre profil a été soumis avec succès
          </p>
        </div>
        
        <Card className="max-w-md mx-auto text-left bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Vérification en cours</h3>
                <p className="text-sm text-muted-foreground">Durée estimée: 24-48h</p>
              </div>
            </div>
            <Separator className="my-4" />
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">✓</span>
                <span>Profil soumis</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">2</span>
                <span>Vérification par notre équipe</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">3</span>
                <span>Email de confirmation</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">4</span>
                <span>Visibilité dans la recherche</span>
              </li>
            </ol>
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button onClick={() => navigate('/registration-status')}>
            Voir le statut
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Eye className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Aperçu de votre profil public
        </h2>
        <p className="text-muted-foreground">
          Voici comment les patients verront votre établissement
        </p>
      </div>

      {/* Mirror Preview Card - Simulates the public ProviderCard */}
      <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
        <div className="relative">
          {/* Header Image / Logo Area */}
          <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            {formData.logoPreview ? (
              <img 
                src={formData.logoPreview} 
                alt="Logo" 
                className="w-20 h-20 rounded-full object-cover border-4 border-background shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Pending Badge */}
          <Badge className="absolute top-3 right-3 bg-amber-500/90 text-white">
            En attente de vérification
          </Badge>
        </div>

        <CardContent className="pt-4 space-y-4">
          {/* Name & Type */}
          <div className="text-center">
            <h3 className="text-xl font-bold">{formData.facilityNameFr || 'Nom de l\'établissement'}</h3>
            {formData.facilityNameAr && (
              <p className="text-muted-foreground" dir="rtl">{formData.facilityNameAr}</p>
            )}
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="secondary">{providerTypeLabel || 'Type'}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span>Nouveau</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">{formData.address || 'Adresse non renseignée'}</p>
              <p className="text-sm text-muted-foreground">
                {formData.area}{formData.city ? `, ${formData.city}` : ''}
              </p>
            </div>
          </div>

          {/* Hours */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              {formData.is24_7 ? (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                  Ouvert 24h/24
                </Badge>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {(Object.keys(DAYS_FR) as Array<keyof WeeklySchedule>).map(day => (
                    formData.schedule[day].isOpen && (
                      <Badge key={day} variant="outline" className="text-xs">
                        {DAYS_FR[day]}
                      </Badge>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-4 text-sm">
            {formData.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{formData.phone}</span>
              </div>
            )}
            {formData.homeVisitAvailable && (
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                <span>Visite à domicile</span>
              </div>
            )}
          </div>

          {/* Services Preview */}
          {formData.serviceCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.serviceCategories.slice(0, 5).map(s => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
              {formData.serviceCategories.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{formData.serviceCategories.length - 5}
                </Badge>
              )}
            </div>
          )}

          {/* Gallery Preview */}
          {formData.galleryPreviews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {formData.galleryPreviews.slice(0, 4).map((preview, i) => (
                <img
                  key={i}
                  src={preview}
                  alt={`Photo ${i + 1}`}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              ))}
              {formData.galleryPreviews.length > 4 && (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium">+{formData.galleryPreviews.length - 4}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Sections */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" size="sm" className="justify-start" onClick={() => onEditStep(1)}>
          <Edit className="h-4 w-4 mr-2" /> Modifier le compte
        </Button>
        <Button variant="outline" size="sm" className="justify-start" onClick={() => onEditStep(2)}>
          <Edit className="h-4 w-4 mr-2" /> Modifier les informations
        </Button>
        <Button variant="outline" size="sm" className="justify-start" onClick={() => onEditStep(3)}>
          <Edit className="h-4 w-4 mr-2" /> Modifier la localisation
        </Button>
        <Button variant="outline" size="sm" className="justify-start" onClick={() => onEditStep(4)}>
          <Edit className="h-4 w-4 mr-2" /> Modifier les services
        </Button>
        <Button variant="outline" size="sm" className="justify-start sm:col-span-2" onClick={() => onEditStep(5)}>
          <Edit className="h-4 w-4 mr-2" /> Modifier le profil & médias
        </Button>
      </div>

      {/* Profile Score Summary */}
      <Card className={cn(
        "border-2",
        profileScore.isSearchable ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"
      )}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profileScore.isSearchable ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-amber-500" />
              )}
              <div>
                <p className="font-semibold">
                  Score de profil: {profileScore.total}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {profileScore.isSearchable 
                    ? 'Votre profil sera visible dans la recherche après vérification'
                    : 'Complétez davantage pour améliorer votre visibilité'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Notice */}
      <div className="bg-muted/50 p-4 rounded-lg border">
        <p className="text-sm text-muted-foreground">
          📋 En publiant votre profil, vous acceptez que vos informations soient vérifiées par notre équipe. 
          Le processus de validation prend généralement 24 à 48 heures. Vous recevrez un email de confirmation 
          une fois votre profil approuvé.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          Précédent
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          size="lg"
          className="min-w-[200px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publication...
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              Publier mon profil
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
