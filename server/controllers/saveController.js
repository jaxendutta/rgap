// src/controllers/saveController.js
import { pool } from "../config/db.js";

/**
 * Generic function to handle bookmark operations for different entity types
 * @param {string} entityType - The type of entity being bookmarked ('grant', 'recipient', 'institute')
 * @param {number} entityId - The ID of the entity to bookmark
 * @param {number} userId - The user ID
 * @param {boolean} isDelete - Whether this is a delete operation
 * @returns {Object} Result of the database operation
 */
async function handleBookmark(entityType, entityId, userId, isDelete = false) {
    // Define table and column names based on entity type
    const tableMap = {
        grant: { table: "BookmarkedGrants", column: "grant_id" },
        recipient: { table: "BookmarkedRecipients", column: "recipient_id" },
        institute: { table: "BookmarkedInstitutes", column: "institute_id" },
    };

    const { table, column } = tableMap[entityType];

    // Check if user exists
    const [userExists] = await pool.query(
        "SELECT 1 FROM User WHERE user_id = ?",
        [userId]
    );

    if (!userExists.length) {
        throw new Error(`User with ID ${userId} does not exist`);
    }

    // Check if bookmark exists
    const [bookmarkExists] = await pool.query(
        `SELECT 1 FROM ${table} WHERE ${column} = ? AND user_id = ?`,
        [entityId, userId]
    );

    if (isDelete) {
        // Delete operation
        if (!bookmarkExists.length) {
            throw new Error(`Bookmark does not exist`);
        }

        const [result] = await pool.query(
            `DELETE FROM ${table} WHERE ${column} = ? AND user_id = ?`,
            [entityId, userId]
        );

        return result;
    } else {
        // Create operation
        if (bookmarkExists.length) {
            return { alreadyExists: true };
        }

        const [result] = await pool.query(
            `INSERT INTO ${table} (user_id, ${column}) VALUES(?, ?)`,
            [userId, entityId]
        );

        return result;
    }
}

/**
 * Get bookmarked entity IDs for a user
 * @param {string} entityType - The type of entity ('grant', 'recipient', 'institute')
 * @param {number} userId - The user ID
 * @returns {Array} Array of entity IDs
 */
async function getBookmarkedIds(entityType, userId) {
    const tableMap = {
        grant: { table: "BookmarkedGrants", column: "grant_id" },
        recipient: { table: "BookmarkedRecipients", column: "recipient_id" },
        institute: { table: "BookmarkedInstitutes", column: "institute_id" },
    };

    const { table, column } = tableMap[entityType];

    // Check if user exists
    const [userExists] = await pool.query(
        "SELECT 1 FROM User WHERE user_id = ?",
        [userId]
    );

    if (!userExists.length) {
        throw new Error(`User with ID ${userId} does not exist`);
    }

    const [results] = await pool.query(
        `SELECT ${column} FROM ${table} WHERE user_id = ?`,
        [userId]
    );

    return results;
}

// Grant Controllers
export const saveGrant = async (req, res) => {
    try {
        const { grant_id } = req.params;
        const { user_id } = req.body;

        const result = await handleBookmark("grant", grant_id, user_id);

        if (result.alreadyExists) {
            console.log(
                `Grant ${grant_id} already bookmarked by user ${user_id}`
            );
            return res.status(204).json({ message: `Bookmark already exists` });
        }

        console.log(`Grant ${grant_id} bookmarked by user ${user_id}`);
        res.status(201).json(result);
    } catch (error) {
        console.error(`Error bookmarking grant: ${error.message}`);
        res.status(409).json({ message: error.message });
    }
};

export const deleteSavedGrant = async (req, res) => {
    try {
        const { grant_id } = req.params;
        const { user_id } = req.body;

        const result = await handleBookmark("grant", grant_id, user_id, true);

        console.log(`Grant ${grant_id} unbookmarked by user ${user_id}`);
        res.status(200).json(result);
    } catch (error) {
        console.error(`Error deleting grant bookmark: ${error.message}`);
        res.status(409).json({ message: error.message });
    }
};

export const getSavedGrantIds = async (req, res) => {
    try {
        const { user_id } = req.params;
        const results = await getBookmarkedIds("grant", user_id);
        res.status(200).json(results);
    } catch (error) {
        console.error(`Error getting bookmarked grant IDs: ${error.message}`);
        res.status(409).json({ message: error.message });
    }
};

export const getSavedGrant = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Check if user exists
        const [userExists] = await pool.query(
            "SELECT 1 FROM User WHERE user_id = ?",
            [user_id]
        );

        if (!userExists.length) {
            return res.status(409).json({ message: `User does not exist` });
        }

        const [results] = await pool.query(
            `SELECT ResearchGrant.grant_id
            FROM BookmarkedGrants 
            LEFT OUTER JOIN ResearchGrant ON ResearchGrant.grant_id = BookmarkedGrants.grant_id
            WHERE user_id = ?`,
            [user_id]
        );

        res.status(200).json(results);
    } catch (error) {
        console.error(`Error getting saved grants: ${error.message}`);
        res.status(409).json({ message: error.message });
    }
};

// Recipient Controllers
export const saveRecipient = async (req, res) => {
    try {
        const { recipient_id } = req.params;
        const { user_id } = req.body;

        const result = await handleBookmark("recipient", recipient_id, user_id);

        if (result.alreadyExists) {
            console.log(
                `Recipient ${recipient_id} already bookmarked by user ${user_id}`
            );
            return res.status(204).json({ message: `Bookmark already exists` });
        }

        console.log(`Recipient ${recipient_id} bookmarked by user ${user_id}`);
        res.status(201).json(result);
    } catch (error) {
        console.error(`Error bookmarking recipient: ${error.message}`);
        res.status(409).json({ message: error.message });
    }
};

export const deleteSavedRecipient = async (req, res) => {
    try {
        const { recipient_id } = req.params;
        const { user_id } = req.body;

        const result = await handleBookmark(
            "recipient",
            recipient_id,
            user_id,
            true
        );

        console.log(
            `Recipient ${recipient_id} unbookmarked by user ${user_id}`
        );
        res.status(200).json(result);
    } catch (error) {
        console.error(`Error deleting recipient bookmark: ${error.message}`);
        res.status(409).json({ message: error.message });
    }
};

export const getSavedRecipientIds = async (req, res) => {
    try {
        const { user_id } = req.params;
        const results = await getBookmarkedIds("recipient", user_id);
        res.status(200).json(results);
    } catch (error) {
        console.error(
            `Error getting bookmarked recipient IDs: ${error.message}`
        );
        res.status(409).json({ message: error.message });
    }
};

export const getSavedRecipient = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Check if user exists
        const [userExists] = await pool.query(
            "SELECT 1 FROM User WHERE user_id = ?",
            [user_id]
        );

        if (!userExists.length) {
            return res.status(409).json({ message: `User does not exist` });
        }

        const [results] = await pool.query(
            `SELECT Recipient.recipient_id
            FROM BookmarkedRecipients 
            LEFT OUTER JOIN Recipient ON Recipient.recipient_id = BookmarkedRecipients.recipient_id
            WHERE user_id = ?`,
            [user_id]
        );

        res.status(200).json(results);
    } catch (error) {
        console.error(`Error getting saved recipients: ${error.message}`);
        res.status(409).json({ message: error.message });
    }
};

// Institute Controllers
export const saveInstitute = async (req, res) => {
    try {
        const { institute_id } = req.params;
        const { user_id } = req.body;

        const result = await handleBookmark("institute", institute_id, user_id);

        if (result.alreadyExists) {
            console.log(
                `Institute ${institute_id} already bookmarked by user ${user_id}`
            );
            return res.status(204).json({ message: `Bookmark already exists` });
        }

        console.log(`Institute ${institute_id} bookmarked by user ${user_id}`);
        res.status(201).json(result);
    } catch (error) {
        console.error(`Error bookmarking institute: ${error.message}`);
        res.status(409).json({ message: error.message });
    }
};

export const deleteSavedInstitute = async (req, res) => {
    try {
        const { institute_id } = req.params;
        const { user_id } = req.body;

        const result = await handleBookmark(
            "institute",
            institute_id,
            user_id,
            true
        );

        console.log(
            `Institute ${institute_id} unbookmarked by user ${user_id}`
        );
        res.status(200).json(result);
    } catch (error) {
        console.error(`Error deleting institute bookmark: ${error.message}`);
        res.status(409).json({ message: error.message });
    }
};

export const getSavedInstituteIds = async (req, res) => {
    try {
        const { user_id } = req.params;
        const results = await getBookmarkedIds("institute", user_id);
        res.status(200).json(results);
    } catch (error) {
        console.error(
            `Error getting bookmarked institute IDs: ${error.message}`
        );
        res.status(409).json({ message: error.message });
    }
};

export const getSavedInstitute = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Check if user exists
        const [userExists] = await pool.query(
            "SELECT 1 FROM User WHERE user_id = ?",
            [user_id]
        );

        if (!userExists.length) {
            return res.status(409).json({ message: `User does not exist` });
        }

        const [results] = await pool.query(
            `SELECT Institute.institute_id
            FROM BookmarkedInstitutes 
            LEFT OUTER JOIN Institute ON Institute.institute_id = BookmarkedInstitutes.institute_id
            WHERE user_id = ?`,
            [user_id]
        );

        res.status(200).json(results);
    } catch (error) {
        console.error(`Error getting saved institutes: ${error.message}`);
        res.status(409).json({ message: error.message });
    }
};
