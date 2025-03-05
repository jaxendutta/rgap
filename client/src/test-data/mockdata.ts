import { GrantSearchParams } from '@/types/search'

export const filterOptions = {
    agency: ['NSERC', 'SSHRC', 'CIHR'],
    country: ['Canada', 'International', 'United States', 'United Kingdom', 'France'],
    province: ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
    city: ['Toronto', 'Montreal', 'Vancouver', 'Ottawa']
}

export const mock_data = {
    User: [
        {
            "user_id": 1,
            "email": "user1@example.com",
            "name": "John Doe",
            "password_hash": "hashed_password_1",
            "created_at": "2025-01-01 12:00:00"
        },
        {
            "user_id": 2,
            "email": "user2@example.com",
            "name": "Jane Smith",
            "password_hash": "hashed_password_2",
            "created_at": "2025-01-02 12:00:00"
        },
        {
            "user_id": 3,
            "email": "user3@example.com",
            "name": "Alice Johnson",
            "password_hash": "hashed_password_3",
            "created_at": "2025-01-03 12:00:00"
        },
        {
            "user_id": 4,
            "email": "user4@example.com",
            "name": "Bob Brown",
            "password_hash": "hashed_password_4",
            "created_at": "2025-01-04 12:00:00"
        },
        {
            "user_id": 5,
            "email": "user5@example.com",
            "name": "Charlie Davis",
            "password_hash": "hashed_password_5",
            "created_at": "2025-01-05 12:00:00"
        },
        {
            "user_id": 6,
            "email": "user6@example.com",
            "name": "Diana Evans",
            "password_hash": "hashed_password_6",
            "created_at": "2025-01-06 12:00:00"
        },
        {
            "user_id": 7,
            "email": "user7@example.com",
            "name": "Eve Foster",
            "password_hash": "hashed_password_7",
            "created_at": "2025-01-07 12:00:00"
        },
        {
            "user_id": 8,
            "email": "user8@example.com",
            "name": "Frank Green",
            "password_hash": "hashed_password_8",
            "created_at": "2025-01-08 12:00:00"
        }
    ],
    Recipient: [
        {
            "recipient_id": 1,
            "legal_name": "Fox, Terry",
            "research_organization_name": "Canadian Cancer Research Institute",
            "institute_id": 1,
            "type": "Academia",
            "recipient_type": "Academia",
            "country": "CA",
            "province": "ON",
            "city": "Toronto",
            "postal_code": "M5G 2C3",
            "riding_name_en": "Toronto Centre",
            "riding_name_fr": "Centre de Toronto",
            "riding_number": "10001"
        },
        {
            "recipient_id": 2,
            "legal_name": "Germanotta, Stefani",
            "research_organization_name": "National Health Institute",
            "institute_id": 2,
            "type": "Government",
            "recipient_type": "Government",
            "country": "CA",
            "province": "QC",
            "city": "Montreal",
            "postal_code": "H3A 1A1",
            "riding_name_en": "Montreal Centre",
            "riding_name_fr": "Centre de Montréal",
            "riding_number": "20002"
        },
        {
            "recipient_id": 3,
            "legal_name": "Peter Gene, Hernandez",
            "research_organization_name": "Pacific Research Center",
            "institute_id": 3,
            "type": "Private",
            "recipient_type": "Private",
            "country": "CA",
            "province": "BC",
            "city": "Vancouver",
            "postal_code": "V5K 0A1",
            "riding_name_en": "Vancouver Centre",
            "riding_name_fr": "Centre de Vancouver",
            "riding_number": "30003"
        },
        {
            "recipient_id": 4,
            "legal_name": "Marina, Diamandis",
            "research_organization_name": "Alberta Non-Profit Research",
            "institute_id": 4,
            "type": "Non-Profit",
            "recipient_type": "Non-Profit",
            "country": "CA",
            "province": "AB",
            "city": "Calgary",
            "postal_code": "T2P 2C3",
            "riding_name_en": "Calgary Centre",
            "riding_name_fr": "Centre de Calgary",
            "riding_number": "40004"
        },
        {
            "recipient_id": 5,
            "legal_name": "Manitoba Research Institute",
            "research_organization_name": "Manitoba Research Institute",
            "institute_id": 5,
            "type": "Academia",
            "recipient_type": "Academia",
            "country": "CA",
            "province": "MB",
            "city": "Winnipeg",
            "postal_code": "R3C 4T3",
            "riding_name_en": "Winnipeg Centre",
            "riding_name_fr": "Centre de Winnipeg",
            "riding_number": "50005"
        },
        {
            "recipient_id": 6,
            "legal_name": "Nova Scotia Research Institute",
            "research_organization_name": "Nova Scotia Research Institute",
            "institute_id": 6,
            "type": "Government",
            "recipient_type": "Government",
            "country": "CA",
            "province": "NS",
            "city": "Halifax",
            "postal_code": "B3J 3K5",
            "riding_name_en": "Halifax Centre",
            "riding_name_fr": "Centre de Halifax",
            "riding_number": "60006"
        },
        {
            "recipient_id": 7,
            "legal_name": "Saskatchewan Research Institute",
            "research_organization_name": "Saskatchewan Research Institute",
            "institute_id": 7,
            "type": "Private",
            "recipient_type": "Private",
            "country": "CA",
            "province": "SK",
            "city": "Regina",
            "postal_code": "S4P 3Y2",
            "riding_name_en": "Regina Centre",
            "riding_name_fr": "Centre de Regina",
            "riding_number": "70007"
        },
        {
            "recipient_id": 8,
            "legal_name": "Newfoundland Research Institute",
            "research_organization_name": "Newfoundland Research Institute",
            "institute_id": 8,
            "type": "Non-Profit",
            "recipient_type": "Non-Profit",
            "country": "CA",
            "province": "NL",
            "city": "St. John's",
            "postal_code": "A1C 5S7",
            "riding_name_en": "St. John's Centre",
            "riding_name_fr": "Centre de St. John's",
            "riding_number": "80008"
        }
    ],
    Program: [
        {
            "prog_id": "PROG001",
            "name_en": "Program A",
            "name_fr": "Programme A",
            "purpose_en": "Purpose of Program A",
            "purpose_fr": "Objectif du Programme A",
            "naics_identifier": "123456"
        },
        {
            "prog_id": "PROG002",
            "name_en": "Program B",
            "name_fr": "Programme B",
            "purpose_en": "Purpose of Program B",
            "purpose_fr": "Objectif du Programme B",
            "naics_identifier": "654321"
        },
        {
            "prog_id": "PROG003",
            "name_en": "Program C",
            "name_fr": "Programme C",
            "purpose_en": "Purpose of Program C",
            "purpose_fr": "Objectif du Programme C",
            "naics_identifier": "789012"
        },
        {
            "prog_id": "PROG004",
            "name_en": "Program D",
            "name_fr": "Programme D",
            "purpose_en": "Purpose of Program D",
            "purpose_fr": "Objectif du Programme D",
            "naics_identifier": "345678"
        },
        {
            "prog_id": "PROG005",
            "name_en": "Program E",
            "name_fr": "Programme E",
            "purpose_en": "Purpose of Program E",
            "purpose_fr": "Objectif du Programme E",
            "naics_identifier": "901234"
        },
        {
            "prog_id": "PROG006",
            "name_en": "Program F",
            "name_fr": "Programme F",
            "purpose_en": "Purpose of Program F",
            "purpose_fr": "Objectif du Programme F",
            "naics_identifier": "567890"
        },
        {
            "prog_id": "PROG007",
            "name_en": "Program G",
            "name_fr": "Programme G",
            "purpose_en": "Purpose of Program G",
            "purpose_fr": "Objectif du Programme G",
            "naics_identifier": "234567"
        },
        {
            "prog_id": "PROG008",
            "name_en": "Program H",
            "name_fr": "Programme H",
            "purpose_en": "Purpose of Program H",
            "purpose_fr": "Objectif du Programme H",
            "naics_identifier": "890123"
        }
    ],
    Organization: [
        {
            "org": "CIHR",
            "org_name": "Canadian Institutes of Health Research",
            "owner_org": "cihr-irsc",
        },
        {
            "org": "NSERC",
            "org_name": "Natural Sciences and Engineering Research Council of Canada",
            "owner_org": "nserc-crsng",
        },
        {
            "org": "SSHRC",
            "org_name": "Social Sciences and Humanities Research Council of Canada",
            "owner_org": "sshrc-crsh",
        },
    ],
    ResearchGrant: [
        {
            grant_id: 1,
            ref_number: "GRANT001",
            agreement_title_en: "Agreement Title A",
            agreement_value: 100000,
            agreement_start_date: "2025-01-01",
            agreement_end_date: "2025-12-31",
            recipient_id: 1,
            legal_name: "Fox, Terry",
            research_organization_name: "Canadian Cancer Research Institute",
            institute_id: 1,
            city: "Toronto",
            province: "ON",
            country: "CA",
            org: "NSERC"
        },
        {
            grant_id: 2,
            ref_number: "GRANT002",
            agreement_title_en: "Agreement Title B",
            agreement_value: 200000,
            agreement_start_date: "2025-02-01",
            agreement_end_date: "2025-12-31",
            recipient_id: 2,
            legal_name: "Germanotta, Stefani",
            research_organization_name: "National Health Institute",
            institute_id: 2,
            city: "Montreal",
            province: "QC",
            country: "CA",
            org: "CIHR"
        },
        {
            grant_id: 3,
            ref_number: "GRANT003",
            agreement_title_en: "Agreement Title C",
            agreement_value: 300000,
            agreement_start_date: "2025-03-01",
            agreement_end_date: "2025-12-31",
            recipient_id: 3,
            legal_name: "Peter Gene, Hernandez",
            research_organization_name: "Pacific Research Center",
            institute_id: 3,
            city: "Vancouver",
            province: "BC",
            country: "CA",
            org: "SSHRC"
        },
        {
            grant_id: 4,
            ref_number: "GRANT004",
            agreement_title_en: "Agreement Title D",
            agreement_value: 400000,
            agreement_start_date: "2025-04-01",
            agreement_end_date: "2025-12-31",
            recipient_id: 4,
            legal_name: "Marina, Diamandis",
            research_organization_name: "Alberta Non-Profit Research",
            institute_id: 4,
            city: "Calgary",
            province: "AB",
            country: "CA",
            org: "CIHR"
        },
        {
            grant_id: 5,
            ref_number: "GRANT005",
            agreement_title_en: "Agreement Title E",
            agreement_value: 500000,
            agreement_start_date: "2025-05-01",
            agreement_end_date: "2025-12-31",
            recipient_id: 5,
            legal_name: "Manitoba Research Institute",
            research_organization_name: "Manitoba Research Institute",
            institute_id: 5,
            city: "Winnipeg",
            province: "MB",
            country: "CA",
            org: "NSERC"
        },
        {
            grant_id: 6,
            ref_number: "GRANT006",
            agreement_title_en: "Agreement Title F",
            agreement_value: 600000,
            agreement_start_date: "2025-06-01",
            agreement_end_date: "2025-12-31",
            recipient_id: 6,
            legal_name: "Nova Scotia Research Institute",
            research_organization_name: "Nova Scotia Research Institute",
            institute_id: 6,
            city: "Halifax",
            province: "NS",
            country: "CA",
            org: "SSHRC"
        },
        {
            grant_id: 7,
            ref_number: "GRANT007",
            agreement_title_en: "Agreement Title G",
            agreement_value: 700000,
            agreement_start_date: "2025-07-01",
            agreement_end_date: "2025-12-31",
            recipient_id: 7,
            legal_name: "Saskatchewan Research Institute",
            research_organization_name: "Saskatchewan Research Institute",
            institute_id: 7,
            city: "Regina",
            province: "SK",
            country: "CA",
            org: "SSHRC"
        },
        {
            grant_id: 8,
            ref_number: "GRANT008",
            agreement_title_en: "Agreement Title H",
            agreement_value: 800000,
            agreement_start_date: "2025-08-01",
            agreement_end_date: "2025-12-31",
            recipient_id: 8,
            legal_name: "Newfoundland Research Institute",
            research_organization_name: "Newfoundland Research Institute",
            institute_id: 8,
            city: "St. John's",
            province: "NL",
            country: "CA",
            org: "NSERC"
        }
    ]
};

export const mockInstitutes = [
    {
        id: 1,
        name: 'Canadian Cancer Research Institute',
        city: 'Toronto',
        province: 'ON',
        country: 'CA',
        type: 'Academia',
        grants: [
            1, 2, 3, 4
        ],
        recipients: [
            1, 2, 3, 4
        ],
        stats: {
            total_grants: { value: 2, trend: 'up' as 'up' | 'down' },
            total_value: { value: 300000, trend: 'up' as 'up' | 'down' },
            recipients: { value: 2, trend: 'up' as 'up' | 'down' }
        },
        funding_history: [
            { year: 2020, value: 500000 },
            { year: 2021, value: 600000 },
            { year: 2022, value: 700000 },
            { year: 2023, value: 800000 },
            { year: 2024, value: 900000 },
            { year: 2025, value: 1000000 }
        ]
    },
    {
        id: 2,
        name: 'National Health Institute',
        city: 'Montreal',
        province: 'QC',
        country: 'CA',
        type: 'Government',
        grants: [
            5, 6, 7, 8,
        ],
        recipients: [
            5, 6, 7, 8
        ],
        stats: {
            total_grants: { value: 2, trend: 'up' as 'up' | 'down' },
            total_value: { value: 700000, trend: 'up' as 'up' | 'down' },
            recipients: { value: 2, trend: 'up' as 'up' | 'down' }
        },
        funding_history: [
            { year: 2020, value: 600000 },
            { year: 2021, value: 700000 },
            { year: 2022, value: 800000 },
            { year: 2023, value: 900000 },
            { year: 2024, value: 1000000 },
            { year: 2025, value: 1100000 }
        ]
    },
    {
        id: 3,
        name: 'Pacific Research Center',
        city: 'Vancouver',
        province: 'BC',
        country: 'CA',
        type: 'Private',
        grants: [
            1, 3, 5, 7
        ],
        recipients: [
            2, 4, 6, 8
        ],
        stats: {
            total_grants: { value: 2, trend: 'up' as 'up' | 'down' },
            total_value: { value: 1100000, trend: 'up' as 'up' | 'down' },
            recipients: { value: 2, trend: 'up' as 'up' | 'down' }
        },
        funding_history: [
            { year: 2020, value: 700000 },
            { year: 2021, value: 800000 },
            { year: 2022, value: 900000 },
            { year: 2023, value: 1000000 },
            { year: 2024, value: 1100000 },
            { year: 2025, value: 1200000 }
        ]
    }
];

export const mock_searches = [
    {
        id: 1,
        search_params: {
            searchTerms: {
                recipient: 'kim',
                institute: 'waterloo',
                grant: ''
            },
            filters: {
                agencies: ['NSERC'],
                countries: ['Canada'],
                provinces: ['ON'],
                cities: ['Toronto'],
                yearRange: { start: 2020, end: 2025 },
                valueRange: { min: 1000, max: 1000000 }
            },
            sortConfig: {
                field: 'date',
                direction: 'asc'
            }
        } as GrantSearchParams,
        results: 8869,
        timestamp: new Date('2025-01-01 12:00:00')
    },
    {
        id: 2,
        search_params: {
            searchTerms: {
                recipient: 'jane',
                institute: '',
                grant: 'health'
            },
            filters: {
                agencies: ['CIHR', 'NSERC'],
                countries: ['Canada'],
                provinces: ['QC'],
                cities: ['Montreal'],
                yearRange: { start: 2020, end: 2025 },
                valueRange: { min: 1000, max: 1000000 }
            },
            sortConfig: {
                field: 'date',
                direction: 'asc'
            }
        } as GrantSearchParams,
        results: 5421,
        timestamp: new Date('2025-01-02 12:00:00')
    },
    {
        id: 3,
        search_params: {
            searchTerms: {
                recipient: '',
                institute: 'research',
                grant: 'science'
            },
            filters: {
                agencies: ['SSHRC'],
                countries: ['Canada'],
                provinces: ['BC'],
                cities: ['Vancouver'],
                yearRange: { start: 2020, end: 2025 },
                valueRange: { min: 1000, max: 1000000 }
            },
            sortConfig: {
                field: 'date',
                direction: 'asc'
            }
        } as GrantSearchParams,
        results: 3210,
        timestamp: new Date('2025-01-03 12:00:00')
    },
    {
        id: 4,
        search_params: {
            searchTerms: {
                recipient: 'research',
                institute: 'institute',
                grant: 'grant'
            },
            filters: {
                agencies: ['CIHR'],
                countries: ['Canada'],
                provinces: ['AB'],
                cities: ['Calgary'],
                yearRange: { start: 2020, end: 2025 },
                valueRange: { min: 1000, max: 1000000 }
            },
            sortConfig: {
                field: 'date',
                direction: 'asc'
            }
        } as GrantSearchParams,
        results: 7890,
        timestamp: new Date('2025-01-04 12:00:00')
    },
    {
        id: 5,
        search_params: {
            searchTerms: {
                recipient: 'non-profit',
                institute: 'research',
                grant: 'grant'
            },
            filters: {
                agencies: ['NSERC'],
                countries: ['Canada'],
                provinces: ['MB'],
                cities: ['Winnipeg'],
                yearRange: { start: 2020, end: 2025 },
                valueRange: { min: 1000, max: 1000000 }
            },
            sortConfig: {
                field: 'date',
                direction: 'asc'
            }
        } as GrantSearchParams,
        results: 4567,
        timestamp: new Date('2025-01-05 12:00:00')
    }
]