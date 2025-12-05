import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BadgeCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    setAds(getMockApprovedAds());
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || ads.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, ads.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
    setIsAutoPlaying(false);
  };

  if (ads.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30 text-primary">
            Annonces Partenaires
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Services de Santé à Découvrir
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les offres de nos partenaires de santé vérifiés à Sidi Bel Abbès
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main Carousel */}
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {ads.map((ad) => (
                <div 
                  key={ad.id}
                  className="w-full flex-shrink-0"
                >
                  <div className="relative h-[400px] md:h-[450px] group">
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${ad.imageUrl})` }}
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
                            <BadgeCheck className="w-3 h-3 mr-1" />
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
                          <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
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
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full h-12 w-12 z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full h-12 w-12 z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Dots Indicator */}
          {ads.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {ads.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
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
