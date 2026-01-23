import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, FileWarning } from 'lucide-react';
import { SENSITIVE_FIELD_LABELS, type SensitiveField } from '@/constants/sensitiveFields';

interface VerificationRevokedBannerProps {
  revokedReason?: string;
  revokedAt?: Date | string;
  onGoToVerification?: () => void;
}

export function VerificationRevokedBanner({ 
  revokedReason, 
  revokedAt,
  onGoToVerification 
}: VerificationRevokedBannerProps) {
  // Parse the revoked reason to extract field names
  const modifiedFields = revokedReason?.startsWith('Modified:') 
    ? revokedReason.replace('Modified:', '').trim().split(', ')
    : [];

  const formattedDate = revokedAt 
    ? new Date(revokedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
      <FileWarning className="h-5 w-5 text-amber-500" />
      <AlertTitle className="text-amber-600 text-lg flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Vérification révoquée
      </AlertTitle>
      <AlertDescription className="text-amber-700 mt-2 space-y-3">
        <p>
          Votre statut vérifié a été révoqué suite à la modification de données sensibles.
          Votre profil n'est plus visible publiquement.
        </p>
        
        {modifiedFields.length > 0 && (
          <div className="bg-amber-500/10 rounded-lg p-3">
            <p className="font-medium text-sm mb-2">Champs modifiés :</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {modifiedFields.map((field) => (
                <li key={field}>
                  {SENSITIVE_FIELD_LABELS[field as SensitiveField] || field}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {formattedDate && (
          <p className="text-xs text-amber-600/80">
            Révoqué le {formattedDate}
          </p>
        )}
        
        <div className="pt-2">
          <Button 
            onClick={onGoToVerification}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Soumettre une nouvelle vérification
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
