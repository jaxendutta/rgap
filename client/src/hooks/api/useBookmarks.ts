// src/hooks/api/useBookmarks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import portConfig from "../../../../config/ports.json";
import { EntityType } from "@/components/common/ui/EntityCard";
import { useNotification } from "@/components/features/notifications/NotificationProvider";

const API = axios.create({
    baseURL:
        process.env.VITE_API_URL ||
        `http://localhost:${portConfig.defaults.server}`,
    timeout: 15000,
});

// Configure retry logic for specific error codes
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        // If we get a 409 Conflict from the server (temporary table issue)
        if (error.response?.status === 409 && error.response?.data?.retryable) {
            console.log(
                "Received retryable error, attempting to retry the request..."
            );

            // Wait a short delay before retrying
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Retry the request
            return API(error.config);
        }

        // For all other errors, just reject the promise
        return Promise.reject(error);
    }
);

export const bookmarkKeys = {
    all: ["bookmarks"] as const,
    type: (bookmarkType: "grant" | EntityType) =>
        [...bookmarkKeys.all, bookmarkType] as const,
};

export function useAllBookmarks(
    bookmarkType: "grant" | EntityType,
    user_id: number | undefined | null
) {
    return useQuery({
        queryKey: [...bookmarkKeys.type(bookmarkType), user_id],
        queryFn: async () => {
            // Skip the API call if user_id is not present
            if (!user_id) {
                return [];
            }

            try {
                const response = await API.get<number[]>(
                    `/save/${bookmarkType}/id/${user_id}`
                );
                // Convert object to array of numbers (entity IDs)
                const idsArray = response.data.map(
                    (entry) => Object.values(entry)[0] as number
                );
                return idsArray;
            } catch (error) {
                console.error(
                    `Error fetching ${bookmarkType} bookmarks:`,
                    error
                );
                // Return empty array on error instead of throwing
                return [];
            }
        },
        enabled: !!user_id, // Only run query if user_id exists
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1, // Only retry once
    });
}

interface ToggleBookmarkVariables {
    user_id: number;
    entity_id: number;
    isBookmarked: boolean;
}

export function useToggleBookmark(bookmarkType: "grant" | EntityType) {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    return useMutation<
        void,
        Error,
        ToggleBookmarkVariables,
        { prevBookmarks: number[]; queryKey: (string | number)[] }
    >({
        mutationFn: async ({ user_id, entity_id, isBookmarked }) => {
            if (isBookmarked) {
                // Remove bookmark
                await API.delete(`/save/${bookmarkType}/${entity_id}`, {
                    data: { user_id },
                });
            } else {
                // Add bookmark
                await API.post(`/save/${bookmarkType}/${entity_id}`, {
                    user_id,
                });
            }
        },
        onMutate: async ({ user_id, entity_id, isBookmarked }) => {
            const queryKey = [...bookmarkKeys.type(bookmarkType), user_id];
            await queryClient.cancelQueries({ queryKey });

            const prevBookmarks =
                queryClient.getQueryData<number[]>(queryKey) || [];

            // Optimistically update UI
            queryClient.setQueryData<number[]>(queryKey, (prev = []) =>
                isBookmarked
                    ? prev.filter((id) => id !== entity_id)
                    : [...prev, entity_id]
            );

            return { prevBookmarks, queryKey };
        },
        onError: (_, __, context) => {
            if (context && context.prevBookmarks) {
                // Revert to previous state on error
                queryClient.setQueryData(
                    context.queryKey,
                    context.prevBookmarks
                );
                showNotification(
                    "Failed to update bookmark. Please try again.",
                    "error"
                );
            }
        },
        onSuccess: (_, { isBookmarked }) => {
            showNotification(
                isBookmarked
                    ? "Bookmark removed successfully!"
                    : "Saved to bookmarks!",
                "success"
            );
        },
        onSettled: (_, __, { user_id }) => {
            // Always invalidate the query to ensure data is fresh
            queryClient.invalidateQueries({
                queryKey: [...bookmarkKeys.type(bookmarkType), user_id],
            });
        },
    });
}
