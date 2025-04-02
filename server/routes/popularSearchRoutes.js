// server/routes/popularSearchRoutes.js
import { Router } from "express";
import { getPopularSearchTerms } from "../controllers/popularSearchController.js";

const router = Router();

/**
 * Routes for popular search terms
 *
 * GET /popular-searches
 * - Fetches popular search terms for all categories
 * - Query params: from, to (date format: YYYY-MM-DD)
 *
 * GET /popular-searches/:category
 * - Fetches popular search terms for a specific category
 * - Path param: category (grant, recipient, institute)
 * - Query params: from, to (date format: YYYY-MM-DD)
 *
 * POST /popular-searches
 * - Alternative endpoint supporting POST method
 * - Body: { date_start: "YYYY-MM-DD", date_end: "YYYY-MM-DD", category: "..." }
 */

// Routes for GET method (query parameters)
router.get("/", getPopularSearchTerms);
router.get("/:category", getPopularSearchTerms);

// Routes for POST method (request body)
router.post("/", getPopularSearchTerms);

export default router;
