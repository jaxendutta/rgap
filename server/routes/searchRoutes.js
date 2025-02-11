// server/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const { searchGrants, getFilterOptions } = require('../controllers/searchController');

router.post('/', searchGrants);
router.get('/filter-options', getFilterOptions);

module.exports = router;