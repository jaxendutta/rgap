SELECT
            rg.grant_id,
            rg.ref_number,
            rg.latest_amendment_number,
            rg.amendment_date,
            rg.agreement_number,
            rg.agreement_value,
            rg.foreign_currency_type,
            rg.foreign_currency_value,
            rg.agreement_start_date,
            rg.agreement_end_date,
            rg.agreement_title_en,
            rg.description_en,
            rg.expected_results_en,
            rg.additional_information_en,
            r.legal_name,
            i.name AS research_organization_name,
            i.institute_id,
            rg.recipient_id,
            i.city,
            i.province,
            i.country,
            o.org,
            o.org_title,
            rg.prog_id,
            p.name_en AS prog_title_en,
            p.purpose_en AS prog_purpose_en,
            rg.amendments_history
            FROM ResearchGrant rg 
            JOIN Recipient r ON rg.recipient_id = r.recipient_id
            JOIN Institute i ON r.institute_id = i.institute_id
            JOIN Organization o ON rg.org = o.org
            LEFT JOIN Program p ON rg.prog_id = p.prog_id
            WHERE r.legal_name LIKE '%Huang%' AND i.name LIKE '%Waterloo%';