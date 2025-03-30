// src/hooks/api/useBookmarks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import { Entity } from "@/types/models";
import createAPI from "@/utils/api";
import { formatSentenceCase } from "@/utils/format";

const API = createAPI();

export const bookmarkKeys = {
    all: ["bookmarks"] as const,
    type: (bookmarkType: keyof Entity) =>
        [...bookmarkKeys.all, bookmarkType] as const,
    user: (userId: number | null | undefined) =>
        [...bookmarkKeys.all, userId] as const,
    userType: (bookmarkType: keyof Entity, userId: number | null | undefined) =>
        [...bookmarkKeys.type(bookmarkType), userId] as const,
};

/**
 * Hook to fetch all bookmarked IDs for a given entity type and user
 */
export function useAllBookmarks(
    bookmarkType: keyof Entity,
    userId: number | null | undefined
) {
    return useQuery({
        queryKey: bookmarkKeys.userType(bookmarkType, userId),
        queryFn: async () => {
            // Skip the API call if user_id is not present
            if (!userId) {
                return [];
            }

            try {
                const response = await API.get(
                    `/bookmark/${bookmarkType}/ids/${userId}`
                );
                return response.data;
            } catch (error) {
                console.error(
                    `Error fetching ${bookmarkType} bookmarks:`,
                    error
                );
                return [];
            }
        },
        enabled: !!userId, // Only run query if userId exists
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook to fetch all bookmarked entities with their details
 */
export function useBookmarkedEntities(
    bookmarkType: keyof Entity,
    userId: number | null | undefined
) {
    return useQuery({
        queryKey: [...bookmarkKeys.userType(bookmarkType, userId), "details"],
        queryFn: async () => {
            // Skip the API call if user_id is not present
            if (!userId) {
                return [];
            }

            try {
                const response = await API.get(
                    `/bookmark/${bookmarkType}/${userId}`
                );
                return response.data;
            } catch (error) {
                console.error(
                    `Error fetching ${bookmarkType} bookmarks:`,
                    error
                );
                return [];
            }
        },
        enabled: !!userId, // Only run query if userId exists
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

interface ToggleBookmarkVariables {
    user_id: number;
    entity_id: number | string;
    isBookmarked: boolean;
}

/**
 * Hook to toggle bookmark status (add or remove)
 */
export function useToggleBookmark(bookmarkType: keyof Entity) {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    return useMutation({
        mutationFn: async ({
            user_id,
            entity_id,
            isBookmarked,
        }: ToggleBookmarkVariables) => {
            // Ensure entity_id is not undefined
            if (!entity_id) {
                throw new Error("Entity ID is required for bookmarking!");
            }

            if (isBookmarked) {
                // Remove bookmark
                const response = await API.delete(
                    `/bookmark/${bookmarkType}/${entity_id}`,
                    {
                        data: { user_id, isBookmarked },
                    }
                );
                return { removed: true, data: response.data };
            } else {
                // Add bookmark
                const response = await API.post(
                    `/bookmark/${bookmarkType}/${entity_id}`,
                    {
                        user_id,
                        isBookmarked,
                    }
                );
                return { added: true, data: response.data };
            }
        },
        // Use onMutate for optimistic updates
        onMutate: async ({ user_id, entity_id, isBookmarked }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: bookmarkKeys.userType(bookmarkType, user_id),
            });

            // Snapshot the previous value
            const previousIds =
                queryClient.getQueryData<any[]>(
                    bookmarkKeys.userType(bookmarkType, user_id)
                ) || [];

            // Optimistically update to the new value
            // Important: the change here is that we want to immediately show the result AFTER the toggle
            queryClient.setQueryData(
                bookmarkKeys.userType(bookmarkType, user_id),
                (old: any[] = []) => {
                    // If currently bookmarked (and we're removing)
                    if (isBookmarked) {
                        return old.filter((id) => id !== entity_id);
                    }
                    // If not currently bookmarked (and we're adding)
                    else {
                        // Only add if it's not already there
                        return old.includes(entity_id)
                            ? old
                            : [...old, entity_id];
                    }
                }
            );

            // Return a context object with the previous value
            return { previousIds, newBookmarkState: !isBookmarked };
        },
        onError: (err, variables, context) => {
            if (context) {
                // Reset to the previous value on error
                queryClient.setQueryData(
                    bookmarkKeys.userType(bookmarkType, variables.user_id),
                    context.previousIds
                );
            }
            showNotification(
                `Failed to ${
                    variables.isBookmarked ? "remove" : "add"
                } bookmark. Please try again.\n\nError: ${err.message}`,
                "error"
            );
        },
        onSuccess: (_, { isBookmarked }) => {
            // Show success notification
            showNotification(
                isBookmarked
                    ? `${formatSentenceCase(
                          bookmarkType
                      )} removed from bookmarks`
                    : `${formatSentenceCase(bookmarkType)} added to bookmarks!`,
                "success"
            );
        },
        onSettled: (_, __, { user_id }) => {
            // Invalidate the relevant queries
            queryClient.invalidateQueries({
                queryKey: bookmarkKeys.userType(bookmarkType, user_id),
            });
        },
    });
}
