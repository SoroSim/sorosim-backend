import { Request, Response } from 'express';
import { getMockLedgerStore } from '../store/mockLedgerStore';
import { LedgerEntry, LedgerEntryType } from '../types/ledger';
import { validateLedgerEntry } from '../utils/ledgerValidation';

/**
 * Ledger store management controller
 */

/**
 * Get store statistics
 */
export const getStats = (_req: Request, res: Response): void => {
  try {
    const store = getMockLedgerStore();
    const stats = store.getStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve store statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all ledger entries
 */
export const getAllEntries = (_req: Request, res: Response): void => {
  try {
    const store = getMockLedgerStore();
    const entries = store.getAll();

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ledger entries',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get entries by type
 */
export const getEntriesByType = (req: Request, res: Response): void => {
  try {
    const { type } = req.params;
    
    // Validate type
    if (!Object.values(LedgerEntryType).includes(type as LedgerEntryType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid ledger entry type',
        error: `Type must be one of: ${Object.values(LedgerEntryType).join(', ')}`
      });
      return;
    }

    const store = getMockLedgerStore();
    const entries = store.getByType(type as LedgerEntryType);

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ledger entries by type',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get a specific ledger entry by key
 */
export const getEntry = (req: Request, res: Response): void => {
  try {
    const { key } = req.params;
    const store = getMockLedgerStore();
    const entry = store.get(key);

    if (!entry) {
      res.status(404).json({
        success: false,
        message: 'Ledger entry not found',
        key
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ledger entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create or update a ledger entry
 */
export const createOrUpdateEntry = (req: Request, res: Response): void => {
  try {
    const entry = req.body as LedgerEntry;

    // Validate entry has required fields
    if (!entry.type) {
      res.status(400).json({
        success: false,
        message: 'Ledger entry type is required',
        error: 'Missing type field in request body'
      });
      return;
    }

    // Validate type
    if (!Object.values(LedgerEntryType).includes(entry.type)) {
      res.status(400).json({
        success: false,
        message: 'Invalid ledger entry type',
        error: `Type must be one of: ${Object.values(LedgerEntryType).join(', ')}`
      });
      return;
    }

    // Validate entry based on type
    const validation = validateLedgerEntry(entry);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: 'Ledger entry validation failed',
        errors: validation.errors
      });
      return;
    }

    const store = getMockLedgerStore();
    const storedEntry = store.set(entry);

    res.status(201).json({
      success: true,
      message: 'Ledger entry created/updated successfully',
      data: storedEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create/update ledger entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update an existing ledger entry
 */
export const updateEntry = (req: Request, res: Response): void => {
  try {
    const { key } = req.params;
    const updates = req.body;

    const store = getMockLedgerStore();
    const existingEntry = store.get(key);

    if (!existingEntry) {
      res.status(404).json({
        success: false,
        message: 'Ledger entry not found',
        key
      });
      return;
    }

    // Merge updates with existing entry
    const updatedEntry = {
      ...existingEntry,
      ...updates,
      key: existingEntry.key, // Preserve the original key
      type: existingEntry.type // Preserve the original type
    };

    const storedEntry = store.set(updatedEntry);

    res.status(200).json({
      success: true,
      message: 'Ledger entry updated successfully',
      data: storedEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update ledger entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete a specific ledger entry
 */
export const deleteEntry = (req: Request, res: Response): void => {
  try {
    const { key } = req.params;
    const store = getMockLedgerStore();
    
    const deleted = store.delete(key);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Ledger entry not found',
        key
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Ledger entry deleted successfully',
      key
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete ledger entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Clear all ledger entries
 */
export const clearStore = (_req: Request, res: Response): void => {
  try {
    const store = getMockLedgerStore();
    store.clear();

    res.status(200).json({
      success: true,
      message: 'Ledger store cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear ledger store',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get current ledger sequence
 */
export const getLedgerSeq = (_req: Request, res: Response): void => {
  try {
    const store = getMockLedgerStore();
    const sequence = store.getCurrentLedgerSeq();

    res.status(200).json({
      success: true,
      data: {
        currentLedgerSeq: sequence
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ledger sequence',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Set ledger sequence
 */
export const setLedgerSeq = (req: Request, res: Response): void => {
  try {
    const { sequence } = req.body;

    if (typeof sequence !== 'number' || sequence < 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid ledger sequence',
        error: 'Sequence must be a non-negative number'
      });
      return;
    }

    const store = getMockLedgerStore();
    store.setLedgerSeq(sequence);

    res.status(200).json({
      success: true,
      message: 'Ledger sequence updated successfully',
      data: {
        currentLedgerSeq: sequence
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to set ledger sequence',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Increment ledger sequence
 */
export const incrementLedgerSeq = (_req: Request, res: Response): void => {
  try {
    const store = getMockLedgerStore();
    const newSequence = store.incrementLedgerSeq();

    res.status(200).json({
      success: true,
      message: 'Ledger sequence incremented successfully',
      data: {
        currentLedgerSeq: newSequence
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to increment ledger sequence',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
