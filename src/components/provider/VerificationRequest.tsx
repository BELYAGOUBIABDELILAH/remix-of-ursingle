import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, CheckCircle, Clock, XCircle, Upload, FileText, AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface VerificationRequestProps {
  providerId: string;
  providerName: string;
  currentStatus: VerificationStatus;
  profileComplete: boolean;
  onStatusChange?: (status: VerificationStatus) => void;
}

export function VerificationRequest({
  providerId,
  providerName,
  currentStatus,
  profileComplete,
  onStatusChange
}: VerificationRequestProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<{
    license: File | null;
    id: File | null;
    additionalNotes: string;
  }>({
    license: null,
    id: null,
    additionalNotes: ''
  });

  const handleSubmit = async () => {
    if (!documents.license) {
      toast({
        title: "Document requis",
        description: "Veuillez télécharger votre licence professionnelle.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Mock API call - save to localStorage for demo
    try {
      const requests = JSON.parse(localStorage.getItem('ch_verification_requests') || '[]');
      requests.push({
        id: Date.now().toString(),
        providerId,
        providerName,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        documents: {
          license: documents.license?.name,
          id: documents.id?.name,
          additionalNotes: documents.additionalNotes
        }
      });
      localStorage.setItem('ch_verification_requests', JSON.stringify(requests));

      // Update provider status
      const registrations = JSON.parse(localStorage.getItem('ch_pending_registrations') || '[]');
      const updated = registrations.map((r: any) => 
        r.id === providerId ? { ...r, verificationStatus: 'pending' } : r
      );
      localStorage.setItem('ch_pending_registrations', JSON.stringify(updated));

      toast({
        title: "Demande envoyée !",
        description: "Votre demande de vérification a été soumise. Délai: 24-48h.",
      });

      onStatusChange?.('pending');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande. Réessayez.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig = {
    none: {
      icon: Shield,
      color: 'text-muted-foreground',
      bg: 'bg-muted',
      label: 'Non vérifié',
      description: 'Demandez la vérification pour obtenir le badge'
    },
    pending: {
      icon: Clock,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      label: 'En cours de vérification',
      description: 'Votre demande est en cours d\'examen (24-48h)'
    },
    approved: {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      label: 'Vérifié',
      description: 'Votre profil est vérifié et certifié'
    },
    rejected: {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      label: 'Rejeté',
      description: 'Votre demande a été rejetée. Vous pouvez soumettre à nouveau.'
    }
  };

  const config = statusConfig[currentStatus];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full", config.bg)}>
              <StatusIcon className={cn("h-5 w-5", config.color)} />
            </div>
            <div>
              <CardTitle className="text-lg">Statut de vérification</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          <Badge variant={currentStatus === 'approved' ? 'default' : 'secondary'}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      {(currentStatus === 'none' || currentStatus === 'rejected') && (
        <CardContent className="space-y-4">
          {!profileComplete && (
            <div className="flex items-start gap-3 p-4 bg-orange-500/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Profil incomplet</p>
                <p className="text-sm text-muted-foreground">
                  Complétez d'abord votre profil à 100% avant de demander la vérification.
                </p>
              </div>
            </div>
          )}

          {profileComplete && (
            <>
              <div>
                <Label htmlFor="license">Licence professionnelle *</Label>
                <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    id="license"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setDocuments({
                      ...documents,
                      license: e.target.files?.[0] || null
                    })}
                  />
                  <Label htmlFor="license" className="cursor-pointer text-sm">
                    {documents.license ? documents.license.name : 'Télécharger (PDF, JPG, PNG)'}
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="id">Pièce d'identité (optionnel)</Label>
                <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    id="id"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setDocuments({
                      ...documents,
                      id: e.target.files?.[0] || null
                    })}
                  />
                  <Label htmlFor="id" className="cursor-pointer text-sm">
                    {documents.id ? documents.id.name : 'Télécharger (optionnel)'}
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes supplémentaires</Label>
                <Textarea
                  id="notes"
                  placeholder="Informations additionnelles pour la vérification..."
                  rows={3}
                  value={documents.additionalNotes}
                  onChange={(e) => setDocuments({
                    ...documents,
                    additionalNotes: e.target.value
                  })}
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !documents.license}
                className="w-full"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Demander la vérification'}
              </Button>
            </>
          )}
        </CardContent>
      )}

      {currentStatus === 'pending' && (
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
            <Clock className="h-5 w-5 text-primary animate-pulse" />
            <div>
              <p className="font-medium text-sm">Vérification en cours</p>
              <p className="text-sm text-muted-foreground">
                Notre équipe examine vos documents. Vous recevrez une notification par email.
              </p>
            </div>
          </div>
        </CardContent>
      )}

      {currentStatus === 'approved' && (
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-sm">Profil vérifié</p>
              <p className="text-sm text-muted-foreground">
                Votre badge de vérification est visible sur votre profil public.
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
