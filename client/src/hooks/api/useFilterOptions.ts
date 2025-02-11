// src/hooks/api/useFilterOptions.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface FilterOptions {
  agencies: string[];
  countries: string[];
  provinces: string[];
  cities: string[];
}

export function useFilterOptions() {
  return useQuery<FilterOptions>({
    queryKey: ['filterOptions'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3030/search/filter-options');
      return data;
    },
    staleTime: 1000 * 60 * 30, // Consider data fresh for 30 minutes
  });
}