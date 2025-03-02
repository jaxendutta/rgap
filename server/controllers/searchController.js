// server/controllers/searchController.js
const pool = require("../config/db");

const getFilterOptions = async (req, res) => {
    try {
        // Use the stored procedure for filter options
        const [results] = await pool.query('CALL sp_get_filter_options()');
        
        // The stored procedure returns multiple result sets
        const filterOptions = {
            agencies: results[0].map(row => row.abbreviation),
            countries: results[1].map(row => row.country),
            provinces: results[2].map(row => row.province),
            cities: results[3].map(row => row.city)
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

        // Convert filter arrays to JSON strings for the stored procedure
        const agenciesJson = JSON.stringify(filters.agencies || []);
        const countriesJson = JSON.stringify(filters.countries || []);
        const provincesJson = JSON.stringify(filters.provinces || []);
        const citiesJson = JSON.stringify(filters.cities || []);

        // Call the stored procedure with all the parameters
        const [results] = await pool.query(
            'CALL sp_grant_search(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                searchTerms.recipient || null,
                searchTerms.institute || null,
                searchTerms.grant || null,
                filters.yearRange?.start || 1900,
                filters.yearRange?.end || 2025,
                filters.valueRange?.min || 0,
                filters.valueRange?.max || 200000000,
                agenciesJson,
                countriesJson,
                provincesJson,
                citiesJson,
                sortConfig.field || 'date',
                sortConfig.direction || 'desc'
            ]
        );

        console.log(`Query returned ${results[0].length} results`);

        res.json({
            message: "Success",
            data: results[0].map((row) => ({
                ...row,
                agreement_value: parseFloat(row.agreement_value) || 0,
            })),
            metadata: {
                count: results[0].length,
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
