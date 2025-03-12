// server/controllers/recipientController.js
const pool = require("../config/db");

/**
 * Get all recipients with basic information
 */
const getAllRecipients = async (req, res) => {
    try {
        // Apply pagination parameters if provided
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const offset = (page - 1) * pageSize;

        // Get total count for pagination metadata
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM Recipient`
        );
        const totalCount = countResult[0].total;

        // Query recipients with their organization info and grant counts
        const [recipients] = await pool.query(
            `SELECT 
                r.recipient_id,
                r.legal_name,
                r.type,
                r.recipient_type,
                r.institute_id,
                i.name AS research_organization_name,
                i.city,
                i.province,
                i.country,
                COUNT(DISTINCT rg.grant_id) AS grant_count,
                COALESCE(SUM(rg.agreement_value), 0) AS total_funding,
                MAX(rg.agreement_start_date) AS latest_grant_date
            FROM 
                Recipient r
            LEFT JOIN 
                Institute i ON r.institute_id = i.institute_id
            LEFT JOIN 
                ResearchGrant rg ON r.recipient_id = rg.recipient_id
            GROUP BY 
                r.recipient_id
            ORDER BY 
                total_funding DESC
            LIMIT ? OFFSET ?`,
            [pageSize, offset]
        );

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
const getRecipientById = async (req, res) => {
    try {
        const recipientId = req.params.id;

        // Use the stored procedure to get comprehensive recipient details
        const [results] = await pool.query("CALL sp_recipient_details(?)", [
            recipientId,
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
const getRecipientGrants = async (req, res) => {
    try {
        const recipientId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const sortField = req.query.sortField || 'date';
        const sortDirection = req.query.sortDirection || 'desc';

        const [results] = await pool.query(
            'CALL sp_entity_grants(?, NULL, ?, ?, ?, ?)',
            [recipientId, sortField, sortDirection, pageSize, page]
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
const processFundingHistory = (fundingHistory) => {
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
const searchRecipients = async (req, res) => {
    try {
        const { term } = req.query;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const offset = (page - 1) * pageSize;

        if (!term || term.trim() === "") {
            return res.status(400).json({
                error: "Search term is required",
            });
        }

        // Get total count for pagination metadata
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total 
             FROM Recipient r
             LEFT JOIN Institute i ON r.institute_id = i.institute_id
             WHERE r.legal_name LIKE ? OR i.name LIKE ?`,
            [`%${term}%`, `%${term}%`]
        );
        const totalCount = countResult[0].total;

        // Search recipients with their organization info and grant counts
        const [recipients] = await pool.query(
            `SELECT 
                r.recipient_id,
                r.legal_name,
                r.type,
                r.recipient_type,
                r.institute_id,
                i.name AS research_organization_name,
                i.city,
                i.province,
                i.country,
                COUNT(DISTINCT rg.grant_id) AS grant_count,
                COALESCE(SUM(rg.agreement_value), 0) AS total_funding,
                MAX(rg.agreement_start_date) AS latest_grant_date
            FROM 
                Recipient r
            LEFT JOIN 
                Institute i ON r.institute_id = i.institute_id
            LEFT JOIN 
                ResearchGrant rg ON r.recipient_id = rg.recipient_id
            WHERE 
                r.legal_name LIKE ? OR i.name LIKE ?
            GROUP BY 
                r.recipient_id
            ORDER BY 
                total_funding DESC
            LIMIT ? OFFSET ?`,
            [`%${term}%`, `%${term}%`, pageSize, offset]
        );

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

module.exports = {
    getAllRecipients,
    getRecipientById,
    getRecipientGrants,
    searchRecipients,
};
