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
            sortConfig = { field: "agreement_start_date", direction: "desc" },
            pagination = { page: 1, pageSize: 20 },
            userId = null,
        } = req.body;

        console.log("Received search request with sort:", {
            userId,
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
            userId,
            searchTerms.recipient || null,
            searchTerms.institute || null,
            searchTerms.grant || null,
            fromDate,
            toDate,
            valueMin,
            valueMax,
            agenciesJson,
            countriesJson,
            provincesJson,
            citiesJson,
            sortConfig.field,
            sortConfig.direction,
            pageSize,
            page,
        ];

        console.log("Search query parameters with sort:", queryParams);

        // Call the stored procedure with the correct parameter order
        const [results] = await pool.query(
            "CALL sp_grant_search(?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), ?, ?, ?, ?)",
            queryParams
        );

        // The first result set is the total count
        const totalCount = results[0][0]?.total_count || 0;

        // The second result set contains the actual data
        const grantsData = results[1] || [];

        console.log(
            `Search found ${totalCount} total grants, returning ${grantsData.length} for this page`
        );

        // Process the results to convert amendment_history from JSON string to actual array
        const processedResults = grantsData.map((row) => {
            // Create a clean copy of the row
            const processed = { ...row };

            // Ensure numeric values
            processed.agreement_value =
                parseFloat(processed.agreement_value) || 0;

            // Handle amendment data
            processed.amendment_number = processed.latest_amendment_number;
            processed.amendment_date = processed.amendment_start_date;

            // Handle JSON fields
            if (typeof processed.amendments_history === "string") {
                try {
                    processed.amendments_history = JSON.parse(
                        processed.amendments_history
                    );
                } catch (e) {
                    processed.amendments_history = [];
                    console.warn("Failed to parse amendments_history JSON:", e);
                }
            } else if (!processed.amendments_history) {
                processed.amendments_history = [];
            }

            return processed;
        });

        console.log(
            `Search query returned ${
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
            details: error.message,
            query: req.body,
        });
    }
};

export const getPopularSearches = async (req, res) => {
    /*
    try {
        // Use the stored procedure for popular searches
        const [results] = await pool.query("CALL sp_get_popular_searches()");

        const popularSearches = results[0].map((row) => row.search_term);

        res.json(popularSearches);
    } catch (error) {
        console.error("Error fetching popular searches:", error);
        res.status(500).json({ error: error.message });
    }
    */
};
