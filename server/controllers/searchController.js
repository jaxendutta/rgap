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
        const { 
            searchTerms = {}, 
            filters = {}, 
            sortConfig = {}, 
            pagination = { page: 1, pageSize: 20 } 
        } = req.body;
        
        console.log("Received request:", { 
            searchTerms, 
            filters, 
            sortConfig, 
            pagination 
        });

        // Default pagination values if not provided
        const page = pagination.page || 1;
        const pageSize = pagination.pageSize || 20;

        // Convert filter arrays to JSON strings for the stored procedure
        const agenciesJson = JSON.stringify(filters.agencies || []);
        const countriesJson = JSON.stringify(filters.countries || []);
        const provincesJson = JSON.stringify(filters.provinces || []);
        const citiesJson = JSON.stringify(filters.cities || []);

        // Call the consolidated grant search procedure with pagination
        const [results] = await pool.query(
            'CALL sp_consolidated_grant_search(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
                sortConfig.direction || 'desc',
                pageSize,
                page
            ]
        );

        // The first result set is the total count
        const totalCount = results[0][0]?.total_count || 0;
        
        // The second result set contains the actual data
        const grantsData = results[1] || [];

        // Process the results to convert amendment_history from JSON string to actual array
        const processedResults = grantsData.map(row => ({
            ...row,
            agreement_value: parseFloat(row.latest_value) || 0,
            amendment_number: row.latest_amendment_number,
            amendment_date: row.latest_amendment_date,
            amendments_history: typeof row.amendments_history === 'string' 
                ? JSON.parse(row.amendments_history) 
                : (row.amendments_history || [])
        }));

        console.log(`Query returned ${processedResults.length} grants (page ${page} of ${Math.ceil(totalCount/pageSize)})`);

        res.json({
            message: "Success",
            data: processedResults,
            metadata: {
                count: processedResults.length,
                totalCount: totalCount,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
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
