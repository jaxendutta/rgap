// server/routes/searchRoutes.js
import { Router } from "express";
const router = Router();
import {
    searchGrants,
    getFilterOptions,
    getPopularSearches
} from "../controllers/searchController.js";

router.post("/", searchGrants);
router.get("/filter-options", getFilterOptions);
router.get("/popular-searches", getPopularSearches);

export default router;
