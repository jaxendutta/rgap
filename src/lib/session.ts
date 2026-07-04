import { getIronSession, IronSession } from 'iron-session';
import { cookies, headers } from 'next/headers';
import { db } from './db';
import { cache } from 'react';
import crypto from 'crypto';

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

// Helper: Consistent IP Extraction
export async function getClientIp(): Promise<string> {
    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    
    if (forwardedFor) {
        // The first IP in the list is the original client IP
        return forwardedFor.split(',')[0].trim();
    }
    
    // Fallback for local development or direct connection
    return '127.0.0.1';
}

// Helper: Estimate Location
export async function getLocationFromIP(ip: string): Promise<string> {
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('::ffff:') || ip.startsWith('172.') || ip.startsWith('192.168.')) {
        return 'Local Network (Dev)';
    }

    try {
        // ipinfo.io/json works without token for low volume, supports HTTPS
        const response = await fetch(`https://ipinfo.io/${ip}/json`);
        const data = await response.json();

        if (data.city && data.country) {
            return `${data.city}, ${data.country}`;
        }
        return 'Unknown Location';
    } catch (error) {
        return 'Unknown Location';
    }
}

// Create a DB-backed session + audit log entry and persist the iron-session
// cookie. Shared by password login and OAuth sign-in.
export async function createAuthenticatedSession(
    user: SessionUser,
    options: { userAgent: string; ip: string; rememberMe?: boolean }
): Promise<void> {
    const sessionId = crypto.randomUUID();
    const location = await getLocationFromIP(options.ip);

    await db.query(
        `INSERT INTO sessions (session_id, user_id, user_agent, ip_address, location) VALUES ($1, $2, $3, $4, $5)`,
        [sessionId, user.id, options.userAgent, options.ip, location]
    );

    await db.query(
        `INSERT INTO user_audit_logs (user_id, event_type, ip_address) VALUES ($1, 'LOGIN', $2)`,
        [user.id, options.ip]
    );

    const session = await getSession();
    session.user = user;
    session.sessionId = sessionId;
    session.isLoggedIn = true;

    if (options.rememberMe) {
        const thirtyDays = 60 * 60 * 24 * 30;
        session.updateConfig({
            ...sessionOptions,
            cookieOptions: { ...sessionOptions.cookieOptions, maxAge: thirtyDays }
        });
    }

    await session.save();
}

// 1. Wrap in React cache() so it only runs once per server request
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
    const session = await getSession();

    if (!session.user || !session.sessionId) return null;

    try {
        const result = await db.query(
            `SELECT is_revoked, last_active_at FROM sessions WHERE session_id = $1`,
            [session.sessionId]
        );

        if (result.rows.length === 0 || result.rows[0].is_revoked) {
            await session.destroy();
            return null;
        }

        // 2. Optimization: Only update 'last_active_at' if > 1 hour ago
        const lastActive = new Date(result.rows[0].last_active_at).getTime();
        const oneHour = 60 * 60 * 1000;
        
        if (Date.now() - lastActive > oneHour) {
             // Fire and forget, but throttled
             db.query('UPDATE sessions SET last_active_at = NOW() WHERE session_id = $1', [session.sessionId]);
        }

        return session.user;
    } catch (error) {
        return null;
    }
});
