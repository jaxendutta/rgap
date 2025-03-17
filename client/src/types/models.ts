// src/types/models.ts
import { GrantSearchParams } from "./search";

// Amendment type for grant amendments
export interface GrantAmendment {
    amendment_number: string;
    amendment_date: string;
    agreement_value: number;
    agreement_start_date: string;
    agreement_end_date: string;
}

// Recipient
export interface Recipient {
    recipient_id: number;
    legal_name: string;
    institute_id: number;
    research_organization_name?: string;
    type?: string;
    recipient_type?: string;
    city?: string;
    province?: string;
    country?: string;
    postal_code?: string;
    riding_name_en?: string;
    riding_name_fr?: string;
    riding_number?: string;
    grants_count?: number;
    total_funding?: number;
    latest_grant_date?: string;
}

// Institute
export interface Institute {
    institute_id: number;
    name: string;
    type?: string;
    city?: string;
    province?: string;
    country?: string;
    postal_code?: string;
    riding_name_en?: string;
    riding_name_fr?: string;
    riding_number?: string;
    total_recipients?: number;
    total_grants?: number;
    total_funding?: number;
    first_grant_date?: string;
    latest_grant_date?: string;
}

// Grant
export interface Grant {
    grant_id?: number;
    ref_number: string;
    amendment_number?: string;
    amendment_date?: string;
    agreement_type?: string;
    agreement_number?: string;
    agreement_value: number;
    foreign_currency_type?: string;
    foreign_currency_value?: number;
    agreement_start_date: string;
    agreement_end_date: string;
    agreement_title_en: string;
    agreement_title_fr?: string;
    description_en?: string;
    description_fr?: string;
    expected_results_en?: string;
    expected_results_fr?: string;

    // Recipient information
    recipient_id: number;
    legal_name: string;

    // Institute information
    institute_id: number;
    research_organization_name: string;
    city?: string;
    province?: string;
    country?: string;

    // Organization information
    org: string;
    org_title: string; // Full name of the organization

    // Program information
    prog_id?: string;
    prog_title_en?: string;
    program_purpose?: string; // Purpose of the program

    // Amendment history
    amendments_history?: GrantAmendment[];
}

// Search History
export interface SearchHistory {
    history_id: number;
    timestamp: Date;
    search_params: GrantSearchParams;
    results: number;
}
