// server/controllers/bookmarkController.js
import { pool } from "../config/db.js";

// Helper function to check if user exists
const checkUserExists = async (userId) => {
    const [rows] = await pool.query("CALL sp_check_user_exists(?)", [userId]);
    return rows[0][0].user_exists === 1;
};

// Helper function to handle bookmarking response
const handleBookmarkResponse = (result, entityType) => {
    if (result.status === "exists") {
        return {
            status: 204,
            message: `${entityType} bookmark already exists`,
        };
    }
    return {
        status: 201,
        message: `${entityType} bookmark added successfully`,
    };
};

// Helper function to handle unbookmarking response
const handleUnbookmarkResponse = (result, entityType) => {
    if (result.status === "not_found") {
        return {
            status: 404,
            message: `${entityType} bookmark does not exist`,
        };
    }
    return {
        status: 200,
        message: `${entityType} bookmark removed successfully`,
    };
};

/**
 * Generic bookmark handler for all entity types
 * @param {string} entityType - Type of entity (grant, recipient, institute, search)
 * @param {number|string} entityId - ID of the entity to bookmark
 * @param {number} userId - User's ID
 * @param {boolean} isRemoving - Whether we're removing the bookmark (true) or adding it (false)
 * @returns {Promise<{status: number, message: string}>}
 */
const handleBookmark = async (entityType, entityId, userId, isRemoving) => {
    let procedure, entityLabel;

    // Configure based on entity type
    switch (entityType) {
        case "grant":
            procedure = isRemoving
                ? "sp_delete_grant_bookmark"
                : "sp_save_grant_bookmark";
            entityLabel = "Grant";
            break;
        case "recipient":
            procedure = isRemoving
                ? "sp_delete_recipient_bookmark"
                : "sp_save_recipient_bookmark";
            entityLabel = "Recipient";
            break;
        case "institute":
            procedure = isRemoving
                ? "sp_delete_institute_bookmark"
                : "sp_save_institute_bookmark";
            entityLabel = "Institute";
            break;
        case "search":
            // Special handling for search histories (they're toggled rather than created/deleted)
            procedure = "sp_toggle_search_bookmark";
            entityLabel = "Search";
            break;
        default:
            throw new Error(`Unknown entity type: ${entityType}`);
    }

    // Check if entityId is valid
    if (!entityId || entityId === "undefined") {
        throw new Error(`Invalid ${entityLabel} ID: ${entityId}`);
    }

    // Call the appropriate stored procedure
    const [results] = await pool.query(`CALL ${procedure}(?, ?)`, [
        userId,
        entityId,
    ]);
    const result = results[0][0];

    // Return appropriate response
    if (entityType === "search") {
        // Search bookmarks use a toggle procedure that returns true/false for the new state
        return {
            status: 200,
            message: result.bookmarked
                ? "Search bookmark added"
                : "Search bookmark removed",
            bookmarked: result.bookmarked,
        };
    } else {
        // Other entity types use separate add/remove procedures
        return isRemoving
            ? handleUnbookmarkResponse(result, entityLabel)
            : handleBookmarkResponse(result, entityLabel);
    }
};

/**
 * Generic function to get bookmarked IDs for an entity type
 * @param {string} entityType - Type of entity
 * @param {number} userId - User's ID
 * @returns {Promise<Array>}
 */
const getBookmarkedIds = async (entityType, userId) => {
    // Different procedure names for different entity types
    const procedures = {
        grant: "sp_get_bookmarked_grant_ids",
        recipient: "sp_get_bookmarked_recipient_ids",
        institute: "sp_get_bookmarked_institute_ids",
        search: "sp_get_bookmarked_search_ids",
    };

    const procedure = procedures[entityType];
    if (!procedure) {
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    const [results] = await pool.query(`CALL ${procedure}(?)`, [userId]);
    return results[0];
};

/**
 * Generic function to get detailed bookmarked entities
 * @param {string} entityType - Type of entity
 * @param {number} userId - User's ID
 * @returns {Promise<Array>}
 */
const getBookmarkedEntities = async (entityType, userId) => {
    // Different procedure names for different entity types
    const procedures = {
        grant: "sp_get_bookmarked_grants",
        recipient: "sp_get_bookmarked_recipients_with_stats",
        institute: "sp_get_bookmarked_institutes_with_stats",
        search: "sp_get_bookmarked_searches",
    };

    const procedure = procedures[entityType];
    if (!procedure) {
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    const [results] = await pool.query(`CALL ${procedure}(?)`, [userId]);
    return results[0];
};

/*
 * Toggle bookmark for any entity type
 */
export const toggleBookmark = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const { user_id, isBookmarked } = req.body;

        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!entityType || !entityId || entityId === "undefined") {
            return res
                .status(400)
                .json({ message: "Entity type and valid ID are required" });
        }

        // Validate that the entity type is supported
        const validTypes = ["grant", "recipient", "institute", "search"];
        if (!validTypes.includes(entityType)) {
            return res.status(400).json({ message: "Invalid entity type" });
        }

        const result = await handleBookmark(
            entityType,
            entityId,
            user_id,
            isBookmarked
        );
        return res.status(result.status).json({
            message: result.message,
            bookmarked: result.bookmarked, // Only returned for search bookmarks
        });
    } catch (error) {
        console.error(
            `Error toggling ${req.params.entityType} bookmark:`,
            error
        );
        return res.status(500).json({ message: error.message });
    }
};

/*
 * Get bookmarked IDs for any entity type
 */
export const getBookmarkIds = async (req, res) => {
    try {
        const { entityType, user_id } = req.params;

        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Validate that the entity type is supported
        const validTypes = ["grant", "recipient", "institute", "search"];
        if (!validTypes.includes(entityType)) {
            return res.status(400).json({ message: "Invalid entity type" });
        }

        // Check if user exists
        const userExists = await checkUserExists(user_id);
        if (!userExists) {
            return res.status(404).json({ message: "User does not exist" });
        }

        const ids = await getBookmarkedIds(entityType, user_id);
        return res.status(200).json(ids);
    } catch (error) {
        console.error(
            `Error getting ${req.params.entityType} bookmark IDs:`,
            error
        );
        return res.status(500).json({ message: error.message });
    }
};

/*
 * Get bookmarked entities with details for any entity type
 */
export const getBookmarks = async (req, res) => {
    try {
        const { entityType, user_id } = req.params;

        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Validate that the entity type is supported
        const validTypes = ["grant", "recipient", "institute", "search"];
        if (!validTypes.includes(entityType)) {
            return res.status(400).json({ message: "Invalid entity type" });
        }

        // Check if user exists
        const userExists = await checkUserExists(user_id);
        if (!userExists) {
            return res.status(404).json({ message: "User does not exist" });
        }

        const bookmarks = await getBookmarkedEntities(entityType, user_id);
        return res.status(200).json(bookmarks);
    } catch (error) {
        console.error(
            `Error getting bookmarked ${req.params.entityType}:`,
            error
        );
        return res.status(500).json({ message: error.message });
    }
};
