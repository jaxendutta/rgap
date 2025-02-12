// server/controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

const signupUser = async (req, res) => {
  const { email, name, password } = req.body;
  try {
    console.log('Signup endpoint hit with:', req.body);
    // Hashing password using bcrypt
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Call sp_create_user
    const [rows] = await pool.query('CALL sp_create_user(?, ?, ?)', [email, name, password_hash]);
    console.log('Stored procedure result:', rows); // logging to make sure we are picking up the sp result
    // Make sure the result set exists and has a row
    if (!rows || !rows[0] || !rows[0][0]) {
      console.error('Stored procedure did not return a valid user_id.');
      return res.status(500).json({ message: 'User creation failed. No ID returned.' });
    }

    // rows[0] is the result from the stored procedure
    const insertedUser = rows[0][0];
    console.log('Returning JSON response with:', { user_id: insertedUser.user_id, email, name });
    return res.status(201).json({ user_id: insertedUser.user_id, email, name });
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { signupUser };
