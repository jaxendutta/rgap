// src/app/actions/bookmarks.ts
'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

// Helper to log bookmark activities
async function logActivity(userId: number, eventType: string, oldValue: string | null, newValue: string | null) {
    try {
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';

        await db.query(
            `INSERT INTO user_audit_logs (user_id, event_type, old_value, new_value, ip_address, created_at) 
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [userId, eventType, oldValue, newValue, ip]
        );
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}

// --- Toggle Actions ---

export async function toggleGrantBookmark(grantId: number) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in' };

    try {
        const check = await db.query(
            'SELECT id FROM bookmarked_grants WHERE grant_id = $1 AND user_id = $2',
            [grantId, user.id]
        );

        if (check.rows.length > 0) {
            await db.query('DELETE FROM bookmarked_grants WHERE grant_id = $1 AND user_id = $2', [grantId, user.id]);
            await logActivity(user.id, 'REMOVE_BOOKMARK_GRANT', String(grantId), null);

            revalidatePath('/bookmarks');
            return { success: true, isBookmarked: false };
        } else {
            await db.query('INSERT INTO bookmarked_grants (grant_id, user_id) VALUES ($1, $2)', [grantId, user.id]);
            await logActivity(user.id, 'BOOKMARK_GRANT', null, String(grantId));

            revalidatePath('/bookmarks');
            return { success: true, isBookmarked: true };
        }
    } catch (error) {
        console.error('Error toggling grant bookmark:', error);
        return { success: false, error: 'Failed to toggle bookmark' };
    }
}

export async function toggleRecipientBookmark(recipientId: number) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in' };

    try {
        const check = await db.query(
            'SELECT id FROM bookmarked_recipients WHERE recipient_id = $1 AND user_id = $2',
            [recipientId, user.id]
        );

        if (check.rows.length > 0) {
            await db.query('DELETE FROM bookmarked_recipients WHERE recipient_id = $1 AND user_id = $2', [recipientId, user.id]);
            await logActivity(user.id, 'REMOVE_BOOKMARK_RECIPIENT', String(recipientId), null);

            revalidatePath('/bookmarks');
            return { success: true, isBookmarked: false };
        } else {
            await db.query('INSERT INTO bookmarked_recipients (recipient_id, user_id) VALUES ($1, $2)', [recipientId, user.id]);
            await logActivity(user.id, 'BOOKMARK_RECIPIENT', null, String(recipientId));

            revalidatePath('/bookmarks');
            return { success: true, isBookmarked: true };
        }
    } catch (error) {
        console.error('Error toggling recipient bookmark:', error);
        return { success: false, error: 'Failed to toggle bookmark' };
    }
}

export async function toggleInstituteBookmark(instituteId: number) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in' };

    try {
        const check = await db.query(
            'SELECT id FROM bookmarked_institutes WHERE institute_id = $1 AND user_id = $2',
            [instituteId, user.id]
        );

        if (check.rows.length > 0) {
            await db.query('DELETE FROM bookmarked_institutes WHERE institute_id = $1 AND user_id = $2', [instituteId, user.id]);
            await logActivity(user.id, 'REMOVE_BOOKMARK_INSTITUTE', String(instituteId), null);

            revalidatePath('/bookmarks');
            return { success: true, isBookmarked: false };
        } else {
            await db.query('INSERT INTO bookmarked_institutes (institute_id, user_id) VALUES ($1, $2)', [instituteId, user.id]);
            await logActivity(user.id, 'BOOKMARK_INSTITUTE', null, String(instituteId));

            revalidatePath('/bookmarks');
            return { success: true, isBookmarked: true };
        }
    } catch (error) {
        console.error('Error toggling institute bookmark:', error);
        return { success: false, error: 'Failed to toggle bookmark' };
    }
}

export async function toggleSearchBookmark(searchHistoryId: number) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in' };

    try {
        const check = await db.query(
            'SELECT id FROM bookmarked_searches WHERE search_history_id = $1 AND user_id = $2',
            [searchHistoryId, user.id]
        );

        if (check.rows.length > 0) {
            await db.query('DELETE FROM bookmarked_searches WHERE search_history_id = $1 AND user_id = $2', [searchHistoryId, user.id]);
            revalidatePath('/bookmarks');
            return { success: true, isBookmarked: false };
        } else {
            await db.query('INSERT INTO bookmarked_searches (search_history_id, user_id) VALUES ($1, $2)', [searchHistoryId, user.id]);
            revalidatePath('/bookmarks');
            return { success: true, isBookmarked: true };
        }
    } catch (error) {
        console.error('Error toggling search bookmark:', error);
        return { success: false, error: 'Failed to toggle bookmark' };
    }
}

// --- Update Note Actions (unchanged) ---
export async function updateGrantNote(grantId: number, note: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in' };
    try {
        await db.query('UPDATE bookmarked_grants SET notes = $1 WHERE grant_id = $2 AND user_id = $3', [note, grantId, user.id]);
        revalidatePath('/bookmarks');
        return { success: true };
    } catch (error) { return { success: false, error: 'Failed' }; }
}
export async function updateRecipientNote(recipientId: number, note: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in' };
    try {
        await db.query('UPDATE bookmarked_recipients SET notes = $1 WHERE recipient_id = $2 AND user_id = $3', [note, recipientId, user.id]);
        revalidatePath('/bookmarks');
        return { success: true };
    } catch (error) { return { success: false, error: 'Failed' }; }
}
export async function updateInstituteNote(instituteId: number, note: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in' };
    try {
        await db.query('UPDATE bookmarked_institutes SET notes = $1 WHERE institute_id = $2 AND user_id = $3', [note, instituteId, user.id]);
        revalidatePath('/bookmarks');
        return { success: true };
    } catch (error) { return { success: false, error: 'Failed' }; }
}
export async function updateSearchNote(searchHistoryId: number, note: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in' };
    try {
        await db.query('UPDATE bookmarked_searches SET notes = $1 WHERE search_history_id = $2 AND user_id = $3', [note, searchHistoryId, user.id]);
        revalidatePath('/bookmarks');
        return { success: true };
    } catch (error) { return { success: false, error: 'Failed' }; }
}

// --- Fetch Actions (Modified for sorting) ---

export async function getUserBookmarks(sortConfig?: { field: string, direction: 'asc' | 'desc' }) {
    const user = await getCurrentUser();
    if (!user) return null;

    // Default sort: Latest bookmarked first
    const sortField = sortConfig?.field || 'bookmarked_at';
    const sortDir = sortConfig?.direction === 'asc' ? 'ASC' : 'DESC';

    // Map common fields to table aliases
    const getSort = (alias: string, field: string) => {
        if (field === 'bookmarked_at') return `${alias}.bookmarked_at`;
        if (field === 'value') return 'agreement_value'; // For grants
        return `${alias}.bookmarked_at`; // Fallback
    };

    try {
        const grants = await db.query(`
            SELECT 
                g.*, 
                bg.bookmarked_at,
                bg.notes,
                r.legal_name,
                i.name, i.city, i.province, i.country,
                org.org_title_en,
                p.prog_title_en, p.prog_purpose_en
            FROM bookmarked_grants bg
            JOIN grants g ON bg.grant_id = g.grant_id
            JOIN recipients r ON g.recipient_id = r.recipient_id
            JOIN institutes i ON r.institute_id = i.institute_id
            LEFT JOIN organizations org ON g.org = org.org
            LEFT JOIN programs p ON g.prog_id = p.prog_id
            WHERE bg.user_id = $1
            ORDER BY ${getSort('bg', sortField)} ${sortDir}
        `, [user.id]);

        const recipients = await db.query(`
            SELECT 
                r.*, 
                br.bookmarked_at, 
                br.notes,
                i.name as research_organization_name, 
                i.city, i.province, i.country
            FROM bookmarked_recipients br
            JOIN recipients r ON br.recipient_id = r.recipient_id
            JOIN institutes i ON r.institute_id = i.institute_id
            WHERE br.user_id = $1
            ORDER BY ${getSort('br', sortField)} ${sortDir}
        `, [user.id]);

        const institutes = await db.query(`
            SELECT 
                i.*, 
                bi.bookmarked_at,
                bi.notes
            FROM bookmarked_institutes bi
            JOIN institutes i ON bi.institute_id = i.institute_id
            WHERE bi.user_id = $1
            ORDER BY ${getSort('bi', sortField)} ${sortDir}
        `, [user.id]);

        const searches = await db.query(`
            SELECT 
                sh.*, 
                bs.bookmarked_at,
                bs.notes
            FROM bookmarked_searches bs
            JOIN search_history sh ON bs.search_history_id = sh.id
            WHERE bs.user_id = $1
            ORDER BY ${getSort('bs', sortField)} ${sortDir}
        `, [user.id]);

        return {
            grants: grants.rows,
            recipients: recipients.rows,
            institutes: institutes.rows,
            searches: searches.rows
        };
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        return null;
    }
}
