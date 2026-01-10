// src/app/actions/auth.ts
'use server';

import { db } from '@/lib/db';
import { createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
// import bcrypt from 'bcryptjs'; // You will need this for password comparison

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // 1. Validate credentials
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    // (Add bcrypt comparison here in real app)
    // if (!user || !await bcrypt.compare(password, user.password_hash)) { ... }

    if (!user || user.password_hash !== password) { // Temporary plain text check for dev
        return { error: 'Invalid credentials' };
    }

    // 2. Create Session
    await createSession(user.user_id);

    // 3. Redirect
    redirect('/');
}

export async function logoutAction() {
    await deleteSession();
    redirect('/auth');
}