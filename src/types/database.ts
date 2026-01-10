// Database Model Types

import { IconType } from "react-icons";

export interface User {
    user_id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
    last_login: Date | null;
}

export interface Organization {
    org: 'NSERC' | 'CIHR' | 'SSHRC';
    title: string;
}

export interface Program {
    prog_id: number;
    prog_name_en: string;
    prog_purpose_en: string | null;
    org: string | null;
}

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

export interface Recipient {
    recipient_id: number;
    type: 'I' | 'P'; // I = Institution, P = Person
    business_number: string | null;
    legal_name: string;
    operating_name: string | null;
    institute_id: number | null;
}

export interface ResearchGrant {
    grant_id: number;
    ref_number: string | null;
    latest_amendment_number: number | null;
    amendment_date: Date | null;
    agreement_number: string | null;
    agreement_value: number | null;
    foreign_currency_type: string | null;
    foreign_currency_value: number | null;
    agreement_start_date: Date | null;
    agreement_end_date: Date | null;
    agreement_title_en: string | null;
    description_en: string | null;
    expected_results_en: string | null;
    additional_information_en: string | null;
    org: string | null;
    recipient_id: number | null;
    prog_id: number | null;
    amendments_history: any | null; // JSONB
}

export interface BookmarkedGrant {
    bookmark_id: number;
    user_id: number;
    grant_id: number;
    bookmarked_at: Date;
    notes: string | null;
}

export interface BookmarkedRecipient {
    bookmark_id: number;
    user_id: number;
    recipient_id: number;
    bookmarked_at: Date;
    notes: string | null;
}

export interface SearchHistory {
    search_id: number;
    user_id: number;
    search_query: string;
    filters: any | null; // JSONB
    result_count: number | null;
    searched_at: Date;
}

// Extended types with joins
export interface GrantDetail extends ResearchGrant {
    recipient_name: string | null;
    recipient_type: 'I' | 'P' | null;
    institute_name: string | null;
    city: string | null;
    province: string | null;
    country: string | null;
    program_name: string | null;
    organization_name: string | null;
}

// API Response Types
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

// Search & Filter Types
export interface SearchFilters {
    query?: string;
    org?: string[];
    programs?: number[];
    institutes?: number[];
    startDate?: string;
    endDate?: string;
    minValue?: number;
    maxValue?: number;
    province?: string[];
    city?: string[];
}

// Statistics Types
export interface GrantStatistics {
    totalGrants: number;
    totalFunding: number;
    avgGrantValue: number;
    grantsPerYear: { year: number; count: number; funding: number }[];
    topPrograms: { prog_id: number; prog_name_en: string; count: number; funding: number }[];
    topInstitutes: { institute_id: number; name: string; count: number; funding: number }[];
}

export interface InstituteStatistics {
    institute_id: number;
    name: string;
    totalGrants: number;
    totalFunding: number;
    avgGrantValue: number;
    fundingByYear: { year: number; count: number; funding: number }[];
    fundingByOrg: { org: string; count: number; funding: number }[];
    topPrograms: { prog_id: number; prog_name_en: string; count: number }[];
}

export interface RecipientStatistics {
    recipient_id: number;
    legal_name: string;
    totalGrants: number;
    totalFunding: number;
    avgGrantValue: number;
    fundingByYear: { year: number; count: number; funding: number }[];
    grantsByProgram: { prog_id: number; prog_name_en: string; count: number }[];
}

// Search & Filter Types (ADD THESE)
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

// ============================================================================
// UI-Extended Types (types with extra fields for UI display)
// ============================================================================
export type EntityType = 'grant' | 'recipient' | 'institute';

// Entity is a union type for components that can display either institutes or recipients
export type Entity = (Institute | Recipient) & {
  // Optional fields that may be added by API for display
  is_bookmarked?: boolean;
  grant_count?: number;
  total_funding?: number;
  recipients_count?: number; // For institutes
  latest_grant_date?: string | Date;
  research_organization_name?: string; // For recipients
  city?: string; // Recipients might not have this directly
  province?: string;
  country?: string;
};

// Alias for consistency with component naming
export type Grant = ResearchGrant & {
  // UI may add these from joins
  recipient_name?: string;
  institute_name?: string;
  program_name?: string;
};

// Generic SortConfig for type safety
export interface SortConfig<TFields extends PropertyKey = string> {
field: TFields;
direction: 'asc' | 'desc';
}

// Helper function type
export type GetSortOptionsFunc<T> = (entityType: string) => Array<{
  field: T;
  label: string;
}>;

// SortOption interface
export interface SortOption<T = string> {
    field: keyof T;
    label: string;
    icon?: IconType;
}