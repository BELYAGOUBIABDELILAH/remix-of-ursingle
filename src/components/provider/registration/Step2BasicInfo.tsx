import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, Phone, Mail, User, FileText, CheckCircle2, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProviderFormData, PROVIDER_TYPE_LABELS } from './types';
import { useToast } from '@/hooks/use-toast';

interface Step2Props {
  formData: ProviderFormData;
  updateFormData: (data: Partial<ProviderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step2BasicInfo({ formData, updateFormData, onNext, onPrev }: Step2Props) {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.facilityNameFr) {
      newErrors.facilityNameFr = 'Le nom en français est requis';
    }
    if (!formData.legalRegistrationNumber) {
      newErrors.legalRegistrationNumber = 'Le numéro d\'enregistrement est requis';
    }
    if (!formData.contactPersonName) {
      newErrors.contactPersonName = 'Le nom du contact est requis';
    }
    if (!formData.phone) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleVerifyPhone = async () => {
    setIsVerifyingPhone(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    updateFormData({ phoneVerified: true });
    setIsVerifyingPhone(false);
    toast({
      title: "Numéro vérifié",
      description: "Votre numéro de téléphone a été vérifié avec succès.",
    });
  };

  const handleVerifyEmail = async () => {
    setIsVerifyingEmail(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    updateFormData({ emailVerified: true });
    setIsVerifyingEmail(false);
    toast({
      title: "Email vérifié",
      description: "Votre adresse email a été vérifiée avec succès.",
    });
  };

  const providerTypeLabel = formData.providerType 
    ? PROVIDER_TYPE_LABELS[formData.providerType]?.fr 
    : '';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Informations de l'établissement
          </h2>
        </div>
        <p className="text-muted-foreground">
          Ces informations seront affichées sur votre profil public
        </p>
        {providerTypeLabel && (
          <Badge variant="secondary" className="mt-2">
            {providerTypeLabel}
          </Badge>
        )}
      </div>

      {/* Facility Name */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="facilityNameFr">
            Nom de l'établissement (Français) <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="facilityNameFr"
              placeholder="Ex: Clinique El Amal"
              className={cn("pl-10", errors.facilityNameFr && "border-destructive")}
              value={formData.facilityNameFr}
              onChange={(e) => updateFormData({ facilityNameFr: e.target.value })}
            />
          </div>
          {errors.facilityNameFr && (
            <p className="text-sm text-destructive">{errors.facilityNameFr}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Ce nom apparaîtra dans les résultats de recherche
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="facilityNameAr">
            Nom de l'établissement (Arabe)
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="facilityNameAr"
              placeholder="مثال: عيادة الأمل"
              className="pl-10"
              dir="rtl"
              value={formData.facilityNameAr}
              onChange={(e) => updateFormData({ facilityNameAr: e.target.value })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Optionnel mais recommandé pour une meilleure visibilité
          </p>
        </div>
      </div>

      {/* Legal Registration */}
      <div className="space-y-2">
        <Label htmlFor="legalRegistrationNumber">
          Numéro d'enregistrement légal <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="legalRegistrationNumber"
            placeholder="Ex: RC-22-00001"
            className={cn("pl-10", errors.legalRegistrationNumber && "border-destructive")}
            value={formData.legalRegistrationNumber}
            onChange={(e) => updateFormData({ legalRegistrationNumber: e.target.value })}
          />
        </div>
        {errors.legalRegistrationNumber && (
          <p className="text-sm text-destructive">{errors.legalRegistrationNumber}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Numéro du registre de commerce ou agrément ministériel
        </p>
      </div>

      {/* Contact Person */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactPersonName">
            Personne de contact <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="contactPersonName"
              placeholder="Nom complet"
              className={cn("pl-10", errors.contactPersonName && "border-destructive")}
              value={formData.contactPersonName}
              onChange={(e) => updateFormData({ contactPersonName: e.target.value })}
            />
          </div>
          {errors.contactPersonName && (
            <p className="text-sm text-destructive">{errors.contactPersonName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPersonRole">
            Fonction
          </Label>
          <Input
            id="contactPersonRole"
            placeholder="Ex: Directeur, Responsable administratif"
            value={formData.contactPersonRole}
            onChange={(e) => updateFormData({ contactPersonRole: e.target.value })}
          />
        </div>
      </div>

      {/* Phone & Email Verification */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">
            Numéro de téléphone <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+213 XX XX XX XX"
                className={cn("pl-10", errors.phone && "border-destructive")}
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value, phoneVerified: false })}
              />
            </div>
            <Button
              type="button"
              variant={formData.phoneVerified ? "secondary" : "outline"}
              onClick={handleVerifyPhone}
              disabled={!formData.phone || formData.phoneVerified || isVerifyingPhone}
            >
              {isVerifyingPhone ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : formData.phoneVerified ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                "Vérifier"
              )}
            </Button>
          </div>
          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          {formData.phoneVerified && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Numéro vérifié
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailVerify">
            Email de contact
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="emailVerify"
                type="email"
                placeholder={formData.email}
                className="pl-10 bg-muted/50"
                value={formData.email}
                disabled
              />
            </div>
            <Button
              type="button"
              variant={formData.emailVerified ? "secondary" : "outline"}
              onClick={handleVerifyEmail}
              disabled={formData.emailVerified || isVerifyingEmail}
            >
              {isVerifyingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : formData.emailVerified ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                "Vérifier"
              )}
            </Button>
          </div>
          {formData.emailVerified && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Email vérifié
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          Précédent
        </Button>
        <Button onClick={handleSubmit}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
