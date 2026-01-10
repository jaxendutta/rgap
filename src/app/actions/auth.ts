// src/app/actions/auth.ts
'use server';

import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

interface ActionState {
    message: string;
    success?: boolean;
}

export async function authAction(
    prevState: any,
    formData: FormData
): Promise<ActionState> {
    const mode = formData.get('mode') as string; // 'login' or 'register'
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        // =========================================================
        // LOGIN LOGIC
        // =========================================================
        if (mode === 'login') {
            const result = await db.query(
                'SELECT user_id, username, email, password_hash FROM users WHERE email = $1',
                [email]
            );
            const user = result.rows[0];

            if (!user || user.password_hash !== password) {
                return { message: 'Invalid email or password' };
            }

            // Create Session
            const session = await getSession();
            session.user = { id: user.user_id, username: user.username, email: user.email };
            session.isLoggedIn = true;
            await session.save();
        }

        // =========================================================
        // REGISTER LOGIC
        // =========================================================
        else {
            const name = formData.get('name') as string;
            const confirmPassword = formData.get('confirmPassword') as string;

            if (password !== confirmPassword) {
                return { message: "Passwords do not match" };
            }

            // Check if user exists
            const check = await db.query('SELECT user_id FROM users WHERE email = $1', [email]);
            if (check.rows.length > 0) {
                return { message: "User already exists" };
            }

            // Insert User (Note: In production, hash the password here!)
            const result = await db.query(
                'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email',
                [name, email, password]
            );
            const newUser = result.rows[0];

            // Auto-login after register
            const session = await getSession();
            session.user = { id: newUser.user_id, username: newUser.username, email: newUser.email };
            session.isLoggedIn = true;
            await session.save();
        }

    } catch (error) {
        console.error('Auth error:', error);
        return { message: 'An unexpected error occurred' };
    }

    redirect('/');
}

export async function logoutAction() {
    const session = await getSession();
    session.destroy();
    // Redirect to home (since your site is public) rather than forcing login
    redirect('/');
}