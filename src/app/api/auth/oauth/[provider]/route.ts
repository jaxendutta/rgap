import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sealData } from 'iron-session';
import { buildAuthorizationRequest, isOAuthProvider, OAUTH_STATE_COOKIE } from '@/lib/oauth';
import { sessionOptions } from '@/lib/session';

// Starts the OAuth flow: remembers state + PKCE verifier in a short-lived
// sealed cookie, then sends the user to the provider's consent screen.
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider } = await params;

    if (!isOAuthProvider(provider)) {
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent('Unknown sign-in provider.')}`, request.url)
        );
    }

    try {
        const { url, state, codeVerifier } = buildAuthorizationRequest(provider);

        const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/account?welcome=true';

        const sealed = await sealData(
            { state, codeVerifier, callbackUrl },
            { password: sessionOptions.password, ttl: 600 }
        );

        const cookieStore = await cookies();
        cookieStore.set(OAUTH_STATE_COOKIE, sealed, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600,
            path: '/',
        });

        return NextResponse.redirect(url);
    } catch (error) {
        console.error(`OAuth start error (${provider}):`, error);
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent('Sign-in with this provider is not available right now.')}`, request.url)
        );
    }
}
