import { useState, useEffect } from 'react';
import { useAnimateIn } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Users, Clock, MapPin, Phone, Accessibility, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const WhySection = ({ 
  title, 
  content, 
  icon, 
  id 
}: { 
  title: string, 
  content: React.ReactNode, 
  icon: React.ReactNode,
  id: string 
}) => {
  return (
    <div id={id} className="mb-20 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary">{title}</h2>
      </div>
      <div className="text-foreground/80 space-y-4">
        {content}
      </div>
    </div>
  );
};

const WhyPage = () => {
  const [loading, setLoading] = useState(true);
  const showContent = useAnimateIn(false, 300);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground bg-clip-text">
            Pourquoi CityHealth ?
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Révolutionner l'accès aux soins de santé à Sidi Bel Abbès
          </p>
          
          <div className="mt-10 glass-panel p-8 md:p-10 rounded-lg max-w-3xl mx-auto shadow-lg border-2 border-primary/20">
            <p className="text-xl md:text-2xl text-foreground/90">
              Nous croyons que chaque citoyen mérite un accès facile et rapide aux professionnels de santé de sa ville.
            </p>
            <p className="text-xl md:text-2xl text-foreground/90 mt-6">
              CityHealth est né de cette conviction.
            </p>
          </div>
        </div>
        
        <WhySection
          id="accessibility"
          icon={<Accessibility className="w-6 h-6 text-primary" />}
          title="Parce que l'accès aux soins doit être simple"
          content={
            <>
              <p>
                Trouver un médecin, une pharmacie de garde, ou un service d'urgence ne devrait pas être un parcours du combattant. 
                À Sidi Bel Abbès, comme dans beaucoup de villes algériennes, l'information sur les services de santé est souvent dispersée et difficile à trouver.
              </p>
              <p>
                CityHealth centralise toutes ces informations en un seul endroit, accessible 24h/24, en arabe, français et anglais. 
                Plus besoin de multiplier les appels ou de chercher des adresses dans des annuaires obsolètes.
              </p>
              <div className="mt-6">
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/search">
                    Commencer la recherche
                  </Link>
                </Button>
              </div>
            </>
          }
        />
        
        <WhySection
          id="emergency"
          icon={<Clock className="w-6 h-6 text-primary" />}
          title="Parce que les urgences n'attendent pas"
          content={
            <>
              <p>
                Quand un enfant est malade à 2h du matin, quand un proche fait un malaise, chaque seconde compte. 
                Savoir immédiatement quelle pharmacie est ouverte, quel hôpital a un service d'urgence disponible, peut sauver des vies.
              </p>
              <p>
                Notre section <strong>Urgences</strong> vous donne accès en un clic aux services disponibles maintenant, 
                avec les numéros d'urgence et les itinéraires GPS.
              </p>
              <div className="mt-6">
                <Button variant="destructive" className="gap-2" asChild>
                  <Link to="/emergency">
                    <Phone className="w-4 h-4" />
                    Accès Urgences
                  </Link>
                </Button>
              </div>
            </>
          }
        />
        
        <WhySection
          id="trust"
          icon={<Shield className="w-6 h-6 text-primary" />}
          title="Parce que la confiance est essentielle"
          content={
            <>
              <p>
                Choisir un professionnel de santé est une décision importante. 
                Vous avez besoin de savoir que le médecin que vous consultez est qualifié, que la clinique respecte les normes.
              </p>
              <p>
                C'est pourquoi CityHealth propose un système de <strong>vérification</strong> des professionnels. 
                Les praticiens vérifiés affichent un badge de confiance, garantissant l'authenticité de leurs diplômes et qualifications.
              </p>
              <p>
                Les avis et évaluations des autres patients vous aident également à faire un choix éclairé.
              </p>
            </>
          }
        />
        
        <WhySection
          id="community"
          icon={<Users className="w-6 h-6 text-primary" />}
          title="Parce que la santé est une affaire collective"
          content={
            <>
              <p>
                CityHealth n'est pas juste un annuaire. C'est une plateforme qui connecte les citoyens, les professionnels de santé, 
                et les autorités locales pour améliorer l'accès aux soins dans notre ville.
              </p>
              <p>
                Les professionnels peuvent créer leur profil, partager leurs disponibilités, 
                et les patients peuvent réserver des rendez-vous directement sur la plateforme.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-primary/5 text-center">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Professionnels référencés</div>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 text-center">
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Services d'urgence</div>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 text-center">
                  <div className="text-3xl font-bold text-primary">3</div>
                  <div className="text-sm text-muted-foreground">Langues supportées</div>
                </div>
              </div>
            </>
          }
        />
        
        <WhySection
          id="local"
          icon={<MapPin className="w-6 h-6 text-primary" />}
          title="Parce que nous connaissons notre ville"
          content={
            <>
              <p>
                CityHealth est conçu spécifiquement pour Sidi Bel Abbès. 
                Nous connaissons les quartiers, les hôpitaux, les pharmacies, les spécificités locales.
              </p>
              <p>
                Notre carte interactive vous montre les professionnels de santé près de chez vous, 
                avec des itinéraires précis et des informations à jour sur les horaires d'ouverture.
              </p>
              <div className="mt-6">
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/map">
                    <MapPin className="w-4 h-4" />
                    Explorer la carte
                  </Link>
                </Button>
              </div>
            </>
          }
        />
        
        <WhySection
          id="multilingual"
          icon={<Globe className="w-6 h-6 text-primary" />}
          title="Parce que la santé n'a pas de barrière linguistique"
          content={
            <>
              <p>
                L'Algérie est un pays multilingue, et Sidi Bel Abbès ne fait pas exception. 
                CityHealth est disponible en <strong>arabe</strong>, <strong>français</strong> et <strong>anglais</strong> 
                pour servir tous les citoyens et résidents de notre ville.
              </p>
              <p>
                Notre assistant IA peut également vous aider à trouver des informations dans votre langue préférée.
              </p>
            </>
          }
        />
        
        <div className="mt-16 text-center">
          <Button size="lg" className="gap-2" asChild>
            <Link to="/search">
              <Heart className="w-5 h-5" />
              Trouver un professionnel de santé
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WhyPage;
