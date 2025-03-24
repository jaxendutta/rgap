// server/routes/saveRoutes.js
import { Router } from "express";
const router = Router();

import {
    saveGrant,
    deleteSavedGrant,
    getSavedGrant,
    getSavedGrantIds,
    saveRecipient,
    deleteSavedRecipient,
    getSavedRecipient,
    getSavedRecipientIds,
    saveInstitute,
    deleteSavedInstitute,
    getSavedInstitute,
    getSavedInstituteIds,
} from "../controllers/saveController.js";

router.get("/grant/id/:user_id", getSavedGrantIds);
router.get("/grant/:user_id", getSavedGrant);
router.post("/grant/:ref_number", saveGrant);
router.delete("/grant/delete/:ref_number", deleteSavedGrant);

router.get("/recipient/id/:user_id", getSavedRecipientIds);
router.get("/recipient/:user_id", getSavedRecipient);
router.post("/recipient/:recipient_id", saveRecipient);
router.delete("/recipient/:recipient_id", deleteSavedRecipient);

router.get("/institute/id/:user_id", getSavedInstituteIds);
router.get("/institute/:user_id", getSavedInstitute);
router.post("/institute/:institute_id", saveInstitute);
router.delete("/institute/:institute_id", deleteSavedInstitute);

export default router;
