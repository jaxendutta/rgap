// src/hooks/api/useFilterOptions.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import portConfig from "../../../../config/ports.json";

const API = axios.create({
    baseURL:
        process.env.VITE_API_URL ||
        `http://localhost:${portConfig.defaults.server}`,
    timeout: 5000,
});

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
