// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signupUser, loginUser } = require('../controllers/authController');

// Auth routes
router.post('/signup', signupUser);
router.post('/login', loginUser);

router.get('/session', (req, res) => {
    if (req.session && req.session.user) {
        return res.json(req.session.user);
    }
    return res.status(401).json({ message: "Not authenticated" });
});

module.exports = router;