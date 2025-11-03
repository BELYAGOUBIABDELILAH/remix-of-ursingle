import { Briefcase, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const ProviderCTA = () => {
  const benefits = [
    "Visibilité accrue auprès des patients",
    "Gestion simplifiée des rendez-vous",
    "Profil professionnel vérifié",
    "Statistiques et analytics détaillés"
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <Card className="border-primary/20 shadow-2xl bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-12">
            {/* Left Side - Text Content */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full w-fit mb-6">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm font-semibold">Pour les professionnels</span>
              </div>
              
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Vous êtes un professionnel de santé ?
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8">
                Rejoignez notre plateforme gratuitement et développez votre patientèle à Sidi Bel Abbès
              </p>

              {/* Benefits List */}
              <div className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all w-fit group"
              >
                Inscrire mon cabinet
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Right Side - Visual Element */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-72 h-72 rounded-3xl bg-gradient-to-br from-primary to-accent p-1">
                  <div className="w-full h-full rounded-3xl bg-background flex items-center justify-center">
                    <div className="text-center p-8">
                      <Briefcase className="h-24 w-24 mx-auto mb-4 text-primary" />
                      <p className="text-xl font-semibold text-foreground">
                        +500
                      </p>
                      <p className="text-muted-foreground">
                        Professionnels inscrits
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative circles */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
