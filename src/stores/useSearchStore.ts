import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchFilters {
  type: string;
  location: string;
  rating: number | null;
  emergency: boolean;
  accessible: boolean;
}

interface SearchState {
  query: string;
  filters: SearchFilters;
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: SearchFilters = {
  type: '',
  location: '',
  rating: null,
  emergency: false,
  accessible: false,
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      query: '',
      filters: defaultFilters,
      setQuery: (query) => set({ query }),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: defaultFilters, query: '' }),
    }),
    {
      name: 'cityhealth-search',
    }
  )
);
