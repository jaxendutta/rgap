// server/controllers/searchController.js
const pool = require("../config/db");

const getFilterOptions = async (req, res) => {
    try {
        const [results] = await pool.query("CALL sp_get_filter_options()");

        const filterOptions = {
            agencies: results[0].map((row) => row.abbreviation),
            countries: results[1].map((row) => row.country),
            provinces: results[2].map((row) => row.province),
            cities: results[3].map((row) => row.city),
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

        // Convert array filters to JSON strings
        const agenciesJson = JSON.stringify(filters.agencies || []);
        const countriesJson = JSON.stringify(filters.countries || []);
        const provincesJson = JSON.stringify(filters.provinces || []);
        const citiesJson = JSON.stringify(filters.cities || []);

        // Execute the stored procedure with ALL 13 parameters
        const [results] = await pool.query(
            "CALL sp_grant_search(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                searchTerms.recipient || null,
                searchTerms.institute || null,
                searchTerms.grant || null,
                filters.yearRange?.start || 1990,
                filters.yearRange?.end || 2025,
                filters.valueRange?.min || 0,
                filters.valueRange?.max || 200000000,
                agenciesJson,
                countriesJson,
                provincesJson,
                citiesJson,
                sortConfig.field === "value" ? "value" : "date",
                sortConfig.direction || "desc",
            ]
        );

        console.log(`Query returned ${results[0].length} results`);

        // Format and return the results
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
