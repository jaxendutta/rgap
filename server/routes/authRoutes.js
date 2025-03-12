// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signupUser, loginUser, updateUserProfile, updateUserPassword } = require('../controllers/authController');

// Auth routes
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.put('/update-profile', updateUserProfile);
router.put('/update-password', updateUserPassword);

module.exports = router;