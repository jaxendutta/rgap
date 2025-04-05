// src/controllers/popularSearchController.js
import { pool } from "../config/db.js";

/**
 * Handler for fetching the top popular search terms of all types or a specific type.
 *
 * Supports both GET and POST methods for flexibility:
 * - GET: Using query parameters (from, to, category, page, limit)
 * - POST: Using request body (date_start, date_end, category, page, limit)
 */
export const getPopularSearchTerms = async (req, res) => {
    try {
        // Support both query params (GET) and request body (POST)
        const dateStart =
            req.body?.date_start || req.body?.from || req.query.from;
        const dateEnd = req.body?.date_end || req.body?.to || req.query.to;

        // Get pagination/limit parameters
        const limit = parseInt(req.query.limit || req.body?.limit) || 10; // Default to 10 items per page
        const page = parseInt(req.query.page || req.body?.page) || 1; // Default to first page

        // Get category from params, query, or body
        const category =
            req.params?.category || req.query?.category || req.body?.category;

        console.log(
            `Popular Search request - dates: ${dateStart} to ${dateEnd}, category: ${
                category || "all"
            }, page: ${page}, limit: ${limit}`
        );

        // Validate dates
        if (!dateStart || !dateEnd) {
            return res.status(400).json({
                message: "Missing date parameters. Please provide date range.",
            });
        }

        // Call the simplified stored procedure
        const [resultSets] = await pool.query(
            "CALL sp_get_popular_searches(?, ?, ?, ?, ?);",
            [dateStart, dateEnd, category, page, limit]
        );

        // Prepare response structure
        let response = {
            message: "Success",
            results: {},
            metadata: {
                totalCount: 0,
                page: page,
                pageSize: limit,
                totalPages: 0,
            },
        };

        // Process result sets based on whether a specific category was requested
        if (
            category &&
            ["recipient", "institute", "grant"].includes(category)
        ) {
            // First result set contains the count
            const totalCount = resultSets[0][0].total_count;

            // Second result set contains the data
            const mappedResults = resultSets[1].map((item, index) => ({
                text: item.search_term,
                count: Number(item.frequency) || 0,
                category: category, // Add the category
                index, // Add index for client-side ordering
            }));

            // Calculate total pages
            const totalPages = Math.ceil(totalCount / limit);

            // Update response
            response.results[category] = mappedResults;
            response.metadata.totalCount = totalCount;
            response.metadata.totalPages = totalPages;
        } else {
            // First result set is the total count
            const totalCount = resultSets[0][0].total_count;

            // Process each category's results (grant, recipient, institute)
            for (let i = 1; i <= 3; i++) {
                const resultSet = resultSets[i];
                if (resultSet && resultSet.length > 0) {
                    const categoryName = resultSet[0].category;

                    // Map results to our expected format
                    const mappedResults = resultSet.map((item, index) => ({
                        text: item.search_term,
                        count: Number(item.frequency) || 0,
                        category: item.category,
                        index,
                    }));

                    // Add to response
                    response.results[categoryName] = mappedResults;
                }
            }

            // Update metadata
            response.metadata.totalCount = totalCount;
            response.metadata.totalPages = Math.ceil(totalCount / limit);
        }

        // Return the structured response
        res.status(200).json(response);
    } catch (error) {
        console.error(`Error getting popular search terms: ${error.message}`);
        res.status(500).json({
            message: "Failed to retrieve popular searches",
            error: error.message,
        });
    }
};
