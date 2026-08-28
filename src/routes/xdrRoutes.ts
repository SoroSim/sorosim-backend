import { Router } from 'express';
import {
  convertScValToJson,
  convertBatchScValToJson,
  convertSimulationResult,
  getScValTypes,
  convertJsonToScVal,
  convertBatchJsonToScVal
} from '../controllers/xdrController';

const router = Router();

/**
 * XDR conversion routes
 */

// POST /api/xdr/scval - Convert single ScVal XDR to JSON
router.post('/scval', convertScValToJson);

// POST /api/xdr/scval/batch - Convert multiple ScVal XDRs to JSON
router.post('/scval/batch', convertBatchScValToJson);

// POST /api/xdr/simulation - Convert simulation result to JSON
router.post('/simulation', convertSimulationResult);

// GET /api/xdr/types - Get supported ScVal types information
router.get('/types', getScValTypes);

// POST /api/xdr/encode - Encode JSON value to ScVal XDR
router.post('/encode', convertJsonToScVal);

// POST /api/xdr/encode/batch - Encode multiple JSON values to ScVal XDRs
router.post('/encode/batch', convertBatchJsonToScVal);

export default router;
