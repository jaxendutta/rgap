// server/routes/recepientRoutes.js
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

// GET a specific recipient by ID
router.get("/:id", getRecipientById);

// GET grants for a specific recipient
router.get("/:id/grants", getRecipientGrants);

// Search recipients by name or organization
router.get("/search", searchRecipients);

export default router;
