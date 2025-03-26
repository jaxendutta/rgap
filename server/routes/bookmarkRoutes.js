// server/routes/bookmarkRoutes.js
import { Router } from "express";
const router = Router();

import {
    toggleBookmark,
    getBookmarkIds,
    getBookmarks,
} from "../controllers/bookmarkController.js";

// Fixed routes removing the duplicate "bookmark" prefix
router.post("/:entityType/:entityId", toggleBookmark);
router.delete("/:entityType/:entityId", toggleBookmark);
router.get("/:entityType/ids/:user_id", getBookmarkIds);
router.get("/:entityType/:user_id", getBookmarks);

export default router;
