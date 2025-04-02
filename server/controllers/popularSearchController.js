// server/controllers/popularSearchController.js
import { pool } from "../config/db.js";

/**
 * Handler for fetching the top 5 popular search terms of all types or a specific type.
 *
 * Supports both GET and POST methods for flexibility:
 * - GET: Using query parameters (from, to, category)
 * - POST: Using request body (date_start, date_end, category)
 *
 * Categories are string-based for intuitiveness:
 * - "grant"
 * - "recipient"
 * - "institute"
 *
 * Returns structured response containing search terms for requested categories:
 * {
 *   recipient: [{ text: "...", count: 123 }, ...],
 *   institute: [{ text: "...", count: 123 }, ...],
 *   grant: [{ text: "...", count: 123 }, ...]
 * }
 */
export const getPopularSearchTerms = async (req, res) => {
    try {
        // Support both query params (GET) and request body (POST)
        const dateStart = req.body?.date_start || req.body?.from || req.query.from;
        const dateEnd = req.body?.date_end || req.body?.to || req.query.to;

        // Get category from params, query, or body
        let category =
            req.params?.category || req.query?.category || req.body?.category;

        console.log(
            `Popular Search request - dates: ${dateStart} to ${dateEnd}, category: ${
                category || "all"
            }`
        );

        // Validate dates
        if (!dateStart || !dateEnd) {
            return res.status(400).json({
                message: "Missing date parameters. Please provide date range.",
            });
        }

        // Prepare result structure
        const result = {};

        // Define categories and their corresponding stored procedure type values
        const categories = {
            grant: 0,
            recipient: 1,
            institute: 2,
        };

        // If specific category provided, only fetch that one
        if (category && categories[category] !== undefined) {
            const [queryResult] = await pool.query(
                "CALL sp_get_popular_search(?, ?, ?);",
                [dateStart, dateEnd, categories[category]]
            );

            console.log(`Query result for ${category}:`, queryResult[0]);
            result[category] = mapResultToClientFormat(queryResult[0]);
        }
        // Otherwise fetch all categories
        else {
            // Fetch all categories in parallel for better performance
            const categoryPromises = Object.entries(categories).map(
                async ([categoryName, typeValue]) => {
                    try {
                        const [queryResult] = await pool.query(
                            "CALL sp_get_popular_search(?, ?, ?);",
                            [dateStart, dateEnd, typeValue]
                        );

                        return {
                            category: categoryName,
                            data: mapResultToClientFormat(queryResult[0]),
                        };
                    } catch (err) {
                        console.error(`Error querying ${categoryName}:`, err);
                        return {
                            category: categoryName,
                            data: [],
                        };
                    }
                }
            );

            // Wait for all queries to complete
            const results = await Promise.all(categoryPromises);

            // Build the result object
            results.forEach((item) => {
                result[item.category] = item.data;
            });
        }

        // Return structured response
        res.status(200).json(result);
    } catch (error) {
        console.error(`Error getting popular search terms: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Maps database result to client-expected format
 * From: [{ search_term: '...', frequency: 123 }, ...]
 * To: [{ text: '...', count: 123 }, ...]
 */
function mapResultToClientFormat(results) {
    if (!results || !Array.isArray(results)) {
        return [];
    }

    return results.map((item) => ({
        text: item.search_term,
        count: Number(item.frequency) || 0,
    }));
}
