import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const AntigravityHero = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Particle background animation
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Google Blue with transparency
      ctx.fillStyle = 'rgba(66, 133, 244, 0.6)';

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections
      ctx.strokeStyle = 'rgba(66, 133, 244, 0.2)';
      ctx.lineWidth = 1;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Particle Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="container-wide relative z-10 text-center">
        {/* Main Headline */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8 animate-fade-in">
          Find Healthcare,
          <br />
          <span className="text-primary">Instantly.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-secondary max-w-3xl mx-auto mb-12 animate-slide-up">
          Connect with verified doctors, clinics, and pharmacies in Sidi Bel Abbès.
          <br />
          Search, book, and get care in seconds.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
          <Button
            onClick={() => navigate('/search')}
            className="btn-primary-pill text-lg shadow-lifted hover:scale-105 transition-transform"
          >
            <Search className="mr-2 h-5 w-5" />
            Start Searching
          </Button>

          <Button
            onClick={() => navigate('/map')}
            variant="outline"
            className="btn-secondary-pill text-lg border-2 hover:bg-muted transition-all"
          >
            <MapPin className="mr-2 h-5 w-5" />
            Explore Map
          </Button>
        </div>

        {/* Stats - Simple minimal */}
        <div className="mt-20 flex flex-wrap justify-center gap-12 text-sm text-secondary animate-fade-in">
          <div>
            <div className="text-3xl font-bold text-foreground">500+</div>
            <div>Verified Providers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">10k+</div>
            <div>Happy Patients</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">24/7</div>
            <div>Emergency Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};
