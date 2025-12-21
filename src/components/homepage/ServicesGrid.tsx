import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  Building2, 
  Ambulance, 
  Heart,
  Eye,
  Baby,
  Brain
} from 'lucide-react';

const services = [
  {
    icon: Stethoscope,
    title: 'Médecins',
    description: 'Trouvez le spécialiste qu\'il vous faut',
    href: '/search?type=doctor',
    color: 'from-blue-500 to-blue-600',
    count: '200+'
  },
  {
    icon: Pill,
    title: 'Pharmacies',
    description: 'Pharmacies de garde 24h/24',
    href: '/search?type=pharmacy',
    color: 'from-emerald-500 to-emerald-600',
    count: '50+'
  },
  {
    icon: FlaskConical,
    title: 'Laboratoires',
    description: 'Analyses médicales certifiées',
    href: '/search?type=laboratory',
    color: 'from-purple-500 to-purple-600',
    count: '30+'
  },
  {
    icon: Building2,
    title: 'Cliniques',
    description: 'Centres de soins privés',
    href: '/search?type=clinic',
    color: 'from-orange-500 to-orange-600',
    count: '25+'
  },
  {
    icon: Ambulance,
    title: 'Urgences',
    description: 'Services d\'urgence disponibles',
    href: '/carte?mode=emergency',
    color: 'from-red-500 to-red-600',
    count: '24/7'
  },
  {
    icon: Heart,
    title: 'Cardiologie',
    description: 'Spécialistes du cœur',
    href: '/search?specialty=cardiology',
    color: 'from-pink-500 to-pink-600',
    count: '15+'
  },
  {
    icon: Eye,
    title: 'Ophtalmologie',
    description: 'Soins oculaires experts',
    href: '/search?specialty=ophthalmology',
    color: 'from-cyan-500 to-cyan-600',
    count: '20+'
  },
  {
    icon: Baby,
    title: 'Pédiatrie',
    description: 'Soins pour enfants',
    href: '/search?specialty=pediatrics',
    color: 'from-yellow-500 to-yellow-600',
    count: '25+'
  },
  {
    icon: Brain,
    title: 'Neurologie',
    description: 'Spécialistes du système nerveux',
    href: '/search?specialty=neurology',
    color: 'from-indigo-500 to-indigo-600',
    count: '10+'
  }
];

export const ServicesGrid = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nos Services de Santé
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Accédez à un large réseau de professionnels de santé vérifiés à Sidi Bel Abbès
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
          {services.map((service, index) => (
            <Link
              key={service.title}
              to={service.href}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="h-7 w-7 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {service.description}
              </p>
              
              {/* Count Badge */}
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${service.color} text-white`}>
                {service.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
