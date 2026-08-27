import { Router } from 'express';
import {
  captureSnapshot,
  calculateDiff,
  captureBeforeAfterDiff,
  diffFromSnapshot
} from '../controllers/diffController';

const router = Router();

/**
 * State diff routes for before/after ledger comparison
 */

// GET /api/diff/snapshot - Capture current ledger state snapshot
router.get('/snapshot', captureSnapshot);

// POST /api/diff/calculate - Calculate diff between two snapshots
router.post('/calculate', calculateDiff);

// GET /api/diff/before - Capture before snapshot (helper for workflow)
router.get('/before', captureBeforeAfterDiff);

// POST /api/diff/from-snapshot - Calculate diff from a snapshot to current state
router.post('/from-snapshot', diffFromSnapshot);

export default router;
