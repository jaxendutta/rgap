// server/controllers/searchController.js
import { pool } from "../config/db.js";

export const getFilterOptions = async (req, res) => {
    try {
        // Use the stored procedure for filter options
        const [results] = await pool.query("CALL sp_get_filter_options()");

        // The stored procedure returns multiple result sets
        const filterOptions = {
            agencies: results[0].map((row) => row.org),
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

export const searchGrants = async (req, res) => {
    try {
        const {
            searchTerms = {},
            filters = {},
            sortConfig = {},
            pagination = { page: 1, pageSize: 20 },
            userId = null, // Get userID from request if provided
        } = req.body;

        console.log("Received request:", {
            userId, // Log the user ID for tracking (or null)
            searchTerms,
            filters,
            sortConfig,
            pagination,
        });

        // Default pagination values if not provided
        const page = pagination.page || 1;
        const pageSize = pagination.pageSize || 20;

        // Ensure we're providing proper JSON arrays for filters
        // Convert filter arrays to JSON strings for the stored procedure with explicit checking
        const ensureValidJsonArray = (arr) => {
            if (!arr || !Array.isArray(arr)) {
                return "[]"; // Return empty JSON array if invalid
            }
            return JSON.stringify(arr);
        };

        const agenciesJson = ensureValidJsonArray(filters.agencies);
        const countriesJson = ensureValidJsonArray(filters.countries);
        const provincesJson = ensureValidJsonArray(filters.provinces);
        const citiesJson = ensureValidJsonArray(filters.cities);

        // Get date range parameters (using null if not provided)
        let fromDate = null;
        let toDate = null;

        if (filters.dateRange) {
            if (filters.dateRange.from) {
                fromDate = new Date(filters.dateRange.from)
                    .toISOString()
                    .split("T")[0];
            }

            if (filters.dateRange.to) {
                toDate = new Date(filters.dateRange.to)
                    .toISOString()
                    .split("T")[0];
            }
        }

        console.log(`Using date range: ${fromDate} to ${toDate}`);

        // Get min/max values with defaults
        const valueMin = filters.valueRange?.min || 0;
        const valueMax = filters.valueRange?.max || 200000000;

        // Create the query parameters array with proper order matching the stored procedure
        const queryParams = [
            userId, // p_user_id
            searchTerms.recipient || null, // p_recipient_term
            searchTerms.institute || null, // p_institute_term
            searchTerms.grant || null, // p_grant_term
            fromDate, // p_from_date
            toDate, // p_to_date
            valueMin, // p_value_min
            valueMax, // p_value_max
            agenciesJson, // p_agencies
            countriesJson, // p_countries
            provincesJson, // p_provinces
            citiesJson, // p_cities
            sortConfig.field || "date", // p_sort_field
            sortConfig.direction || "desc", // p_sort_direction
            pageSize, // p_page_size
            page, // p_page
        ];

        // Log the query parameters for debugging
        console.log("Query parameters:", queryParams);

        // Call the stored procedure with the correct parameter order
        const [results] = await pool.query(
            "CALL sp_grant_search(?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), ?, ?, ?, ?)",
            queryParams
        );

        // The first result set is the total count
        const totalCount = results[0][0]?.total_count || 0;

        // The second result set contains the actual data
        const grantsData = results[1] || [];

        // Process the results to convert amendment_history from JSON string to actual array
        const processedResults = grantsData.map((row) => ({
            ...row,
            agreement_value: parseFloat(row.latest_value) || 0,
            amendment_number: row.latest_amendment_number,
            amendment_date: row.latest_amendment_date,
            amendments_history:
                typeof row.amendments_history === "string"
                    ? JSON.parse(row.amendments_history)
                    : row.amendments_history || [],
        }));

        console.log(
            `Query returned ${
                processedResults.length
            } grants (page ${page} of ${Math.ceil(totalCount / pageSize)})`
        );

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

        // Enhanced error handling for specific database errors
        if (error.code === "ER_TABLE_EXISTS_ERROR") {
            console.error(
                "Handling temporary table error, attempting to clean up..."
            );

            try {
                // Try to clean up the temporary table
                await pool.query(
                    "DROP TEMPORARY TABLE IF EXISTS temp_latest_amendments"
                );
                console.log("Successfully cleaned up temporary table");

                // Notify client to retry
                return res.status(409).json({
                    error: "Concurrent search issue. Please try again.",
                    retryable: true,
                    query: req.body,
                });
            } catch (cleanupError) {
                console.error(
                    "Failed to clean up temporary table:",
                    cleanupError
                );
            }
        }

        // Return a more user-friendly error message
        res.status(500).json({
            error: "An error occurred while searching. Please try again.",
            details:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
            query: req.body,
        });
    }
};
