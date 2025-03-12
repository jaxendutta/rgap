// server/controllers/searchHistoryController.js
const pool = require("../config/db");

const getUserSearchHistory = async (req, res) => {
  const { user_id } = req.params;
  const { sortField = "search_time", sortDirection = "desc" } = req.query;
  
  // Validate sortField – allow only permitted columns 
  const allowedFields = ["search_time", "result_count"];
  if (!allowedFields.includes(sortField)) {
    return res.status(400).json({ message: "Invalid sort field." });
  }
  
  // Validate sortDirection
  const direction = sortDirection.toLowerCase() === "asc" ? "ASC" : "DESC";
  
  try {
    const [rows] = await pool.query(
      `SELECT * FROM SearchHistory WHERE user_id = ? ORDER BY ${sortField} ${direction}`,
      [user_id]
    );
    return res.status(200).json({ searches: rows });
  } catch (error) {
    console.error("Error fetching search history:", error);
    return res.status(500).json({ message: error.message });
  }
};

const deleteSearchHistoryEntry = async (req, res) => {
  const { history_id } = req.params;
  try {
    const [result] = await pool.query(
      "DELETE FROM SearchHistory WHERE history_id = ?",
      [history_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "History entry not found." });
    }
    return res.status(200).json({ message: "History entry deleted." });
  } catch (error) {
    console.error("Error deleting history entry:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserSearchHistory, deleteSearchHistoryEntry };
