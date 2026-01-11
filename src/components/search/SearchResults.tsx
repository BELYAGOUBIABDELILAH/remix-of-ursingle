import React, { useState, memo, useCallback, useRef, useEffect } from 'react';
import { Heart, Phone, Star, MapPin, Clock, Navigation, Calendar, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Provider, ViewMode } from '@/pages/SearchPage';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { List, Grid } from 'react-window';
import type { CSSProperties, ReactElement } from 'react';

interface SearchResultsProps {
  providers: Provider[];
  viewMode: ViewMode;
  searchQuery: string;
}

interface ProviderCardProps {
  provider: Provider;
  isGrid: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

// Memoized ProviderCard component to prevent unnecessary re-renders
const ProviderCard = memo(({ provider, isGrid, isFavorite, onToggleFavorite }: ProviderCardProps) => {
  const { t } = useLanguage();
  
  return (
    <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer group ${isGrid ? 'h-full' : ''}`}>
      <CardContent className={`p-4 ${isGrid ? 'h-full flex flex-col' : ''}`}>
        <div className={`${isGrid ? 'flex flex-col h-full' : 'flex gap-4'}`}>
          {/* Provider Image */}
          <div className={`${isGrid ? 'w-full mb-4' : 'w-20 h-20'} flex-shrink-0`}>
            <img
              src={provider.image}
              alt={provider.name}
              className={`${isGrid ? 'w-full h-32' : 'w-20 h-20'} object-cover rounded-lg`}
              loading="lazy"
            />
          </div>

          {/* Provider Info */}
          <div className={`${isGrid ? 'flex-1' : 'flex-1 min-w-0'}`}>
            <div className={`${isGrid ? 'text-center' : 'flex justify-between items-start mb-2'}`}>
              <div className={isGrid ? 'mb-2' : ''}>
                <Link to={`/provider/${provider.id}`} className="hover:text-primary transition-colors">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                    {provider.name}
                  </h3>
                </Link>
                <p className="text-muted-foreground text-sm">{provider.specialty}</p>
                {provider.verified && (
                  <Badge variant="secondary" className="mt-1">
                    ✅ {t('provider', 'verified')}
                  </Badge>
                )}
              </div>

              {!isGrid && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleFavorite(provider.id);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Heart
                    size={18}
                    className={isFavorite ? 'fill-destructive text-destructive' : ''}
                  />
                </Button>
              )}
            </div>

            {/* Rating and Stats */}
            <div className={`flex items-center gap-4 mb-3 ${isGrid ? 'justify-center' : ''}`}>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{provider.rating}</span>
                <span className="text-xs text-muted-foreground">({provider.reviewsCount})</span>
              </div>
              {provider.distance && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  <span>{provider.distance}km</span>
                </div>
              )}
            </div>

            {/* Location and Hours */}
            <div className="space-y-2 mb-4">
              <div className={`flex items-start gap-2 text-sm text-muted-foreground ${isGrid ? 'justify-center' : ''}`}>
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <span className={isGrid ? 'text-center' : ''}>{provider.address}</span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${isGrid ? 'justify-center' : ''}`}>
                <Clock size={14} />
                <span className={provider.isOpen ? 'text-green-600' : 'text-destructive'}>
                  {provider.isOpen ? t('provider', 'hours') + ' ✓' : t('common', 'error')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`grid grid-cols-2 gap-2 mt-auto ${isGrid ? 'mt-4' : ''}`}>
              <Button size="sm" variant="outline" onClick={() => window.open(`tel:${provider.phone}`, '_self')}>
                <Phone size={14} className="mr-1" />
                {t('provider', 'callNow')}
              </Button>
              <Link to={`/provider/${provider.id}`}>
                <Button size="sm" className="w-full">
                  <Calendar size={14} className="mr-1" />
                  {t('provider', 'bookAppointment')}
                </Button>
              </Link>
            </div>

            {isGrid && (
              <div className="flex justify-between mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleFavorite(provider.id);
                  }}
                >
                  <Heart
                    size={16}
                    className={isFavorite ? 'fill-destructive text-destructive' : ''}
                  />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 size={16} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Navigation size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProviderCard.displayName = 'ProviderCard';

// Constants for virtualization
const LIST_ITEM_HEIGHT = 220;
const GRID_ITEM_HEIGHT = 420;
const GRID_ITEM_MIN_WIDTH = 280;

// Virtualization threshold - use virtualization only for large lists
const VIRTUALIZATION_THRESHOLD = 50;

// Custom props for List rows
interface ListRowProps {
  providers: Provider[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

// Custom props for Grid cells
interface GridCellProps {
  providers: Provider[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  columnCount: number;
}

// Row component for List virtualization
const ListRowComponent = ({ 
  index, 
  style,
  providers,
  favorites,
  onToggleFavorite
}: {
  ariaAttributes: { "aria-posinset": number; "aria-setsize": number; role: "listitem" };
  index: number;
  style: CSSProperties;
} & ListRowProps): ReactElement | null => {
  const provider = providers[index];
  if (!provider) return null;

  return (
    <div style={{ ...style, paddingBottom: 16, paddingRight: 8 }}>
      <ProviderCard
        provider={provider}
        isGrid={false}
        isFavorite={favorites.includes(provider.id)}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
};

// Cell component for Grid virtualization
const GridCellComponent = ({ 
  columnIndex, 
  rowIndex, 
  style, 
  providers, 
  favorites, 
  onToggleFavorite,
  columnCount 
}: {
  ariaAttributes: { "aria-colindex": number; role: "gridcell" };
  columnIndex: number;
  rowIndex: number;
  style: CSSProperties;
} & GridCellProps): ReactElement | null => {
  const index = rowIndex * columnCount + columnIndex;
  const provider = providers[index];
  if (!provider) return null;

  return (
    <div style={{ ...style, padding: 8 }}>
      <ProviderCard
        provider={provider}
        isGrid={true}
        isFavorite={favorites.includes(provider.id)}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
};

export const SearchResults = ({ providers, viewMode, searchQuery }: SearchResultsProps) => {
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 600 });

  // Calculate container size for virtualization
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width || 800,
          height: Math.max(window.innerHeight - 200, 400)
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const toggleFavorite = useCallback((providerId: string) => {
    setFavorites(prev =>
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  }, []);

  // Calculate grid columns based on container width
  const columnCount = Math.max(1, Math.floor(containerSize.width / GRID_ITEM_MIN_WIDTH));
  const columnWidth = containerSize.width / columnCount;
  const rowCount = Math.ceil(providers.length / columnCount);

  if (providers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('search', 'noResults')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('common', 'error')} - {t('search', 'noResults')}
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{t('common', 'filters')}:</p>
            <ul className="list-disc list-inside text-left">
              <li>{t('search', 'filterByArea')}</li>
              <li>{t('search', 'filterByType')}</li>
              <li>{t('search', 'filterByRating')}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Use standard rendering for small lists, virtualization for large lists
  const useVirtualization = providers.length > VIRTUALIZATION_THRESHOLD;

  return (
    <div className="flex-1 p-4" ref={containerRef}>
      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {providers.length} {t('search', 'results')} {searchQuery && `pour "${searchQuery}"`}
      </div>

      {useVirtualization ? (
        // Virtualized rendering for large lists
        viewMode === 'grid' ? (
          <Grid
            columnCount={columnCount}
            columnWidth={columnWidth}
            rowCount={rowCount}
            rowHeight={GRID_ITEM_HEIGHT}
            style={{ height: containerSize.height, width: containerSize.width }}
            className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
            cellComponent={GridCellComponent}
            cellProps={{
              providers,
              favorites,
              onToggleFavorite: toggleFavorite,
              columnCount
            } as GridCellProps}
          />
        ) : (
          <List
            rowCount={providers.length}
            rowHeight={LIST_ITEM_HEIGHT}
            style={{ height: containerSize.height, width: containerSize.width }}
            className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
            rowComponent={ListRowComponent}
            rowProps={{
              providers,
              favorites,
              onToggleFavorite: toggleFavorite
            } as ListRowProps}
          />
        )
      ) : (
        // Standard rendering for small lists
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-4'
        }>
          {providers.map(provider => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isGrid={viewMode === 'grid'}
              isFavorite={favorites.includes(provider.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
