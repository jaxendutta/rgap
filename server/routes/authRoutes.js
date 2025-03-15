// server/routes/authRoutes.js
import { Router } from "express";
const router = Router();
import {
    signupUser,
    loginUser,
    deleteAccount,
} from "../controllers/authController.js";

// Auth routes
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.delete("/delete-account/:userId", deleteAccount);

router.get("/session", (req, res) => {
    if (req.session && req.session.user) {
        return res.json(req.session.user);
    }
    return res.status(401).json({ message: "Not authenticated" });
});

export default router;
