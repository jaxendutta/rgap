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
export type ResearchGrant = {
    "grant_id": number
    "ref_number": string
    "amendment_number": string
    "amendment_date": string
    "agreement_type": string
    "agreement_number": string
    "agreement_value": number
    "foreign_currency_type": string
    "foreign_currency_value": number
    "agreement_start_date": string
    "agreement_end_date": string
    "agreement_title_en": string
    "agreement_title_fr": string
    "description_en": string
    "description_fr": string
    "expected_results_en": string
    "expected_results_fr": string
    "org": string
    "recipient_id": number
    "prog_id": string
}