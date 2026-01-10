// src/app/actions/bookmarks.ts
'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function toggleGrantBookmark(grantId: number) {
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, error: 'Must be logged in to bookmark' };
    }

    try {
        // Check if bookmark exists
        const checkResult = await db.query(
            'SELECT bookmark_id FROM bookmarked_grants WHERE grant_id = $1 AND user_id = $2',
            [grantId, user.id]
        );

        if (checkResult.rows.length > 0) {
            // Bookmark exists, remove it
            await db.query(
                'DELETE FROM bookmarked_grants WHERE grant_id = $1 AND user_id = $2',
                [grantId, user.id]
            );

            // Revalidate pages that show bookmarks
            revalidatePath('/bookmarks');
            revalidatePath('/search');

            return { success: true, isBookmarked: false };
        } else {
            // Bookmark doesn't exist, add it
            await db.query(
                'INSERT INTO bookmarked_grants (grant_id, user_id, bookmarked_at) VALUES ($1, $2, NOW())',
                [grantId, user.id]
            );

            revalidatePath('/bookmarks');
            revalidatePath('/search');

            return { success: true, isBookmarked: true };
        }
    } catch (error) {
        console.error('Error toggling grant bookmark:', error);
        return { success: false, error: 'Failed to toggle bookmark' };
    }
}

export async function toggleRecipientBookmark(recipientId: number) {
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, error: 'Must be logged in to bookmark' };
    }

    try {
        const checkResult = await db.query(
            'SELECT bookmark_id FROM bookmarked_recipients WHERE recipient_id = $1 AND user_id = $2',
            [recipientId, user.id]
        );

        if (checkResult.rows.length > 0) {
            await db.query(
                'DELETE FROM bookmarked_recipients WHERE recipient_id = $1 AND user_id = $2',
                [recipientId, user.id]
            );

            revalidatePath('/bookmarks');
            revalidatePath('/recipients');

            return { success: true, isBookmarked: false };
        } else {
            await db.query(
                'INSERT INTO bookmarked_recipients (recipient_id, user_id, bookmarked_at) VALUES ($1, $2, NOW())',
                [recipientId, user.id]
            );

            revalidatePath('/bookmarks');
            revalidatePath('/recipients');

            return { success: true, isBookmarked: true };
        }
    } catch (error) {
        console.error('Error toggling recipient bookmark:', error);
        return { success: false, error: 'Failed to toggle bookmark' };
    }
}

export async function toggleInstituteBookmark(instituteId: number) {
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, error: 'Must be logged in to bookmark' };
    }

    try {
        const checkResult = await db.query(
            'SELECT bookmark_id FROM bookmarked_institutes WHERE institute_id = $1 AND user_id = $2',
            [instituteId, user.id]
        );

        if (checkResult.rows.length > 0) {
            await db.query(
                'DELETE FROM bookmarked_institutes WHERE institute_id = $1 AND user_id = $2',
                [instituteId, user.id]
            );

            revalidatePath('/bookmarks');
            revalidatePath('/institutes');

            return { success: true, isBookmarked: false };
        } else {
            await db.query(
                'INSERT INTO bookmarked_institutes (institute_id, user_id, bookmarked_at) VALUES ($1, $2, NOW())',
                [instituteId, user.id]
            );

            revalidatePath('/bookmarks');
            revalidatePath('/institutes');

            return { success: true, isBookmarked: true };
        }
    } catch (error) {
        console.error('Error toggling institute bookmark:', error);
        return { success: false, error: 'Failed to toggle bookmark' };
    }
}
