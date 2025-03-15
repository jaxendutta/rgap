// server/controllers/authController.js
import pool from "../config/db.js";
import bcrypt from "bcrypt";

export const signupUser = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    try {
        // Check if the passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        // Hash the password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const [rows] = await pool.query("CALL sp_create_user(?, ?, ?)", [
            email,
            name,
            password_hash,
        ]);

        // Check if the user was created
        if (!rows || !rows[0] || !rows[0][0]) {
            return res
                .status(500)
                .json({ message: "User creation failed. No ID returned." });
        }

        // Return the user ID, email, and name
        const insertedUser = rows[0][0];
        return res
            .status(201)
            .json({ user_id: insertedUser.user_id, email, name });
    } catch (error) {
        console.error("Error during signup:", error);

        // Check for duplicate entry error
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message:
                    "An account with this email already exists. Please log in.",
            });
        }

        // For all other errors, return a generic message
        return res.status(500).json({
            message: "Something went wrong during signup. Please try again.",
        });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Get user from database using stored procedure
        const [rowsets] = await pool.query("CALL sp_login(?)", [email]);

        // The stored procedure returns a resultset array, first element contains the rows
        const rows = rowsets[0];

        // Check if the user exists
        if (!rows || rows.length === 0) {
            return res
                .status(401)
                .json({ message: "Invalid email or password." });
        }

        // Check if the password is correct
        const user = rows[0];
        const validPassword = await bcrypt.compare(
            password,
            user.password_hash
        );

        // If the password is invalid, return an error
        if (!validPassword) {
            return res
                .status(401)
                .json({ message: "Invalid email or password." });
        }

        // Return successful response
        return res.status(200).json({
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            searches: [], // You can populate this from your searches table if needed
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            message: "Something went wrong during login. Please try again.",
        });
    }
};

export const deleteAccount = async (req, res) => {
    const { userId } = req.params;

    try {
        // Call the stored procedure to delete the user
        await pool.query("CALL sp_delete_user(?)", [userId]);

        return res.status(200).json({
            message: "Account successfully deleted",
        });
    } catch (error) {
        console.error("Error deleting account:", error);

        return res.status(500).json({
            message: "Failed to delete account. Please try again later.",
            details: error.message,
        });
    }
};
