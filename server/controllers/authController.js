// server/controllers/authController.js
import { pool } from "../config/db.js";
import { hash, compare } from "bcrypt";

export const signupUser = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    try {
        // Check if the passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        // Hash the password
        const saltRounds = 10;
        const password_hash = await hash(password, saltRounds);

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

        // Get the inserted user data
        const insertedUser = rows[0][0];
        const userData = {
            user_id: insertedUser.user_id,
            email,
            name,
        };

        // Store user data in session
        req.session.user = userData;

        // Return the user data
        return res.status(201).json(userData);
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
        const validPassword = await compare(
            password,
            user.password_hash
        );

        // If the password is invalid, return an error
        if (!validPassword) {
            return res
                .status(401)
                .json({ message: "Invalid email or password." });
        }

        // Create user data object (excluding sensitive info)
        const userData = {
            user_id: user.user_id,
            email: user.email,
            name: user.name,
        };

        // Store user data in session
        req.session.user = userData;

        // Set a session cookie
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({
                    message: "Error saving session. Please try again.",
                });
            }

            // Return successful response with user data
            return res.status(200).json({
                ...userData,
                searches: [], // You can populate this from your searches table if needed
            });
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            message: "Something went wrong during login. Please try again.",
        });
    }
};


// Update profile information
export const updateUserProfile = async (req, res) => {
    const { user_id, email, name } = req.body;
    try {
      const [rows] = await pool.query('CALL sp_update_user_profile(?, ?, ?)', [user_id, email, name]);
      if (!rows || !rows[0] || !rows[0][0]) {
        return res.status(500).json({ message: 'Profile update failed.' });
      }
      return res.status(200).json(rows[0][0]);
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ message: error.message });
    }
};

export const updateUserPassword = async (req, res) => {
    const { user_id, currentPassword, newPassword } = req.body;
    try {
      // Check that required fields are provided
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords are required." });
      }
  
      // Retrieve the user's stored password hash
      const [userRows] = await pool.query("SELECT password_hash FROM User WHERE user_id = ?", [user_id]);
      if (!userRows || userRows.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }
      const storedHash = userRows[0].password_hash;
  
      // Verify the current password
      const isValid = await compare(currentPassword, storedHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid current password." });
      }
  
      // Hash the new password
      const saltRounds = 10;
      const new_password_hash = await hash(newPassword, saltRounds);
  
      // Update the password using the stored procedure
      const [rows] = await pool.query("CALL sp_update_user_password(?, ?)", [user_id, new_password_hash]);
      if (!rows || !rows[0] || !rows[0][0]) {
        return res.status(500).json({ message: "Password update failed." });
      }
      return res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
      console.error("Error updating password:", error);
      return res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    // Destroy session
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({
                message: "Error logging out. Please try again.",
            });
        }

        // Clear the session cookie
        res.clearCookie("connect.sid");

        // Return success message
        res.status(200).json({ message: "Logged out successfully" });
    });
};

export const deleteAccount = async (req, res) => {
    const { userId } = req.params;

    try {
        // Call the stored procedure to delete the user
        await pool.query("CALL sp_delete_user(?)", [userId]);

        // Also destroy the session
        req.session.destroy((err) => {
            if (err) {
                console.error(
                    "Error destroying session after account deletion:",
                    err
                );
            }
        });

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
