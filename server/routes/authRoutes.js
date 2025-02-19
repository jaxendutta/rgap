// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signupUser, loginUser } = require('../controllers/authController');

// Auth routes
router.post('/signup', signupUser);
router.post('/login', loginUser);

module.exports = router;