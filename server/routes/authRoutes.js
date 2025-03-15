// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signupUser, loginUser, updateUserProfile, updateUserPassword, deleteAccount } = require('../controllers/authController');

// Auth routes
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.delete("/delete-account/:userId", deleteAccount);
router.put('/update-profile', updateUserProfile);
router.put('/update-password', updateUserPassword);
router.get("/session", (req, res) => {
    if (req.session && req.session.user) {
        return res.json(req.session.user);
    }
    return res.status(401).json({ message: "Not authenticated" });
});

module.exports = router;