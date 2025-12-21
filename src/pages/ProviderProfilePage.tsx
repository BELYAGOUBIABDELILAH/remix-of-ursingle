import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, Phone, Share2, Flag, Calendar, Languages, Award, Image as ImageIcon, Heart, Navigation } from "lucide-react";
import { CityHealthProvider } from "@/data/providers";
import { getProviderById } from "@/services/firestoreProviderService";
import { BookingModal } from "@/components/BookingModal";
import { ReviewSystem } from "@/components/ReviewSystem";
import { useAuth } from "@/contexts/AuthContext";
import { favoritesService } from "@/services/favoritesService";
import { toast } from "sonner";
import ProviderMap from "@/components/ProviderMap";
import { Skeleton } from "@/components/ui/skeleton";

const ProviderProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [provider, setProvider] = useState<CityHealthProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Load provider from Firestore
  useEffect(() => {
    const loadProvider = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const providerData = await getProviderById(id);
        setProvider(providerData);
        if (providerData) {
          document.title = `${providerData.name} – CityHealth Profile`;
        }
      } catch (error) {
        console.error("Error loading provider:", error);
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };
    
    loadProvider();
  }, [id]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (user?.uid && provider?.id) {
        try {
          const favorites = await favoritesService.getUserFavorites(user.uid);
          setIsFavorite(favorites.includes(provider.id));
        } catch (error) {
          console.error("Error checking favorite:", error);
        }
      }
    };
    checkFavorite();
  }, [user?.uid, provider?.id]);

  const handleFavoriteClick = async () => {
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

    if (!user?.uid || !provider) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoritesService.removeFavorite(user.uid, provider.id);
        setIsFavorite(false);
        toast.success("Retiré des favoris");
      } else {
        await favoritesService.addFavorite(user.uid, provider.id);
        setIsFavorite(true);
        toast.success("Ajouté aux favoris");
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleGetDirections = () => {
    if (!provider) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`;
    window.open(url, '_blank');
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
              {provider.verified && (
                <Badge className="verified-badge">Verified</Badge>
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
            <Button variant="ghost"><Share2 className="h-4 w-4" /></Button>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-video rounded-lg bg-muted/50" />
                ))}
              </div>
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
              <Button variant="outline" className="w-full mt-2">
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
