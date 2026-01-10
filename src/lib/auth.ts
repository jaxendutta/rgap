// src/lib/auth.ts
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { User } from '@/types/database';
import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-key');

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        // Optional: Verify user still exists in DB if you want strict security
        const result = await db.query('SELECT user_id, username, email FROM users WHERE user_id = $1', [payload.sub]);
        return result.rows[0] as Partial<User> || null;
    } catch (error) {
        return null;
    }
}

export async function createSession(userId: number) {
    const token = await new SignJWT({ sub: userId.toString() })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(SECRET_KEY);

    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete('session_token');
}
