import { useState, useEffect, useRef } from 'react';
import { useAnimateIn } from '@/lib/animations';
import { 
  Search, 
  MapPin, 
  Calendar,
  CheckCircle,
  UserPlus,
  Shield,
  Star,
  Phone,
  Clock,
  Heart,
  Users,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const FeatureCard = ({ 
  icon, 
  title, 
  description
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string
}) => {
  return (
    <div className="flex flex-col items-start p-6 glass-panel rounded-lg h-full hover-lift">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-primary">{title}</h3>
      <p className="text-foreground/80">{description}</p>
    </div>
  );
};

const WorkflowStep = ({ 
  number, 
  title, 
  description
}: { 
  number: number, 
  title: string, 
  description: string
}) => {
  return (
    <div className="relative">
      <div className="absolute top-0 left-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg z-10">
        {number}
      </div>
      <div className="pl-16">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-foreground/80">{description}</p>
      </div>
    </div>
  );
};

const UserTypeCard = ({
  icon,
  title,
  description,
  features,
  ctaText,
  ctaLink
}: {
  icon: React.ReactNode,
  title: string,
  description: string,
  features: string[],
  ctaText: string,
  ctaLink: string
}) => {
  return (
    <Card className="glass-panel h-full">
      <CardContent className="p-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-4">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-foreground/80 mb-6">{description}</p>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-foreground/80">{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full" asChild>
          <Link to={ctaLink}>{ctaText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const HowPage = () => {
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollPosition = window.scrollY;
        const parallaxFactor = 0.4;
        heroRef.current.style.transform = `translateY(${scrollPosition * parallaxFactor}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-24">
          <div ref={heroRef} className="relative w-full max-w-3xl mx-auto">
            <div className="absolute -z-10 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-3xl left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="glass-panel rounded-full py-5 px-8 inline-block mx-auto mb-12">
              <h1 className="text-2xl md:text-3xl font-bold text-primary">Comment fonctionne CityHealth ?</h1>
            </div>
            
            <p className="text-xl text-center text-foreground/80 max-w-2xl mx-auto mb-12">
              Une plateforme simple et intuitive pour connecter les citoyens de Sidi Bel Abbès 
              aux professionnels de santé de leur ville.
            </p>
            
            <div className="flex justify-center gap-4 flex-wrap">
              <Button size="lg" className="rounded-full" asChild>
                <Link to="/search">Trouver un médecin</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full" asChild>
                <Link to="/provider/register">Je suis professionnel</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Pour les Citoyens */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-4">Pour les Citoyens</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Trouvez rapidement le bon professionnel de santé en 4 étapes simples
          </p>
          
          <div className="relative">
            <div className="absolute left-5 top-6 w-0.5 h-[calc(100%-60px)] bg-gradient-to-b from-primary via-accent to-primary/30"></div>
            
            <div className="space-y-16 pl-4">
              <WorkflowStep 
                number={1}
                title="Recherchez"
                description="Utilisez notre moteur de recherche intelligent pour trouver des médecins, pharmacies, cliniques par nom, spécialité ou localisation. Filtrez par disponibilité, accessibilité ou services à domicile."
              />
              <WorkflowStep 
                number={2}
                title="Comparez"
                description="Consultez les profils détaillés des professionnels : qualifications, horaires, avis patients, photos du cabinet. Trouvez celui qui correspond le mieux à vos besoins."
              />
              <WorkflowStep 
                number={3}
                title="Localisez"
                description="Visualisez sur la carte interactive où se trouvent les professionnels de santé près de chez vous. Obtenez l'itinéraire GPS en un clic."
              />
              <WorkflowStep 
                number={4}
                title="Contactez"
                description="Appelez directement, réservez un rendez-vous en ligne, ou ajoutez le professionnel à vos favoris pour le retrouver facilement."
              />
            </div>
          </div>
        </div>
        
        {/* User Types */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">CityHealth pour tous</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <UserTypeCard
              icon={<Users className="w-8 h-8 text-primary" />}
              title="Citoyens"
              description="Accédez gratuitement à l'annuaire santé le plus complet de Sidi Bel Abbès"
              features={[
                "Recherche gratuite et illimitée",
                "Filtres avancés (spécialité, urgence, accessibilité)",
                "Carte interactive avec itinéraires",
                "Sauvegardez vos professionnels favoris",
                "Système d'avis et évaluations"
              ]}
              ctaText="Commencer"
              ctaLink="/search"
            />
            
            <UserTypeCard
              icon={<Building className="w-8 h-8 text-primary" />}
              title="Professionnels de Santé"
              description="Créez votre profil et développez votre visibilité auprès des patients"
              features={[
                "Profil professionnel complet",
                "Photos et galerie du cabinet",
                "Gestion des horaires d'ouverture",
                "Badge de vérification officiel",
                "Annonces médicales"
              ]}
              ctaText="Créer mon profil"
              ctaLink="/provider/register"
            />
            
            <UserTypeCard
              icon={<Shield className="w-8 h-8 text-primary" />}
              title="Établissements"
              description="Référencez votre clinique, hôpital ou pharmacie sur CityHealth"
              features={[
                "Page établissement dédiée",
                "Listing de plusieurs praticiens",
                "Services et équipements détaillés",
                "Horaires des services d'urgence",
                "Statistiques de visibilité"
              ]}
              ctaText="Nous contacter"
              ctaLink="/contact"
            />
          </div>
        </div>
        
        {/* Section Urgences */}
        <div className="py-16 px-4 rounded-lg glass-panel my-24 bg-destructive/5">
          <h2 className="text-3xl font-bold text-center mb-3">Services d'Urgence 24/7</h2>
          <p className="text-xl text-center text-foreground/80 max-w-3xl mx-auto mb-8">
            En cas d'urgence, accédez instantanément aux services disponibles maintenant
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4">
              <Phone className="w-10 h-10 text-destructive mx-auto mb-3" />
              <h3 className="font-bold">SAMU</h3>
              <p className="text-2xl font-bold text-destructive">14</p>
            </div>
            <div className="text-center p-4">
              <Phone className="w-10 h-10 text-destructive mx-auto mb-3" />
              <h3 className="font-bold">Protection Civile</h3>
              <p className="text-2xl font-bold text-destructive">14</p>
            </div>
            <div className="text-center p-4">
              <Phone className="w-10 h-10 text-destructive mx-auto mb-3" />
              <h3 className="font-bold">Police</h3>
              <p className="text-2xl font-bold text-destructive">17</p>
            </div>
            <div className="text-center p-4">
              <Phone className="w-10 h-10 text-destructive mx-auto mb-3" />
              <h3 className="font-bold">Gendarmerie</h3>
              <p className="text-2xl font-bold text-destructive">1055</p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button size="lg" variant="destructive" className="rounded-full" asChild>
              <Link to="/emergency">
                <Clock className="w-5 h-5 mr-2" />
                Voir les urgences disponibles
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Fonctionnalités Clés</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Search className="w-8 h-8 text-primary" />}
              title="Recherche Intelligente"
              description="Trouvez par nom, spécialité, localisation ou symptômes. Notre IA vous aide à trouver le bon professionnel."
            />
            <FeatureCard
              icon={<MapPin className="w-8 h-8 text-primary" />}
              title="Carte Interactive"
              description="Visualisez tous les professionnels de santé sur une carte avec itinéraires GPS et distances."
            />
            <FeatureCard
              icon={<Calendar className="w-8 h-8 text-primary" />}
              title="Prise de RDV"
              description="Réservez vos rendez-vous directement en ligne, sans appeler. Recevez des rappels automatiques."
            />
            <FeatureCard
              icon={<Star className="w-8 h-8 text-primary" />}
              title="Avis Vérifiés"
              description="Consultez les évaluations d'autres patients pour faire un choix éclairé."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-primary" />}
              title="Profils Vérifiés"
              description="Badge de confiance pour les praticiens dont les qualifications ont été vérifiées."
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8 text-primary" />}
              title="Favoris"
              description="Sauvegardez vos professionnels préférés pour les retrouver en un clic."
            />
          </div>
        </div>
        
        {/* CTA Final */}
        <div className="glass-panel p-10 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à trouver votre professionnel de santé ?</h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
            Rejoignez des milliers de citoyens qui utilisent CityHealth pour accéder aux soins de santé à Sidi Bel Abbès.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button size="lg" className="rounded-full" asChild>
              <Link to="/search">
                <Search className="w-5 h-5 mr-2" />
                Rechercher maintenant
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full" asChild>
              <Link to="/why">En savoir plus</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowPage;
