// server/routes/instituteRoutes.js
const express = require("express");
const router = express.Router();
const instituteController = require("../controllers/instituteController");

// GET all institutes with pagination
router.get("/", instituteController.getAllInstitutes);

// GET a specific institute by ID
router.get("/:id", instituteController.getInstituteById);

// GET grants for a specific institute
router.get("/:id/grants", instituteController.getInstituteGrants);

// GET recipients for a specific institute
router.get("/:id/recipients", instituteController.getInstituteRecipients);

// Search institutes by name
router.get("/search", instituteController.searchInstitutes);

module.exports = router;
