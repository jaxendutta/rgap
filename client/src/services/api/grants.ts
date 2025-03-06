import axios from "axios";
import { Grant } from "@/types/models";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import portConfig from "../../../../config/ports.json";

const API = axios.create({
    baseURL:
        process.env.VITE_API_URL ||
        `http://localhost:${portConfig.defaults.server}`,
    timeout: 15000,
});

export interface GrantSearchParams {
    searchTerms: {
        recipient?: string;
        institute?: string;
        grant?: string;
    };
    filters: typeof DEFAULT_FILTER_STATE;
    sortConfig: {
        field: "date" | "value";
        direction: "asc" | "desc";
    };
}

export const grantsApi = {
    search: async (params: GrantSearchParams) => {
        try {
            const { data } = await API.post<{ data: Grant[] }>(
                "/search",
                params
            );
            return data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message || "Failed to search grants"
                );
            }
            throw error;
        }
    },

    getAll: async () => {
        try {
            const { data } = await API.get<Grant[]>("/search/all");
            return data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message || "Failed to fetch grants"
                );
            }
            throw error;
        }
    },
};
