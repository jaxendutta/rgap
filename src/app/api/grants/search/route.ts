import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build filters
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (q) {
        conditions.push(`(
      g.agreement_title_en ILIKE $${paramIndex} OR 
      g.description_en ILIKE $${paramIndex} OR
      r.legal_name ILIKE $${paramIndex} OR
      p.prog_title_en ILIKE $${paramIndex}
    )`);
        params.push(`%${q}%`);
        paramIndex++;
    }

    const whereClause = conditions.length > 0
        ? 'WHERE ' + conditions.join(' AND ')
        : '';

    try {
        // Get total count
        const countQuery = `
      SELECT COUNT(*) as total
      FROM grants g
      JOIN recipients r ON g.recipient_id = r.recipient_id
      LEFT JOIN programs p ON g.prog_id = p.prog_id
      LEFT JOIN organizations o ON g.org_id = o.org_id
      ${whereClause}
    `;

        const countResult = await db.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Get data - UPDATED TO FETCH LOCATION DATA
        const dataQuery = `
      SELECT 
        g.*,
        r.legal_name as recipient_legal_name,
        r.operating_name as recipient_operating_name,
        p.prog_title_en,
        o.org_name_en,
        i.city as recipient_city,       -- Added
        i.province as recipient_province, -- Added
        i.country as recipient_country    -- Added
      FROM grants g
      JOIN recipients r ON g.recipient_id = r.recipient_id
      JOIN institutes i ON r.institute_id = i.institute_id -- Added JOIN
      LEFT JOIN programs p ON g.prog_id = p.prog_id
      LEFT JOIN organizations o ON g.org_id = o.org_id
      ${whereClause}
      ORDER BY g.agreement_value DESC NULLS LAST
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        const dataResult = await db.query(dataQuery, [...params, limit, offset]);

        return NextResponse.json({
            data: dataResult.rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
