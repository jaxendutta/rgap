import { useQuery } from '@tanstack/react-query';
import { grantsApi, GrantSearchParams } from '@/services/api/grants';

export const grantKeys = {
  all: ['grants'] as const,
  search: (params: GrantSearchParams) => [...grantKeys.all, 'search', params] as const,
};

export function useGrantSearch(params: GrantSearchParams) {
  return useQuery({
    queryKey: grantKeys.search(params),
    queryFn: () => grantsApi.search(params),
    enabled: false, // Only search when button is clicked
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
}

export function useAllGrants() {
  return useQuery({
    queryKey: grantKeys.all,
    queryFn: grantsApi.getAll,
    staleTime: 5 * 60 * 1000,
  });
}