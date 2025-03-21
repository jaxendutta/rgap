CREATE TEMPORARY TABLE IF NOT EXISTS temp_grant_search_results (
        ref_number VARCHAR(20),
        latest_amendment_number VARCHAR(10),
        latest_amendment_date DATE,
        agreement_type VARCHAR(50),
        agreement_number VARCHAR(50),
        latest_value DECIMAL(15,2),
        foreign_currency_type VARCHAR(3),
        foreign_currency_value DECIMAL(15,2),
        agreement_start_date DATE,
        agreement_end_date DATE,
        agreement_title_en TEXT,
        description_en TEXT,
        expected_results_en TEXT,
        legal_name TEXT,
        research_organization_name TEXT,
        institute_id INT,
        recipient_id INT,
        city TEXT,
        province TEXT,
        country TEXT,
        org VARCHAR(20),
        owner_org VARCHAR(20),
        owner_org_title TEXT,
        prog_id VARCHAR(50),
        name_en TEXT,
        amendments_history JSON);


INSERT INTO temp_grant_search_results
        SELECT 
            rg.ref_number,
            rg.amendment_number AS latest_amendment_number,
            rg.amendment_date AS latest_amendment_date,
            rg.agreement_type,
            rg.agreement_number,
            rg.agreement_value AS latest_value,
            rg.foreign_currency_type,
            rg.foreign_currency_value,
            rg.agreement_start_date,
            rg.agreement_end_date,
            rg.agreement_title_en,
            rg.description_en,
            rg.expected_results_en,
            r.legal_name,
            i.name AS research_organization_name,
            i.institute_id,
            rg.recipient_id,
            i.city,
            i.province,
            i.country,
            o.abbreviation AS org,
            rg.owner_org,
            o.org_title AS owner_org_title,
            rg.prog_id,
            p.name_en,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'amendment_number', a.amendment_number,
                        'amendment_date', a.amendment_date,
                        'agreement_value', a.agreement_value,
                        'agreement_start_date', a.agreement_start_date,
                        'agreement_end_date', a.agreement_end_date
                    )
                )
                FROM ResearchGrant a
                WHERE a.ref_number = rg.ref_number
            ) AS amendments_history
        FROM ResearchGrant rg
        JOIN Recipient r ON rg.recipient_id = r.recipient_id
        JOIN Institute i ON r.institute_id = i.institute_id
        JOIN Organization o ON rg.owner_org = o.owner_org
        LEFT JOIN Program p ON rg.prog_id = p.prog_id
        JOIN (
            SELECT 
                t.ref_number,
                MAX(CAST(t.amendment_number AS UNSIGNED)) AS latest_amendment
            FROM ResearchGrant t
            JOIN Recipient tr ON t.recipient_id = tr.recipient_id
            JOIN Institute ti ON tr.institute_id = ti.institute_id
            JOIN Organization org_t ON t.owner_org = org_t.owner_org
            GROUP BY t.ref_number
        ) AS tla ON rg.ref_number = tla.ref_number AND CAST(rg.amendment_number AS UNSIGNED) = tla.latest_amendment
        WHERE 1=1
        AND i.name LIKE '%Waterloo%';


 SELECT * FROM temp_grant_search_results 
         ORDER BY latest_value ASC
         LIMIT 20 OFFSET 0;

        
