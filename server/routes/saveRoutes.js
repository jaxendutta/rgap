// server/routes/saveRoutes.js
const express = require('express');
const router = express.Router();

const {saveGrant, deleteSavedGrant, getSavedGrant, getSavedGrantIds, 
        saveRecipient, deleteSavedRecipient, getSavedRecipient, getSavedRecipientIds,
        saveInstitute, deleteSavedInstitute, getSavedInstitute, getSavedInstituteIds,
    } = require('../controllers/saveController');

router.get('/grant/id/:user_id', getSavedGrantIds);
router.get('/grant/:user_id', getSavedGrant);
router.post('/grant/:grant_id', saveGrant);
router.delete('/grant/delete/:grant_id', deleteSavedGrant);

router.get('/recipient/id/:user_id', getSavedRecipientIds);
router.get('/recipient/:user_id', getSavedRecipient);
router.post('/recipient/:recipient_id', saveRecipient);
router.delete('/recipient/:recipient_id', deleteSavedRecipient);

router.get('/institute/id/:user_id', getSavedInstituteIds);
router.get('/institute/:user_id', getSavedInstitute);
router.post('/institute/:institute_id', saveInstitute);
router.delete('/institute/:institute_id', deleteSavedInstitute);

module.exports = router;