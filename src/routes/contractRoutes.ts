import { Router } from 'express';
import {
  getAllContractData,
  getAllContractCode,
  createOrUpdateContractData,
  createOrUpdateContractCode,
  createContractDataWithDefaults,
  createContractCodeWithDefaults
} from '../controllers/contractController';

const router = Router();

/**
 * Contract Data Routes
 */

/**
 * GET /api/contracts/data
 * Get all contract data entries
 */
router.get('/data', getAllContractData);

/**
 * POST /api/contracts/data
 * Create or update a contract data entry
 */
router.post('/data', createOrUpdateContractData);

/**
 * POST /api/contracts/data/defaults
 * Create contract data entry with defaults
 */
router.post('/data/defaults', createContractDataWithDefaults);

/**
 * Contract Code Routes
 */

/**
 * GET /api/contracts/code
 * Get all contract code entries
 */
router.get('/code', getAllContractCode);

/**
 * POST /api/contracts/code
 * Create or update a contract code entry
 */
router.post('/code', createOrUpdateContractCode);

/**
 * POST /api/contracts/code/defaults
 * Create contract code entry with defaults
 */
router.post('/code/defaults', createContractCodeWithDefaults);

export default router;
