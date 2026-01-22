// ============================================================================
// BASE DATABASE TYPES (Direct from PostgreSQL schema)
// ============================================================================

import { IconType } from "react-icons";

/**
 * User account information
 */
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: Date | null;
    pending_email: string | null;
    created_at: Date;
}

export interface Session {
    session_id: string;
    user_id: number;
    user_agent: string | null;
    ip_address: string | null;
    location: string | null;
    created_at: Date;
    last_active_at: Date;
}

export interface AuditLog {
    id: number;
    user_id: number;
    event_type: 'NAME_CHANGE' | 'EMAIL_CHANGE' | 'PASSWORD_CHANGE' | 'LOGIN';
    old_value: string | null;
    new_value: string | null;
    created_at: Date;
}

/**
 * Funding organization (NSERC, CIHR, SSHRC)
 */
export interface Organization {
    org: 'NSERC' | 'CIHR' | 'SSHRC';
    org_fr: 'CRSNG' | 'IRSC' | 'CRSH';
    org_title_en: string;
    org_title_fr: string;
}

/**
 * Funding program
 */
export interface Program {
    prog_id: number;
    prog_title_en: string;
    prog_purpose_en: string | null;
    org: string | null;
}

/**
 * Research institution
 * CONTAINS: All location data (city, province, country)
 * UNIQUE BY: name + city + country
 */
export interface Institute {
    institute_id: number;
    name: string;
    country: string;
    province: string | null;
    city: string | null;
    postal_code: string | null;
    federal_riding_name_en: string | null;
    federal_riding_number: string | null;
}

/**
 * Grant recipient (person or institution)
 * LOCATION: Inherited from linked Institute
 * UNIQUE BY: legal_name + institute_id
 */
export interface Recipient {
    recipient_id: number;
    type: keyof typeof RECIPIENT_TYPE_LABELS;
    business_number: string | null;
    legal_name: string;
    operating_name: string | null;
    institute_id: number | null;
}

/**
 * Research grant
 */
export interface Grant {
    grant_id: number;
    ref_number: string;
    latest_amendment_number: number;
    amendment_date: Date;
    agreement_number: string;
    agreement_value: number;
    foreign_currency_type: string | null;
    foreign_currency_value: number | null;
    agreement_start_date: Date;
    agreement_end_date?: Date;
    agreement_title_en: string;
    description_en: string;
    expected_results_en: string;
    additional_information_en: string;
    org: string;
    recipient_id: number;
    prog_id: number;
    amendments_history: GrantAmendment[] | null;
}

/**
 * Grant amendment information
 */
export interface GrantAmendment {
    amendment_number: number;
    amendment_date: string;
    agreement_value: number;
    agreement_start_date: string;
    agreement_end_date: string;
    additional_information_en?: string;
}

/**
 * Bookmarked grant
 */
export interface BookmarkedGrant {
    bookmark_id: number;
    user_id: number;
    grant_id: number;
    bookmarked_at: Date;
    notes: string | null;
}

/**
 * Bookmarked institute
 */
export interface BookmarkedInstitute {
    bookmark_id: number;
    user_id: number;
    institute_id: number;
    bookmarked_at: Date;
    notes: string | null;
}

/**
 * Bookmarked recipient
 */
export interface BookmarkedRecipient {
    bookmark_id: number;
    user_id: number;
    recipient_id: number;
    bookmarked_at: Date;
    notes: string | null;
}

/**
 * Search history
 */
export interface SearchHistory {
    search_id: number;
    user_id: number;
    search_query: string;
    filters: Record<string, any> | null;
    result_count: number | null;
    searched_at: Date;
}

// ============================================================================
// EXTENDED TYPES (With Aggregated Data from API/Views)
// ============================================================================

/**
 * Institute with aggregated statistics
 * Used in list views and profile pages
 */
export interface InstituteWithStats extends Institute {
    // Aggregated counts
    recipient_count: number;
    grant_count: number;
    total_grants: number;
    total_recipients: number;

    // Active counts (New)
    active_recipient_count?: number;
    active_grant_count?: number;

    // Funding statistics
    total_funding: number;
    avg_funding: number;

    // Date ranges
    first_grant_date: string | Date;
    latest_grant_date: string | Date;
    latest_end_date: string | Date;

    // Misc
    funding_agencies_count: number;

    // UI state
    is_bookmarked: boolean;
}

/**
 * Recipient with aggregated statistics AND institute location data
 * Used in list views and profile pages
 * IMPORTANT: Location fields are populated from the linked Institute
 */
export interface RecipientWithStats extends Recipient {
    // Institute information (for display)
    research_organization_name?: string; // Institute name

    // Location (inherited from Institute via institute_id)
    city?: string;
    province?: string;
    country?: string;
    postal_code?: string;

    // Aggregated counts
    grant_count: number;

    // Funding statistics
    total_funding: number;
    avg_funding: number;

    // Date ranges
    first_grant_date: string | Date;
    latest_grant_date: string | Date;

    // Misc
    funding_agencies_count: number;

    // UI state
    is_bookmarked?: boolean;
}

/**
 * Grant with full details (joins with recipient, institute, program, org)
 */
export type GrantWithDetails = Grant & Recipient & Institute & Program & Organization & {
    is_bookmarked?: boolean;
};

// ============================================================================
// TYPE UTILITIES
// ============================================================================

/**
 * Entity types for routing and components
 */
export type EntityType = 'grant' | 'recipient' | 'institute';

/**
 * Recipient type labels
 */
export const RECIPIENT_TYPE_LABELS = {
    A: "Indigenous recipients",
    F: "For-profit organizations",
    G: "Government",
    I: "International (non-government)",
    N: "Not-for-profit organizations and charities",
    O: "Other",
    P: "Individual or sole proprietorships",
    S: "Academia"
} as const;

/**
 * Type guard to check if entity is an Institute
 */
export function isInstitute(entity: InstituteWithStats | RecipientWithStats): entity is InstituteWithStats {
    return 'institute_id' in entity && !('recipient_id' in entity);
}

/**
 * Type guard to check if entity is a Recipient
 */
export function isRecipient(entity: InstituteWithStats | RecipientWithStats): entity is RecipientWithStats {
    return 'recipient_id' in entity;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T = any> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
}

// ============================================================================
// SORT & FILTER TYPES
// ============================================================================

export interface SortConfig {
    field: string;
    label: string;
    direction: 'asc' | 'desc';
}

export type SortOption = {
    value: string;
    label: string;
    field: string;
    direction: 'asc' | 'desc';
    icon: IconType;
};

export interface SearchFilters {
    query?: string;
    organizations?: string[];
    programs?: number[];
    institutes?: number[];
    recipients?: number[];
    startDate?: string;
    endDate?: string;
    minValue?: number;
    maxValue?: number;
    provinces?: string[];
    cities?: string[];
    recipientType?: string;
}

export type ChartMetric = "funding" | "grants" | "counts";