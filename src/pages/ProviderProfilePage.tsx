import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Star, Phone, Share2, Flag, Calendar, Languages, Award, Image as ImageIcon, Heart, Navigation, Copy, Check, QrCode, Clock } from "lucide-react";
import { useProvider } from "@/hooks/useProviders";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { BookingModal } from "@/components/BookingModal";
import { ReviewSystem } from "@/components/ReviewSystem";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ProviderMap from "@/components/ProviderMap";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeSVG } from 'qrcode.react';
import { getProviderGallery, getDefaultSchedule } from "@/data/providerAssets";

const ProviderProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Get current URL for sharing
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Use TanStack Query for provider data
  const { data: provider, isLoading: loading, isError } = useProvider(id);
  
  // Use TanStack Query for favorites
  const { data: favorites = [] } = useFavorites();
  const { toggle: toggleFavorite, isLoading: favoriteLoading } = useToggleFavorite();
  
  const isFavorite = provider ? favorites.includes(provider.id) : false;

  // Update document title when provider loads
  useEffect(() => {
    if (provider) {
      document.title = `${provider.name} – CityHealth Profile`;
    }
  }, [provider]);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      toast.error("Connexion requise", {
        description: "Veuillez vous connecter pour ajouter aux favoris",
        action: {
          label: "Se connecter",
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }

    if (!provider) return;
    toggleFavorite(provider.id);
    toast.success(isFavorite ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  const handleGetDirections = () => {
    if (!provider) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Lien copié!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  const handleNativeShare = async () => {
    if (!provider) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: provider.name,
          text: `Découvrez ${provider.name} sur CityHealth`,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };


  if (loading) {
    return (
      <main className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Skeleton className="w-28 h-28 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (!provider) {
    return (
      <main className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <h2 className="text-xl font-semibold mb-2">Prestataire non trouvé</h2>
            <p className="text-muted-foreground mb-4">
              Le profil demandé n'existe pas ou a été supprimé.
            </p>
            <Button onClick={() => navigate('/search')}>
              Retour à la recherche
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <section className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-28 h-28 rounded-xl bg-primary/10 grid place-items-center text-primary">
            <ImageIcon className="h-10 w-10" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{provider.name}</h1>
              {(provider.verified || provider.verificationStatus === 'verified') && (
                <Badge className="verified-badge">Vérifié</Badge>
              )}
              {provider.emergency && (
                <Badge variant="destructive">Urgences</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{provider.specialty || provider.type}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="inline-flex items-center gap-1 rating-stars">
                <Star className="h-4 w-4" /> {provider.rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">{provider.reviewsCount} avis</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setBookingOpen(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Prendre RDV
            </Button>
            <Button 
              variant={isFavorite ? "default" : "outline"} 
              onClick={handleFavoriteClick}
              disabled={favoriteLoading}
            >
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? "Favori" : "Ajouter aux Favoris"}
            </Button>
            
            {/* Share Dialog with QR Code */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost"><Share2 className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Partager ce profil</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* QR Code */}
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <QRCodeSVG 
                      value={shareUrl} 
                      size={180}
                      level="M"
                      includeMargin
                    />
                  </div>
                  
                  {/* Copy Link */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-lg text-sm bg-muted"
                    />
                    <Button size="sm" onClick={handleCopyLink}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {/* Native Share (mobile) */}
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <Button className="w-full" onClick={handleNativeShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Partager
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost"><Flag className="h-4 w-4" /></Button>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* About */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>À propos</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>{provider.description}</p>
              {provider.specialty && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{provider.specialty}</Badge>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4" /> {provider.area}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Languages className="h-4 w-4" /> Langues: {provider.languages.join(", ")}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>Galerie</CardTitle></CardHeader>
            <CardContent>
              {(() => {
                const gallery = provider.gallery?.length ? provider.gallery : getProviderGallery(provider.type);
                return (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {gallery.slice(0, 6).map((img, i) => (
                      <Dialog key={i}>
                        <DialogTrigger asChild>
                          <div className="aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                            <img 
                              src={img} 
                              alt={`${provider.name} - Photo ${i + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <img 
                            src={img.replace('w=600', 'w=1200')} 
                            alt={`${provider.name} - Photo ${i + 1}`}
                            className="w-full h-auto rounded-lg"
                          />
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Reviews */}
          <ReviewSystem 
            providerId={provider.id}
            providerName={provider.name}
            canReview={true}
            isProvider={false}
          />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Contact */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>Contact</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {provider.address}</div>
              <a href={`tel:${provider.phone}`} className="inline-flex items-center gap-2 underline">
                <Phone className="h-4 w-4" /> {provider.phone}
              </a>
              <div className="text-xs text-muted-foreground">
                {provider.isOpen ? "Ouvert maintenant" : "Fermé"}
              </div>
              
              {/* Opening Hours */}
              {(() => {
                const schedule = provider.schedule || getDefaultSchedule(provider.type, provider.emergency);
                const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
                const dayLabels: Record<string, string> = {
                  lundi: 'Lun', mardi: 'Mar', mercredi: 'Mer', jeudi: 'Jeu',
                  vendredi: 'Ven', samedi: 'Sam', dimanche: 'Dim'
                };
                return (
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                      <Clock className="h-4 w-4" /> Horaires
                    </div>
                    <div className="space-y-1 text-xs">
                      {days.map(day => {
                        const hours = schedule[day as keyof typeof schedule] as { open: string; close: string; closed?: boolean } | undefined;
                        if (!hours) return null;
                        const isClosed = ('closed' in hours && hours.closed) || (hours.open === '00:00' && hours.close === '00:00');
                        const is24h = hours.open === '00:00' && hours.close === '23:59';
                        return (
                          <div key={day} className="flex justify-between">
                            <span className="text-muted-foreground">{dayLabels[day]}</span>
                            <span className={isClosed ? 'text-destructive' : ''}>
                              {isClosed ? 'Fermé' : is24h ? '24h/24' : `${hours.open} - ${hours.close}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              
              <Button variant="outline" className="w-full mt-4">
                <Calendar className="h-4 w-4 mr-2" /> Voir disponibilités
              </Button>
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>Localisation</CardTitle></CardHeader>
            <CardContent>
              <ProviderMap 
                lat={provider.lat} 
                lng={provider.lng} 
                name={provider.name}
                address={provider.address}
              />
              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={handleGetDirections}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Itinéraire
              </Button>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>Annonces</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-primary/10">Nouveau service disponible ce mois.</div>
              <div className="p-3 rounded-lg bg-secondary/10">Horaires étendus le samedi.</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal 
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        providerName={provider.name}
        providerId={provider.id}
      />
    </main>
  );
};

export default ProviderProfilePage;
