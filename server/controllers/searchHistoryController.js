// server/controllers/searchHistoryController.js
import { pool } from "../config/db.js";

export const getUserSearchHistory = async (req, res) => {
    const { user_id } = req.params;
    const {
        sortField = "search_time",
        sortDirection = "desc",
        page = 1,
        pageSize = 10, // Use pageSize for consistency with other endpoints
    } = req.query;

    console.log(
        `Fetching search history for user ${user_id}, page ${page}, pageSize ${pageSize}`
    );

    // Validate sortField – allow only permitted columns
    const allowedFields = ["search_time", "result_count", "bookmarked"];
    if (!allowedFields.includes(sortField)) {
        return res.status(400).json({ message: "Invalid sort field." });
    }

    // Validate sortDirection
    const direction = sortDirection.toLowerCase() === "asc" ? "ASC" : "DESC";

    // Parse pagination parameters as numbers
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);

    // Calculate offset for pagination
    const offset = (pageNum - 1) * pageSizeNum;

    try {
        // First get total count
        const [countRows] = await pool.query(
            "SELECT COUNT(*) as total FROM SearchHistory WHERE user_id = ?",
            [user_id]
        );
        const totalCount = Number(countRows[0].total);

        console.log(`Found ${totalCount} search history records`);

        // Then get the paginated results
        const [rows] = await pool.query(
            `SELECT * FROM SearchHistory 
             WHERE user_id = ? 
             ORDER BY ${sortField} ${direction}
             LIMIT ? OFFSET ?`,
            [user_id, pageSizeNum, offset]
        );

        console.log(
            `Retrieved ${rows.length} search history records for page ${pageNum}`
        );

        // Return in format matching other entity endpoints
        return res.status(200).json({
            message: "Success",
            data: rows,
            metadata: {
                totalCount,
                page: pageNum,
                pageSize: pageSizeNum,
                totalPages: Math.ceil(totalCount / pageSizeNum),
            },
        });
    } catch (error) {
        console.error("Error fetching search history:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const deleteSearchHistoryEntry = async (req, res) => {
    const { history_id } = req.params;

    console.log(`Deleting search history entry: ${history_id}`);

    try {
        const [result] = await pool.query(
            "DELETE FROM SearchHistory WHERE history_id = ?",
            [history_id]
        );

        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ message: "History entry not found." });
        }

        return res.status(200).json({ message: "History entry deleted." });
    } catch (error) {
        console.error("Error deleting history entry:", error);
        return res.status(500).json({ message: error.message });
    }
};
