import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Testimonial {
  id: number;
  name: string;
  initials: string;
  text: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Amira K.",
    initials: "AK",
    text: "CityHealth m'a permis de trouver rapidement un excellent cardiologue près de chez moi. Interface simple et professionnels vérifiés !",
    role: "Patiente"
  },
  {
    id: 2,
    name: "Mohamed B.",
    initials: "MB",
    text: "Grâce à cette plateforme, j'ai pu prendre rendez-vous en quelques clics avec un dentiste de qualité. Service exceptionnel !",
    role: "Patient"
  },
  {
    id: 3,
    name: "Sarah L.",
    initials: "SL",
    text: "Application très utile pour trouver des pharmacies de garde. Les informations sont toujours à jour et fiables.",
    role: "Patiente"
  }
];

export const TestimonialsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-muted-foreground text-lg">
            Des milliers de patients satisfaits nous font confiance
          </p>
        </div>

        <div className="relative">
          <Card className="border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="p-12">
              <Quote className="h-12 w-12 text-primary/30 mb-6" />
              
              <div className="mb-8">
                <p className="text-xl text-foreground leading-relaxed mb-6">
                  "{testimonials[currentIndex].text}"
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {testimonials[currentIndex].initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{testimonials[currentIndex].name}</p>
                  <p className="text-muted-foreground">{testimonials[currentIndex].role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="h-12 w-12 rounded-full border-primary/20 hover:bg-primary/10"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-3 w-3 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-primary w-8' 
                      : 'bg-primary/30 hover:bg-primary/50'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="h-12 w-12 rounded-full border-primary/20 hover:bg-primary/10"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
