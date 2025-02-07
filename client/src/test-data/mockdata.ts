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
            "grant_id": 1,
            "ref_number": "GRANT001",
            "amendment_number": "001",
            "amendment_date": "2025-01-01",
            "agreement_type": "Type A",
            "agreement_number": "AG001",
            "agreement_value": 100000.00,
            "foreign_currency_type": "USD",
            "foreign_currency_value": 80000.00,
            "agreement_start_date": "2025-01-01",
            "agreement_end_date": "2025-12-31",
            "agreement_title_en": "Agreement Title A",
            "agreement_title_fr": "Titre de l'Accord A",
            "description_en": "Description of Agreement A",
            "description_fr": "Description de l'Accord A",
            "expected_results_en": "Expected Results A",
            "expected_results_fr": "Résultats Attendus A",
            "org": "NSERC",
            "recipient_id": 1,
            "prog_id": "PROG001"
        },
        {
            "grant_id": 2,
            "ref_number": "GRANT002",
            "amendment_number": "002",
            "amendment_date": "2025-02-01",
            "agreement_type": "Type B",
            "agreement_number": "AG002",
            "agreement_value": 200000.00,
            "foreign_currency_type": "EUR",
            "foreign_currency_value": 180000.00,
            "agreement_start_date": "2025-02-01",
            "agreement_end_date": "2025-12-31",
            "agreement_title_en": "Agreement Title B",
            "agreement_title_fr": "Titre de l'Accord B",
            "description_en": "Description of Agreement B",
            "description_fr": "Description de l'Accord B",
            "expected_results_en": "Expected Results B",
            "expected_results_fr": "Résultats Attendus B",
            "org": "CIHR",
            "recipient_id": 2,
            "prog_id": "PROG002"
        },
        {
            "grant_id": 3,
            "ref_number": "GRANT003",
            "amendment_number": "003",
            "amendment_date": "2025-03-01",
            "agreement_type": "Type C",
            "agreement_number": "AG003",
            "agreement_value": 300000.00,
            "foreign_currency_type": "GBP",
            "foreign_currency_value": 250000.00,
            "agreement_start_date": "2025-03-01",
            "agreement_end_date": "2025-12-31",
            "agreement_title_en": "Agreement Title C",
            "agreement_title_fr": "Titre de l'Accord C",
            "description_en": "Description of Agreement C",
            "description_fr": "Description de l'Accord C",
            "expected_results_en": "Expected Results C",
            "expected_results_fr": "Résultats Attendus C",
            "org": "SSHRC",
            "recipient_id": 3,
            "prog_id": "PROG003"
        },
        {
            "grant_id": 4,
            "ref_number": "GRANT004",
            "amendment_number": "004",
            "amendment_date": "2025-04-01",
            "agreement_type": "Type D",
            "agreement_number": "AG004",
            "agreement_value": 400000.00,
            "foreign_currency_type": "CAD",
            "foreign_currency_value": 400000.00,
            "agreement_start_date": "2025-04-01",
            "agreement_end_date": "2025-12-31",
            "agreement_title_en": "Agreement Title D",
            "agreement_title_fr": "Titre de l'Accord D",
            "description_en": "Description of Agreement D",
            "description_fr": "Description de l'Accord D",
            "expected_results_en": "Expected Results D",
            "expected_results_fr": "Résultats Attendus D",
            "org": "CIHR",
            "recipient_id": 4,
            "prog_id": "PROG004"
        },
        {
            "grant_id": 5,
            "ref_number": "GRANT005",
            "amendment_number": "005",
            "amendment_date": "2025-05-01",
            "agreement_type": "Type E",
            "agreement_number": "AG005",
            "agreement_value": 500000.00,
            "foreign_currency_type": "JPY",
            "foreign_currency_value": 55000000.00,
            "agreement_start_date": "2025-05-01",
            "agreement_end_date": "2025-12-31",
            "agreement_title_en": "Agreement Title E",
            "agreement_title_fr": "Titre de l'Accord E",
            "description_en": "Description of Agreement E",
            "description_fr": "Description de l'Accord E",
            "expected_results_en": "Expected Results E",
            "expected_results_fr": "Résultats Attendus E",
            "org": "NSERC",
            "recipient_id": 5,
            "prog_id": "PROG005"
        },
        {
            "grant_id": 6,
            "ref_number": "GRANT006",
            "amendment_number": "006",
            "amendment_date": "2025-06-01",
            "agreement_type": "Type F",
            "agreement_number": "AG006",
            "agreement_value": 600000.00,
            "foreign_currency_type": "AUD",
            "foreign_currency_value": 780000.00,
            "agreement_start_date": "2025-06-01",
            "agreement_end_date": "2025-12-31",
            "agreement_title_en": "Agreement Title F",
            "agreement_title_fr": "Titre de l'Accord F",
            "description_en": "Description of Agreement F",
            "description_fr": "Description de l'Accord F",
            "expected_results_en": "Expected Results F",
            "expected_results_fr": "Résultats Attendus F",
            "org": "SSHRC",
            "recipient_id": 6,
            "prog_id": "PROG006"
        },
        {
            "grant_id": 7,
            "ref_number": "GRANT007",
            "amendment_number": "007",
            "amendment_date": "2025-07-01",
            "agreement_type": "Type G",
            "agreement_number": "AG007",
            "agreement_value": 700000.00,
            "foreign_currency_type": "CHF",
            "foreign_currency_value": 650000.00,
            "agreement_start_date": "2025-07-01",
            "agreement_end_date": "2025-12-31",
            "agreement_title_en": "Agreement Title G",
            "agreement_title_fr": "Titre de l'Accord G",
            "description_en": "Description of Agreement G",
            "description_fr": "Description de l'Accord G",
            "expected_results_en": "Expected Results G",
            "expected_results_fr": "Résultats Attendus G",
            "org": "SSHRC",
            "recipient_id": 7,
            "prog_id": "PROG007"
        },
        {
            "grant_id": 8,
            "ref_number": "GRANT008",
            "amendment_number": "008",
            "amendment_date": "2025-08-01",
            "agreement_type": "Type H",
            "agreement_number": "AG008",
            "agreement_value": 800000.00,
            "foreign_currency_type": "INR",
            "foreign_currency_value": 60000000.00,
            "agreement_start_date": "2025-08-01",
            "agreement_end_date": "2025-12-31",
            "agreement_title_en": "Agreement Title H",
            "agreement_title_fr": "Titre de l'Accord H",
            "description_en": "Description of Agreement H",
            "description_fr": "Description de l'Accord H",
            "expected_results_en": "Expected Results H",
            "expected_results_fr": "Résultats Attendus H",
            "org": "NSERC",
            "recipient_id": 7,
            "prog_id": "PROG008"
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
            { id: 1, title: 'Research Grant', ref_number: 'GRANT001', agency: 'ORG001', recipient: 'Terry Fox', start_date: '2025-01-01', end_date: '2025-12-31', value: 100000 },
            { id: 2, title: 'Scholarship Grant', ref_number: 'GRANT002', agency: 'ORG002', recipient: 'Stefani Germanotta', start_date: '2025-02-01', end_date: '2025-12-31', value: 200000 }
        ],
        recipients: [
            { id: 1, name: 'Terry Fox', department: 'Oncology', grants: 2, total_funding: 300000 },
            { id: 2, name: 'Stefani Germanotta', department: 'Genetics', grants: 1, total_funding: 200000 }
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
            { id: 3, title: 'Health Research Grant', ref_number: 'GRANT003', agency: 'ORG003', recipient: 'Peter Gene Hernandez', start_date: '2025-03-01', end_date: '2025-12-31', value: 300000 },
            { id: 4, title: 'Medical Equipment Grant', ref_number: 'GRANT004', agency: 'ORG004', recipient: 'Marina Diamandis', start_date: '2025-04-01', end_date: '2025-12-31', value: 400000 }
        ],
        recipients: [
            { id: 3, name: 'Peter Gene Hernandez', department: 'Cardiology', grants: 2, total_funding: 700000 },
            { id: 4, name: 'Marina Diamandis', department: 'Neurology', grants: 1, total_funding: 400000 }
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
            { id: 5, title: 'Environmental Research Grant', ref_number: 'GRANT005', agency: 'ORG005', recipient: 'Manitoba Research Institute', start_date: '2025-05-01', end_date: '2025-12-31', value: 500000 },
            { id: 6, title: 'Climate Change Grant', ref_number: 'GRANT006', agency: 'ORG006', recipient: 'Nova Scotia Research Institute', start_date: '2025-06-01', end_date: '2025-12-31', value: 600000 }
        ],
        recipients: [
            { id: 5, name: 'Manitoba Research Institute', department: 'Environmental Science', grants: 2, total_funding: 1100000 },
            { id: 6, name: 'Nova Scotia Research Institute', department: 'Climate Science', grants: 1, total_funding: 600000 }
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
