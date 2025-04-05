// server/routes/popularSearchRoutes.js
import { Router } from "express";
import { getPopularSearchTerms } from "../controllers/popularSearchController.js";

const router = Router();

// Routes for GET method (query parameters)
router.get("/", getPopularSearchTerms);
router.get("/:category", getPopularSearchTerms);

// Routes for POST method (request body)
router.post("/", getPopularSearchTerms);

export default router;
