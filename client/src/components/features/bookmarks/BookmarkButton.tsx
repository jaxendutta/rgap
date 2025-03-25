// src/components/features/bookmarks/BookmarkButton.tsx
import React from "react";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import { useAllBookmarks, useToggleBookmark } from "@/hooks/api/useBookmarks";
import { BookmarkType } from "@/types/bookmark";

interface BookmarkButtonProps {
    entityId: number | string;
    entityType: BookmarkType;
    isBookmarked?: boolean; // Optional override if you already know the state
    size?: "sm" | "md" | "lg";
    variant?: "icon" | "button" | "text";
    label?: string;
    className?: string;
    iconOnly?: boolean;
    onBookmarkChange?: (isBookmarked: boolean) => void;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
    entityId,
    entityType,
    isBookmarked: externalIsBookmarked,
    size = "md",
    variant = "icon",
    label = "",
    className,
    iconOnly = false,
    onBookmarkChange,
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
                    // Call the callback if provided
                    if (onBookmarkChange) {
                        onBookmarkChange(!isBookmarked);
                    }
                },
            }
        );
    };

    // Define size-specific classes
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
    };

    // Render based on variant
    switch (variant) {
        case "button":
            return (
                <button
                    onClick={handleToggleBookmark}
                    className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors",
                        isBookmarked
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100",
                        className
                    )}
                >
                    {isBookmarked ? (
                        <BookmarkCheck className={sizeClasses[size]} />
                    ) : (
                        <BookmarkPlus className={sizeClasses[size]} />
                    )}
                    {!iconOnly && (
                        <span className="text-sm font-medium">
                            {label ||
                                (isBookmarked ? "Bookmarked" : "Bookmark")}
                        </span>
                    )}
                </button>
            );

        case "text":
            return (
                <button
                    onClick={handleToggleBookmark}
                    className={cn(
                        "flex items-center gap-2 text-sm font-medium transition-colors",
                        isBookmarked
                            ? "text-blue-600"
                            : "text-gray-600 hover:text-gray-800",
                        className
                    )}
                >
                    {isBookmarked ? (
                        <BookmarkCheck className={sizeClasses[size]} />
                    ) : (
                        <BookmarkPlus className={sizeClasses[size]} />
                    )}
                    {!iconOnly && (
                        <span>
                            {label ||
                                (isBookmarked ? "Bookmarked" : "Bookmark")}
                        </span>
                    )}
                </button>
            );

        case "icon":
        default:
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
                    aria-label={
                        isBookmarked ? "Remove bookmark" : "Add bookmark"
                    }
                >
                    {isBookmarked ? (
                        <BookmarkCheck className={sizeClasses[size]} />
                    ) : (
                        <BookmarkPlus className={sizeClasses[size]} />
                    )}
                </button>
            );
    }
};

export default BookmarkButton;
