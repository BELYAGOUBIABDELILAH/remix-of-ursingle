import { AntigravityHeader } from '@/components/AntigravityHeader';
import { AntigravityHero } from '@/components/AntigravityHero';
import Footer from '@/components/Footer';
import { FeaturedProviders } from '@/components/homepage/FeaturedProviders';
import { TestimonialsSlider } from '@/components/homepage/TestimonialsSlider';
import { ProviderCTA } from '@/components/homepage/ProviderCTA';
import { MedicalAdsCarousel } from '@/components/homepage/MedicalAdsCarousel';
import { ServicesGrid } from '@/components/homepage/ServicesGrid';
import { EmergencyBanner } from '@/components/homepage/EmergencyBanner';
import { Helmet } from 'react-helmet-async';

const AntigravityIndex = () => {
  return (
    <>
      <Helmet>
        <title>CityHealth - Trouvez votre médecin à Sidi Bel Abbès</title>
        <meta name="description" content="CityHealth est la plateforme de référence pour trouver des médecins, cliniques et pharmacies vérifiés à Sidi Bel Abbès, Algérie. Recherchez, réservez et recevez des soins en quelques clics." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <AntigravityHeader />
        <AntigravityHero />
        
        {/* Emergency Banner */}
        <EmergencyBanner />
        
        {/* Services Grid Section */}
        <ServicesGrid />
        
        {/* Medical Ads Carousel */}
        <MedicalAdsCarousel />
        
        {/* Featured Providers */}
        <div className="py-20 bg-muted/20">
          <FeaturedProviders />
        </div>
        
        {/* Testimonials */}
        <div className="py-20 bg-background">
          <TestimonialsSlider />
        </div>
        
        {/* Provider CTA */}
        <div className="py-20 bg-gradient-to-b from-muted/30 to-background">
          <ProviderCTA />
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default AntigravityIndex;
