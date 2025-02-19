// server/controllers/authController.js
const pool = require("../config/db");
const bcrypt = require("bcrypt");

const signupUser = async (req, res) => {
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

// TODO: Implement login functionality!
// THIS IS A PLACEHOLDER FUNCTION
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Get user from database
        const [rows] = await pool.query(
            "SELECT user_id, email, name, password_hash FROM User WHERE email = ?",
            [email]
        );

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

        // For now, return a simple success response
        // In a production app, you'd want to generate a JWT token here
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

module.exports = { signupUser, loginUser };
