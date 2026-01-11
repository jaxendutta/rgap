// src/app/actions/auth.ts
'use server';

import { createSession, destroySession } from '@/lib/session';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

interface ActionState {
    message: string;
    success?: boolean;
}

export async function authAction(
    prevState: any,
    formData: FormData
): Promise<ActionState> {
    const mode = formData.get('mode') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        // =================================================
        // LOGIN LOGIC
        // =================================================
        if (mode === 'login') {
            const result = await db.query(
                'SELECT user_id, username, email, password_hash FROM users WHERE email = $1',
                [email]
            );
            const user = result.rows[0];

            if (!user) {
                return { message: 'Invalid email or password' };
            }

            // Use bcrypt to verify password
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return { message: 'Invalid email or password' };
            }

            // Create Session using the createSession helper
            await createSession({
                id: user.user_id,
                username: user.username,
                email: user.email,
            });
        }

        // =================================================
        // REGISTER LOGIC
        // =================================================
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

            // Hash password with bcrypt
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            // Insert User
            const result = await db.query(
                'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email',
                [name, email, password_hash]
            );
            const newUser = result.rows[0];

            // Auto-login after register using the createSession helper
            await createSession({
                id: newUser.user_id,
                username: newUser.username,
                email: newUser.email,
            });
        }

    } catch (error) {
        console.error('Auth error:', error);
        return { message: 'An unexpected error occurred' };
    }

    // Redirect to dashboard after successful auth
    redirect('/dashboard');
}

export async function logoutAction() {
    await destroySession();
    redirect('/');
}
