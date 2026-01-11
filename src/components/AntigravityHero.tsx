import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, ArrowRight, Shield, Clock, Users, Star, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AntigravityHero = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [location, setLocation] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Optimized particle animation with reduced motion support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Reduce particles on mobile for performance
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 25 : 50;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    let lastTime = 0;
    const fps = 30; // Limit FPS for better performance
    const frameInterval = 1000 / fps;

    const animate = (currentTime: number) => {
      animationRef.current = requestAnimationFrame(animate);
      
      const delta = currentTime - lastTime;
      if (delta < frameInterval) return;
      lastTime = currentTime - (delta % frameInterval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle with primary color
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(221, 83%, 53%, ${particle.opacity})`;
        ctx.fill();
      });

      // Draw connections (only on desktop for performance)
      if (!isMobile) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `hsla(221, 83%, 53%, ${0.08 * (1 - distance / 100)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery);
    if (serviceType) params.set('type', serviceType);
    if (location.trim()) params.set('location', location);
    navigate(`/search?${params.toString()}`);
  };

  const serviceTypes = [
    { value: 'doctor', label: 'Médecin' },
    { value: 'pharmacy', label: 'Pharmacie' },
    { value: 'clinic', label: 'Clinique' },
    { value: 'laboratory', label: 'Laboratoire' },
    { value: 'dentist', label: 'Dentiste' },
    { value: 'specialist', label: 'Spécialiste' },
  ];

  const stats = [
    { icon: Users, value: '500+', label: 'Praticiens vérifiés' },
    { icon: Shield, value: '100%', label: 'Profils certifiés' },
    { icon: Clock, value: '24/7', label: 'Urgences disponibles' },
  ];

  const socialProof = [
    { value: '4.8', suffix: '/5', label: 'Note moyenne' },
    { value: '10K+', suffix: '', label: 'Rendez-vous pris' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Gradient Orbs - Optimized opacity */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} aria-hidden="true" />

      {/* Content */}
      <div className="container-wide relative z-10 pt-20">
        <div className={`text-center max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>La santé à portée de main à Sidi Bel Abbès</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Trouvez votre
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              médecin idéal
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Connectez-vous avec les meilleurs médecins, cliniques et pharmacies vérifiés.
            Recherchez, réservez et recevez des soins en quelques clics.
          </p>

          {/* Enhanced Search Bar with Filters */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col lg:flex-row gap-3 p-3 bg-card/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Nom, spécialité..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-0 bg-transparent focus-visible:ring-0 text-base"
                  aria-label="Rechercher un médecin ou une spécialité"
                />
              </div>
              
              {/* Service Type Select */}
              <div className="lg:w-48">
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger className="h-12 border-0 bg-muted/50 focus:ring-0" aria-label="Type de service">
                    <SelectValue placeholder="Type de service" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Input */}
              <div className="lg:w-48 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Localisation"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-12 h-12 border-0 bg-muted/50 focus-visible:ring-0 text-base"
                  aria-label="Localisation"
                />
              </div>
              
              {/* Search Button */}
              <Button 
                type="submit"
                size="lg"
                className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg group"
              >
                Rechercher
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </form>

          {/* Social Proof Line */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="font-semibold text-foreground">4.8/5</span>
              <span className="text-muted-foreground">• 10K+ avis</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>Tous les praticiens sont vérifiés</span>
            </div>
          </div>

          {/* Quick Actions - Enhanced visibility */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <Button
              onClick={() => navigate('/carte')}
              className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Explorer la carte
            </Button>
            <Button
              onClick={() => navigate('/carte?mode=emergency')}
              className="rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md"
            >
              🚨 Urgences 24/7
            </Button>
            <Button
              onClick={() => navigate('/medical-assistant')}
              className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-md"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Assistant IA
            </Button>
          </div>

          {/* Stats - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className={`text-center transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Enhanced */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">Découvrir</span>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
};
