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

// GET a specific institute by ID
router.get("/:id", getInstituteById);

// GET grants for a specific institute
router.get("/:id/grants", getInstituteGrants);

// GET recipients for a specific institute
router.get("/:id/recipients", getInstituteRecipients);

// Search institutes by name
router.get("/search", searchInstitutes);

export default router;
