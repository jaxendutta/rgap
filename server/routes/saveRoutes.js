// server/routes/saveRoutes.js
const express = require('express');
const router = express.Router();

const {saveGrant, deleteSavedGrant, getSavedGrant, saveRecipient, deleteSavedRecipient, getSavedRecipient} = require('../controllers/saveController');

router.get('/grant/:user_id', getSavedGrant);
router.post('/grant/:grant_id', saveGrant);
router.delete('/grant/delete/:grant_id', deleteSavedGrant);

router.get('/recipient/:user_id', getSavedRecipient);
router.post('/recipient/:recipient_id', saveRecipient);
router.delete('/recipient/:recipient_id', deleteSavedRecipient);

module.exports = router;