// src/lib/session.ts
// Session management - Authentication is OPTIONAL
// Users can browse everything without logging in
// Auth is only needed for: bookmarks, saved searches, account features

import { cookies } from 'next/headers';

export interface User {
  id: number;
  username: string;
  email: string;
}

/**
 * Get current user session
 * Returns null if no session exists - THIS IS TOTALLY FINE!
 * Users can browse grants without logging in
 */
export async function getSession(): Promise<User | null> {
  try {
    // TODO: Implement proper session management with iron-session
    // For now, return null (no user logged in)
    return null;
  } catch (error) {
    // Fail gracefully - users can still browse
    return null;
  }
}

/**
 * Get current user - alias for getSession
 * Returns null if not logged in - browsing is allowed!
 */
export async function getCurrentUser(): Promise<User | null> {
  return getSession();
}

/**
 * Check if user is authenticated
 * Used to show/hide bookmark buttons, etc.
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getSession();
  return !!user;
}

/**
 * Create a new session (called after login)
 */
export async function createSession(user: User): Promise<void> {
  // TODO: Implement with iron-session
  console.log('Session created for user:', user.username);
}

/**
 * Destroy current session (called on logout)
 */
export async function destroySession(): Promise<void> {
  // TODO: Implement with iron-session
  console.log('Session destroyed');
}
