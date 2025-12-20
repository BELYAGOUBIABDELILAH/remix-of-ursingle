import { useCallback, useState } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Image, Upload, X, CheckCircle2, AlertCircle,
  Shield, Camera, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProviderFormData } from './types';
import { useToast } from '@/hooks/use-toast';

interface Step5MediaUploadProps {
  formData: ProviderFormData;
  updateFormData: (data: Partial<ProviderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface UploadedFile {
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  type: 'credential' | 'gallery';
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES: Accept = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};
const ACCEPTED_DOC_TYPES: Accept = {
  ...ACCEPTED_IMAGE_TYPES,
  'application/pdf': ['.pdf'],
};

export function Step5MediaUpload({ formData, updateFormData, onNext, onPrev }: Step5MediaUploadProps) {
  const { toast } = useToast();
  const [credentialFiles, setCredentialFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Simulate file upload progress
  const simulateUpload = useCallback((file: File, type: 'credential' | 'gallery'): Promise<UploadedFile> => {
    return new Promise((resolve) => {
      const preview = URL.createObjectURL(file);
      const uploadedFile: UploadedFile = {
        file,
        preview,
        progress: 0,
        status: 'uploading',
        type,
      };

      // Simulate gradual progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve({
            ...uploadedFile,
            progress: 100,
            status: 'complete',
          });
        }
      }, 200);
    });
  }, []);

  // Credentials dropzone
  const onDropCredentials = useCallback(async (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Fichier trop volumineux",
          description: `${file.name} dépasse la limite de 5MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    const uploaded = await Promise.all(
      validFiles.map(file => simulateUpload(file, 'credential'))
    );
    
    setCredentialFiles(prev => [...prev, ...uploaded]);
    updateFormData({
      verificationDocuments: [
        ...(formData.verificationDocuments || []),
        ...validFiles.map(f => ({ name: f.name, type: 'license' as const }))
      ]
    });
    setIsUploading(false);

    toast({
      title: "Documents téléchargés",
      description: `${validFiles.length} document(s) ajouté(s) avec succès`,
    });
  }, [formData.verificationDocuments, simulateUpload, toast, updateFormData]);

  // Gallery dropzone  
  const onDropGallery = useCallback(async (acceptedFiles: File[]) => {
    const totalPhotos = formData.galleryPreviews.length + acceptedFiles.length;
    
    if (totalPhotos > 10) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez pas ajouter plus de 10 photos",
        variant: "destructive",
      });
      return;
    }

    const validFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Fichier trop volumineux",
          description: `${file.name} dépasse la limite de 5MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    await Promise.all(validFiles.map(file => simulateUpload(file, 'gallery')));
    
    const previews = validFiles.map(f => URL.createObjectURL(f));
    updateFormData({
      galleryPhotos: [...formData.galleryPhotos, ...validFiles],
      galleryPreviews: [...formData.galleryPreviews, ...previews],
    });
    setIsUploading(false);

    toast({
      title: "Photos téléchargées",
      description: `${validFiles.length} photo(s) ajoutée(s) avec succès`,
    });
  }, [formData.galleryPhotos, formData.galleryPreviews, simulateUpload, toast, updateFormData]);

  const {
    getRootProps: getCredentialsRootProps,
    getInputProps: getCredentialsInputProps,
    isDragActive: isCredentialsDragActive,
  } = useDropzone({
    onDrop: onDropCredentials,
    accept: ACCEPTED_DOC_TYPES,
    maxSize: MAX_FILE_SIZE,
  });

  const {
    getRootProps: getGalleryRootProps,
    getInputProps: getGalleryInputProps,
    isDragActive: isGalleryDragActive,
  } = useDropzone({
    onDrop: onDropGallery,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 10 - formData.galleryPreviews.length,
  });

  const removeCredentialFile = (index: number) => {
    setCredentialFiles(prev => prev.filter((_, i) => i !== index));
    updateFormData({
      verificationDocuments: formData.verificationDocuments?.filter((_, i) => i !== index)
    });
  };

  const removeGalleryPhoto = (index: number) => {
    URL.revokeObjectURL(formData.galleryPreviews[index]);
    updateFormData({
      galleryPhotos: formData.galleryPhotos.filter((_, i) => i !== index),
      galleryPreviews: formData.galleryPreviews.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Espace Documents & Médias
          </h2>
        </div>
        <p className="text-muted-foreground">
          Téléchargez vos documents professionnels et photos de votre établissement
        </p>
      </div>

      {/* Professional Credentials Zone */}
      <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Documents Professionnels
            <Badge variant="secondary" className="ml-auto">Requis</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Licences médicales, certificats, autorisations d'exercice
          </p>
        </CardHeader>
        <CardContent>
          <div
            {...getCredentialsRootProps()}
            className={cn(
              "relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200",
              isCredentialsDragActive
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <input {...getCredentialsInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                isCredentialsDragActive ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <Upload className="h-8 w-8" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {isCredentialsDragActive
                    ? "Déposez vos documents ici..."
                    : "Glissez-déposez vos documents"
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ou <span className="text-primary font-medium">parcourez</span> vos fichiers
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline">PDF</Badge>
                <Badge variant="outline">JPG</Badge>
                <Badge variant="outline">PNG</Badge>
                <Badge variant="outline">Max 5MB</Badge>
              </div>
            </div>
          </div>

          {/* Uploaded credentials list */}
          {credentialFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {credentialFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.file.size / 1024).toFixed(1)} KB
                    </p>
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="h-1 mt-1" />
                    )}
                  </div>
                  {file.status === 'complete' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => removeCredentialFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Facility Gallery Zone */}
      <Card className="border-2 border-dashed border-accent/30 hover:border-accent/50 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5 text-accent" />
            Galerie de l'établissement
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {formData.galleryPreviews.length}/10 photos
            </span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Photos de votre cabinet, équipements, équipe médicale
          </p>
        </CardHeader>
        <CardContent>
          <div
            {...getGalleryRootProps()}
            className={cn(
              "relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200",
              isGalleryDragActive
                ? "border-accent bg-accent/5 scale-[1.02]"
                : "border-muted-foreground/30 hover:border-accent/50 hover:bg-muted/50",
              formData.galleryPreviews.length >= 10 && "pointer-events-none opacity-50"
            )}
          >
            <input {...getGalleryInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                isGalleryDragActive ? "bg-accent text-accent-foreground" : "bg-muted"
              )}>
                <Image className="h-8 w-8" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {formData.galleryPreviews.length >= 10
                    ? "Limite de photos atteinte"
                    : isGalleryDragActive
                    ? "Déposez vos photos ici..."
                    : "Glissez-déposez vos photos"
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Photos haute qualité recommandées (min. 800x600px)
                </p>
              </div>
            </div>
          </div>

          {/* Gallery grid preview */}
          {formData.galleryPreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {formData.galleryPreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-xl overflow-hidden group border-2 border-transparent hover:border-primary transition-colors"
                >
                  <img
                    src={preview}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeGalleryPhoto(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {index === 0 && (
                    <Badge className="absolute top-2 left-2 bg-primary/90">
                      Principale
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Info */}
      <div className="bg-muted/50 p-4 rounded-lg border flex items-start gap-3">
        <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Stockage sécurisé</p>
          <p>
            Vos documents professionnels sont stockés de manière sécurisée et ne sont accessibles 
            qu'à notre équipe de vérification. Les photos de galerie seront visibles publiquement 
            après validation.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          Précédent
        </Button>
        <Button onClick={onNext}>
          Continuer vers l'aperçu
        </Button>
      </div>
    </div>
  );
}
