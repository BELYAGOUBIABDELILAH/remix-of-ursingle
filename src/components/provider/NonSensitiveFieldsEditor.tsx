import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Paintbrush, CheckCircle2 } from 'lucide-react';
import { ScheduleEditor } from './ScheduleEditor';
import { PhotoGalleryManager } from './PhotoGalleryManager';
import { ProfileServicesEditor } from './ProfileServicesEditor';
import type { WeeklySchedule } from '@/data/providers';

interface NonSensitiveFieldsData {
  description: string;
  specialty: string;
  schedule: WeeklySchedule | null;
  accessible: boolean;
  emergency: boolean;
  photos: string[];
  services: string[];
  specialties: string[];
  insurances: string[];
  accessibility: string[];
}

interface NonSensitiveFieldsEditorProps {
  data: NonSensitiveFieldsData;
  isVerified: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  onDataChange: <K extends keyof NonSensitiveFieldsData>(
    field: K, 
    value: NonSensitiveFieldsData[K]
  ) => void;
  onSave: () => Promise<void>;
}

export function NonSensitiveFieldsEditor({
  data,
  isVerified,
  isSaving,
  hasChanges,
  onDataChange,
  onSave,
}: NonSensitiveFieldsEditorProps) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Paintbrush className="h-5 w-5 text-green-600" />
                Profil public
                <Badge variant="outline" className="ml-2 text-green-600 border-green-500/50">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Édition libre
                </Badge>
              </CardTitle>
              <CardDescription>
                {isVerified 
                  ? 'Personnalisez votre profil sans impact sur votre vérification.'
                  : 'Ces informations seront visibles après validation.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Description & Specialty */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description & Spécialité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="description">Description de l'établissement</Label>
            <Textarea
              id="description"
              rows={4}
              value={data.description}
              onChange={(e) => onDataChange('description', e.target.value)}
              placeholder="Décrivez votre établissement, vos services, votre expérience..."
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Une bonne description améliore votre visibilité dans les recherches.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Horaires d'ouverture</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleEditor
            value={data.schedule}
            onChange={(schedule) => onDataChange('schedule', schedule)}
            isEmergency={data.emergency}
          />
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Caractéristiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="accessible"
                checked={data.accessible}
                onCheckedChange={(checked) => onDataChange('accessible', !!checked)}
              />
              <Label htmlFor="accessible" className="font-normal">
                Accès PMR (personnes à mobilité réduite)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emergency"
                checked={data.emergency}
                onCheckedChange={(checked) => onDataChange('emergency', !!checked)}
              />
              <Label htmlFor="emergency" className="font-normal">
                Urgences 24/7
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Galerie photos ({data.photos.length}/10)</CardTitle>
          <CardDescription>
            Ajoutez des photos de votre établissement pour attirer plus de patients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoGalleryManager
            photos={data.photos}
            onPhotosChange={(photos) => onDataChange('photos', photos)}
            maxPhotos={10}
          />
        </CardContent>
      </Card>

      {/* Services & Specialties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Services, Assurances & Accessibilité</CardTitle>
          <CardDescription>
            Détails supplémentaires pour améliorer votre visibilité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileServicesEditor
            services={data.services}
            specialties={data.specialties}
            insurances={data.insurances}
            accessibility={data.accessibility}
            onServicesChange={(services) => onDataChange('services', services)}
            onSpecialtiesChange={(specialties) => onDataChange('specialties', specialties)}
            onInsurancesChange={(insurances) => onDataChange('insurances', insurances)}
            onAccessibilityChange={(accessibility) => onDataChange('accessibility', accessibility)}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={onSave}
        disabled={isSaving || !hasChanges}
        className="w-full"
        size="lg"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer le profil
            {hasChanges && <span className="ml-2 text-xs bg-primary-foreground/20 px-1.5 py-0.5 rounded">●</span>}
          </>
        )}
      </Button>
    </div>
  );
}
