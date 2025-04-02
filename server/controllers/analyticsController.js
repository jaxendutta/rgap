// server/controllers/analyticsController.js
import { pool } from "../config/db.js";

// Controller for funding comparisons
export const getFundingComparisons = async (req, res) => {
  try {
    // Call the stored procedure sp_advanced_funding_comparisons
    const [rows] = await pool.query("CALL sp_advanced_funding_comparisons()");
    // rows[0] holds our result set
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Error fetching advanced funding comparisons:", err);
    res.status(500).json({ message: err.message });
  }
};

// Controller for grant histogram
export const getGrantHistogram = async (req, res) => {
  try {
    // Get the number of bins from the query parameter, default to 10
    const bins = parseInt(req.query.bins || "10", 10);
    const [rows] = await pool.query("CALL sp_grant_value_histogram(?)", [bins]);
    // rows[0] is the histogram array
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Error fetching grant value histogram:", err);
    res.status(500).json({ message: "Failed to fetch grant value histogram." });
  }
};

