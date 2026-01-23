import { useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Link } from 'react-router-dom';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import useEmblaCarousel from 'embla-carousel-react';
import { useVerifiedProviders } from '@/hooks/useProviders';

interface DisplayProvider {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  reviewCount: number;
  distance: string;
  isVerified: boolean;
  isAvailable: boolean;
  image: string;
  nextAvailable: string;
}

export const FeaturedProviders = () => {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal();
  const { data: verifiedProviders = [], isLoading } = useVerifiedProviders();
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false, 
    align: 'start',
    skipSnaps: false,
    dragFree: true
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Map Firestore providers to display format, sorted by rating (top 6)
  const providers: DisplayProvider[] = useMemo(() => {
    return verifiedProviders
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        name: p.name,
        specialty: p.specialty || p.type,
        location: p.area || p.city || '',
        rating: p.rating || 0,
        reviewCount: p.reviewsCount || 0,
        distance: `${(p as any).distance || Math.floor(Math.random() * 5) + 1} km`,
        isVerified: p.verified || p.verificationStatus === 'verified',
        isAvailable: p.isOpen || false,
        image: p.image || '/placeholder.svg',
        nextAvailable: p.isOpen ? 'Maintenant' : 'Prochainement'
      }));
  }, [verifiedProviders]);

  // Skeleton loading component
  const ProviderSkeleton = () => (
    <Card className="glass-card border border-primary/10 min-w-[300px] md:min-w-[350px]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );

  return (
    <section ref={sectionRef} className="py-20 px-4" aria-labelledby="featured-providers-title">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 animate-slide-up">
          <div>
            <h2 id="featured-providers-title" className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('providers.featured')}
            </h2>
            <p className="text-xl text-muted-foreground">
              Professionnels de santé vérifiés et très bien notés
            </p>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <span className="text-sm text-muted-foreground mr-2 hidden sm:inline">
              ← Glissez ou utilisez les flèches →
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="hover-lift rounded-full"
              aria-label="Praticien précédent"
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="hover-lift rounded-full"
              aria-label="Praticien suivant"
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>

        {/* Embla Carousel for touch swipe */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {isLoading ? (
              // Show skeletons while loading
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex-shrink-0">
                  <ProviderSkeleton />
                </div>
              ))
            ) : (
              providers.map((provider, index) => (
                <div 
                  key={provider.id} 
                  className="flex-shrink-0 min-w-[300px] md:min-w-[350px] lg:min-w-[380px]"
                >
                  <Card 
                    className="group glass-card hover:shadow-xl transition-all duration-300 cursor-pointer border border-primary/10 hover:border-primary/30 hover-lift animate-scale-in h-full"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      {/* Provider Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {provider.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {provider.name}
                            </h3>
                            <p className="text-muted-foreground text-sm">{provider.specialty}</p>
                          </div>
                        </div>
                        
                        {provider.isVerified && (
                          <VerifiedBadge type="verified" size="sm" />
                        )}
                      </div>

                      {/* Location & Rating */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={14} className="text-muted-foreground flex-shrink-0" aria-hidden="true" />
                          <span className="truncate">{provider.location}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-primary font-medium">{provider.distance}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star className="text-yellow-400 fill-yellow-400" size={14} aria-hidden="true" />
                            <span className="font-medium">{provider.rating}</span>
                            <span className="text-muted-foreground text-sm">({provider.reviewCount})</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock size={14} className={provider.isAvailable ? 'text-green-500' : 'text-orange-500'} aria-hidden="true" />
                            <span className={`text-sm font-medium ${provider.isAvailable ? 'text-green-600' : 'text-orange-600'}`}>
                              {provider.nextAvailable}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Availability Status */}
                      <div className="mb-4">
                        <Badge 
                          variant={provider.isAvailable ? "default" : "secondary"}
                          className={provider.isAvailable ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800" : ""}
                        >
                          {provider.isAvailable ? 'Disponible maintenant' : 'Prochaine disponibilité'}
                        </Badge>
                      </div>

                      {/* Action Button */}
                      <Link to={`/provider/${provider.id}`}>
                        <Button 
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                          variant="outline"
                          aria-label={`Voir le profil de ${provider.name}`}
                        >
                          Voir le profil
                          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={14} aria-hidden="true" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <Link to="/search">
            <Button size="lg" className="hover-lift">
              {t('providers.viewAll')}
              <ArrowRight className="ml-2" size={18} aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
