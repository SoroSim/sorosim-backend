import { Router } from 'express';
import {
  exportSimulationReport,
  exportSessionReport,
  exportBatchReport
} from '../controllers/reportController';

const router = Router();

/**
 * Simulation report routes
 */

// POST /api/reports/simulation - Export a single simulation report
router.post('/simulation', exportSimulationReport);

// POST /api/reports/session/:sessionId - Export all simulations from a session as batch report
router.post('/session/:sessionId', exportSessionReport);

// POST /api/reports/batch - Export multiple simulations as batch report
router.post('/batch', exportBatchReport);

export default router;
