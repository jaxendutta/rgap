// src/components/features/bookmarks/BookmarkButton.tsx
// Bookmark button that works for both logged in and logged out users
'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface BookmarkButtonProps {
    entityType: 'grant' | 'recipient' | 'institute';
    entityId: number;
    isBookmarked?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export function BookmarkButton({
    entityType,
    entityId,
    isBookmarked = false,
    size = 'sm',
    showLabel = true,
}: BookmarkButtonProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [loading, setLoading] = useState(false);

    // ============================================================================
    // NOT LOGGED IN: Show "Sign in to bookmark" button
    // ============================================================================
    if (!user) {
        return (
            <Button
                variant="outline"
                size={size}
                onClick={() => router.push(`/login?redirect=${window.location.pathname}`)}
                title="Sign in to bookmark this item"
            >
                <Bookmark className="w-4 h-4" />
                {showLabel && <span className="ml-2">Sign in to bookmark</span>}
            </Button>
        );
    }

    // ============================================================================
    // LOGGED IN: Show actual bookmark toggle
    // ============================================================================
    const handleToggle = async () => {
        setLoading(true);

        try {
            const response = await fetch(`/api/bookmarks/${entityType}`, {
                method: bookmarked ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entityId }),
            });

            if (response.ok) {
                setBookmarked(!bookmarked);
            } else {
                console.error('Failed to toggle bookmark');
            }
        } catch (error) {
            console.error('Bookmark error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={bookmarked ? 'primary' : 'outline'}
            size={size}
            onClick={handleToggle}
            disabled={loading}
            title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
            {bookmarked ? (
                <>
                    <BookmarkCheck className="w-4 h-4" />
                    {showLabel && <span className="ml-2">Bookmarked</span>}
                </>
            ) : (
                <>
                    <Bookmark className="w-4 h-4" />
                    {showLabel && <span className="ml-2">Bookmark</span>}
                </>
            )}
        </Button>
    );
}

export default BookmarkButton;
