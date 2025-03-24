// server/routes/popularSearchRoutes.js
import { Router } from "express";
import { getPopularSearchTerms } from "../controllers/popularSearchController.js";

const router = Router();

// Define a GET endpoint at /api/popular/:search_term_type
// :search_term_type should be 0 (grant), 1 (recipient), or 2 (institution)
// The request expects a JSON body with date_start and date_end fields
router.get("/:search_term_type", getPopularSearchTerms);

export default router;