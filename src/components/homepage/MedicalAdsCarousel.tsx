import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BadgeCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface MedicalAd {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  description: string;
  imageUrl: string;
  specialty: string;
  isVerified: boolean;
  status: 'approved';
}

// Mock approved ads - in production, fetch from backend
const getMockApprovedAds = (): MedicalAd[] => {
  const storedAds = localStorage.getItem('medicalAds');
  if (storedAds) {
    const allAds = JSON.parse(storedAds);
    return allAds.filter((ad: any) => ad.status === 'approved');
  }
  
  // Default demo ads
  return [
    {
      id: '1',
      providerId: 'provider-1',
      providerName: 'Dr. Amina Benali',
      title: 'Consultation Cardiologie',
      description: 'Spécialiste en cardiologie avec 15 ans d\'expérience. Consultations disponibles du lundi au vendredi.',
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600',
      specialty: 'Cardiologie',
      isVerified: true,
      status: 'approved'
    },
    {
      id: '2',
      providerId: 'provider-2',
      providerName: 'Clinique El Nour',
      title: 'Imagerie Médicale Avancée',
      description: 'Scanner, IRM, échographie - Équipements dernière génération. Résultats en 24h.',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600',
      specialty: 'Imagerie',
      isVerified: true,
      status: 'approved'
    },
    {
      id: '3',
      providerId: 'provider-3',
      providerName: 'Dr. Karim Mansouri',
      title: 'Dentisterie Esthétique',
      description: 'Blanchiment, implants, couronnes. Transformez votre sourire avec les techniques les plus modernes.',
      imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600',
      specialty: 'Dentiste',
      isVerified: true,
      status: 'approved'
    },
    {
      id: '4',
      providerId: 'provider-4',
      providerName: 'Pharmacie Centrale',
      title: 'Pharmacie de Garde 24/7',
      description: 'Service de garde tous les jours. Livraison à domicile disponible dans tout Sidi Bel Abbès.',
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600',
      specialty: 'Pharmacie',
      isVerified: true,
      status: 'approved'
    }
  ];
};

export const MedicalAdsCarousel = () => {
  const [ads, setAds] = useState<MedicalAd[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true })
  ]);

  useEffect(() => {
    setAds(getMockApprovedAds());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  if (ads.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30" aria-labelledby="medical-ads-title">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30 text-primary">
            Annonces Partenaires
          </Badge>
          <h2 id="medical-ads-title" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Services de Santé à Découvrir
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les offres de nos partenaires de santé vérifiés à Sidi Bel Abbès
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Main Carousel with Embla */}
          <div className="overflow-hidden rounded-2xl shadow-xl" ref={emblaRef}>
            <div className="flex">
              {ads.map((ad) => (
                <div 
                  key={ad.id}
                  className="flex-shrink-0 w-full"
                >
                  <div className="relative h-[400px] md:h-[450px] group">
                    {/* Background Image with lazy loading */}
                    <img
                      src={ad.imageUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      aria-hidden="true"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground">
                          {ad.specialty}
                        </Badge>
                        {ad.isVerified && (
                          <Badge variant="secondary" className="bg-emerald-500/90 text-white">
                            <BadgeCheck className="w-3 h-3 mr-1" aria-hidden="true" />
                            Vérifié
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {ad.title}
                      </h3>
                      
                      <p className="text-white/80 text-sm mb-1">
                        Par {ad.providerName}
                      </p>
                      
                      <p className="text-white/70 text-sm md:text-base mb-6 max-w-2xl line-clamp-2">
                        {ad.description}
                      </p>
                      
                      <Link to={`/provider/${ad.providerId}`}>
                        <Button 
                          className="bg-white text-foreground hover:bg-white/90 shadow-lg group/btn"
                        >
                          Voir le profil
                          <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" aria-hidden="true" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {ads.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full h-12 w-12 z-10 focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Annonce précédente"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full h-12 w-12 z-10 focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Annonce suivante"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Dots Indicator */}
          {ads.length > 1 && (
            <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Sélection d'annonce">
              {ads.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  role="tab"
                  aria-selected={index === selectedIndex}
                  aria-label={`Annonce ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    index === selectedIndex 
                      ? 'w-8 bg-primary' 
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
