import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // 1. Define protected routes
    if (request.nextUrl.pathname.startsWith('/account') ||
        request.nextUrl.pathname.startsWith('/bookmarks')) {

        // 2. Check for session cookie presence
        // We check purely for existence here to stop the "Logged Out" loop.
        // Detailed validation (DB check) still happens in the Page component.
        const hasSession = request.cookies.has('rgap_session');

        if (!hasSession) {
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/account/:path*', '/bookmarks/:path*'],
};
