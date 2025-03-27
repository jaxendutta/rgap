// server/controllers/saveController.js
import { pool } from "../config/db.js";

/*
 * Save a specific grant to a specific user's bookmarks
 */
export const saveGrant = async (req, res) => {
    try {
        const { ref_number } = req.params;
        const { user_id } = req.body;

        const [results] = await pool.query(
            "CALL sp_save_grant_bookmark(?, ?)",
            [user_id, ref_number]
        );

        const result = results[0][0];
        
        if (result.status === 'exists') {
            console.log("Grant bookmark already exists.");
            return res.status(204).json({ message: "Bookmark already exists" });
        }

        console.log("Grant bookmark added.");
        res.status(201).json({ message: "Bookmark added successfully" });
    } catch (error) {
        console.error("Error saving grant bookmark:", error);
        res.status(409).json({ message: error.message });
    }
};

/*
 * Delete a specific grant bookmark
 */
export const deleteSavedGrant = async (req, res) => {
    try {
        const { ref_number } = req.params;
        const { user_id } = req.body;

        const [results] = await pool.query(
            "CALL sp_delete_grant_bookmark(?, ?)",
            [user_id, ref_number]
        );

        const result = results[0][0];
        
        if (result.status === 'not_found') {
            console.log("Grant bookmark doesn't exist.");
            return res.status(409).json({ message: "Bookmark does not exist" });
        }

        console.log("Grant bookmark deleted.");
        return res.status(200).json({ message: "Bookmark removed successfully" });
    } catch (error) {
        console.error("Error deleting grant bookmark:", error);
        return res.status(409).json({ message: error.message });
    }
};

/*
 * Get all saved grant bookmark ids
 */
export const getSavedGrantIds = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Check if user exists first
        const [userCheck] = await pool.query(
            "CALL sp_check_user_exists(?)",
            [user_id]
        );

        if (userCheck[0][0].exists === 0) {
            return res.status(409).json({ message: "User does not exist" });
        }

        const [results] = await pool.query(
            "CALL sp_get_bookmarked_grant_ids(?)",
            [user_id]
        );

        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error getting grant bookmark IDs:", error);
        res.status(409).json({ message: error.message });
    }
};

/*
 * Get all saved grant information with detailed statistics
 */
export const getSavedGrant = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Check if user exists first
        const [userCheck] = await pool.query(
            "CALL sp_check_user_exists(?)",
            [user_id]
        );

        if (userCheck[0][0].exists === 0) {
            return res.status(409).json({ message: "User does not exist" });
        }

        const [results] = await pool.query(
            "CALL sp_get_bookmarked_grants(?)",
            [user_id]
        );

        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error getting bookmarked grants:", error);
        res.status(409).json({ message: error.message });
    }
};

/*
 * Save a specific recipient to a specific user's bookmarks
 */
export const saveRecipient = async (req, res) => {
    try {
        const { recipient_id } = req.params;
        const { user_id } = req.body;

        const [results] = await pool.query(
            "CALL sp_save_recipient_bookmark(?, ?)",
            [user_id, recipient_id]
        );

        const result = results[0][0];
        
        if (result.status === 'exists') {
            console.log(`Recipient ${recipient_id} bookmark already exists.`);
            return res.status(204).json({ message: "Bookmark already exists" });
        }

        console.log(`Recipient ${recipient_id} bookmarked by user ${user_id}`);
        res.status(201).json({ message: "Bookmark added successfully" });
    } catch (error) {
        console.error("Error saving recipient bookmark:", error);
        res.status(409).json({ message: error.message });
    }
};

/*
 * Delete a specific recipient bookmark
 */
export const deleteSavedRecipient = async (req, res) => {
    try {
        const { recipient_id } = req.params;
        const { user_id } = req.body;

        const [results] = await pool.query(
            "CALL sp_delete_recipient_bookmark(?, ?)",
            [user_id, recipient_id]
        );

        const result = results[0][0];
        
        if (result.status === 'not_found') {
            console.log("Recipient bookmark doesn't exist.");
            return res.status(409).json({ message: "Bookmark does not exist" });
        }

        console.log(`Recipient ${recipient_id} unbookmarked by user ${user_id}`);
        return res.status(200).json({ message: "Bookmark removed successfully" });
    } catch (error) {
        console.error("Error deleting recipient bookmark:", error);
        return res.status(409).json({ message: error.message });
    }
};

/*
 * Get all saved recipient bookmark ids
 */
export const getSavedRecipientIds = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Check if user exists first
        const [userCheck] = await pool.query(
            "CALL sp_check_user_exists(?)",
            [user_id]
        );

        if (userCheck[0][0].exists === 0) {
            return res.status(409).json({ message: "User does not exist" });
        }

        const [results] = await pool.query(
            "CALL sp_get_bookmarked_recipient_ids(?)",
            [user_id]
        );

        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error getting recipient bookmark IDs:", error);
        res.status(409).json({ message: error.message });
    }
};

/*
 * Get all saved recipient information with detailed statistics
 */
export const getSavedRecipient = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Check if user exists first
        const [userCheck] = await pool.query(
            "CALL sp_check_user_exists(?)",
            [user_id]
        );

        if (userCheck[0][0].exists === 0) {
            return res.status(409).json({ message: "User does not exist" });
        }

        const [results] = await pool.query(
            "CALL sp_get_bookmarked_recipients_with_stats(?)",
            [user_id]
        );

        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error getting bookmarked recipients:", error);
        res.status(409).json({ message: error.message });
    }
};

/*
 * Save a specific institute to a specific user's bookmarks
 */
export const saveInstitute = async (req, res) => {
    try {
        const { institute_id } = req.params;
        const { user_id } = req.body;

        const [results] = await pool.query(
            "CALL sp_save_institute_bookmark(?, ?)",
            [user_id, institute_id]
        );

        const result = results[0][0];
        
        if (result.status === 'exists') {
            console.log(`Institute ${institute_id} bookmark already exists.`);
            return res.status(204).json({ message: "Bookmark already exists" });
        }

        console.log(`Institute ${institute_id} bookmarked by user ${user_id}`);
        res.status(201).json({ message: "Bookmark added successfully" });
    } catch (error) {
        console.error("Error saving institute bookmark:", error);
        res.status(409).json({ message: error.message });
    }
};

/*
 * Delete a specific institute bookmark
 */
export const deleteSavedInstitute = async (req, res) => {
    try {
        const { institute_id } = req.params;
        const { user_id } = req.body;

        const [results] = await pool.query(
            "CALL sp_delete_institute_bookmark(?, ?)",
            [user_id, institute_id]
        );

        const result = results[0][0];
        
        if (result.status === 'not_found') {
            console.log("Institute bookmark doesn't exist.");
            return res.status(409).json({ message: "Bookmark does not exist" });
        }

        console.log(`Institute ${institute_id} unbookmarked by user ${user_id}`);
        return res.status(200).json({ message: "Bookmark removed successfully" });
    } catch (error) {
        console.error("Error deleting institute bookmark:", error);
        return res.status(409).json({ message: error.message });
    }
};

/*
 * Get all saved institute bookmark ids
 */
export const getSavedInstituteIds = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Check if user exists first
        const [userCheck] = await pool.query(
            "CALL sp_check_user_exists(?)",
            [user_id]
        );

        if (userCheck[0][0].exists === 0) {
            return res.status(409).json({ message: "User does not exist" });
        }

        const [results] = await pool.query(
            "CALL sp_get_bookmarked_institute_ids(?)",
            [user_id]
        );

        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error getting institute bookmark IDs:", error);
        res.status(409).json({ message: error.message });
    }
};

/*
 * Get all saved institute information with detailed statistics
 */
export const getSavedInstitute = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Check if user exists first
        const [userCheck] = await pool.query(
            "CALL sp_check_user_exists(?)",
            [user_id]
        );

        if (userCheck[0][0].exists === 0) {
            return res.status(409).json({ message: "User does not exist" });
        }

        const [results] = await pool.query(
            "CALL sp_get_bookmarked_institutes_with_stats(?)",
            [user_id]
        );

        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error getting bookmarked institutes:", error);
        res.status(409).json({ message: error.message });
    }
};