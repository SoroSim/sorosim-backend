import { Router } from 'express';
import {
  getStats,
  getAllEntries,
  getEntriesByType,
  getEntry,
  createOrUpdateEntry,
  updateEntry,
  deleteEntry,
  clearStore,
  getLedgerSeq,
  setLedgerSeq,
  incrementLedgerSeq,
  exportStellarFormat,
  bulkCreateEntries
} from '../controllers/ledgerController';
import { 
  createLedgerEntryValidation, 
  paginationValidation, 
  bulkCreateLedgerEntriesValidation 
} from '../middleware/validationSchemas';
import { validate } from '../middleware/validator';

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
router.get('/entries', validate(paginationValidation), getAllEntries);

/**
 * GET /api/ledger/entries/type/:type
 * Get ledger entries by type
 */
router.get('/entries/type/:type', validate(paginationValidation), getEntriesByType);

/**
 * GET /api/ledger/entries/:key
 * Get a specific ledger entry by key
 */
router.get('/entries/:key', getEntry);

/**
 * POST /api/ledger/entries
 * Create or update a ledger entry
 */
router.post('/entries', validate(createLedgerEntryValidation), createOrUpdateEntry);

/**
 * PUT /api/ledger/entries/:key
 * Update an existing ledger entry
 */
router.put('/entries/:key', validate(createLedgerEntryValidation), updateEntry);

/**
 * DELETE /api/ledger/entries/:key
 * Delete a specific ledger entry
 */
router.delete('/entries/:key', deleteEntry);

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

/**
 * PUT /api/ledger/sequence
 * Set ledger sequence number
 */
router.put('/sequence', setLedgerSeq);

/**
 * POST /api/ledger/sequence/increment
 * Increment ledger sequence number
 */
router.post('/sequence/increment', incrementLedgerSeq);

/**
 * GET /api/ledger/export/stellar-format
 * Export ledger state in Stellar account JSON format
 */
router.get('/export/stellar-format', exportStellarFormat);

/**
 * POST /api/ledger/entries/bulk
 * Create multiple ledger entries in a single operation
 */
router.post('/entries/bulk', validate(bulkCreateLedgerEntriesValidation), bulkCreateEntries);

export default router;
