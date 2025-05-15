//  server/controllers/userController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../config/db.js";

// Register a new user
export const registerUser = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from("User")
            .select("*")
            .eq("email", email)
            .single();

        if (existingUser) {
            return res
                .status(400)
                .json({ message: "User already exists with this email" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user using the function
        const { data, error } = await supabase.rpc("create_user", {
            p_email: email,
            p_name: name,
            p_password_hash: passwordHash,
        });

        if (error) throw error;

        // Generate JWT token
        const token = jwt.sign(
            { id: data[0].user_id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(201).json({
            token,
            user: {
                id: data[0].user_id,
                email,
                name,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "Failed to register user",
            error: error.message,
        });
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get user by email using the function
        const { data, error } = await supabase.rpc("login", {
            p_email: email,
        });

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = data[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });

        res.json({
            token,
            user: {
                id: user.user_id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Failed to login",
            error: error.message,
        });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { id } = req.user; // From auth middleware
        const { email, name } = req.body;

        // Update using the function
        const { data, error } = await supabase.rpc("update_user_profile", {
            p_user_id: id,
            p_email: email,
            p_name: name,
        });

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            user: {
                id: data[0].user_id,
                email: data[0].email,
                name: data[0].name,
            },
        });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({
            message: "Failed to update profile",
            error: error.message,
        });
    }
};

// Update user password
export const updatePassword = async (req, res) => {
    try {
        const { id } = req.user; // From auth middleware
        const { currentPassword, newPassword } = req.body;

        // Get current user data
        const { data: userData, error: userError } = await supabase
            .from("User")
            .select("password_hash")
            .eq("user_id", id)
            .single();

        if (userError) throw userError;

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(
            currentPassword,
            userData.password_hash
        );

        if (!isMatch) {
            return res
                .status(401)
                .json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Update password using the function
        const { data, error } = await supabase.rpc("update_user_password", {
            p_user_id: id,
            p_new_password_hash: newPasswordHash,
        });

        if (error) throw error;

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Password update error:", error);
        res.status(500).json({
            message: "Failed to update password",
            error: error.message,
        });
    }
};

// Delete user account
export const deleteAccount = async (req, res) => {
    try {
        const { id } = req.user; // From auth middleware

        // Delete user using the function
        const { data, error } = await supabase.rpc("delete_user", {
            p_user_id: id,
        });

        if (error) throw error;

        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Account deletion error:", error);
        res.status(500).json({
            message: "Failed to delete account",
            error: error.message,
        });
    }
};
