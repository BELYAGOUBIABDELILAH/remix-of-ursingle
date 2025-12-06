import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, Clock, Home, Plus, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProviderFormData, WeeklySchedule, AdditionalLocation } from './types';
import { AREAS } from '@/data/providers';

interface Step3Props {
  formData: ProviderFormData;
  updateFormData: (data: Partial<ProviderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const DAYS_FR: Record<keyof WeeklySchedule, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

export function Step3Location({ formData, updateFormData, onNext, onPrev }: Step3Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.address) {
      newErrors.address = 'L\'adresse est requise';
    }
    if (!formData.area) {
      newErrors.area = 'Le quartier est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const updateSchedule = (day: keyof WeeklySchedule, field: string, value: string | boolean) => {
    const newSchedule = {
      ...formData.schedule,
      [day]: {
        ...formData.schedule[day],
        [field]: value,
      },
    };
    updateFormData({ schedule: newSchedule });
  };

  const addLocation = () => {
    const newLocation: AdditionalLocation = {
      id: Date.now().toString(),
      name: '',
      address: '',
      phone: '',
    };
    updateFormData({
      additionalLocations: [...formData.additionalLocations, newLocation],
    });
  };

  const removeLocation = (id: string) => {
    updateFormData({
      additionalLocations: formData.additionalLocations.filter(l => l.id !== id),
    });
  };

  const updateLocation = (id: string, field: keyof AdditionalLocation, value: string) => {
    updateFormData({
      additionalLocations: formData.additionalLocations.map(l =>
        l.id === id ? { ...l, [field]: value } : l
      ),
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Localisation & Disponibilité
          </h2>
        </div>
        <p className="text-muted-foreground">
          Aidez les patients à vous trouver facilement
        </p>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">
            Adresse complète <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="address"
              placeholder="Numéro, Rue, Quartier"
              className={cn("pl-10", errors.address && "border-destructive")}
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
            />
          </div>
          {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">
              Quartier <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.area}
              onValueChange={(value) => updateFormData({ area: value })}
            >
              <SelectTrigger className={errors.area ? "border-destructive" : ""}>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.area && <p className="text-sm text-destructive">{errors.area}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Code postal</Label>
            <Input
              id="postalCode"
              placeholder="22000"
              value={formData.postalCode}
              onChange={(e) => updateFormData({ postalCode: e.target.value })}
            />
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="h-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Carte interactive</p>
            <p className="text-xs">Cliquez pour définir votre emplacement exact</p>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Horaires d'ouverture
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Switch
                id="is24_7"
                checked={formData.is24_7}
                onCheckedChange={(checked) => updateFormData({ is24_7: checked })}
              />
              <Label htmlFor="is24_7" className="text-sm">Ouvert 24h/24</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!formData.is24_7 && (
            <div className="space-y-3">
              {(Object.keys(DAYS_FR) as Array<keyof WeeklySchedule>).map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-24">
                    <Label className="text-sm">{DAYS_FR[day]}</Label>
                  </div>
                  <Switch
                    checked={formData.schedule[day].isOpen}
                    onCheckedChange={(checked) => updateSchedule(day, 'isOpen', checked)}
                  />
                  {formData.schedule[day].isOpen && (
                    <>
                      <Input
                        type="time"
                        className="w-28"
                        value={formData.schedule[day].openTime}
                        onChange={(e) => updateSchedule(day, 'openTime', e.target.value)}
                      />
                      <span className="text-muted-foreground">à</span>
                      <Input
                        type="time"
                        className="w-28"
                        value={formData.schedule[day].closeTime}
                        onChange={(e) => updateSchedule(day, 'closeTime', e.target.value)}
                      />
                    </>
                  )}
                  {!formData.schedule[day].isOpen && (
                    <span className="text-sm text-muted-foreground">Fermé</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {formData.is24_7 && (
            <p className="text-center text-muted-foreground py-4">
              Votre établissement sera affiché comme disponible 24h/24, 7j/7
            </p>
          )}
        </CardContent>
      </Card>

      {/* Home Visit */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <Home className="h-5 w-5 text-primary" />
          <div>
            <Label className="text-base">Visites à domicile</Label>
            <p className="text-sm text-muted-foreground">
              Proposez-vous des consultations à domicile ?
            </p>
          </div>
        </div>
        <Switch
          checked={formData.homeVisitAvailable}
          onCheckedChange={(checked) => updateFormData({ homeVisitAvailable: checked })}
        />
      </div>

      {/* Additional Locations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Emplacements supplémentaires
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLocation}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Pour les établissements avec plusieurs adresses
          </p>
        </CardHeader>
        {formData.additionalLocations.length > 0 && (
          <CardContent className="space-y-4">
            {formData.additionalLocations.map((location, index) => (
              <div key={location.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Emplacement {index + 2}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLocation(location.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Nom du site"
                    value={location.name}
                    onChange={(e) => updateLocation(location.id, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Adresse"
                    value={location.address}
                    onChange={(e) => updateLocation(location.id, 'address', e.target.value)}
                  />
                  <Input
                    placeholder="Téléphone"
                    value={location.phone}
                    onChange={(e) => updateLocation(location.id, 'phone', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

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
