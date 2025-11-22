import { Shield, Lock, Eye, Database, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const SecuritySection = () => {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'Protection des Données',
      description: 'Vos informations médicales sont cryptées et sécurisées selon les normes RGPD.'
    },
    {
      icon: Lock,
      title: 'Connexion Sécurisée',
      description: 'Authentification à deux facteurs et connexion SSL pour protéger votre compte.'
    },
    {
      icon: Eye,
      title: 'Confidentialité Garantie',
      description: 'Vos recherches et rendez-vous restent strictement confidentiels.'
    },
    {
      icon: Database,
      title: 'Stockage Sécurisé',
      description: 'Données hébergées dans des centres certifiés SOC 2 Type II.'
    }
  ];

  const certifications = [
    { name: 'RGPD Conforme', verified: true },
    { name: 'Hébergement de Données de Santé', verified: true },
    { name: 'Certifié ISO 27001', verified: true },
    { name: 'SOC 2 Type II', verified: true }
  ];

  return (
    <section className="py-16 px-4 bg-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-2xl mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Votre Sécurité, Notre Priorité
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            CityHealth utilise les technologies de sécurité les plus avancées pour protéger vos données de santé.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {securityFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className="glass-card hover-lift animate-scale-in border-primary/10"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-6 text-center">Certifications & Conformité</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {certifications.map((cert, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-3 rounded-lg bg-background/50"
                >
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{cert.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
