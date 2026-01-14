// src/app/api/grants/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/grants
 * Search grants with advanced filters
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            searchTerms = {},
            filters = {},
            sortConfig = { field: 'agreement_start_date', direction: 'desc' },
            pagination = { page: 1, limit: 20 }
        } = body;

        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const offset = (page - 1) * limit;

        // Build dynamic WHERE clause
        const conditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        // Search terms
        if (searchTerms.recipient) {
            conditions.push(`r.legal_name ILIKE $${paramIndex}`);
            params.push(`%${searchTerms.recipient}%`);
            paramIndex++;
        }

        if (searchTerms.institute) {
            conditions.push(`i.name ILIKE $${paramIndex}`);
            params.push(`%${searchTerms.institute}%`);
            paramIndex++;
        }

        if (searchTerms.grant) {
            conditions.push(`g.agreement_title_en ILIKE $${paramIndex}`);
            params.push(`%${searchTerms.grant}%`);
            paramIndex++;
        }

        // Date range filter
        if (filters.dateRange?.from) {
            conditions.push(`g.agreement_start_date >= $${paramIndex}`);
            params.push(filters.dateRange.from);
            paramIndex++;
        }

        if (filters.dateRange?.to) {
            conditions.push(`g.agreement_start_date <= $${paramIndex}`);
            params.push(filters.dateRange.to);
            paramIndex++;
        }

        // Value range filter
        if (filters.valueRange?.min !== undefined && filters.valueRange.min > 0) {
            conditions.push(`g.agreement_value >= $${paramIndex}`);
            params.push(filters.valueRange.min);
            paramIndex++;
        }

        if (filters.valueRange?.max !== undefined && filters.valueRange.max < 200000000) {
            conditions.push(`g.agreement_value <= $${paramIndex}`);
            params.push(filters.valueRange.max);
            paramIndex++;
        }

        // Multi-select filters (using PostgreSQL ANY)
        if (filters.agencies?.length > 0) {
            conditions.push(`g.org = ANY($${paramIndex})`);
            params.push(filters.agencies);
            paramIndex++;
        }

        if (filters.countries?.length > 0) {
            conditions.push(`i.country = ANY($${paramIndex})`);
            params.push(filters.countries);
            paramIndex++;
        }

        if (filters.provinces?.length > 0) {
            conditions.push(`i.province = ANY($${paramIndex})`);
            params.push(filters.provinces);
            paramIndex++;
        }

        if (filters.cities?.length > 0) {
            conditions.push(`i.city = ANY($${paramIndex})`);
            params.push(filters.cities);
            paramIndex++;
        }

        const whereClause = conditions.length > 0
            ? 'WHERE ' + conditions.join(' AND ')
            : '';

        // Validate sort field to prevent SQL injection
        const validSortFields = ['agreement_start_date', 'agreement_value', 'agreement_title_en'];
        const sortField = validSortFields.includes(sortConfig.field)
            ? sortConfig.field
            : 'agreement_start_date';
        const sortDirection = sortConfig.direction === 'asc' ? 'ASC' : 'DESC';

        // Count total matching grants
        const countQuery = `
            SELECT COUNT(*) as total
            FROM grants g
            JOIN recipients r ON g.recipient_id = r.recipient_id
            JOIN institutes i ON r.institute_id = i.institute_id
            ${whereClause}
        `;

        const countResult = await db.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Fetch grant data
        const dataQuery = `
            SELECT 
                g.*,
                r.legal_name,
                r.operating_name,
                r.recipient_id,
                i.name,
                i.institute_id,
                i.city,
                i.province,
                i.country,
                p.prog_id,
                p.prog_title_en,
                p.prog_purpose_en,
                o.org_title_en,
                o.org
            FROM grants g
            JOIN recipients r ON g.recipient_id = r.recipient_id
            JOIN institutes i ON r.institute_id = i.institute_id
            JOIN programs p ON g.prog_id = p.prog_id
            JOIN organizations o ON g.org = o.org
            ${whereClause}
            ORDER BY g.${sortField} ${sortDirection}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const dataResult = await db.query(dataQuery, [...params, limit, offset]);

        return NextResponse.json({
            data: dataResult.rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.error('Grant Search API Error:', error);
        return NextResponse.json(
            { error: 'Failed to search grants' },
            { status: 500 }
        );
    }
}
