import { Request, Response } from 'express';
import { getMockLedgerStore } from '../store/mockLedgerStore';
import { AccountEntry, LedgerEntryType } from '../types/ledger';
import { validateAccountEntry, createDefaultAccountEntry } from '../utils/ledgerValidation';

/**
 * Account-specific ledger entry controller
 */

/**
 * Get all account entries
 */
export const getAllAccounts = (_req: Request, res: Response): void => {
  try {
    const store = getMockLedgerStore();
    const accounts = store.getByType(LedgerEntryType.ACCOUNT);

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve accounts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get account by account ID
 */
export const getAccountById = (req: Request, res: Response): void => {
  try {
    const { accountId } = req.params;
    const store = getMockLedgerStore();
    const account = store.getByTypeAndId(LedgerEntryType.ACCOUNT, accountId);

    if (!account) {
      res.status(404).json({
        success: false,
        message: 'Account not found',
        accountId
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve account',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create or update account entry
 */
export const createOrUpdateAccount = (req: Request, res: Response): void => {
  try {
    const accountData = req.body as Partial<AccountEntry>;

    // Set type
    accountData.type = LedgerEntryType.ACCOUNT;

    // Validate
    const validation = validateAccountEntry(accountData);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: 'Account validation failed',
        errors: validation.errors
      });
      return;
    }

    const store = getMockLedgerStore();
    const account = store.set(accountData as AccountEntry);

    res.status(201).json({
      success: true,
      message: 'Account created/updated successfully',
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create/update account',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create account with defaults
 */
export const createAccountWithDefaults = (req: Request, res: Response): void => {
  try {
    const { accountId } = req.body;

    if (!accountId) {
      res.status(400).json({
        success: false,
        message: 'accountId is required'
      });
      return;
    }

    const account = createDefaultAccountEntry(accountId);
    
    // Merge with any additional fields from request
    const finalAccount = {
      ...account,
      ...req.body,
      type: LedgerEntryType.ACCOUNT,
      accountId // Ensure accountId is not overwritten
    };

    const store = getMockLedgerStore();
    const storedAccount = store.set(finalAccount as AccountEntry);

    res.status(201).json({
      success: true,
      message: 'Account created with defaults',
      data: storedAccount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create account',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
