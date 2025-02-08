
const express = require('express');
const router = express.Router();

const { getAllGrants, searchGrants } = require('../controllers/searchController'); 


router.get('/all', getAllGrants);
router.post('/', searchGrants);
//router.get('/grant', searchController.getAllGrants);
//router.get('/institute', searchController.getAllGrants);
//router.get('/recipient', searchController.getAllGrants);
//router.get('/combine', searchController.getAllGrants);

module.exports = router;