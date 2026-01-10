import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateOffset, generatePagination } from '@/lib/utils';
import { GrantDetail } from '@/types/database';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const query = searchParams.get('q') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
        const org = searchParams.get('org');
        const minValue = searchParams.get('minValue');
        const maxValue = searchParams.get('maxValue');

        // Build WHERE clause
        const conditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (query) {
            conditions.push(`(
        agreement_title_en ILIKE $${paramIndex} OR
        description_en ILIKE $${paramIndex} OR
        ref_number ILIKE $${paramIndex}
      )`);
            params.push(`%${query}%`);
            paramIndex++;
        }

        if (org) {
            conditions.push(`org = $${paramIndex}`);
            params.push(org);
            paramIndex++;
        }

        if (minValue) {
            conditions.push(`agreement_value >= $${paramIndex}`);
            params.push(parseFloat(minValue));
            paramIndex++;
        }

        if (maxValue) {
            conditions.push(`agreement_value <= $${paramIndex}`);
            params.push(parseFloat(maxValue));
            paramIndex++;
        }

        const whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(' AND ')}`
            : '';

        // Get total count
        const countResult = await db.query(
            `SELECT COUNT(*) as count FROM grant_details ${whereClause}`,
            params
        );
        const totalCount = parseInt(countResult.rows[0].count);

        // Get paginated results
        const offset = calculateOffset(page, pageSize);
        const dataResult = await db.query<GrantDetail>(
            `SELECT * FROM grant_details 
       ${whereClause}
       ORDER BY agreement_start_date DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...params, pageSize, offset]
        );

        return NextResponse.json({
            success: true,
            data: dataResult.rows,
            pagination: generatePagination(page, pageSize, totalCount),
        });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to search grants',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}