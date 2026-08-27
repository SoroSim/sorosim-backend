import { Request, Response } from 'express';
import { getMockLedgerStore } from '../store/mockLedgerStore';

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
