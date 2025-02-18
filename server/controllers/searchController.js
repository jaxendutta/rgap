// server/controllers/searchController.js
const pool = require("../config/db");

const searchGrants = async (req, res) => {
    console.log("Received search request:", {
        searchTerms: req.body.searchTerms,
        filters: req.body.filters,
        sortConfig: req.body.sortConfig,
    });

    try {
        const { searchTerms = {}, filters = {}, sortConfig = {} } = req.body;
        const params = [];

        let query = `
      SELECT DISTINCT
        rg.grant_id,
        rg.ref_number,
        r.legal_name,
        r.research_organization_name,
        rg.agreement_title_en,
        rg.agreement_value,
        rg.agreement_start_date,
        rg.agreement_end_date,
        r.city,
        r.province,
        r.country,
        o.abbreviation AS org
      FROM ResearchGrant rg
      JOIN Recipient r ON rg.recipient_id = r.recipient_id
      JOIN Organization o ON rg.owner_org = o.owner_org
      WHERE 1=1
    `;

        // Search terms
        if (searchTerms.recipient) {
            query += ` AND r.legal_name LIKE ?`;
            params.push(`%${searchTerms.recipient}%`);
        }
        if (searchTerms.institute) {
            query += ` AND r.research_organization_name LIKE ?`;
            params.push(`%${searchTerms.institute}%`);
        }
        if (searchTerms.grant) {
            query += ` AND rg.agreement_title_en LIKE ?`;
            params.push(`%${searchTerms.grant}%`);
        }

        // Year range filter (with defaults)
        query += ` AND YEAR(rg.agreement_start_date) BETWEEN ? AND ?`;
        params.push(
            filters.yearRange?.start || 1900,
            filters.yearRange?.end || 2025
        );

        // Value range filter (with default max)
        query += ` AND rg.agreement_value <= ?`;
        params.push(filters.valueRange?.max || 200000000);

        // Array filters
        if (filters.agencies?.length) {
            query += ` AND o.abbreviation IN (?)`;
            params.push(filters.agencies);
        }
        if (filters.countries?.length) {
            query += ` AND r.country IN (?)`;
            params.push(filters.countries);
        }
        if (filters.provinces?.length) {
            query += ` AND r.province IN (?)`;
            params.push(filters.provinces);
        }
        if (filters.cities?.length) {
            query += ` AND r.city IN (?)`;
            params.push(filters.cities);
        }

        // Sorting (with default)
        const sortField =
            sortConfig.field === "value"
                ? "rg.agreement_value"
                : "rg.agreement_start_date";
        const sortDir = sortConfig.direction === "asc" ? "ASC" : "DESC";
        query += ` ORDER BY ${sortField} ${sortDir}`;

        console.log("\nExecuting query:", query);
        console.log("With parameters:", params);

        const [results] = await pool.query(query, params);
        console.log(`Query returned ${results.length} results`);

        if (results.length === 0) {
            console.log("No results found with these parameters");
        } else {
            console.log("First result:", results[0]);
        }

        res.json({
            message: "Success",
            data: results,
            metadata: {
                count: results.length,
                filters: filters,
                searchTerms: searchTerms,
            },
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({
            error: error.message,
            query: req.body,
        });
    }
};

const getFilterOptions = async (req, res) => {
    try {
        const [results] = await pool.query(`
      SELECT 
      JSON_OBJECT(
        'agencies', (SELECT JSON_ARRAYAGG(DISTINCT abbreviation) FROM Organization),
        'countries', (SELECT JSON_ARRAYAGG(DISTINCT country) FROM Recipient WHERE country IS NOT NULL),
        'provinces', (SELECT JSON_ARRAYAGG(DISTINCT province) FROM Recipient WHERE province IS NOT NULL),
        'cities', (SELECT JSON_ARRAYAGG(DISTINCT city) FROM Recipient WHERE city IS NOT NULL)
      ) as options
    `);

        console.log("Filter options:", results[0].options);
        res.json(results[0].options);
    } catch (error) {
        console.error("Error fetching filter options:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { searchGrants, getFilterOptions };
