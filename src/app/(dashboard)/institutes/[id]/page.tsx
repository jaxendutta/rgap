// src/app/(dashboard)/institutes/[id]/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { InstituteDetailClient } from '@/app/(dashboard)/institutes/[id]/client';
import { InstituteWithStats, RecipientWithStats, GrantWithDetails } from '@/types/database';
import { getSortOptions } from '@/lib/utils';

const sortOptions = getSortOptions('recipient', 'institute');

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getInstituteDetails(id: number, userId?: number) {
    const query = `
        SELECT 
            i.institute_id,
            i.name, i.city, i.province, i.country, i.postal_code,
            COUNT(DISTINCT r.recipient_id)::int as recipient_count,
            COUNT(DISTINCT g.grant_id)::int as grant_count,
            COALESCE(SUM(g.agreement_value::numeric), 0) as total_funding,
            COALESCE(AVG(g.agreement_value::numeric), 0) as avg_funding,
            MIN(g.agreement_start_date) as first_grant_date,
            MAX(g.agreement_start_date) as latest_grant_date,
            COUNT(DISTINCT g.org)::int as funding_agencies_count,
            ${userId ? `
                EXISTS(
                    SELECT 1 FROM bookmarked_institutes bi 
                    WHERE bi.institute_id = i.institute_id 
                    AND bi.user_id = $2::int
                ) as is_bookmarked
            ` : 'false as is_bookmarked'}
        FROM institutes i
        LEFT JOIN recipients r ON i.institute_id = r.institute_id
        LEFT JOIN grants g ON r.recipient_id = g.recipient_id
        WHERE i.institute_id = $1
        GROUP BY i.institute_id
    `;
    const params = userId ? [id, userId] : [id];
    const result = await db.query<InstituteWithStats>(query, params);
    return result.rows[0] || null;
}

async function getInstituteRecipients(
    id: number,
    userId: number | undefined,
    page: number,
    pageSize: number,
    sortField: string = sortOptions[0].field,
    sortDir: 'asc' | 'desc' = 'desc'
) {
    const offset = (page - 1) * pageSize;

    const safeSortField = sortOptions.find(option => option.field === sortField) ? sortField : sortOptions[0].field;
    const safeSortDir = sortDir === 'asc' ? 'ASC' : 'DESC';

    const query = `
        SELECT 
            r.recipient_id, r.legal_name, r.type, r.business_number, r.operating_name,
            r.institute_id,
            i.name as research_organization_name, i.city, i.province, i.country,
            COUNT(DISTINCT g.grant_id)::int as grant_count,
            COALESCE(SUM(g.agreement_value::numeric), 0) as total_funding,
            COALESCE(AVG(g.agreement_value::numeric), 0) as avg_funding,
            MIN(g.agreement_start_date::date) as first_grant_date,
            MAX(g.agreement_start_date::date) as latest_grant_date,
            ${userId ? `
                EXISTS(
                    SELECT 1 FROM bookmarked_recipients br 
                    WHERE br.recipient_id = r.recipient_id 
                    AND br.user_id = $4::int
                ) as is_bookmarked
            ` : 'false as is_bookmarked'}
        FROM recipients r
        LEFT JOIN institutes i ON r.institute_id = i.institute_id
        LEFT JOIN grants g ON r.recipient_id = g.recipient_id
        WHERE r.institute_id = $1
        GROUP BY r.recipient_id, i.name, i.city, i.province, i.country
        ORDER BY ${safeSortField} ${safeSortDir} NULLS LAST
        LIMIT $2 OFFSET $3
    `;
    const params = userId ? [id, pageSize, offset, userId] : [id, pageSize, offset];
    const result = await db.query<RecipientWithStats>(query, params);
    return result.rows;
}

const ALLOWED_GRANT_SORTS = ['agreement_value', 'agreement_start_date'];

async function getInstituteGrants(
    id: number,
    userId: number | undefined,
    page: number,
    pageSize: number,
    sortField: string = 'agreement_start_date',
    sortDir: 'asc' | 'desc' = 'desc'
) {
    const offset = (page - 1) * pageSize;

    const safeSortField = ALLOWED_GRANT_SORTS.includes(sortField) ? sortField : 'agreement_start_date';
    const orderBy = "g." + safeSortField;
    const safeSortDir = sortDir === 'asc' ? 'ASC' : 'DESC';

    const query = `
        SELECT 
            g.*,
            r.type, r.business_number, r.legal_name, r.operating_name,
            i.institute_id, i.name, i.city, i.province, i.country, i.postal_code,
            p.prog_title_en, p.prog_purpose_en,
            o.org_fr, o.org_title_en, o.org_title_fr,
            ${userId ? `
                EXISTS(
                    SELECT 1 FROM bookmarked_grants bg 
                    WHERE bg.grant_id = g.grant_id 
                    AND bg.user_id = $4::int
                ) as is_bookmarked
            ` : 'false as is_bookmarked'}
        FROM grants g
        JOIN recipients r ON g.recipient_id = r.recipient_id
        JOIN institutes i ON r.institute_id = i.institute_id
        LEFT JOIN programs p ON g.prog_id = p.prog_id
        JOIN organizations o ON g.org = o.org
        WHERE i.institute_id = $1
        ORDER BY ${orderBy} ${safeSortDir} NULLS LAST
        LIMIT $2 OFFSET $3
    `;
    const params = userId ? [id, pageSize, offset, userId] : [id, pageSize, offset];
    const result = await db.query<GrantWithDetails>(query, params);
    return result.rows;
}

async function getInstituteAnalyticsData(id: number) {
    // FIXED: Added g.agreement_end_date here as well
    const query = `
        SELECT 
            g.grant_id,
            g.agreement_value,
            g.agreement_start_date,
            g.agreement_end_date,
            g.recipient_id,
            p.prog_title_en,
            o.org_title_en
        FROM grants g
        JOIN recipients r ON g.recipient_id = r.recipient_id
        LEFT JOIN programs p ON g.prog_id = p.prog_id
        JOIN organizations o ON g.org = o.org
        WHERE r.institute_id = $1
        ORDER BY g.agreement_start_date ASC
    `;
    const result = await db.query<GrantWithDetails>(query, [id]);
    return result.rows;
}

export default async function InstitutePage({ params, searchParams }: PageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const id = parseInt(resolvedParams.id);
    const page = parseInt((resolvedSearchParams.page as string) || '1');
    const tab = (resolvedSearchParams.tab as string) || 'recipients';
    const sort = (resolvedSearchParams.sort as string) || '';
    const dir = (resolvedSearchParams.dir as 'asc' | 'desc') || 'desc';
    const limit = 15;

    if (isNaN(id)) notFound();

    const user = await getCurrentUser();
    const institute = await getInstituteDetails(id, user?.id);

    if (!institute) notFound();

    let recipients: RecipientWithStats[] = [];
    let grants: GrantWithDetails[] = [];

    if (tab === 'recipients') {
        recipients = await getInstituteRecipients(id, user?.id, page, limit, sort || 'total_funding', dir);
    } else if (tab === 'grants') {
        grants = await getInstituteGrants(id, user?.id, page, limit, sort || 'agreement_start_date', dir);
    } else if (tab === 'analytics') {
        grants = await getInstituteAnalyticsData(id);
    }

    return (
        <InstituteDetailClient
            institute={institute}
            recipients={recipients}
            grants={grants}
            userId={user?.id}
            page={page}
            pageSize={limit}
            activeTab={tab}
        />
    );
}

export async function generateMetadata({ params }: PageProps) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) return { title: 'Institute Not Found | RGAP' };
    const result = await db.query('SELECT name FROM institutes WHERE institute_id = $1', [id]);
    if (result.rows.length === 0) return { title: 'Institute Not Found | RGAP' };
    return {
        title: `${result.rows[0].name} | RGAP`,
        description: `View information about ${result.rows[0].name}.`
    };
}
