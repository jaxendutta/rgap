// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signupUser } = require('../controllers/authController');

router.post('/signup', signupUser);

module.exports = router;
