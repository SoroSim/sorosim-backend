import { Request, Response } from 'express';
import { getMockLedgerStore } from '../store/mockLedgerStore';
import { ContractDataEntry, ContractCodeEntry, LedgerEntryType } from '../types/ledger';
import {
  validateContractDataEntry,
  validateContractCodeEntry,
  createDefaultContractDataEntry,
  createDefaultContractCodeEntry
} from '../utils/ledgerValidation';

/**
 * Contract-specific ledger entry controllers
 */

/**
 * Get all contract data entries
 */
export const getAllContractData = (_req: Request, res: Response): void => {
  try {
    const store = getMockLedgerStore();
    const entries = store.getByType(LedgerEntryType.CONTRACT_DATA);

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contract data entries',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all contract code entries
 */
export const getAllContractCode = (_req: Request, res: Response): void => {
  try {
    const store = getMockLedgerStore();
    const entries = store.getByType(LedgerEntryType.CONTRACT_CODE);

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contract code entries',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create or update contract data entry
 */
export const createOrUpdateContractData = (req: Request, res: Response): void => {
  try {
    const entryData = req.body as Partial<ContractDataEntry>;

    // Set type
    entryData.type = LedgerEntryType.CONTRACT_DATA;

    // Validate
    const validation = validateContractDataEntry(entryData);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: 'Contract data validation failed',
        errors: validation.errors
      });
      return;
    }

    const store = getMockLedgerStore();
    const entry = store.set(entryData as ContractDataEntry);

    res.status(201).json({
      success: true,
      message: 'Contract data entry created/updated successfully',
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create/update contract data entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create or update contract code entry
 */
export const createOrUpdateContractCode = (req: Request, res: Response): void => {
  try {
    const entryData = req.body as Partial<ContractCodeEntry>;

    // Set type
    entryData.type = LedgerEntryType.CONTRACT_CODE;

    // Validate
    const validation = validateContractCodeEntry(entryData);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: 'Contract code validation failed',
        errors: validation.errors
      });
      return;
    }

    const store = getMockLedgerStore();
    const entry = store.set(entryData as ContractCodeEntry);

    res.status(201).json({
      success: true,
      message: 'Contract code entry created/updated successfully',
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create/update contract code entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create contract data with defaults
 */
export const createContractDataWithDefaults = (req: Request, res: Response): void => {
  try {
    const { contract, storageKey } = req.body;

    if (!contract || !storageKey) {
      res.status(400).json({
        success: false,
        message: 'contract and storageKey are required'
      });
      return;
    }

    const entry = createDefaultContractDataEntry(contract, storageKey);
    
    // Merge with any additional fields from request
    const finalEntry = {
      ...entry,
      ...req.body,
      type: LedgerEntryType.CONTRACT_DATA,
      contract, // Ensure contract is not overwritten
      storageKey // Ensure storageKey is not overwritten
    };

    const store = getMockLedgerStore();
    const storedEntry = store.set(finalEntry as ContractDataEntry);

    res.status(201).json({
      success: true,
      message: 'Contract data entry created with defaults',
      data: storedEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create contract data entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create contract code with defaults
 */
export const createContractCodeWithDefaults = (req: Request, res: Response): void => {
  try {
    const { hash, code } = req.body;

    if (!hash || !code) {
      res.status(400).json({
        success: false,
        message: 'hash and code are required'
      });
      return;
    }

    const entry = createDefaultContractCodeEntry(hash, code);
    
    // Merge with any additional fields from request
    const finalEntry = {
      ...entry,
      ...req.body,
      type: LedgerEntryType.CONTRACT_CODE,
      hash, // Ensure hash is not overwritten
      code // Ensure code is not overwritten
    };

    const store = getMockLedgerStore();
    const storedEntry = store.set(finalEntry as ContractCodeEntry);

    res.status(201).json({
      success: true,
      message: 'Contract code entry created with defaults',
      data: storedEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create contract code entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
