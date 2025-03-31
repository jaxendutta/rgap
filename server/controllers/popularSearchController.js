// src/controllers/popularSearchController.js
import { pool } from "../config/db.js";

/**
 * Handler for fetching the top 5 popular search terms of a specific type within a date range.
 * 
 * Expects:
 * - Path param: search_term_type (0 = grant, 1 = recipient, 2 = institution)
 * - JSON Body:
 *    {
 *      "date_start": "YYYY-MM-DD",
 *      "date_end": "YYYY-MM-DD"
 *    }
 * 
 * Calls the MySQL stored procedure `sp_get_popular_search(date_start, date_end, search_term_type)`
 * to retrieve the top 5 most frequent terms for the specified category and time period.
 * 
 * Returns:
 * - An array of up to 5 objects, each with the following fields:
 *    {
 *      search_term: string,   // The search keyword entered by users
 *      frequency: number      // Number of times this term was searched
 *    }
 * - Results are ordered by frequency in descending order.
 * 
 * Example:
 *   POST http://localhost:4000/popular-search/0
 *   Body:
 *   {
 *     "date_start": "2024-01-01",
 *     "date_end": "2024-12-31"
 *   }
 */

export const getPopularSearchTerms = async (req, res) => {
    try {
        const { search_term_type } = req.params;
        const { date_start, date_end } = req.body;
        // Get user from database using stored procedure
        const [results] = await pool.query("CALL sp_get_popular_search(?,?,?);", [date_start, date_end, search_term_type]);
        res.status(200).json(results);
    } catch (error) {
        console.error(`Error getting popular search terms: ${error.message}`);
        res.status(409).json({ message: error.message });
    }
}

