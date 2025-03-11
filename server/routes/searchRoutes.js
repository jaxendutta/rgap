// server/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const { searchGrants, getFilterOptions, sortGrants } = require('../controllers/searchController');

router.post('/', searchGrants);
router.get('/filter-options', getFilterOptions);
router.post('/sort', sortGrants);

module.exports = router;