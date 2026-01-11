import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, CheckCircle, Clock, XCircle, Upload, FileText, AlertCircle,
  FileSearch, Loader2, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { verifyDocumentContent } from '@/services/ocrVerificationService';
import type { VerificationResult, OCRProgress } from '@/types/ocr';

export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface VerificationRequestProps {
  providerId: string;
  providerName: string;
  currentStatus: VerificationStatus;
  profileComplete: boolean;
  onStatusChange?: (status: VerificationStatus) => void;
}

interface DocumentWithOCR {
  file: File | null;
  ocrResult: VerificationResult | null;
  ocrProgress: OCRProgress | null;
  isVerifying: boolean;
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
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [licenseDoc, setLicenseDoc] = useState<DocumentWithOCR>({
    file: null,
    ocrResult: null,
    ocrProgress: null,
    isVerifying: false,
  });
  
  const [idDoc, setIdDoc] = useState<DocumentWithOCR>({
    file: null,
    ocrResult: null,
    ocrProgress: null,
    isVerifying: false,
  });

  // Extract first and last name from provider name
  const nameParts = providerName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Auto-verify document with OCR
  const verifyDocument = useCallback(async (
    file: File,
    setDoc: React.Dispatch<React.SetStateAction<DocumentWithOCR>>,
    expectedData: { firstName?: string; lastName?: string; fullName?: string }
  ) => {
    setDoc(prev => ({ ...prev, isVerifying: true, ocrProgress: null, ocrResult: null }));
    
    try {
      const result = await verifyDocumentContent(
        file,
        expectedData,
        (progress) => {
          setDoc(prev => ({ ...prev, ocrProgress: progress }));
        }
      );
      
      setDoc(prev => ({ ...prev, ocrResult: result, isVerifying: false }));
      
      toast({
        title: result.success ? 'Document pré-vérifié ✓' : 'Vérification partielle',
        description: result.success 
          ? 'Les informations correspondent. L\'admin fera la validation finale.'
          : `Score: ${Math.round(result.overallScore)}%. L\'admin vérifiera manuellement.`,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (error) {
      setDoc(prev => ({ ...prev, isVerifying: false }));
      toast({
        title: 'Erreur OCR',
        description: 'Impossible de vérifier le document automatiquement.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleLicenseChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLicenseDoc(prev => ({ ...prev, file, ocrResult: null }));
    
    if (file) {
      // Auto-start OCR verification
      verifyDocument(file, setLicenseDoc, { 
        fullName: providerName,
        firstName,
        lastName 
      });
    }
  }, [verifyDocument, providerName, firstName, lastName]);

  const handleIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setIdDoc(prev => ({ ...prev, file, ocrResult: null }));
    
    if (file) {
      // Auto-start OCR verification
      verifyDocument(file, setIdDoc, { 
        fullName: providerName,
        firstName,
        lastName 
      });
    }
  }, [verifyDocument, providerName, firstName, lastName]);

  const handleSubmit = async () => {
    if (!licenseDoc.file) {
      toast({
        title: "Document requis",
        description: "Veuillez télécharger votre licence professionnelle.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const requests = JSON.parse(localStorage.getItem('ch_verification_requests') || '[]');
      requests.push({
        id: Date.now().toString(),
        providerId,
        providerName,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        documents: {
          license: licenseDoc.file?.name,
          licenseOCR: licenseDoc.ocrResult ? {
            success: licenseDoc.ocrResult.success,
            score: licenseDoc.ocrResult.overallScore,
            fields: licenseDoc.ocrResult.fields,
          } : null,
          id: idDoc.file?.name,
          idOCR: idDoc.ocrResult ? {
            success: idDoc.ocrResult.success,
            score: idDoc.ocrResult.overallScore,
            fields: idDoc.ocrResult.fields,
          } : null,
          additionalNotes
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
        description: licenseDoc.ocrResult?.success 
          ? "Votre demande pré-vérifiée a été soumise. Validation rapide attendue."
          : "Votre demande a été soumise. Délai: 24-48h.",
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

  const renderDocumentUpload = (
    id: string,
    label: string,
    required: boolean,
    doc: DocumentWithOCR,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    icon: React.ReactNode
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && '*'}
      </Label>
      <div className={cn(
        "border-2 border-dashed rounded-lg p-4 transition-colors",
        doc.ocrResult?.success 
          ? "border-green-500/50 bg-green-500/5" 
          : doc.ocrResult && !doc.ocrResult.success
            ? "border-amber-500/50 bg-amber-500/5"
            : "hover:border-primary"
      )}>
        <div className="text-center cursor-pointer">
          {doc.isVerifying ? (
            <div className="space-y-3">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium">{doc.ocrProgress?.statusText || 'Vérification...'}</p>
                <Progress value={doc.ocrProgress?.progress || 0} className="h-2" />
              </div>
            </div>
          ) : doc.ocrResult ? (
            <div className="space-y-2">
              <div className={cn(
                "w-12 h-12 mx-auto rounded-full flex items-center justify-center",
                doc.ocrResult.success ? "bg-green-500/20" : "bg-amber-500/20"
              )}>
                {doc.ocrResult.success ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {doc.file?.name}
                </p>
                <Badge 
                  variant={doc.ocrResult.success ? 'default' : 'outline'}
                  className={cn(
                    "mt-1",
                    doc.ocrResult.success 
                      ? "bg-green-500/10 text-green-600 border-green-500/20" 
                      : "border-amber-500/30 text-amber-600"
                  )}
                >
                  <FileSearch className="h-3 w-3 mr-1" />
                  {doc.ocrResult.success 
                    ? 'Pré-vérifié par IA' 
                    : `Score: ${Math.round(doc.ocrResult.overallScore)}%`
                  }
                </Badge>
              </div>
              <Label htmlFor={id} className="text-xs text-muted-foreground cursor-pointer hover:text-primary">
                Changer le fichier
              </Label>
            </div>
          ) : (
            <>
              {icon}
              <Label htmlFor={id} className="cursor-pointer text-sm block">
                {doc.file ? doc.file.name : `Télécharger (PDF, JPG, PNG)`}
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                <FileSearch className="h-3 w-3 inline mr-1" />
                Vérification automatique à l'upload
              </p>
            </>
          )}
          <Input
            id={id}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={onChange}
          />
        </div>
      </div>
      
      {/* OCR Results Details */}
      {doc.ocrResult && (
        <div className="space-y-1 pl-2 border-l-2 border-muted">
          {Object.entries(doc.ocrResult.fields).map(([key, field]) => field && (
            <div key={key} className="flex items-center gap-2 text-xs">
              {field.found ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-destructive" />
              )}
              <span className="text-muted-foreground">
                {key === 'firstName' ? 'Prénom' : 
                 key === 'lastName' ? 'Nom' : 
                 key === 'fullName' ? 'Nom complet' : key}:
              </span>
              <span className={field.found ? 'text-green-600' : 'text-destructive'}>
                {Math.round(field.similarity * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

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
              {/* OCR Info Banner */}
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <FileSearch className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Vérification automatique par IA</p>
                  <p className="text-sm text-muted-foreground">
                    Vos documents seront pré-vérifiés automatiquement pour accélérer le processus.
                  </p>
                </div>
              </div>

              {renderDocumentUpload(
                'license',
                'Licence professionnelle',
                true,
                licenseDoc,
                handleLicenseChange,
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              )}

              {renderDocumentUpload(
                'id',
                'Pièce d\'identité',
                false,
                idDoc,
                handleIdChange,
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              )}

              <div>
                <Label htmlFor="notes">Notes supplémentaires</Label>
                <Textarea
                  id="notes"
                  placeholder="Informations additionnelles pour la vérification..."
                  rows={3}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                />
              </div>

              {/* Pre-verification status summary */}
              {(licenseDoc.ocrResult || idDoc.ocrResult) && (
                <div className={cn(
                  "p-3 rounded-lg",
                  licenseDoc.ocrResult?.success 
                    ? "bg-green-500/10 border border-green-500/20" 
                    : "bg-amber-500/10 border border-amber-500/20"
                )}>
                  <div className="flex items-center gap-2">
                    {licenseDoc.ocrResult?.success ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-700">
                          Documents pré-vérifiés - Validation accélérée
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-700">
                          Vérification manuelle requise par l'admin
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !licenseDoc.file || licenseDoc.isVerifying || idDoc.isVerifying}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : licenseDoc.ocrResult?.success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Soumettre (Pré-vérifié)
                  </>
                ) : (
                  'Demander la vérification'
                )}
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
