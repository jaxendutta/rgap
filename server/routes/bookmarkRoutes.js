// server/routes/bookmarkRoutes.js
import { Router } from "express";
const router = Router();

import {
    toggleBookmark,
    getBookmarkIds,
    getBookmarks,
} from "../controllers/bookmarkController.js";

// New unified routes
router.post("/bookmark/:entityType/:entityId", toggleBookmark);
router.delete("/bookmark/:entityType/:entityId", toggleBookmark);
router.get("/bookmark/:entityType/ids/:user_id", getBookmarkIds);
router.get("/bookmark/:entityType/:user_id", getBookmarks);

export default router;
