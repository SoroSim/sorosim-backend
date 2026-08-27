import { Router } from 'express';
import {
  getStats,
  getAllEntries,
  getEntry,
  clearStore,
  getLedgerSeq
} from '../controllers/ledgerController';

const router = Router();

/**
 * GET /api/ledger/stats
 * Get ledger store statistics
 */
router.get('/stats', getStats);

/**
 * GET /api/ledger/entries
 * Get all ledger entries
 */
router.get('/entries', getAllEntries);

/**
 * GET /api/ledger/entries/:key
 * Get a specific ledger entry by key
 */
router.get('/entries/:key', getEntry);

/**
 * DELETE /api/ledger/clear
 * Clear all ledger entries
 */
router.delete('/clear', clearStore);

/**
 * GET /api/ledger/sequence
 * Get current ledger sequence number
 */
router.get('/sequence', getLedgerSeq);

export default router;
