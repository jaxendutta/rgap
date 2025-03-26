// src/components/features/bookmarks/BookmarkButton.tsx
import React from "react";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import { useAllBookmarks, useToggleBookmark } from "@/hooks/api/useBookmarks";
import { BookmarkType } from "@/types/bookmark";
import { Button } from "@/components/common/ui/Button";

interface BookmarkButtonProps {
    entityId: number | string;
    entityType: BookmarkType;
    isBookmarked?: boolean; // Optional override if you already know the state
    size?: "sm" | "md" | "lg";
    variant?: "primary" | "secondary" | "outline";
    iconOnly?: boolean;
    className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
    entityId,
    entityType,
    isBookmarked: externalIsBookmarked,
    size = "md",
    variant = "secondary",
    iconOnly = false,
    className,
}) => {
    const { user } = useAuth();
    const { showNotification } = useNotification();

    // If isBookmarked is not explicitly provided, look it up from our hook
    const { data: bookmarkedIds = [] } = useAllBookmarks(
        entityType,
        user?.user_id
    );

    // Use the external isBookmarked if provided, otherwise check our bookmarkedIds
    const isBookmarked =
        externalIsBookmarked !== undefined
            ? externalIsBookmarked
            : bookmarkedIds.includes(entityId);

    const toggleBookmarkMutation = useToggleBookmark(entityType);

    const handleToggleBookmark = () => {
        if (!user || !user.user_id) {
            showNotification(
                "You must be logged in to bookmark items",
                "error"
            );
            return;
        }

        toggleBookmarkMutation.mutate(
            {
                user_id: user.user_id,
                entity_id: entityId,
                isBookmarked,
            },
            {
                onSuccess: () => {
                    showNotification(
                        isBookmarked
                            ? "Bookmark removed successfully"
                            : "Bookmark added successfully",
                        "success"
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
                className={cn(
                    "p-1 rounded-full transition-colors focus:outline-none",
                    isBookmarked
                        ? "text-blue-600 hover:text-blue-700"
                        : "text-gray-400 hover:text-gray-600",
                    className
                )}
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
                {isBookmarked ? (
                    <BookmarkCheck className="h-5 w-5" />
                ) : (
                    <BookmarkPlus className="h-5 w-5" />
                )}
            </button>
        );
    }

    // Customize button appearance based on bookmark state
    const buttonVariant = isBookmarked ? "secondary" : variant;
    const customClassName = isBookmarked
        ? cn(
              "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200",
              className
          )
        : className;

    return (
        <Button
            size={size}
            variant={buttonVariant}
            leftIcon={isBookmarked ? BookmarkCheck : BookmarkPlus}
            onClick={handleToggleBookmark}
            className={customClassName}
        >
            <span className="hidden lg:inline">{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
        </Button>
    );
};

export default BookmarkButton;
