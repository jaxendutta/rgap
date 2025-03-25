// server/routes/popularSearchRoutes.js
import { Router } from "express";
import { getPopularSearchTerms } from "../controllers/popularSearchController.js";

const router = Router();

/**
 * GET /popular-search/:search_term_type
 * Fetch the top 5 most popular search terms by type:
 *   0 = grant, 1 = recipient, 2 = institution
 * Requires JSON body: { "date_start": "YYYY-MM-DD", "date_end": "YYYY-MM-DD" }
 * Example: GET http://localhost:4000/popular-search/0
 */
router.get("/:search_term_type", getPopularSearchTerms);

export default router;