import { Router } from 'express';
import {
  convertScValToJson,
  convertBatchScValToJson,
  convertSimulationResult,
  getScValTypes
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

export default router;
