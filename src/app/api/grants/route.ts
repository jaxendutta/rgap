// src/app/api/grants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            searchTerms = {},
            filters = {},
            sortConfig = { field: 'agreement_start_date', direction: 'desc' },
            pagination = { page: 1, limit: 20 },
            format = 'full' // 'full' | 'visualization'
        } = body;

        // --- 1. Build Dynamic WHERE Clause ---
        const conditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        // Search Terms
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

        // Filters - Date Range
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

        // Filters - Value Range
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

        // Filters - Arrays
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

        // --- 2. Handle Visualization Mode ---
        if (format === 'visualization') {
            const visQuery = `
                SELECT 
                    g.agreement_value,
                    g.agreement_start_date,
                    g.org,
                    r.legal_name,
                    i.city,
                    i.province,
                    i.country
                FROM grants g
                JOIN recipients r ON g.recipient_id = r.recipient_id
                JOIN institutes i ON r.institute_id = i.institute_id
                ${whereClause}
            `;
            const visResult = await db.query(visQuery, params);
            return NextResponse.json({ data: visResult.rows });
        }

        // --- 3. Handle Full Pagination Mode ---
        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const offset = (page - 1) * limit;

        // Count total
        const countQuery = `
            SELECT COUNT(*) as total
            FROM grants g
            JOIN recipients r ON g.recipient_id = r.recipient_id
            JOIN institutes i ON r.institute_id = i.institute_id
            ${whereClause}
        `;
        const countResult = await db.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // --- SORT CONFIGURATION ---
        // FIXED: Added 'legal_name' to valid sort fields to support Recipient sort
        const validSortFields = ['agreement_start_date', 'agreement_value', 'agreement_title_en', 'legal_name'];
        let sortField = sortConfig.field;

        // Map frontend sort keys to DB columns
        if (sortField === 'value') sortField = 'agreement_value';
        if (sortField === 'date') sortField = 'agreement_start_date';
        if (sortField === 'recipient') sortField = 'legal_name';

        if (!validSortFields.includes(sortField)) {
            sortField = 'agreement_start_date';
        }

        const sortDirection = sortConfig.direction === 'asc' ? 'ASC' : 'DESC';

        // Determine correct table alias for sort
        const sortColumn = sortField === 'legal_name' ? 'r.legal_name' : `g.${sortField}`;

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
            ORDER BY ${sortColumn} ${sortDirection}
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
        return NextResponse.json({ error: 'Failed to search grants' }, { status: 500 });
    }
}
