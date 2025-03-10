// src/hooks/api/useGrants.ts
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
    response => response,
    async (error) => {
        // If we get a 409 Conflict from the server (temporary table issue)
        if (error.response?.status === 409 && error.response?.data?.retryable) {
            console.log("Received retryable error, attempting to retry the request...");

            // Wait a short delay before retrying
            await new Promise(resolve => setTimeout(resolve, 500));

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


export function useAllBookmarks(bookmarkType: "grant" | EntityType, user_id: number | undefined | null) {
    return useQuery({
        queryKey: [...bookmarkKeys.type(bookmarkType), user_id],
        queryFn: async () => {
            const response = await API.get<number[]>(`/save/${bookmarkType}/${user_id}`);
            console.log('useAllBookmarks:response:',response)
            return response.data;
        },
        enabled: !!user_id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
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


    return useMutation<void, Error, ToggleBookmarkVariables, { prevBookmarks: number[] }>({
        mutationFn: async ({ user_id, entity_id, isBookmarked }) => {
            if (isBookmarked) {
                // Remove bookmark
                await API.delete(`/save/${bookmarkType}/${entity_id}`);
            } else {
                // Add bookmark
                await API.post(`/save/${bookmarkType}/${entity_id}`, { user_id });
            }
        },
        onMutate: async ({ entity_id, isBookmarked }) => {
            await queryClient.cancelQueries({ queryKey: bookmarkKeys.type(bookmarkType) });


            const prevBookmarks = queryClient.getQueryData<number[]>(bookmarkKeys.type(bookmarkType)) || [];

            queryClient.setQueryData<number[]>(bookmarkKeys.type(bookmarkType), (prev = []) =>
                isBookmarked ? prev.filter((i) => i !== entity_id) : [...prev, entity_id]
            );

            return { prevBookmarks };
        },
        onError: (err, _, context) => {
            if (context && context.prevBookmarks) {
                queryClient.setQueryData(bookmarkKeys.type(bookmarkType), context.prevBookmarks);
                showNotification(
                    "Failed to update bookmark. Please try again.",
                    "error",
                );
            }
        },
        onSuccess: (_, { isBookmarked }) => {
            queryClient.invalidateQueries({ queryKey: bookmarkKeys.type(bookmarkType) });
            showNotification(
                isBookmarked ? "Bookmark removed successfully!" : "Saved to bookmarks!",
                "success",
            );
        },
    });
}
