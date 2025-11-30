import { AntigravityHeader } from '@/components/AntigravityHeader';
import { AntigravityHero } from '@/components/AntigravityHero';
import Footer from '@/components/Footer';
import { FeaturedProviders } from '@/components/homepage/FeaturedProviders';
import { TestimonialsSlider } from '@/components/homepage/TestimonialsSlider';
import { ProviderCTA } from '@/components/homepage/ProviderCTA';

const AntigravityIndex = () => {
  return (
    <div className="min-h-screen bg-white">
      <AntigravityHeader />
      <AntigravityHero />
      
      {/* Massive whitespace section spacing */}
      <div className="section-spacing">
        <FeaturedProviders />
      </div>
      
      <div className="section-spacing bg-muted/30">
        <TestimonialsSlider />
      </div>
      
      <div className="section-spacing">
        <ProviderCTA />
      </div>
      
      <Footer />
    </div>
  );
};

export default AntigravityIndex;
