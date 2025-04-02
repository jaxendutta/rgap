import { Router } from "express";
const router = Router();

import {
  getFundingComparisons,
  getGrantHistogram,
} from "../controllers/analyticsController.js";

// Funding comparisons endpoint
router.get('/funding-comparisons', getFundingComparisons);

// Histogram endpoint
router.get('/grant-histogram', getGrantHistogram);

export default router;

