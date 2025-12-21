import React, { useState, useEffect } from 'react';
import { SearchInterface } from '@/components/search/SearchInterface';
import { AdvancedFilters } from '@/components/search/AdvancedFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchMap } from '@/components/search/SearchMap';
import { CityHealthProvider } from '@/data/providers';
import { getVerifiedProviders } from '@/services/firestoreProviderService';

export type ViewMode = 'list' | 'grid' | 'map';
export type SortOption = 'relevance' | 'distance' | 'rating' | 'price' | 'newest';

export interface FilterState {
  categories: string[];
  location: string;
  radius: number;
  availability: string;
  minRating: number;
  verifiedOnly: boolean;
  emergencyServices: boolean;
  wheelchairAccessible: boolean;
  insuranceAccepted: boolean;
  priceRange: [number, number];
}

export type Provider = CityHealthProvider;

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    location: '',
    radius: 25,
    availability: 'any',
    minRating: 0,
    verifiedOnly: false,
    emergencyServices: false,
    wheelchairAccessible: false,
    insuranceAccepted: false,
    priceRange: [0, 500]
  });

  // Load providers from Firestore
  useEffect(() => {
    const loadProviders = async () => {
      setLoading(true);
      try {
        const providers = await getVerifiedProviders();
        setAllProviders(providers);
        setFilteredProviders(providers);
      } catch (error) {
        console.error('Error loading providers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProviders();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let results = allProviders;

    // Text search
    if (searchQuery) {
      results = results.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (provider.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      results = results.filter(provider =>
        filters.categories.some(category => 
          (provider.specialty || '').toLowerCase().includes(category.toLowerCase()) ||
          provider.type.toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    // Rating filter
    if (filters.minRating > 0) {
      results = results.filter(provider => provider.rating >= filters.minRating);
    }

    // Verified only
    if (filters.verifiedOnly) {
      results = results.filter(provider => provider.verified);
    }

    // Emergency services
    if (filters.emergencyServices) {
      results = results.filter(provider => provider.emergency);
    }

    // Sort results
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      default:
        break;
    }

    setFilteredProviders(results);
  }, [searchQuery, filters, sortBy, allProviders]);

  return (
    <div className="min-h-screen bg-background">
      {/* Search Interface */}
      <SearchInterface
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        resultCount={filteredProviders.length}
      />

      <div className="flex">
        {/* Advanced Filters Sidebar */}
        <AdvancedFilters
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
        />

        {/* Main Content */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : viewMode === 'map' ? (
            <SearchMap providers={filteredProviders} />
          ) : (
            <SearchResults 
              providers={filteredProviders}
              viewMode={viewMode}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
