// server/routes/searchHistoryRoutes.js
import { Router } from "express";
const router = Router();
import {
    getUserSearchHistory,
    deleteSearchHistoryEntry,
} from "../controllers/searchHistoryController.js";

// Fetch all search history for a given user, with optional sorting via query parameters
router.get("/:user_id", getUserSearchHistory);

// Delete a specific search history entry by history_id
router.delete("/:history_id", deleteSearchHistoryEntry);

export default router;
