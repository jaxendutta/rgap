import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { unsealData } from 'iron-session';
import { db } from '@/lib/db';
import { createAuthenticatedSession, getClientIp, sessionOptions } from '@/lib/session';
import { getOAuthProfile, isOAuthProvider, OAUTH_PROVIDERS, OAUTH_STATE_COOKIE } from '@/lib/oauth';

interface OAuthStatePayload {
    state: string;
    codeVerifier: string;
    callbackUrl: string;
}

// Handles the provider redirect: validates state, exchanges the code for a
// profile, finds-or-creates the user, links the provider, and logs them in.
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider } = await params;

    const fail = (message: string) =>
        NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));

    if (!isOAuthProvider(provider)) {
        return fail('Unknown sign-in provider.');
    }

    const providerLabel = OAUTH_PROVIDERS[provider].label;
    const code = request.nextUrl.searchParams.get('code');
    const returnedState = request.nextUrl.searchParams.get('state');

    const cookieStore = await cookies();
    const sealed = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
    cookieStore.delete(OAUTH_STATE_COOKIE);

    if (!code || !returnedState || !sealed) {
        return fail(`${providerLabel} sign-in was cancelled or expired. Please try again.`);
    }

    let stored: OAuthStatePayload;
    try {
        stored = await unsealData<OAuthStatePayload>(sealed, {
            password: sessionOptions.password,
            ttl: 600,
        });
    } catch {
        return fail('Sign-in session expired. Please try again.');
    }

    if (!stored.state || stored.state !== returnedState) {
        return fail('Sign-in verification failed. Please try again.');
    }

    try {
        const profile = await getOAuthProfile(provider, code, stored.codeVerifier);

        if (!profile.email || !profile.emailVerified) {
            return fail(`We couldn't get a verified email address from ${providerLabel}. Please verify your email with ${providerLabel} first, or register with email and password.`);
        }

        // 1. Already linked? Log straight in.
        const linked = await db.query(
            `SELECT u.id, u.name, u.email FROM oauth_accounts oa
             JOIN users u ON u.id = oa.user_id
             WHERE oa.provider = $1 AND oa.provider_account_id = $2`,
            [provider, profile.providerAccountId]
        );
        let user = linked.rows[0];

        if (!user) {
            // 2. Existing account with the same (provider-verified) email? Link it.
            const existing = await db.query(
                'SELECT id, name, email FROM users WHERE email = $1',
                [profile.email]
            );

            if (existing.rows.length > 0) {
                user = existing.rows[0];
                // The provider vouched for this email — treat it as verified.
                await db.query(
                    'UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = $1',
                    [user.id]
                );
            } else {
                // 3. Brand-new user: no password, email pre-verified by the provider.
                const inserted = await db.query(
                    `INSERT INTO users (name, email, password_hash, email_verified_at)
                     VALUES ($1, $2, NULL, NOW()) RETURNING id, name, email`,
                    [profile.name || profile.email.split('@')[0], profile.email]
                );
                user = inserted.rows[0];
            }

            await db.query(
                `INSERT INTO oauth_accounts (user_id, provider, provider_account_id)
                 VALUES ($1, $2, $3) ON CONFLICT (provider, provider_account_id) DO NOTHING`,
                [user.id, provider, profile.providerAccountId]
            );
        }

        const userAgent = request.headers.get('user-agent') || 'Unknown Device';
        const ip = await getClientIp();

        await createAuthenticatedSession(
            { id: user.id, name: user.name, email: user.email },
            { userAgent, ip, rememberMe: true }
        );

        // Only allow same-site relative redirect targets.
        const callbackUrl =
            typeof stored.callbackUrl === 'string' &&
            stored.callbackUrl.startsWith('/') &&
            !stored.callbackUrl.startsWith('//')
                ? stored.callbackUrl
                : '/account?welcome=true';

        return NextResponse.redirect(new URL(callbackUrl, request.url));
    } catch (error) {
        console.error(`OAuth callback error (${provider}):`, error);
        return fail(`Something went wrong signing you in with ${providerLabel}. Please try again.`);
    }
}
