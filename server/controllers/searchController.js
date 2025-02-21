// server/controllers/searchController.js
const pool = require("../config/db");

const getDistinctValues = async (column, table) => {
    try {
        const [results] = await pool.query(
            `SELECT DISTINCT ${column} FROM ${table} WHERE ${column} IS NOT NULL AND ${column} != '' ORDER BY ${column}`
        );
        return results.map((row) => row[column]);
    } catch (error) {
        console.error(`Error fetching distinct ${column}:`, error);
        return [];
    }
};

const getFilterOptions = async (req, res) => {
    try {
        const [countries] = await pool.query(
            'SELECT DISTINCT country FROM Recipient WHERE country IS NOT NULL AND country != "" ORDER BY country'
        );
        const [provinces] = await pool.query(
            'SELECT DISTINCT province FROM Recipient WHERE province IS NOT NULL AND province != "" ORDER BY province'
        );
        const [cities] = await pool.query(
            'SELECT DISTINCT city FROM Recipient WHERE city IS NOT NULL AND city != "" ORDER BY city'
        );
        const [agencies] = await pool.query(
            'SELECT DISTINCT abbreviation FROM Organization WHERE abbreviation IS NOT NULL AND abbreviation != "" ORDER BY abbreviation'
        );

        const filterOptions = {
            countries: countries.map((row) => row.country),
            provinces: provinces.map((row) => row.province),
            cities: cities.map((row) => row.city),
            agencies: agencies.map((row) => row.abbreviation),
        };

        res.json(filterOptions);
    } catch (error) {
        console.error("Error fetching filter options:", error);
        res.status(500).json({ error: error.message });
    }
};

const searchGrants = async (req, res) => {
    try {
        const { searchTerms = {}, filters = {}, sortConfig = {} } = req.body;
        console.log("Received request:", { searchTerms, filters, sortConfig });

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

        const params = [];

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

        // Year range filter
        query += ` AND YEAR(rg.agreement_start_date) BETWEEN ? AND ?`;
        params.push(
            filters.yearRange?.start || 1900,
            filters.yearRange?.end || 2025
        );

        // Value range filter
        query += ` AND rg.agreement_value BETWEEN ? AND ?`;
        params.push(
            filters.valueRange?.min || 0,
            filters.valueRange?.max || 200000000
        );

        // Handle array filters using OR conditions within each filter type
        if (Array.isArray(filters.agencies) && filters.agencies.length > 0) {
            query += ` AND o.abbreviation IN (${filters.agencies
                .map(() => "?")
                .join(",")})`;
            params.push(...filters.agencies);
        }

        if (Array.isArray(filters.countries) && filters.countries.length > 0) {
            const placeholders = filters.countries
                .map((country) => {
                    params.push(country);
                    return "?";
                })
                .join(",");
            query += ` AND r.country IN (${placeholders})`;
        }

        if (Array.isArray(filters.provinces) && filters.provinces.length > 0) {
            const placeholders = filters.provinces
                .map((province) => {
                    params.push(province);
                    return "?";
                })
                .join(",");
            query += ` AND r.province IN (${placeholders})`;
        }

        if (Array.isArray(filters.cities) && filters.cities.length > 0) {
            const placeholders = filters.cities
                .map((city) => {
                    params.push(city);
                    return "?";
                })
                .join(",");
            query += ` AND r.city IN (${placeholders})`;
        }

        // Add sorting
        const sortField =
            sortConfig.field === "value"
                ? "rg.agreement_value"
                : "rg.agreement_start_date";
        const sortDir = sortConfig.direction === "asc" ? "ASC" : "DESC";
        query += ` ORDER BY ${sortField} ${sortDir}`;

        console.log("Executing query:", query);
        console.log("Parameters:", params);

        const [results] = await pool.query(query, params);
        console.log(`Query returned ${results.length} results`);

        res.json({
            message: "Success",
            data: results.map((row) => ({
                ...row,
                agreement_value: parseFloat(row.agreement_value) || 0,
            })),
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

module.exports = { searchGrants, getFilterOptions };
