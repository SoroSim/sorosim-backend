import { Router } from 'express';
import {
  getAllAccounts,
  getAccountById,
  createOrUpdateAccount,
  createAccountWithDefaults
} from '../controllers/accountController';
import { createAccountValidation } from '../middleware/validationSchemas';
import { validate } from '../middleware/validator';

const router = Router();

/**
 * GET /api/accounts
 * Get all account entries
 */
router.get('/', getAllAccounts);

/**
 * GET /api/accounts/:accountId
 * Get account by account ID
 */
router.get('/:accountId', getAccountById);

/**
 * POST /api/accounts
 * Create or update an account entry
 */
router.post('/', validate(createAccountValidation), createOrUpdateAccount);

/**
 * POST /api/accounts/defaults
 * Create account with default values
 */
router.post('/defaults', createAccountWithDefaults);

export default router;
