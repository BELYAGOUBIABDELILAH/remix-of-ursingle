import React, { useState, useMemo } from 'react';
import { SearchInterface } from '@/components/search/SearchInterface';
import { AdvancedFilters } from '@/components/search/AdvancedFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchMap } from '@/components/search/SearchMap';
import { SearchResultsSkeleton } from '@/components/search/SearchResultsSkeleton';
import { SearchError } from '@/components/search/SearchError';
import { useVerifiedProviders } from '@/hooks/useProviders';
import type { CityHealthProvider } from '@/data/providers';

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

  // Use TanStack Query for Firestore data - only fetches verified & public providers
  const { data: allProviders = [], isLoading, isError, error, refetch } = useVerifiedProviders();

  // Filter and search logic using useMemo for performance
  const filteredProviders = useMemo(() => {
    let results = [...allProviders];

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(provider =>
        provider.name.toLowerCase().includes(query) ||
        (provider.specialty || '').toLowerCase().includes(query) ||
        provider.address.toLowerCase().includes(query) ||
        provider.type.toLowerCase().includes(query)
      );
    }

    // Category filter - match against type and specialty
    if (filters.categories.length > 0) {
      results = results.filter(provider =>
        filters.categories.some(category => {
          const categoryLower = category.toLowerCase();
          const typeLower = provider.type.toLowerCase();
          const specialtyLower = (provider.specialty || '').toLowerCase();
          
          // Map filter categories to provider types
          if (categoryLower === 'doctors' || categoryLower === 'specialists') {
            return typeLower.includes('doctor') || typeLower.includes('clinic') || typeLower.includes('specialist');
          }
          if (categoryLower === 'pharmacies') {
            return typeLower.includes('pharmacy');
          }
          if (categoryLower === 'laboratories') {
            return typeLower.includes('laboratory') || typeLower.includes('lab');
          }
          if (categoryLower === 'clinics') {
            return typeLower.includes('clinic') || typeLower.includes('hospital');
          }
          
          return specialtyLower.includes(categoryLower) || typeLower.includes(categoryLower);
        })
      );
    }

    // Rating filter
    if (filters.minRating > 0) {
      results = results.filter(provider => provider.rating >= filters.minRating);
    }

    // Verified only filter (note: useVerifiedProviders already returns only verified providers)
    if (filters.verifiedOnly) {
      results = results.filter(provider => provider.verified);
    }

    // Emergency services filter
    if (filters.emergencyServices) {
      results = results.filter(provider => provider.emergency);
    }

    // Sort results (create new array to avoid mutating)
    const sortedResults = [...results];
    switch (sortBy) {
      case 'rating':
        sortedResults.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        sortedResults.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        break;
      case 'newest':
        // Sort by id (assuming newer providers have higher/later ids)
        // Note: Could add createdAt to CityHealthProvider if needed
        sortedResults.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        // Relevance - keep original order (or could implement scoring)
        break;
    }

    return sortedResults;
  }, [allProviders, searchQuery, filters, sortBy]);

  // Render content based on state
  const renderContent = () => {
    if (isLoading) {
      return <SearchResultsSkeleton viewMode={viewMode} count={8} />;
    }

    if (isError && error) {
      return <SearchError error={error} onRetry={() => refetch()} />;
    }

    if (viewMode === 'map') {
      return <SearchMap providers={filteredProviders} />;
    }

    return (
      <SearchResults 
        providers={filteredProviders}
        viewMode={viewMode}
        searchQuery={searchQuery}
      />
    );
  };

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
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
