"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useNotify } from "@/providers/NotificationProvider";
import { usePathname } from "next/navigation";
import { LuBookmark, LuBookmarkCheck } from "react-icons/lu";
import { useState } from "react";
import { Button, variants } from "@/components/ui/Button";
import Link from "next/link";

interface BookmarkButtonProps {
    entityType: "grant" | "recipient" | "institute" | "search";
    entityId: number;
    isBookmarked?: boolean;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    variant?: keyof typeof variants;
}

export function BookmarkButton({
    entityType,
    entityId,
    isBookmarked = false,
    size = "sm",
    showLabel = true,
    variant = "outline",
}: BookmarkButtonProps) {
    const { user } = useAuth();
    const { notify } = useNotify();
    const pathname = usePathname();
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        // 1. Check if user is logged in
        if (!user) {
            notify(
                <span>
                    Please{" "}
                    <Link
                        href={`/login?redirect=${pathname}`}
                        className="underline font-bold hover:text-blue-800 transition-colors"
                    >
                        sign in
                    </Link>{" "}
                    to bookmark items.
                </span>,
                "info"
            );
            return;
        }

        // 2. Perform Bookmark Action
        setLoading(true);
        try {
            const response = await fetch(`/api/bookmarks/${entityType}`, {
                method: bookmarked ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entityId }),
            });

            if (response.ok) {
                setBookmarked(!bookmarked);
                // Optional: Notify success on add
                if (!bookmarked) {
                    notify("Saved to bookmarks", "success");
                }
            } else {
                notify("Failed to update bookmark", "error");
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
            onClick={handleToggle}
            disabled={loading}
            title={bookmarked ? "Remove bookmark" : "Add bookmark"}
            className={variant === "outline" ? "bg-white" : ""}
        >
            {bookmarked ? (
                <>
                    <LuBookmarkCheck className="w-4 h-4 text-blue-600" />
                    {showLabel && (
                        <span className="hidden md:inline-flex">Bookmarked</span>
                    )}
                </>
            ) : (
                <>
                    <LuBookmark className="w-4 h-4" />
                    {showLabel && (
                        <span className="hidden md:inline-flex">Bookmark</span>
                    )}
                </>
            )}
        </Button>
    );
}

export default BookmarkButton;
