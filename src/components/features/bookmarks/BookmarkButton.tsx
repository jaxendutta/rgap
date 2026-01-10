// src/components/features/bookmarks/BookmarkButton.tsx
'use client';

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useNotify } from "@/providers/NotificationProvider";
import { cn } from "@/lib/utils";
import {
    toggleGrantBookmark,
    toggleRecipientBookmark,
    toggleInstituteBookmark,
} from "@/app/actions/bookmarks";

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
    const [isPending, startTransition] = useTransition();

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // 1. GUEST CHECK: If not logged in, prompt and redirect
        if (!user) {
            notify("Please log in to save bookmarks", "info");
            router.push('/login');
            return;
        }

        // 2. OPTIMISTIC UPDATE (instant UI feedback)
        const previousState = isBookmarked;
        setIsBookmarked(!isBookmarked);

        // 3. CALL SERVER ACTION (no API route needed!)
        startTransition(async () => {
            try {
                let result;

                switch (entityType) {
                    case 'grant':
                        result = await toggleGrantBookmark(entityId);
                        break;
                    case 'recipient':
                        result = await toggleRecipientBookmark(entityId);
                        break;
                    case 'institute':
                        result = await toggleInstituteBookmark(entityId);
                        break;
                }

                if (!result.success) {
                    // Revert on error
                    setIsBookmarked(previousState);
                    notify(result.error || "Failed to update bookmark", "error");
                } else {
                    // Success - server action already revalidated the page
                    notify(
                        result.isBookmarked ? "Saved to bookmarks" : "Removed from bookmarks",
                        "success"
                    );
                }
            } catch (error) {
                // Revert on error
                setIsBookmarked(previousState);
                notify("Failed to update bookmark", "error");
            }
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={cn(
                "p-2 rounded-full transition-all duration-200",
                isBookmarked
                    ? "text-yellow-500 hover:bg-yellow-50"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
                isPending && "opacity-50 cursor-not-allowed",
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
