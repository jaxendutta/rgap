import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        // Test database connection
        await db.query('SELECT 1');

        return NextResponse.json({
            success: true,
            message: 'API is healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Database connection failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}