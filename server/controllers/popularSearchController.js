// src/controllers/popularSearchController.js
import { pool } from "../config/db.js";

/**
 * Handler for fetching top 5 popular search terms by type and date range.
 * 
 * Expects:
 * - Path param: search_term_type (0 = grant, 1 = recipient, 2 = institution)
 * - JSON Body:
 *    {
 *      "date_start": "YYYY-MM-DD",
 *      "date_end": "YYYY-MM-DD"
 *    }
 *
 * Calls MySQL stored procedure `sp_get_popular_search` to return top search terms.
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

