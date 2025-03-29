// src/types/models.ts
import { GrantSearchParams } from "./search";

// Amendment type for grant amendments
export interface GrantAmendment {
    amendment_number: number;
    amendment_date: string;
    agreement_value: number;
    agreement_start_date: string;
    agreement_end_date: string;
    additional_information_en?: string;
}

// Recipient
export interface Recipient {
    recipient_id: number;
    legal_name: string;
    institute_id: number;
    research_organization_name?: string;
    type?: string;
    city?: string;
    province?: string;
    country?: string;
    postal_code?: string;
    grant_count?: number;
    total_funding?: number;
    avg_funding?: number;
    first_grant_date?: string;
    latest_grant_date?: string;
    funding_agencies_count?: number;
    is_bookmarked: boolean;
}

// Institute
export interface Institute {
    institute_id: number;
    name: string;
    city?: string;
    province?: string;
    country?: string;
    postal_code?: string;
    riding_name_en?: string;
    riding_number?: string;
    recipient_count?: number;
    grant_count?: number;
    total_grants?: number;
    total_recipients?: number;
    total_funding?: number;
    avg_funding: number;
    first_grant_date?: string;
    latest_grant_date?: string;
    funding_agencies_count?: number;
    is_bookmarked: boolean;
}

// Grant
export interface Grant {
    grant_id: number;
    ref_number: string;
    latest_amendment_number: number;
    amendment_date?: string;
    agreement_number?: string;
    agreement_value: number;
    foreign_currency_type?: string;
    foreign_currency_value?: number;
    agreement_start_date: string;
    agreement_end_date: string;
    agreement_title_en: string;
    description_en?: string;
    expected_results_en?: string;
    additional_information_en?: string;
    is_bookmarked: boolean;

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
    prog_purpose_en?: string; // Purpose of the program

    // Amendment history
    amendments_history?: GrantAmendment[];
}

// Search History
export interface SearchHistory {
    history_id: number;
    search_time: Date;
    search_params: GrantSearchParams;
    result_count: number;
    bookmarked: boolean;
}

// Entity types
export type Entity = "recipient" | "institute" | "grant" | "search";
