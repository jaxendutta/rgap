// server/routes/searchHistoryRoutes.js
const express = require("express");
const router = express.Router();
const {
  getUserSearchHistory,
  deleteSearchHistoryEntry,
} = require("../controllers/searchHistoryController");

// Fetch all search history for a given user, with optional sorting via query parameters
router.get("/:user_id", getUserSearchHistory);

// Delete a specific search history entry by history_id
router.delete("/:history_id", deleteSearchHistoryEntry);

module.exports = router;
