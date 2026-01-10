// src/app/api/auth/check/route.ts
// Returns current user session

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
    try {
        const user = await getSession();

        return NextResponse.json({
            success: true,
            user: user || null,
            authenticated: !!user,
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json(
            {
                success: false,
                user: null,
                authenticated: false,
            },
            { status: 200 } // Still return 200, just unauthenticated
        );
    }
}
