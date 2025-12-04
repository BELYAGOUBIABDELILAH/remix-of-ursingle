import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, XCircle, Eye, FileText, Download, Search, User 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface VerificationRequest {
  id: string;
  providerId: string;
  providerName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  documents: {
    license?: string;
    id?: string;
    additionalNotes?: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
}

export function VerificationQueue() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const stored = JSON.parse(localStorage.getItem('ch_verification_requests') || '[]');
    setRequests(stored);
  };

  const handleApprove = (request: VerificationRequest) => {
    updateRequestStatus(request.id, 'approved');
    toast({
      title: "Profil approuvé",
      description: `${request.providerName} a été vérifié avec succès.`,
    });
    setSelectedRequest(null);
  };

  const handleReject = (request: VerificationRequest) => {
    if (!reviewNotes) {
      toast({
        title: "Notes requises",
        description: "Veuillez ajouter une raison de rejet.",
        variant: "destructive"
      });
      return;
    }
    updateRequestStatus(request.id, 'rejected', reviewNotes);
    toast({
      title: "Profil rejeté",
      description: `${request.providerName} a été notifié du rejet.`,
      variant: "destructive"
    });
    setSelectedRequest(null);
    setReviewNotes('');
  };

  const updateRequestStatus = (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    const updated = requests.map(r => 
      r.id === requestId 
        ? { ...r, status, reviewedAt: new Date().toISOString(), reviewNotes: notes } 
        : r
    );
    setRequests(updated);
    localStorage.setItem('ch_verification_requests', JSON.stringify(updated));

    // Also update the provider's verification status
    const registrations = JSON.parse(localStorage.getItem('ch_pending_registrations') || '[]');
    const request = requests.find(r => r.id === requestId);
    if (request) {
      const updatedRegs = registrations.map((r: any) => 
        r.id === request.providerId ? { ...r, verificationStatus: status, verified: status === 'approved' } : r
      );
      localStorage.setItem('ch_pending_registrations', JSON.stringify(updatedRegs));
    }
  };

  const filteredRequests = requests.filter(r => 
    r.providerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>File d'attente de vérification</CardTitle>
              <CardDescription>
                {pendingCount} demande{pendingCount > 1 ? 's' : ''} en attente
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune demande de vérification</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Professionnel</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{request.providerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {request.documents.license && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            Licence
                          </Badge>
                        )}
                        {request.documents.id && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            ID
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(request.submittedAt), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          request.status === 'pending' ? 'secondary' :
                          request.status === 'approved' ? 'default' : 'destructive'
                        }
                      >
                        {request.status === 'pending' ? 'En attente' :
                         request.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleApprove(request)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Examiner la demande</DialogTitle>
            <DialogDescription>
              {selectedRequest?.providerName}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Documents soumis</h4>
                <div className="space-y-2">
                  {selectedRequest.documents.license && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">Licence professionnelle</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                    </div>
                  )}
                  {selectedRequest.documents.id && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">Pièce d'identité</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.documents.additionalNotes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Notes du demandeur</h4>
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    {selectedRequest.documents.additionalNotes}
                  </p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Notes de révision (pour rejet)</h4>
                  <Textarea
                    placeholder="Raison du rejet..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleApprove(selectedRequest)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedRequest)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              )}

              {selectedRequest.status !== 'pending' && selectedRequest.reviewNotes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Notes de révision</h4>
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    {selectedRequest.reviewNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
