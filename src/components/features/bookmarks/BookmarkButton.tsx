'use client';

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useNotify } from "@/providers/NotificationProvider";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
    entityId: number;
    entityType: 'grant' | 'recipient' | 'institute';
    initialIsBookmarked?: boolean;
    className?: string;
}

export default function BookmarkButton({
    entityId,
    entityType,
    initialIsBookmarked = false,
    className
}: BookmarkButtonProps) {
    const { user } = useAuth();
    const { notify } = useNotify();
    const router = useRouter();
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // 1. GUEST CHECK: If not logged in, prompt and redirect
        if (!user) {
            notify("Please log in to save bookmarks", "info");
            router.push('/login');
            return;
        }

        // 2. LOGGED IN: Proceed with bookmark logic
        setIsLoading(true);
        try {
            // Call your server action or API here
            // await toggleBookmarkAction(entityId, entityType); 
            setIsBookmarked(!isBookmarked);
            notify(isBookmarked ? "Removed from bookmarks" : "Saved to bookmarks", "success");
        } catch (error) {
            notify("Failed to update bookmark", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={cn(
                "p-2 rounded-full transition-all duration-200",
                isBookmarked
                    ? "text-yellow-500 hover:bg-yellow-50"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
                className
            )}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
            <Bookmark
                className={cn("w-5 h-5", isBookmarked && "fill-current")}
            />
        </button>
    );
}
