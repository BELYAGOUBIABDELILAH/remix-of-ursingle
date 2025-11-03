import { Header } from '@/components/layout/Header';
import { ModernHeroSection } from '@/components/homepage/ModernHeroSection';
import { QuickSearchSection } from '@/components/homepage/QuickSearchSection';
import { FeaturedProviders } from '@/components/homepage/FeaturedProviders';
import { TestimonialsSlider } from '@/components/homepage/TestimonialsSlider';
import { ProviderCTA } from '@/components/homepage/ProviderCTA';
import { ModernFooter } from '@/components/homepage/ModernFooter';
import { ScrollToTop } from '@/components/ScrollToTop';

export const NewIndex = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Sticky Navigation */}
      <Header />
      
      {/* Hero Section */}
      <ModernHeroSection />
      
      {/* Quick Search Section */}
      <QuickSearchSection />
      
      {/* Featured Providers */}
      <FeaturedProviders />
      
      {/* Testimonials Slider */}
      <TestimonialsSlider />
      
      {/* Provider CTA Banner */}
      <ProviderCTA />
      
      {/* Footer */}
      <ModernFooter />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default NewIndex;