import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, Stethoscope, Pill, FlaskConical, Hospital,
  Mail, Lock, Eye, EyeOff, Chrome, Baby, Droplet, Camera, Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProviderFormData, PROVIDER_TYPE_LABELS, ProviderTypeKey } from './types';

interface Step1Props {
  formData: ProviderFormData;
  updateFormData: (data: Partial<ProviderFormData>) => void;
  onNext: () => void;
}

// Icons for all provider types
const providerTypeIcons: Record<string, React.ReactNode> = {
  hospital: <Hospital className="h-6 w-6" />,
  birth_hospital: <Baby className="h-6 w-6" />,
  clinic: <Building2 className="h-6 w-6" />,
  doctor: <Stethoscope className="h-6 w-6" />,
  pharmacy: <Pill className="h-6 w-6" />,
  lab: <FlaskConical className="h-6 w-6" />,
  blood_cabin: <Droplet className="h-6 w-6" />,
  radiology_center: <Camera className="h-6 w-6" />,
  medical_equipment: <Package className="h-6 w-6" />,
};

export function Step1AccountCreation({ formData, updateFormData, onNext }: Step1Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.providerType) {
      newErrors.providerType = 'Veuillez sélectionner un type d\'établissement';
    }
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Bienvenue sur CityHealth Pro
        </h2>
        <p className="text-muted-foreground">
          Rejoignez notre réseau de professionnels de santé et développez votre visibilité
        </p>
      </div>

      {/* Provider Type Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Type d'établissement <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(PROVIDER_TYPE_LABELS).map(([type, labels]) => (
            <Card 
              key={type}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50",
                formData.providerType === type 
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                  : "border-border"
              )}
              onClick={() => updateFormData({ providerType: type as ProviderTypeKey })}
            >
              <CardContent className="p-3 text-center">
                <div className={cn(
                  "mx-auto mb-1.5 transition-colors",
                  formData.providerType === type ? "text-primary" : "text-muted-foreground"
                )}>
                  {providerTypeIcons[type]}
                </div>
                <p className="text-xs font-medium leading-tight">{labels.fr}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5" dir="rtl">{labels.ar}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {errors.providerType && (
          <p className="text-sm text-destructive">{errors.providerType}</p>
        )}
      </div>

      <Separator />

      {/* Email & Password */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            Email professionnel <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="contact@votre-etablissement.dz"
              className={cn("pl-10", errors.email && "border-destructive")}
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              Mot de passe <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 caractères"
                className={cn("pl-10 pr-10", errors.password && "border-destructive")}
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirmer le mot de passe <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Retapez votre mot de passe"
                className={cn("pl-10 pr-10", errors.confirmPassword && "border-destructive")}
                value={formData.confirmPassword}
                onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>
        </div>
      </div>

      <Separator />

      {/* Google OAuth */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">Ou inscrivez-vous avec</p>
        <Button variant="outline" className="w-full max-w-sm">
          <Chrome className="mr-2 h-4 w-4" />
          Continuer avec Google
        </Button>
      </div>

      <Separator />

      {/* Terms */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms"
          checked={formData.acceptTerms}
          onCheckedChange={(checked) => updateFormData({ acceptTerms: !!checked })}
          className={errors.acceptTerms ? "border-destructive" : ""}
        />
        <div className="space-y-1">
          <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
            J'accepte les{' '}
            <a href="/terms" className="text-primary hover:underline">
              Conditions d'utilisation
            </a>{' '}
            et la{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Politique de confidentialité
            </a>
          </Label>
          {errors.acceptTerms && (
            <p className="text-sm text-destructive">{errors.acceptTerms}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <Button onClick={handleSubmit} size="lg" className="w-full">
        Continuer
      </Button>
    </div>
  );
}
