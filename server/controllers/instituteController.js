// server/controllers/instituteController.js
import { pool } from "../config/db.js";
import { findBestMatch } from "../utils/searchHelpers.js";

/**
 * Get all institutes with basic information, pagination included
 */
export const getAllInstitutes = async (req, res) => {
    try {
        // Apply pagination parameters if provided
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;

        // Use stored procedure for getting institutes with stats
        const userId = req.query.user_id || null;
        const [results] = await pool.query(
            "CALL sp_get_all_institutes(?, ?, ?)",
            [page, pageSize, userId]
        );

        // First result set contains total count
        const totalCount = results[0][0].total_count;

        // Second result set contains institutes data
        const institutes = results[1] || [];

        res.json({
            message: "Institutes retrieved successfully",
            data: institutes,
            metadata: {
                count: institutes.length,
                totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        });
    } catch (error) {
        console.error("Error fetching institutes:", error);
        res.status(500).json({
            error: "Failed to retrieve institutes",
            details: error.message,
        });
    }
};

/**
 * Get detailed information about a specific institute
 */
export const getInstituteById = async (req, res) => {
    try {
        const instituteId = req.params.id;
        const userId = req.query.user_id || null;

        // Check if the instituteId is valid
        if (!instituteId || isNaN(parseInt(instituteId))) {
            return res.status(400).json({
                error: "Invalid institute ID",
                details: "The institute ID must be a valid number.",
            });
        }

        // Parse the ID to ensure it's a number
        const parsedId = parseInt(instituteId);

        // Use the stored procedure to get comprehensive institute details
        const [results] = await pool.query("CALL sp_institute_details(?, ?)", [
            parsedId,
            userId,
        ]);

        // The stored procedure returns multiple result sets
        if (!results[0] || results[0].length === 0) {
            return res.status(404).json({
                error: "Institute not found",
            });
        }

        // First result set: Institute basic info with aggregated stats
        const instituteInfo = results[0][0];

        // Second result set: Institute's recipients
        const recipients = results[1] || [];

        // Third result set: Institute's grants
        const grants = results[2] || [];

        // Fourth result set: Funding history by year and agency
        const fundingHistory = results[3] || [];

        // Format the response
        const formattedGrants = grants.map((grant) => ({
            ...grant,
            agreement_value: parseFloat(grant.agreement_value) || 0,
        }));

        // Format recipients
        const formattedRecipients = recipients.map((recipient) => ({
            ...recipient,
            total_funding: parseFloat(recipient.total_funding) || 0,
        }));

        // Process funding history for visualization
        const fundingData = processFundingHistory(fundingHistory);

        res.json({
            message: "Institute details retrieved successfully",
            data: {
                ...instituteInfo,
                total_funding: parseFloat(instituteInfo.total_funding) || 0,
                avg_funding: parseFloat(instituteInfo.avg_funding) || 0,
                recipients: formattedRecipients,
                grants: formattedGrants,
                funding_history: fundingData,
            },
        });
    } catch (error) {
        console.error("Error fetching institute details:", error);
        res.status(500).json({
            error: "Failed to retrieve institute details",
            details: error.message,
        });
    }
};

/**
 * Get grants for a specific institute
 */
export const getInstituteGrants = async (req, res) => {
    try {
        const instituteId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const sortField = req.query.sortField || "date";
        const sortDirection = req.query.sortDirection || "desc";
        const userId = req.query.user_id || null;

        const [results] = await pool.query(
            "CALL sp_entity_grants(NULL, ?, ?, ?, ?, ?, ?)",
            [instituteId, sortField, sortDirection, pageSize, page, userId]
        );

        // First result set contains the total count
        const totalCount = results[0][0].total_count;

        // Second result set contains the grants data
        const grants = results[1] || [];

        res.json({
            message: "Institute grants retrieved successfully",
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
        console.error("Error fetching institute grants:", error);
        res.status(500).json({
            error: "Failed to retrieve institute grants",
            details: error.message,
        });
    }
};

/**
 * Get recipients for a specific institute
 */
export const getInstituteRecipients = async (req, res) => {
    try {
        const instituteId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const userId = req.query.user_id || null; // Add user_id from query params

        // Use the stored procedure to get paginated recipients
        const [results] = await pool.query(
            "CALL sp_institute_recipients(?, ?, ?, ?)",
            [instituteId, page, pageSize, userId]
        );

        // First result set contains total count
        const totalCount = results[0][0].total_count;

        // Second result set contains recipients data
        const recipients = results[1] || [];

        // Format recipient funding values
        const formattedRecipients = recipients.map((recipient) => ({
            ...recipient,
            total_funding: parseFloat(recipient.total_funding) || 0,
        }));

        res.json({
            message: "Institute recipients retrieved successfully",
            data: formattedRecipients,
            metadata: {
                count: formattedRecipients.length,
                totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        });
    } catch (error) {
        console.error("Error fetching institute recipients:", error);
        res.status(500).json({
            error: "Failed to retrieve institute recipients",
            details: error.message,
        });
    }
};

/**
 * Search institutes by name
 */
export const searchInstitutes = async (req, res) => {
    try {
        const { term } = req.query;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const userId = req.query.user_id || null;
        const logSearchHistory = req.query.logSearchHistory !== "false"; // Default to true

        if (!term || term.trim() === "") {
            return res.status(400).json({
                error: "Search term is required",
            });
        }

        // Normalize the search term for history logging
        const normalizedTerm = await findBestMatch(term, "institute");

        // Use the stored procedure to search institutes with improved search history logging
        const [results] = await pool.query(
            "CALL sp_search_institutes(?, ?, ?, ?, ?, ?)",
            [term, normalizedTerm, page, pageSize, userId, logSearchHistory]
        );

        // First result set contains total count
        const totalCount = results[0][0].total_count;

        // Second result set contains institutes data
        const institutes = results[1] || [];

        // Format institute funding values
        const formattedInstitutes = institutes.map((institute) => ({
            ...institute,
            total_funding: parseFloat(institute.total_funding) || 0,
        }));

        res.json({
            message: "Institutes search completed",
            data: formattedInstitutes,
            metadata: {
                term,
                count: formattedInstitutes.length,
                totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        });
    } catch (error) {
        console.error("Error searching institutes:", error);
        res.status(500).json({
            error: "Failed to search institutes",
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
