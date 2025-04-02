// server/routes/instituteRoutes.js
import { Router } from "express";
const router = Router();
import {
    getAllInstitutes,
    getInstituteById,
    getInstituteGrants,
    getInstituteRecipients,
    searchInstitutes,
} from "../controllers/instituteController.js";

// GET all institutes with pagination
router.get("/", getAllInstitutes);

// Search institutes by name - IMPORTANT: Place this BEFORE the /:id route to avoid conflicts
router.get("/search", searchInstitutes);

// GET a specific institute by ID
router.get("/:id", getInstituteById);

// GET grants for a specific institute
router.get("/:id/grants", getInstituteGrants);

// GET recipients for a specific institute
router.get("/:id/recipients", getInstituteRecipients);

export default router;
