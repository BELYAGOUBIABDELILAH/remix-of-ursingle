import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  CheckCircle, XCircle, Eye, Image as ImageIcon, Search, Calendar, User 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { MedicalAd } from '@/components/provider/MedicalAdsManager';

export function MedicalAdsModeration() {
  const { toast } = useToast();
  const [ads, setAds] = useState<MedicalAd[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAd, setSelectedAd] = useState<MedicalAd | null>(null);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = () => {
    const stored = JSON.parse(localStorage.getItem('ch_medical_ads') || '[]');
    setAds(stored);
  };

  const handleApprove = (ad: MedicalAd) => {
    updateAdStatus(ad.id, 'approved');
    toast({
      title: "Annonce approuvée",
      description: `L'annonce "${ad.title}" est maintenant visible.`,
    });
    setSelectedAd(null);
  };

  const handleReject = (ad: MedicalAd) => {
    updateAdStatus(ad.id, 'rejected');
    toast({
      title: "Annonce rejetée",
      description: `L'annonce "${ad.title}" a été rejetée.`,
      variant: "destructive"
    });
    setSelectedAd(null);
  };

  const updateAdStatus = (adId: string, status: 'approved' | 'rejected') => {
    const updated = ads.map(a => 
      a.id === adId ? { ...a, status } : a
    );
    setAds(updated);
    localStorage.setItem('ch_medical_ads', JSON.stringify(updated));
  };

  const filteredAds = ads.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.providerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = ads.filter(a => a.status === 'pending').length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Modération des annonces</CardTitle>
              <CardDescription>
                {pendingCount} annonce{pendingCount > 1 ? 's' : ''} en attente de validation
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
          {filteredAds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune annonce à modérer</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Annonce</TableHead>
                  <TableHead>Professionnel</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {ad.imageUrl ? (
                          <img 
                            src={ad.imageUrl} 
                            alt={ad.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{ad.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {ad.content}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{ad.providerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(ad.createdAt), 'dd MMM', { locale: fr })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          ad.status === 'pending' ? 'secondary' :
                          ad.status === 'approved' ? 'default' : 'destructive'
                        }
                      >
                        {ad.status === 'pending' ? 'En attente' :
                         ad.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedAd(ad)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {ad.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleApprove(ad)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleReject(ad)}
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

      {/* Preview Dialog */}
      <Dialog open={!!selectedAd} onOpenChange={() => setSelectedAd(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Aperçu de l'annonce</DialogTitle>
            <DialogDescription>
              Par {selectedAd?.providerName}
            </DialogDescription>
          </DialogHeader>
          {selectedAd && (
            <div className="space-y-4 py-4">
              {selectedAd.imageUrl && (
                <img 
                  src={selectedAd.imageUrl} 
                  alt={selectedAd.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg">{selectedAd.title}</h3>
                <p className="text-muted-foreground mt-2">{selectedAd.content}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                <span>Créée le {format(new Date(selectedAd.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
                <span>Expire le {format(new Date(selectedAd.expiresAt), 'dd MMM yyyy', { locale: fr })}</span>
              </div>

              {selectedAd.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => handleApprove(selectedAd)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedAd)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
