// server/routes/authRoutes.js
import { Router } from "express";
const router = Router();
import {
    signupUser,
    loginUser,
    logout,
    deleteAccount,
} from "../controllers/authController.js";

// Auth routes
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.delete("/delete-account/:userId", deleteAccount);

// Session check endpoint
router.get("/session", (req, res) => {
    // Log request cookies and session for debugging
    console.log("Session check - cookies:", req.headers.cookie);
    console.log("Session check - session:", req.session);

    // Check if session exists and has user data
    if (req.session && req.session.user) {
        return res.json(req.session.user);
    }

    // No valid session found, return 401
    return res.status(401).json({ message: "Not authenticated" });
});

export default router;
