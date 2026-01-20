import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { db } from './db';

export interface SessionUser {
    id: number;
    name: string;
    email: string;
}

export interface SessionData {
    user?: SessionUser;
    sessionId?: string;
    isLoggedIn: boolean;
}

// FIX: Added 'export' here so auth.ts can use it
export const sessionOptions = {
    password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
    cookieName: 'rgap_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax' as const,
        maxAge: undefined, // undefined = Session Cookie (deletes on browser close)
    },
};

export async function getSession(): Promise<IronSession<SessionData>> {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
    const session = await getSession();

    if (!session.user || !session.sessionId) return null;

    try {
        const result = await db.query(
            `SELECT is_revoked FROM sessions WHERE session_id = $1`,
            [session.sessionId]
        );

        if (result.rows.length === 0 || result.rows[0].is_revoked) {
            await session.destroy();
            return null;
        }

        // Fire and forget update
        db.query('UPDATE sessions SET last_active_at = NOW() WHERE session_id = $1', [session.sessionId]);

        return session.user;
    } catch (error) {
        return null;
    }
}
