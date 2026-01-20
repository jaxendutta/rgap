import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) return redirect('/login?error=Invalid token');

    try {
        // 1. Find Token
        const result = await db.query('SELECT identifier, expires FROM verification_tokens WHERE token = $1', [token]);
        const record = result.rows[0];

        if (!record || new Date(record.expires) < new Date()) {
            return redirect('/login?error=Invalid or expired token');
        }

        // 2. CHECK: Is this a Registration or an Email Change?
        // Logic: If a user exists with pending_email = identifier, it's a CHANGE.
        //        If a user exists with email = identifier, it's a REGISTRATION (or re-verify).

        // Try finding user by PENDING email first
        const pendingUser = await db.query('SELECT id, email FROM users WHERE pending_email = $1', [record.identifier]);

        if (pendingUser.rows.length > 0) {
            // === EMAIL CHANGE FLOW ===
            const user = pendingUser.rows[0];

            // Log the change
            await db.query(
                `INSERT INTO user_audit_logs (user_id, event_type, old_value, new_value) VALUES ($1, 'EMAIL_CHANGE', $2, $3)`,
                [user.id, user.email, record.identifier]
            );

            // Commit the change
            await db.query(
                'UPDATE users SET email = pending_email, pending_email = NULL, email_verified_at = NOW() WHERE id = $1',
                [user.id]
            );

            // Update Session if logged in
            const session = await getSession();
            if (session.user && session.user.id === user.id) {
                session.user.email = record.identifier;
                await session.save();
            }

            await db.query('DELETE FROM verification_tokens WHERE token = $1', [token]);
            return redirect('/account?verified=true');
        }
        else {
            // === REGISTRATION FLOW ===
            // (Existing logic: find by email, set verified, auto-login)
            const regUser = await db.query('SELECT id, name, email FROM users WHERE email = $1', [record.identifier]);

            if (regUser.rows.length === 0) return redirect('/login?error=User not found');

            const user = regUser.rows[0];
            await db.query('UPDATE users SET email_verified_at = NOW() WHERE id = $1', [user.id]);
            await db.query('DELETE FROM verification_tokens WHERE token = $1', [token]);

            // Auto-Login
            const sessionId = crypto.randomUUID();
            await db.query(
                `INSERT INTO sessions (session_id, user_id, user_agent, location) VALUES ($1, $2, $3, $4)`,
                [sessionId, user.id, 'Email Verification', 'Verified via Email']
            );

            const session = await getSession();
            session.user = { id: user.id, name: user.name, email: user.email };
            session.sessionId = sessionId;
            session.isLoggedIn = true;
            await session.save();

            return redirect('/account?verified=true');
        }

    } catch (error) {
        console.error(error);
        return redirect('/login?error=Verification failed');
    }
}
