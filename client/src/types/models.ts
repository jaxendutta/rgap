// Recipient
export type Recipient = {
    "recipient_id": number
    "legal_name": string
    "research_organization_name": string
    "type": string
    "recipient_type": string
    //"recipientType": 'Indigenous recipients' | 'For-profit organizations' | 'Government' | 'International (non-government)' | 'Not-for-profit organizations and charities' | 'Other' | 'Individual or sole proprietorships' | 'Academia'
    "country": string
    "province": string
    "city": string
    "postal_code": string
    "riding_name_en": string
    "riding_name_fr": string
    "riding_number": string
}

// Grant
export interface ResearchGrant {
    grant_id: number;
    ref_number: string;
    agreement_title_en: string;
    agreement_value: number;
    agreement_start_date: string;
    agreement_end_date: string;
    recipient_id: number;
    // These come from the Recipient table via JOIN
    legal_name: string;
    research_organization_name: string;
    city: string;
    province: string;
    country: string;
    // This comes from the Organization table via JOIN
    org: string;  // abbreviation from Organization table
}