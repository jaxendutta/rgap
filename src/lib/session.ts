// src/lib/session.ts
// Session management using iron-session
// Authentication is OPTIONAL - users can browse without logging in
// Auth only needed for: bookmarks, saved searches, account features

import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface SessionData {
  user?: User;
  isLoggedIn: boolean;
}

// Session configuration
const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'rgap_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

/**
 * Get current session
 * Returns session object that you can read/write to
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * Get current user from session
 * Returns null if no session exists - THIS IS TOTALLY FINE!
 * Users can browse grants without logging in
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getSession();
    return session.user || null;
  } catch (error) {
    // Fail gracefully - users can still browse
    return null;
  }
}

/**
 * Check if user is authenticated
 * Used to show/hide bookmark buttons, etc.
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();
    return session.isLoggedIn || false;
  } catch (error) {
    return false;
  }
}

/**
 * Create a new session (called after login)
 */
export async function createSession(user: User): Promise<void> {
  const session = await getSession();
  session.user = user;
  session.isLoggedIn = true;
  await session.save();
}

/**
 * Destroy current session (called on logout)
 */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
