// server/routes/searchRoutes.js
import { Router } from "express";
const router = Router();
import {
    searchGrants,
    getFilterOptions,
} from "../controllers/searchController.js";

router.post("/", searchGrants);
router.get("/filter-options", getFilterOptions);

export default router;
