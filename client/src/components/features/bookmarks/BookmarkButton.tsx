// src/components/features/bookmarks/BookmarkButton.tsx
import React, { useState, useEffect } from "react";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import { useToggleBookmark } from "@/hooks/api/useBookmarks";
import { Button } from "@/components/common/ui/Button";
import { Entity } from "@/types/models";

interface BookmarkButtonProps {
    entityId: number;
    entityType: keyof Entity;
    isBookmarked?: boolean;
    size?: "sm" | "md" | "lg";
    variant?: "primary" | "secondary" | "outline";
    iconOnly?: boolean;
    className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
    entityId,
    entityType,
    isBookmarked: initialIsBookmarked,
    size = "md",
    variant = "secondary",
    iconOnly = false,
    className,
}) => {
    const { user } = useAuth();
    const { showNotification } = useNotification();

    // Keep track of the visual/UI state of the bookmark button
    const [visualBookmarkState, setVisualBookmarkState] = useState<boolean>(
        initialIsBookmarked ?? false
    );

    // Update the visual state when props change (e.g., due to new API data)
    useEffect(() => {
        if (initialIsBookmarked !== undefined) {
            setVisualBookmarkState(initialIsBookmarked);
        }
    }, [initialIsBookmarked]);

    // Get the mutation function from our hook
    const toggleBookmarkMutation = useToggleBookmark(entityType);

    const handleToggleBookmark = () => {
        if (!user || !user.user_id) {
            showNotification(
                "You must be logged in to bookmark items",
                "error"
            );
            return;
        }

        // Ensure entityId is defined and convert it to the proper type if needed
        if (!entityId) {
            showNotification("Cannot bookmark this item - missing ID", "error");
            return;
        }

        // Update visual state immediately for better UX
        setVisualBookmarkState(!visualBookmarkState);

        // Call the mutation with the CURRENT state (before toggling)
        toggleBookmarkMutation.mutate(
            {
                user_id: user.user_id,
                entity_id: entityId,
                isBookmarked: visualBookmarkState, // The current state before toggling
            },
            {
                onError: (error) => {
                    // Revert visual state on error
                    setVisualBookmarkState(visualBookmarkState);
                    console.error("Bookmark toggle error: ", error);
                    showNotification(
                        `Failed to ${
                            visualBookmarkState ? "remove" : "add"
                        } bookmark. Please try again.`,
                        "error"
                    );
                },
            }
        );
    };

    // For icon-only mode, use a simpler button
    if (iconOnly) {
        return (
            <button
                onClick={handleToggleBookmark}
                disabled={toggleBookmarkMutation.isPending}
                className={cn(
                    "p-1 rounded-full transition-colors focus:outline-none",
                    visualBookmarkState
                        ? "text-blue-600 hover:text-blue-700"
                        : "text-gray-400 hover:text-gray-600",
                    toggleBookmarkMutation.isPending && "opacity-50",
                    className
                )}
                aria-label={
                    visualBookmarkState ? "Remove bookmark" : "Add bookmark"
                }
            >
                {visualBookmarkState ? (
                    <BookmarkCheck
                        className={cn(
                            "h-5 w-5",
                            toggleBookmarkMutation.isPending && "animate-pulse"
                        )}
                    />
                ) : (
                    <BookmarkPlus
                        className={cn(
                            "h-5 w-5",
                            toggleBookmarkMutation.isPending && "animate-pulse"
                        )}
                    />
                )}
            </button>
        );
    }

    // Customize button appearance based on bookmark state
    const buttonVariant = visualBookmarkState ? "secondary" : variant;
    const customClassName = visualBookmarkState
        ? cn(
              "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200",
              className
          )
        : className;

    return (
        <Button
            size={size}
            variant={buttonVariant}
            leftIcon={visualBookmarkState ? BookmarkCheck : BookmarkPlus}
            onClick={handleToggleBookmark}
            disabled={toggleBookmarkMutation.isPending}
            isLoading={toggleBookmarkMutation.isPending}
            className={customClassName}
        >
            <span className="hidden md:inline">
                {visualBookmarkState ? "Bookmarked" : "Bookmark"}
            </span>
        </Button>
    );
};

export default BookmarkButton;
