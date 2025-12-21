import { Link } from 'react-router-dom';
import { Phone, Ambulance, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmergencyBanner = () => {
  return (
    <section className="py-8 bg-gradient-to-r from-red-600 via-red-500 to-red-600 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="container-wide relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left - Emergency Info */}
          <div className="flex items-center gap-4 text-white">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
              <Ambulance className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold">
                Urgences Médicales 24/7
              </h3>
              <p className="text-white/80 text-sm">
                Services d'urgence disponibles jour et nuit
              </p>
            </div>
          </div>

          {/* Center - Contact Numbers */}
          <div className="flex flex-wrap items-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <span className="text-3xl font-bold">15</span>
              <span className="text-sm text-white/80">SAMU</span>
            </div>
            <div className="h-8 w-px bg-white/30 hidden md:block" />
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm">Réponse rapide</span>
            </div>
            <div className="h-8 w-px bg-white/30 hidden md:block" />
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span className="text-sm">Sidi Bel Abbès</span>
            </div>
          </div>

          {/* Right - CTA */}
          <Link to="/carte?mode=emergency">
            <Button 
              size="lg"
              className="bg-white text-red-600 hover:bg-white/90 font-semibold shadow-lg"
            >
              Voir les urgences
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
