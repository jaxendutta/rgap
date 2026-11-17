import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getClientIp, isRateLimitingEnabled, type RateLimitTier } from '@/lib/ratelimit';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Session check on protected routes
    if (pathname.startsWith('/account') || pathname.startsWith('/bookmarks')) {
        const hasSession = request.cookies.has('rgap_session');
        if (!hasSession) {
            const loginUrl = new URL('/auth', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 2. Determine rate limit tier based on destination
    let tier: RateLimitTier | null = null;

    if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password')) {
        tier = 'auth';
    } else if (pathname.startsWith('/api')) {
        tier = 'api';
    } else if (
        pathname.startsWith('/recipients') ||
        pathname.startsWith('/institutes') ||
        pathname.startsWith('/search')
    ) {
        tier = 'page';
    }

    // 3. Apply rate limiting if applicable
    if (tier) {
        const ip = getClientIp(request);
        const { success, limit, remaining, reset } = await checkRateLimit(tier, ip);

        if (!success) {
            const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
            const headers = {
                'Retry-After': String(retryAfter),
                'X-RateLimit-Limit': String(limit),
                'X-RateLimit-Remaining': String(remaining),
                'X-RateLimit-Reset': String(reset),
            };

            if (pathname.startsWith('/api')) {
                return NextResponse.json(
                    {
                        error: 'Too many requests. Please slow down and try again shortly.',
                        retryAfter,
                    },
                    { status: 429, headers }
                );
            }

            return new NextResponse(
                'Too many requests. Please wait a few moments before trying again.',
                { status: 429, headers: { ...headers, 'Content-Type': 'text/plain' } }
            );
        }

        // Attach rate limit headers to allowed requests when rate limiting is active
        if (isRateLimitingEnabled) {
            const response = NextResponse.next();
            response.headers.set('X-RateLimit-Limit', String(limit));
            response.headers.set('X-RateLimit-Remaining', String(remaining));
            response.headers.set('X-RateLimit-Reset', String(reset));
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static build assets)
         * - _next/image (image optimization cache)
         * - static files, logos, icons, fonts, and robots/sitemap
         */
        '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.png|logo\\.png|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
    ],
};
