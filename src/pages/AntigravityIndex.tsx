import { useEffect } from 'react';
import { AntigravityHeader } from '@/components/AntigravityHeader';
import { AntigravityHero } from '@/components/AntigravityHero';
import Footer from '@/components/Footer';
import { FeaturedProviders } from '@/components/homepage/FeaturedProviders';
import { TestimonialsSlider } from '@/components/homepage/TestimonialsSlider';
import { ProviderCTA } from '@/components/homepage/ProviderCTA';
import { MedicalAdsCarousel } from '@/components/homepage/MedicalAdsCarousel';
import { ServicesGrid } from '@/components/homepage/ServicesGrid';
import { EmergencyBanner } from '@/components/homepage/EmergencyBanner';
import { SecuritySection } from '@/components/trust/SecuritySection';
import { CertificationsDisplay } from '@/components/trust/CertificationsDisplay';

const AntigravityIndex = () => {
  useEffect(() => {
    document.title = "CityHealth - Trouvez votre médecin à Sidi Bel Abbès";
  }, []);

  return (
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
      
      {/* Security & Trust Section */}
      <SecuritySection />
      
      {/* Certifications */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nos Certifications
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              CityHealth est certifié selon les normes les plus strictes de sécurité des données de santé.
            </p>
          </div>
          <CertificationsDisplay />
        </div>
      </section>
      
      {/* Provider CTA */}
      <div className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <ProviderCTA />
      </div>
      
      <Footer />
    </div>
  );
};

export default AntigravityIndex;
