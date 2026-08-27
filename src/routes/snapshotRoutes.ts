import { Router } from 'express';
import {
  createSnapshot,
  saveSnapshot,
  loadSnapshot,
  loadSnapshotFromJSON,
  listSnapshots,
  deleteSnapshot,
  exportSnapshot
} from '../controllers/snapshotController';

const router = Router();

/**
 * GET /api/snapshots
 * List all available snapshot files
 */
router.get('/', listSnapshots);

/**
 * POST /api/snapshots/create
 * Create a snapshot of current ledger state (returns JSON)
 */
router.post('/create', createSnapshot);

/**
 * POST /api/snapshots/save
 * Save current ledger state to file
 */
router.post('/save', saveSnapshot);

/**
 * POST /api/snapshots/load
 * Load snapshot from file
 */
router.post('/load', loadSnapshot);

/**
 * POST /api/snapshots/import
 * Load snapshot from JSON body
 */
router.post('/import', loadSnapshotFromJSON);

/**
 * GET /api/snapshots/export
 * Export current ledger state as downloadable JSON
 */
router.get('/export', exportSnapshot);

/**
 * DELETE /api/snapshots/:filename
 * Delete a snapshot file
 */
router.delete('/:filename', deleteSnapshot);

export default router;
