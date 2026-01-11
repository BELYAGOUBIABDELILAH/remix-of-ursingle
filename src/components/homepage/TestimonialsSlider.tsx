import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useEmblaCarousel from 'embla-carousel-react';

interface Testimonial {
  id: string;
  name: string;
  initials: string;
  text: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Amira K.',
    initials: 'AK',
    text: "CityHealth m'a permis de trouver rapidement un excellent cardiologue près de chez moi. Interface simple et professionnels vérifiés !",
    role: 'Patiente'
  },
  {
    id: '2',
    name: 'Mohamed B.',
    initials: 'MB',
    text: "Grâce à cette plateforme, j'ai pu prendre rendez-vous en quelques clics avec un dentiste de qualité. Service exceptionnel !",
    role: 'Patient'
  },
  {
    id: '3',
    name: 'Sarah L.',
    initials: 'SL',
    text: "Application très utile pour trouver des pharmacies de garde. Les informations sont toujours à jour et fiables.",
    role: 'Patiente'
  },
  {
    id: '4',
    name: 'Karim M.',
    initials: 'KM',
    text: "En tant que médecin, je recommande CityHealth à tous mes patients. La vérification des praticiens est rigoureuse.",
    role: 'Médecin'
  },
  {
    id: '5',
    name: 'Fatima Z.',
    initials: 'FZ',
    text: "J'utilise CityHealth depuis 6 mois. La carte interactive m'aide à trouver les urgences les plus proches rapidement.",
    role: 'Patiente'
  }
];

export const TestimonialsSlider = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center'
  });

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    // Auto-play
    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);
    
    return () => {
      emblaApi.off('select', onSelect);
      clearInterval(autoplay);
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

  return (
    <section className="py-20 px-4 bg-secondary/20" aria-labelledby="testimonials-title">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12 animate-slide-up">
          <h2 id="testimonials-title" className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-muted-foreground text-lg">
            Des milliers de patients satisfaits nous font confiance
          </p>
        </div>

        {/* Embla Carousel for testimonials */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className="flex-shrink-0 w-full px-4"
              >
                <Card 
                  className="glass-card border-primary/20 shadow-xl max-w-4xl mx-auto"
                  role="region"
                  aria-roledescription="slide"
                  aria-label={`Témoignage ${index + 1} de ${testimonials.length}`}
                >
                  <CardContent className="p-8 md:p-12">
                    <Quote className="h-12 w-12 text-primary/30 mb-6" aria-hidden="true" />
                    
                    <p className="text-xl text-foreground leading-relaxed mb-8">
                      "{testimonial.text}"
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-lg font-semibold">
                          {testimonial.initials}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{testimonial.name}</p>
                        <p className="text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="h-10 w-10 rounded-full hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Témoignage précédent"
          >
            <ChevronLeft size={20} />
          </Button>
          
          <div className="flex gap-2" role="tablist" aria-label="Sélection de témoignage">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                role="tab"
                aria-selected={index === selectedIndex}
                aria-label={`Témoignage ${index + 1}`}
                className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  index === selectedIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-primary/30 w-2 hover:bg-primary/50'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="h-10 w-10 rounded-full hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Témoignage suivant"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    </section>
  );
};
