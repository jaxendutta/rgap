// src/types/models.ts

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
    research_organization_name: string;
    type: string;
    recipient_type: string;
    country: string;
    province: string;
    city: string;
    postal_code: string;
    riding_name_en: string;
    riding_name_fr: string;
    riding_number: string;
}

// Grant
export interface ResearchGrant {
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
    recipient_id: number;
    legal_name: string;
    institute_id: number;
    research_organization_name: string;
    city: string;
    province: string;
    country: string;
    org: string;  // abbreviation from Organization table
    owner_org?: string;
    owner_org_title?: string; // Full name of the organization
    prog_id?: number;
    prog_title_en?: string;
    
    // New field for amendment history
    amendments_history?: GrantAmendment[];
}
