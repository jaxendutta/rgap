// server/routes/recipientRoutes.js
import { Router } from "express";
const router = Router();
import {
    getAllRecipients,
    getRecipientById,
    getRecipientGrants,
    searchRecipients,
} from "../controllers/recipientController.js";

// GET all recipients with pagination
router.get("/", getAllRecipients);

// Search recipients by name - IMPORTANT: Place this BEFORE the /:id route to avoid conflicts
router.get("/search", searchRecipients);

// GET a specific recipient by ID
router.get("/:id", getRecipientById);

// GET grants for a specific recipient
router.get("/:id/grants", getRecipientGrants);

export default router;
