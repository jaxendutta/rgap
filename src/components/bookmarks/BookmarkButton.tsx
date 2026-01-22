// src/components/bookmarks/BookmarkButton.tsx
"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useNotify } from "@/providers/NotificationProvider";
import { usePathname } from "next/navigation";
import { LuBookmark, LuBookmarkCheck } from "react-icons/lu";
import { useState } from "react";
import { Button, variants } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    toggleGrantBookmark,
    toggleRecipientBookmark,
    toggleInstituteBookmark,
    toggleSearchBookmark
} from "@/app/actions/bookmarks";

interface BookmarkButtonProps {
    entityType: "grant" | "recipient" | "institute" | "search";
    entityId: number;
    isBookmarked?: boolean;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    variant?: keyof typeof variants;
    className?: string;
}

export function BookmarkButton({
    entityType,
    entityId,
    isBookmarked = false,
    size = "sm",
    showLabel = true,
    variant = "outline",
    className,
}: BookmarkButtonProps) {
    const { user } = useAuth();
    const { notify } = useNotify();
    const pathname = usePathname();
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        if (!user) {
            notify(
                <span>
                    Please <Link href={`/login?redirect=${pathname}`} className="underline font-bold">sign in</Link> to bookmark items.
                </span>,
                "info"
            );
            return;
        }

        setLoading(true);
        try {
            let result;

            switch (entityType) {
                case "grant":
                    result = await toggleGrantBookmark(entityId);
                    break;
                case "recipient":
                    result = await toggleRecipientBookmark(entityId);
                    break;
                case "institute":
                    result = await toggleInstituteBookmark(entityId);
                    break;
                case "search":
                    result = await toggleSearchBookmark(entityId);
                    break;
            }

            if (result && result.success) {
                // Fix: explicit boolean cast
                setBookmarked(!!result.isBookmarked);

                // Fix: Use 'info' or 'success' which are valid ToastTypes
                if (result.isBookmarked) notify("Saved to bookmarks", "success");
                else notify("Removed from bookmarks", "info");
            } else {
                notify(result?.error || "Failed to update bookmark", "error");
            }
        } catch (error) {
            console.error("Bookmark error:", error);
            notify("Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggle(); }}
            disabled={loading}
            title={bookmarked ? "Remove bookmark" : "Add bookmark"}
            className={cn(
                bookmarked ? "bg-blue-600 hover:bg-blue-500" :
                    variant === "outline" ? "bg-white" : "",
                className
            )}
        >
            {bookmarked ? (
                <>
                    <LuBookmarkCheck className="w-4 h-4 text-blue-50" />
                    {showLabel && <span className="hidden md:inline-flex text-blue-50">Bookmarked</span>}
                </>
            ) : (
                <>
                    <LuBookmark className="w-4 h-4" />
                    {showLabel && <span className="hidden md:inline-flex">Bookmark</span>}
                </>
            )}
        </Button>
    );
}

export default BookmarkButton;
