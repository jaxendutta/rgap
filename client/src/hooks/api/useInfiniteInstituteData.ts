// src/hooks/api/useInfiniteInstituteData.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import portConfig from "../../../../config/ports.json";
import { instituteKeys } from "./useInstitutes";

const API = axios.create({
    baseURL:
        process.env.VITE_API_URL ||
        `http://localhost:${portConfig.defaults.server}`,
    timeout: 10000,
});

// Hook for infinite loading of institute recipients with sorting
export function useInfiniteInstituteRecipients(
    instituteId: string | number,
    pageSize = 10,
    sortField: "grants_count" | "total_funding" = "total_funding",
    sortDirection: "asc" | "desc" = "desc"
) {
    return useInfiniteQuery({
        queryKey: [
            ...instituteKeys.recipients(Number(instituteId)),
            { pageSize, sortField, sortDirection },
        ],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await API.get(
                `/institutes/${instituteId}/recipients`,
                {
                    params: {
                        page: pageParam,
                        pageSize,
                        sortField,
                        sortDirection,
                    },
                }
            );
            return response.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (
                lastPage.metadata &&
                lastPage.metadata.page < lastPage.metadata.totalPages
            ) {
                return lastPage.metadata.page + 1;
            }
            return undefined;
        },
    });
}

// Hook for infinite loading of institute grants with sorting
export function useInfiniteInstituteGrants(
    instituteId: string | number,
    pageSize = 10,
    sortField: "date" | "value" = "date",
    sortDirection: "asc" | "desc" = "desc"
) {
    return useInfiniteQuery({
        queryKey: [
            ...instituteKeys.grants(Number(instituteId)),
            { pageSize, sortField, sortDirection },
        ],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await API.get(
                `/institutes/${instituteId}/grants`,
                {
                    params: {
                        page: pageParam,
                        pageSize,
                        sortField,
                        sortDirection,
                    },
                }
            );
            return response.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (
                lastPage.metadata &&
                lastPage.metadata.page < lastPage.metadata.totalPages
            ) {
                return lastPage.metadata.page + 1;
            }
            return undefined;
        },
    });
}
