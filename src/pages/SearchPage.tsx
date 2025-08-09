import React, { useEffect, useMemo, useState } from 'react';
import { Search as SearchIcon, MapPin, Filter, Star, Clock, Phone, Navigation, Grid, List, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedTransition from '@/components/AnimatedTransition';
import MapPlaceholder from '@/components/MapPlaceholder';
import { CityHealthProvider, AREAS, SPECIALTIES, getProviders } from '@/data/providers';
import { Link } from 'react-router-dom';

const SearchPage = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [minRating, setMinRating] = useState(0);
  const [maxRadius, setMaxRadius] = useState(50);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const [providers, setProviders] = useState<CityHealthProvider[]>([]);
  useEffect(() => {
    setProviders(getProviders());
    // Re-check shortly in case seeding happened after mount
    if (!getProviders().length) {
      const id = setTimeout(() => setProviders(getProviders()), 100);
      return () => clearTimeout(id);
    }
  }, []);

  const filtered = useMemo(() => {
    let list = providers;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.specialty || '').toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
      );
    }
    if (selectedSpecialty) list = list.filter(p => (p.specialty || '').includes(selectedSpecialty));
    if (selectedLocation) list = list.filter(p => p.area === selectedLocation);
    if (verifiedOnly) list = list.filter(p => p.verified);
    if (emergencyOnly) list = list.filter(p => p.emergency);
    if (minRating > 0) list = list.filter(p => p.rating >= minRating);
    if (maxRadius < 50) list = list.filter(p => p.distance <= maxRadius);

    switch (sortBy) {
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'distance':
      default:
        list = [...list].sort((a, b) => a.distance - b.distance);
    }
    return list;
  }, [providers, searchQuery, selectedSpecialty, selectedLocation, verifiedOnly, emergencyOnly, minRating, maxRadius, sortBy]);

  const ProviderCard = ({ provider }: { provider: CityHealthProvider }) => (
    <Link to={`/provider/${provider.id}`}>
      <Card className="glass-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] cursor-pointer">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <img 
              src={provider.image} 
              alt={provider.name}
              className="w-16 h-16 rounded-xl object-cover bg-muted"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {provider.name}
                    {provider.verified && (
                      <Badge variant="secondary" className="text-xs">
                        ✓ {t('provider.verified')}
                      </Badge>
                    )}
                  </h3>
                  <p className="text-muted-foreground text-sm">{provider.specialty || provider.type}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{provider.rating}</span>
                    <span className="text-muted-foreground text-sm">({provider.reviewsCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Navigation className="h-3 w-3" />
                    <span>{provider.distance} km</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{provider.address}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    provider.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <Clock className="h-3 w-3" />
                    {provider.isOpen ? 'Ouvert' : 'Fermé'}
                  </div>
                  {provider.emergency && (
                    <Badge variant="destructive" className="text-xs">
                      Urgences 24/7
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href={`tel:${provider.phone}`}>
                    <Phone className="h-4 w-4" />
                    Appeler
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 pt-20">
      <div className="container mx-auto px-4 py-8">
        <AnimatedTransition show={true} animation="fade">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Rechercher un prestataire</h1>
            <p className="text-muted-foreground">Trouvez le professionnel de santé adapté à vos besoins</p>
          </div>

          {/* Search Filters */}
          <div className="glass-panel rounded-2xl p-6 mb-8">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder={t('search.specialty')} />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder={t('search.location')} />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v: 'distance'|'rating'|'name') => setSortBy(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rating">Note</SelectItem>
                  <SelectItem value="name">Nom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced filters */}
            <div className="grid md:grid-cols-3 gap-4 items-center">
              <div className="flex items-center gap-2">
                <Checkbox id="verified" checked={verifiedOnly} onCheckedChange={(v) => setVerifiedOnly(Boolean(v))} />
                <label htmlFor="verified" className="text-sm">Prestataires vérifiés uniquement</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="emergency" checked={emergencyOnly} onCheckedChange={(v) => setEmergencyOnly(Boolean(v))} />
                <label htmlFor="emergency" className="text-sm">Services d'urgence seulement</label>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {filtered.length} résultats trouvés
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Note minimale</span><span>{minRating.toFixed(1)}★</span></div>
                <Slider value={[minRating]} min={0} max={5} step={0.5} onValueChange={(v) => setMinRating(v[0] ?? 0)} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Rayon maximal</span><span>{maxRadius} km</span></div>
                <Slider value={[maxRadius]} min={1} max={50} step={1} onValueChange={(v) => setMaxRadius(v[0] ?? 50)} />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-end mt-4">
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="h-8 w-8 p-0"
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {viewMode === 'map' ? (
            <MapPlaceholder height={560} label="Carte de recherche" />
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
              {filtered.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}

          {/* Load More (placeholder for infinite scroll) */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Charger plus de résultats
            </Button>
          </div>
        </AnimatedTransition>
      </div>
    </div>
  );
};

export default SearchPage;
