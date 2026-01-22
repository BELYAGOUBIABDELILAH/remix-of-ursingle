import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, Trash2, Star, Image as ImageIcon, GripVertical, 
  Loader2, X, ZoomIn, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PhotoGalleryManagerProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  className?: string;
}

export function PhotoGalleryManager({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  className,
}: PhotoGalleryManagerProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (photos.length + acceptedFiles.length > maxPhotos) {
      toast({
        title: "Limite atteinte",
        description: `Vous pouvez ajouter maximum ${maxPhotos} photos.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // For now, create object URLs (in production, upload to Firebase Storage)
      const newPhotoUrls = acceptedFiles.map(file => URL.createObjectURL(file));
      onPhotosChange([...photos, ...newPhotoUrls]);
      
      toast({
        title: "Photos ajoutées",
        description: `${acceptedFiles.length} photo(s) ajoutée(s) avec succès.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les photos.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [photos, onPhotosChange, maxPhotos, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading || photos.length >= maxPhotos,
  });

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    toast({
      title: "Photo supprimée",
      description: "La photo a été retirée de votre galerie.",
    });
  };

  const setAsPrimary = (index: number) => {
    if (index === 0) return;
    const newPhotos = [...photos];
    const [photo] = newPhotos.splice(index, 1);
    newPhotos.unshift(photo);
    onPhotosChange(newPhotos);
    toast({
      title: "Photo principale définie",
      description: "Cette photo apparaîtra en premier sur votre profil.",
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newPhotos = [...photos];
    const [draggedPhoto] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(index, 0, draggedPhoto);
    onPhotosChange(newPhotos);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Galerie photos
            </CardTitle>
            <CardDescription>
              Ajoutez jusqu'à {maxPhotos} photos de votre établissement
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {photos.length}/{maxPhotos}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive && "border-primary bg-primary/5",
            uploading && "opacity-50 cursor-not-allowed",
            photos.length >= maxPhotos && "opacity-50 cursor-not-allowed",
            !isDragActive && !uploading && photos.length < maxPhotos && "hover:border-primary hover:bg-primary/5"
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Ajout en cours...</p>
            </div>
          ) : photos.length >= maxPhotos ? (
            <div className="flex flex-col items-center gap-2">
              <Check className="h-8 w-8 text-green-500" />
              <p className="text-sm text-muted-foreground">Galerie complète</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                {isDragActive ? "Déposez les images ici" : "Glissez-déposez ou cliquez pour ajouter"}
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP • Max 5MB par image
              </p>
            </div>
          )}
        </div>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={`${photo}-${index}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 group cursor-move",
                  index === 0 && "ring-2 ring-primary ring-offset-2",
                  draggedIndex === index && "opacity-50 scale-95"
                )}
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="secondary" className="h-8 w-8">
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-auto max-h-[80vh] object-contain"
                      />
                    </DialogContent>
                  </Dialog>
                  
                  {index !== 0 && (
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-8 w-8"
                      onClick={() => setAsPrimary(index)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="h-8 w-8"
                    onClick={() => removePhoto(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Primary Badge */}
                {index === 0 && (
                  <Badge className="absolute top-2 left-2 bg-primary">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Principale
                  </Badge>
                )}

                {/* Drag Handle */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-5 w-5 text-white drop-shadow-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {photos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune photo ajoutée</p>
            <p className="text-sm">Les photos aident les patients à reconnaître votre établissement</p>
          </div>
        )}

        {/* Tips */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">💡 Conseils pour de bonnes photos</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• La première photo apparaît dans les résultats de recherche</li>
            <li>• Montrez l'entrée, la salle d'attente et les espaces de consultation</li>
            <li>• Utilisez un bon éclairage naturel</li>
            <li>• Glissez-déposez pour réorganiser l'ordre</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
