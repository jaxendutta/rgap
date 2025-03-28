// server/controllers/recipientController.js
import { pool } from "../config/db.js";

/**
 * Get all recipients with basic information
 */
export const getAllRecipients = async (req, res) => {
    try {
        // Apply pagination parameters if provided
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const userId = req.query.user_id || null;

        // Use stored procedure for getting recipients with stats and bookmark status
        const [results] = await pool.query(
            "CALL sp_get_all_recipients(?, ?, ?)",
            [page, pageSize, userId]
        );

        // First result contains total count
        const totalCount = results[0][0].total_count;

        // Second result contains recipients data
        const recipients = results[1] || [];

        res.json({
            message: "Recipients retrieved successfully",
            data: recipients,
            metadata: {
                count: recipients.length,
                totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        });
    } catch (error) {
        console.error("Error fetching recipients:", error);
        res.status(500).json({
            error: "Failed to retrieve recipients",
            details: error.message,
        });
    }
};

/**
 * Get detailed information about a specific recipient
 */
export const getRecipientById = async (req, res) => {
    try {
        const recipientId = req.params.id;
        const userId = req.query.user_id || null;

        // Use the stored procedure to get comprehensive recipient details
        const [results] = await pool.query("CALL sp_recipient_details(?, ?)", [
            recipientId,
            userId,
        ]);

        // The stored procedure returns multiple result sets
        if (!results[0] || results[0].length === 0) {
            return res.status(404).json({
                error: "Recipient not found",
            });
        }

        // First result set: Recipient basic info with aggregated stats
        const recipientInfo = results[0][0];

        // Second result set: Recipient's grants
        const grants = results[1] || [];

        // Third result set: Funding history by year and agency
        const fundingHistory = results[2] || [];

        // Format the response
        const formattedGrants = grants.map((grant) => ({
            ...grant,
            agreement_value: parseFloat(grant.agreement_value) || 0,
        }));

        // Process funding history for visualization
        const fundingData = processFundingHistory(fundingHistory);

        // Make sure we're passing all fields from the recipient info
        res.json({
            message: "Recipient details retrieved successfully",
            data: {
                ...recipientInfo,
                grants: formattedGrants,
                funding_history: fundingData,
            },
        });
    } catch (error) {
        console.error("Error fetching recipient details:", error);
        res.status(500).json({
            error: "Failed to retrieve recipient details",
            details: error.message,
        });
    }
};

/**
 * Get grants for a specific recipient
 */
export const getRecipientGrants = async (req, res) => {
    try {
        const recipientId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const sortField = req.query.sortField || "date";
        const sortDirection = req.query.sortDirection || "desc";
        const userId = req.query.user_id || null;

        const [results] = await pool.query(
            "CALL sp_entity_grants(?, NULL, ?, ?, ?, ?, ?)",
            [recipientId, sortField, sortDirection, pageSize, page, userId]
        );

        // First result set contains the total count
        const totalCount = results[0][0].total_count;

        // Second result set contains the grants data
        const grants = results[1] || [];

        res.json({
            message: "Recipient grants retrieved successfully",
            data: grants,
            metadata: {
                count: grants.length,
                totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        });
    } catch (error) {
        console.error("Error fetching recipient grants:", error);
        res.status(500).json({
            error: "Failed to retrieve recipient grants",
            details: error.message,
        });
    }
};

/**
 * Helper function to process funding history data for visualization
 */
export const processFundingHistory = (fundingHistory) => {
    // Group by year
    const yearMap = new Map();

    fundingHistory.forEach((entry) => {
        const year = entry.year;
        const agency = entry.agency;
        const value = parseFloat(entry.total_value) || 0;

        if (!yearMap.has(year)) {
            yearMap.set(year, { year });
        }

        const yearData = yearMap.get(year);
        yearData[agency] = value;
    });

    // Convert to array and sort by year
    return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
};

/**
 * Search recipients by name or organization
 */
export const searchRecipients = async (req, res) => {
    try {
        const { term } = req.query;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const userId = req.query.user_id || null;

        if (!term || term.trim() === "") {
            return res.status(400).json({
                error: "Search term is required",
            });
        }

        // Updated to include user_id parameter
        const [results] = await pool.query(
            "CALL sp_search_recipients(?, ?, ?, ?)",
            [term, page, pageSize, userId]
        );

        // First result set contains total count
        const totalCount = results[0][0].total_count;

        // Second result set contains recipients data
        const recipients = results[1] || [];

        res.json({
            message: "Recipients search completed",
            data: recipients,
            metadata: {
                term,
                count: recipients.length,
                totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        });
    } catch (error) {
        console.error("Error searching recipients:", error);
        res.status(500).json({
            error: "Failed to search recipients",
            details: error.message,
        });
    }
};
