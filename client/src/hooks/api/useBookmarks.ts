// src/hooks/api/useBookmarks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import { BookmarkType } from "@/types/bookmark";
import createAPI from "@/utils/api";
import { formatSentenceCase } from "@/utils/format";

const API = createAPI(15000); // Increase timeout to 15 seconds

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
    type: (bookmarkType: BookmarkType) =>
        [...bookmarkKeys.all, bookmarkType] as const,
};

export function useAllBookmarks(
    bookmarkType: BookmarkType,
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
                // Special handling for search bookmarks since there's no endpoint yet
                if (bookmarkType === "search") {
                    // Return empty array for now or mock data if needed
                    // In a production app, you would implement the server endpoint
                    console.log(
                        "Search bookmarks functionality not implemented on server yet"
                    );
                    return [];
                }

                const response = await API.get<any[]>(
                    `/save/${bookmarkType}/id/${user_id}`
                );

                // For grants, we now get ref_number instead of ref_number
                if (bookmarkType === "grant") {
                    const idsArray = response.data.map(
                        (entry) => entry.ref_number
                    );
                    return idsArray;
                }

                // For recipients and institutes, we still get the respective IDs
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
    entity_id: number | string; // Can be either grant ref_number (string) or ID (number)
    isBookmarked: boolean;
}

export function useToggleBookmark(bookmarkType: BookmarkType) {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    return useMutation<
        void,
        Error,
        ToggleBookmarkVariables,
        { prevBookmarks: (number | string)[]; queryKey: (string | number)[] }
    >({
        mutationFn: async ({ user_id, entity_id, isBookmarked }) => {
            // Special handling for search bookmarks
            if (bookmarkType === "search") {
                // This is a placeholder since the search bookmark API is not implemented yet
                console.log(
                    `Would ${
                        isBookmarked ? "remove" : "add"
                    } search bookmark ${entity_id}`
                );
                // In a real app, we would implement the API call
                return;
            }

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
                queryClient.getQueryData<(number | string)[]>(queryKey) || [];

            // Optimistically update UI
            queryClient.setQueryData<(number | string)[]>(
                queryKey,
                (prev = []) =>
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
                    ? `${formatSentenceCase(
                          bookmarkType
                      )} removed from bookmarks!`
                    : `${formatSentenceCase(bookmarkType)} bookmarked!`,
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
