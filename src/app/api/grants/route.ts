// src/app/api/grants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { DEFAULT_ITEM_PER_PAGE } from '@/constants/data';
import { z } from 'zod';

// --- Zod Validation Schema ---
const searchSchema = z.object({
    searchTerms: z.object({
        recipient: z.string().optional(),
        institute: z.string().optional(),
        grant: z.string().optional(),
    }).optional(),
    filters: z.object({
        dateRange: z.object({
            from: z.string().optional(),
            to: z.string().optional()
        }).optional(),
        valueRange: z.object({
            min: z.number().optional(),
            max: z.number().optional()
        }).optional(),
        agencies: z.array(z.string()).optional(),
        countries: z.array(z.string()).optional(),
        provinces: z.array(z.string()).optional(),
        cities: z.array(z.string()).optional(),
    }).optional(),
    sortConfig: z.object({
        field: z.string().optional(),
        direction: z.enum(['asc', 'desc']).optional(),
    }).optional(),
    pagination: z.object({
        page: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(100).optional(),
    }).optional(),
    format: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        const userId = user?.id;

        // --- 1. Validate Input with Zod ---
        const json = await request.json();
        const parsed = searchSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid search parameters', details: parsed.error.format() },
                { status: 400 }
            );
        }

        // Use the validated data
        const body = parsed.data;

        const {
            searchTerms = {},
            filters = {},
            sortConfig = { field: 'agreement_start_date', direction: 'desc' },
            pagination = { page: 1, limit: DEFAULT_ITEM_PER_PAGE },
            format = 'full'
        } = body;

        // --- 2. Build Dynamic WHERE Clause ---
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
        if (filters.agencies && filters.agencies.length > 0) {
            conditions.push(`g.org = ANY($${paramIndex})`);
            params.push(filters.agencies);
            paramIndex++;
        }
        if (filters.countries && filters.countries.length > 0) {
            conditions.push(`i.country = ANY($${paramIndex})`);
            params.push(filters.countries);
            paramIndex++;
        }
        if (filters.provinces && filters.provinces.length > 0) {
            conditions.push(`i.province = ANY($${paramIndex})`);
            params.push(filters.provinces);
            paramIndex++;
        }
        if (filters.cities && filters.cities.length > 0) {
            conditions.push(`i.city = ANY($${paramIndex})`);
            params.push(filters.cities);
            paramIndex++;
        }

        const whereClause = conditions.length > 0
            ? 'WHERE ' + conditions.join(' AND ')
            : '';

        // --- 3. Handle Visualization Mode ---
        if (format === 'visualization') {
            const visQuery = `
                SELECT 
                    g.agreement_value,
                    g.agreement_start_date,
                    g.org,
                    r.legal_name,
                    i.name,
                    i.city,
                    i.province,
                    i.country,
                    p.prog_title_en
                FROM grants g
                JOIN recipients r ON g.recipient_id = r.recipient_id
                JOIN institutes i ON r.institute_id = i.institute_id
                LEFT JOIN programs p ON g.prog_id = p.prog_id
                ${whereClause}
            `;
            const visResult = await db.query(visQuery, params);
            return NextResponse.json({ data: visResult.rows });
        }

        // --- 4. Handle Full Pagination Mode ---
        const page = pagination.page || 1;
        const limit = pagination.limit || DEFAULT_ITEM_PER_PAGE;
        const offset = (page - 1) * limit;

        // Count total
        // OPTIMIZATION: On really large datasets, consider estimating this count 
        // or only running it on the first page load.
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
        const validSortFields = ['agreement_start_date', 'agreement_value', 'agreement_title_en', 'legal_name'];
        let sortField = sortConfig.field || 'agreement_start_date'; // Fallback

        if (sortField === 'value') sortField = 'agreement_value';
        if (sortField === 'date') sortField = 'agreement_start_date';
        if (sortField === 'recipient') sortField = 'legal_name';

        if (!validSortFields.includes(sortField)) {
            sortField = 'agreement_start_date';
        }

        const sortDirection = sortConfig.direction === 'asc' ? 'ASC' : 'DESC';
        const sortColumn = sortField === 'legal_name' ? 'r.legal_name' : `g.${sortField}`;

        // --- JOIN BOOKMARKS LOGIC ---
        const finalParams = [...params, limit, offset];
        let bookmarkJoin = '';
        let bookmarkSelect = '';

        if (userId) {
            const userParamIndex = finalParams.length + 1;
            finalParams.push(userId);
            bookmarkJoin = `LEFT JOIN bookmarked_grants bg ON g.grant_id = bg.grant_id AND bg.user_id = $${userParamIndex}`;
            bookmarkSelect = ', bg.bookmarked_at, bg.notes';
        }

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
                ${bookmarkSelect}
            FROM grants g
            JOIN recipients r ON g.recipient_id = r.recipient_id
            JOIN institutes i ON r.institute_id = i.institute_id
            LEFT JOIN programs p ON g.prog_id = p.prog_id
            LEFT JOIN organizations o ON g.org = o.org
            ${bookmarkJoin}
            ${whereClause}
            ORDER BY ${sortColumn} ${sortDirection}
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const dataResult = await db.query(dataQuery, finalParams);

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
