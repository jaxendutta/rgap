// src/hooks/api/useFilterOptions.ts
import { useQuery } from "@tanstack/react-query";
import createAPI from '@/utils/api';

const API = createAPI(5000); // Use 5000ms timeout

interface FilterOptions {
    agencies: string[];
    countries: string[];
    provinces: string[];
    cities: string[];
}

export function useFilterOptions() {
    return useQuery<FilterOptions>({
        queryKey: ["filterOptions"],
        queryFn: async () => {
            const { data } = await API.get<FilterOptions>(
                "/search/filter-options"
            );
            return data;
        },
        staleTime: 1000 * 60 * 30, // Consider data fresh for 30 minutes
        gcTime: 1000 * 60 * 60, // Keep in garbage collection for 1 hour
    });
}
