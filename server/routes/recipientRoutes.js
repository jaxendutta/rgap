// server/routes/recepientRoutes.js
const express = require("express");
const router = express.Router();
const recipientController = require("../controllers/recipientController");

// GET all recipients with pagination
router.get("/", recipientController.getAllRecipients);

// GET a specific recipient by ID
router.get("/:id", recipientController.getRecipientById);

// GET grants for a specific recipient
router.get("/:id/grants", recipientController.getRecipientGrants);

// Search recipients by name or organization
router.get("/search", recipientController.searchRecipients);

module.exports = router;
