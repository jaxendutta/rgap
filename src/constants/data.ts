// src/constants/data.ts
// Static data used for display

export interface OrganizationInfo {
    abbreviation_en: string;
    abbreviation_fr: string;
    name_en: string;
    name_fr: string;
    // Raw CKAN owner_org slug used by open.canada.ca -- needed to link back
    // to the original government record, e.g.
    // https://search.open.canada.ca/grants/record/nserc-crsng,{ref_number},current
    ckan_slug: string;
}

// Matches supabase/migrations/20260708140000_baseline_schema.sql's
// organizations seed data (org, org_fr, org_title_en, org_title_fr).
export const ORGANIZATIONS: Record<string, OrganizationInfo> = {
    NSERC: {
        abbreviation_en: 'NSERC',
        abbreviation_fr: 'CRSNG',
        name_en: 'Natural Sciences and Engineering Research Council',
        name_fr: 'Conseil de recherches en sciences naturelles et en génie du Canada',
        ckan_slug: 'nserc-crsng',
    },
    CIHR: {
        abbreviation_en: 'CIHR',
        abbreviation_fr: 'IRSC',
        name_en: 'Canadian Institutes of Health Research',
        name_fr: 'Instituts de recherche en santé du Canada',
        ckan_slug: 'cihr-irsc',
    },
    SSHRC: {
        abbreviation_en: 'SSHRC',
        abbreviation_fr: 'CRSH',
        name_en: 'Social Sciences and Humanities Research Council',
        name_fr: 'Conseil de recherches en sciences humaines du Canada',
        ckan_slug: 'sshrc-crsh',
    },
};

export const RECIPIENT_TYPE_LABELS: Record<string, string> = {
    I: 'Institute',
    P: 'Person',
};

export const DEFAULT_ITEM_PER_PAGE = 30;
export const MAX_NOTE_LENGTH = 2000;
export const LAST_UPDATED: Date = new Date('2026-07-15T00:00:00Z');
// Rounded down to the nearest 1,000 (so "over X grants" always stays true).
// Updated automatically by scripts/update-grant-count.mjs during the monthly refresh.
export const GRANTS_COUNT_APPROX: number = 195000;
