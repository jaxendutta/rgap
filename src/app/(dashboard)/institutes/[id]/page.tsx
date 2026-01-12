// src/app/(dashboard)/institutes/[id]/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { InstituteDetailClient } from './client';
import { InstituteWithStats, RecipientWithStats, GrantWithDetails } from '@/types/database';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getInstituteData(id: number, userId?: number) {
    // 1. GET INSTITUTE WITH STATS (use recipient_count not recipients_count!)
    const instituteResult = await db.query<InstituteWithStats>(`
        SELECT 
            i.institute_id,
            i.name,
            i.city,
            i.province,
            i.country,
            i.postal_code,
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
                    AND bi.user_id = $2
                ) as is_bookmarked
            ` : 'false as is_bookmarked'}
        FROM institutes i
        LEFT JOIN recipients r ON i.institute_id = r.institute_id
        LEFT JOIN grants g ON r.recipient_id = g.recipient_id
        WHERE i.institute_id = $1
        GROUP BY i.institute_id
    `, userId ? [id, userId] : [id]);

    if (instituteResult.rows.length === 0) {
        return null;
    }

    const institute = instituteResult.rows[0];

    // 2. GET ALL RECIPIENTS
    const allRecipientsResult = await db.query<RecipientWithStats>(`
        SELECT 
            r.recipient_id,
            r.legal_name,
            r.type,
            r.business_number,
            r.operating_name,
            r.institute_id,
            i.name as research_organization_name,
            i.city,
            i.province,
            i.country,
            COUNT(DISTINCT g.grant_id)::int as grant_count,
            COALESCE(SUM(g.agreement_value::numeric), 0) as total_funding,
            COALESCE(AVG(g.agreement_value::numeric), 0) as avg_funding,
            MIN(g.agreement_start_date::date) as first_grant_date,
            MAX(g.agreement_start_date::date) as latest_grant_date,
            ${userId ? `
                EXISTS(
                    SELECT 1 FROM bookmarked_recipients br 
                    WHERE br.recipient_id = r.recipient_id 
                    AND br.user_id = $3
                ) as is_bookmarked
            ` : 'false as is_bookmarked'}
        FROM recipients r
        LEFT JOIN institutes i ON r.institute_id = i.institute_id
        LEFT JOIN grants g ON r.recipient_id = g.recipient_id
        WHERE r.institute_id = $1
        GROUP BY r.recipient_id, i.name, i.city, i.province, i.country
        ORDER BY total_funding DESC NULLS LAST
    `, userId ? [id, 1000, userId] : [id]);

    // 3. GET ALL GRANTS - Return EVERYTHING for GrantWithDetails intersection type!
    const allGrantsResult = await db.query<GrantWithDetails>(`
        SELECT 
            -- ALL Grant fields
            g.grant_id,
            g.ref_number,
            g.latest_amendment_number,
            g.amendment_date,
            g.agreement_number,
            g.agreement_value,
            g.foreign_currency_type,
            g.foreign_currency_value,
            g.agreement_start_date,
            g.agreement_end_date,
            g.agreement_title_en,
            g.description_en,
            g.expected_results_en,
            g.additional_information_en,
            g.org,
            g.recipient_id,
            g.prog_id,
            g.amendments_history,
            
            -- ALL Recipient fields
            r.type,
            r.business_number,
            r.legal_name,
            r.operating_name,
            
            -- ALL Institute fields (from i)
            i.institute_id,
            i.name,
            i.city,
            i.province,
            i.country,
            i.postal_code,
            
            -- ALL Program fields
            p.prog_title_en,
            p.prog_purpose_en,
            
            -- ALL Organization fields
            o.org_fr,
            o.org_title_en,
            o.org_title_fr,
            
            ${userId ? `
                EXISTS(
                    SELECT 1 FROM bookmarked_grants bg 
                    WHERE bg.grant_id = g.grant_id 
                    AND bg.user_id = $3
                ) as is_bookmarked
            ` : 'false as is_bookmarked'}
        FROM grants g
        JOIN recipients r ON g.recipient_id = r.recipient_id
        JOIN institutes i ON r.institute_id = i.institute_id
        LEFT JOIN programs p ON g.prog_id = p.prog_id
        JOIN organizations o ON g.org = o.org
        WHERE i.institute_id = $1
        ORDER BY g.agreement_start_date DESC NULLS LAST
    `, userId ? [id, 1000, userId] : [id]);

    return {
        institute,
        allRecipients: allRecipientsResult.rows,
        allGrants: allGrantsResult.rows,
    };
}

export default async function InstitutePage({ params }: PageProps) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
        notFound();
    }

    const user = await getCurrentUser();
    const data = await getInstituteData(id, user?.id);

    if (!data) {
        notFound();
    }

    return (
        <InstituteDetailClient
            institute={data.institute}
            allRecipients={data.allRecipients}
            allGrants={data.allGrants}
            userId={user?.id}
        />
    );
}

export async function generateMetadata({ params }: PageProps) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
        return { title: 'Institute Not Found | RGAP' };
    }

    const result = await db.query<InstituteWithStats>(
        'SELECT name FROM institutes WHERE institute_id = $1',
        [id]
    );

    if (result.rows.length === 0) {
        return { title: 'Institute Not Found | RGAP' };
    }

    return {
        title: `${result.rows[0].name} | RGAP`,
        description: `View detailed information about ${result.rows[0].name} including funding statistics, recipients, and grants.`
    };
}
