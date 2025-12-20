import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Stethoscope, Search, Plus, X, Accessibility, Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ProviderFormData, 
  SERVICE_CATEGORIES, 
  MEDICAL_SPECIALTIES, 
  EQUIPMENT_OPTIONS, 
  ACCESSIBILITY_OPTIONS,
  LANGUAGES_OPTIONS,
  getTypeSpecificFields
} from './types';
import { TypeSpecificFields } from './TypeSpecificFields';

interface Step4Props {
  formData: ProviderFormData;
  updateFormData: (data: Partial<ProviderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step4Services({ formData, updateFormData, onNext, onPrev }: Step4Props) {
  const [searchService, setSearchService] = useState('');
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.serviceCategories.length === 0) {
      newErrors.serviceCategories = 'Sélectionnez au moins une catégorie de service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const toggleArrayItem = (field: 'serviceCategories' | 'specialties' | 'equipment' | 'accessibilityFeatures' | 'languages', item: string) => {
    const current = formData[field] as string[];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateFormData({ [field]: updated });
  };

  const addDepartment = () => {
    if (newDepartment.trim() && !formData.departments.includes(newDepartment.trim())) {
      updateFormData({ departments: [...formData.departments, newDepartment.trim()] });
      setNewDepartment('');
    }
  };

  const removeDepartment = (dept: string) => {
    updateFormData({ departments: formData.departments.filter(d => d !== dept) });
  };

  const filteredServices = SERVICE_CATEGORIES.filter(s =>
    s.toLowerCase().includes(searchService.toLowerCase())
  );

  const filteredSpecialties = MEDICAL_SPECIALTIES.filter(s =>
    s.toLowerCase().includes(searchSpecialty.toLowerCase())
  );

  const hasTypeSpecificFields = Object.keys(getTypeSpecificFields(formData.providerType)).length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Services & Spécialisations
          </h2>
        </div>
        <p className="text-muted-foreground">
          Décrivez précisément vos services pour une meilleure visibilité
        </p>
      </div>

      {/* Type-Specific Fields (Blood Cabin, Radiology, Equipment) */}
      {hasTypeSpecificFields && (
        <TypeSpecificFields formData={formData} updateFormData={updateFormData} />
      )}

      {/* Service Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Catégories de services
            <span className="text-sm font-normal text-muted-foreground">
              {formData.serviceCategories.length} sélectionnée(s)
            </span>
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un service..."
              className="pl-10"
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {filteredServices.map((service) => (
              <div
                key={service}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                  formData.serviceCategories.includes(service)
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted"
                )}
                onClick={() => toggleArrayItem('serviceCategories', service)}
              >
                <Checkbox
                  checked={formData.serviceCategories.includes(service)}
                  onCheckedChange={() => toggleArrayItem('serviceCategories', service)}
                />
                <Label className="text-sm cursor-pointer">{service}</Label>
              </div>
            ))}
          </div>
          {errors.serviceCategories && (
            <p className="text-sm text-destructive mt-2">{errors.serviceCategories}</p>
          )}
        </CardContent>
      </Card>

      {/* Medical Specialties */}
      {(formData.providerType === 'doctor' || formData.providerType === 'clinic' || formData.providerType === 'hospital') && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Spécialités médicales
              <span className="text-sm font-normal text-muted-foreground">
                {formData.specialties.length} sélectionnée(s)
              </span>
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une spécialité..."
                className="pl-10"
                value={searchSpecialty}
                onChange={(e) => setSearchSpecialty(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {filteredSpecialties.map((specialty) => (
                <div
                  key={specialty}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                    formData.specialties.includes(specialty)
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted"
                  )}
                  onClick={() => toggleArrayItem('specialties', specialty)}
                >
                  <Checkbox
                    checked={formData.specialties.includes(specialty)}
                    onCheckedChange={() => toggleArrayItem('specialties', specialty)}
                  />
                  <Label className="text-sm cursor-pointer">{specialty}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Departments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Départements / Services</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ajoutez les départements de votre établissement
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Ex: Service de cardiologie"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDepartment())}
            />
            <Button type="button" onClick={addDepartment}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.departments.map((dept) => (
              <Badge key={dept} variant="secondary" className="px-3 py-1">
                {dept}
                <button
                  type="button"
                  onClick={() => removeDepartment(dept)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {formData.departments.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun département ajouté</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Équipements disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {EQUIPMENT_OPTIONS.map((equipment) => (
              <div
                key={equipment}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                  formData.equipment.includes(equipment)
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted"
                )}
                onClick={() => toggleArrayItem('equipment', equipment)}
              >
                <Checkbox
                  checked={formData.equipment.includes(equipment)}
                  onCheckedChange={() => toggleArrayItem('equipment', equipment)}
                />
                <Label className="text-sm cursor-pointer">{equipment}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Accessibilité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ACCESSIBILITY_OPTIONS.map((option) => (
              <div
                key={option}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors",
                  formData.accessibilityFeatures.includes(option)
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted"
                )}
                onClick={() => toggleArrayItem('accessibilityFeatures', option)}
              >
                <Checkbox
                  checked={formData.accessibilityFeatures.includes(option)}
                  onCheckedChange={() => toggleArrayItem('accessibilityFeatures', option)}
                />
                <Label className="text-sm cursor-pointer">{option}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Langues parlées par le personnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {LANGUAGES_OPTIONS.map((lang) => (
              <div
                key={lang.code}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-full border cursor-pointer transition-colors",
                  formData.languages.includes(lang.code)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                )}
                onClick={() => toggleArrayItem('languages', lang.code)}
              >
                <span className="text-sm font-medium">{lang.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
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
