import { Request, Response } from 'express';
import { StateDiffService } from '../services/stateDiffService';
import { LedgerSnapshot } from '../types/stateDiff';

/**
 * State diff controller for before/after ledger comparison
 */

/**
 * Capture current ledger state snapshot
 */
export const captureSnapshot = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stateDiffService = new StateDiffService();
    const snapshot = stateDiffService.captureSnapshot();

    res.status(200).json({
      success: true,
      message: 'Ledger snapshot captured successfully',
      data: snapshot
    });
  } catch (error) {
    console.error('Capture snapshot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture ledger snapshot',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Calculate diff between two ledger snapshots
 */
export const calculateDiff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { before, after } = req.body as { before: LedgerSnapshot; after: LedgerSnapshot };

    // Validate request
    if (!before || !after) {
      res.status(400).json({
        success: false,
        message: 'Both before and after snapshots are required',
        error: 'Missing before or after in request body'
      });
      return;
    }

    if (!before.entries || !after.entries) {
      res.status(400).json({
        success: false,
        message: 'Invalid snapshot format',
        error: 'Snapshots must include entries array'
      });
      return;
    }

    const stateDiffService = new StateDiffService();
    const diff = stateDiffService.calculateBeforeAfterDiff(before, after);

    res.status(200).json({
      success: true,
      message: 'Diff calculated successfully',
      data: {
        before: {
          timestamp: before.timestamp,
          ledgerSequence: before.ledgerSequence,
          entryCount: before.entries.length
        },
        after: {
          timestamp: after.timestamp,
          ledgerSequence: after.ledgerSequence,
          entryCount: after.entries.length
        },
        diff
      }
    });
  } catch (error) {
    console.error('Calculate diff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate diff',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Capture snapshot, perform action (via callback simulation), then calculate diff
 * This endpoint demonstrates the workflow but requires client to handle the action
 */
export const captureBeforeAfterDiff = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stateDiffService = new StateDiffService();

    // Capture before snapshot
    const beforeSnapshot = stateDiffService.captureSnapshot();

    res.status(200).json({
      success: true,
      message: 'Before snapshot captured. Perform your operations, then call POST /api/diff/calculate with both snapshots.',
      data: {
        beforeSnapshot,
        instructions: {
          step1: 'Store the returned beforeSnapshot',
          step2: 'Perform your ledger modifications or simulations',
          step3: 'Capture another snapshot with GET /api/diff/snapshot',
          step4: 'Call POST /api/diff/calculate with both snapshots to get the diff'
        }
      }
    });
  } catch (error) {
    console.error('Capture before/after diff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture snapshot',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Calculate diff between a provided snapshot and current ledger state
 */
export const diffFromSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { snapshot } = req.body as { snapshot: LedgerSnapshot };

    // Validate request
    if (!snapshot || !snapshot.entries) {
      res.status(400).json({
        success: false,
        message: 'Valid snapshot is required',
        error: 'Missing or invalid snapshot in request body'
      });
      return;
    }

    const stateDiffService = new StateDiffService();
    
    // Capture current state
    const currentSnapshot = stateDiffService.captureSnapshot();
    
    // Calculate diff
    const diff = stateDiffService.calculateBeforeAfterDiff(snapshot, currentSnapshot);

    res.status(200).json({
      success: true,
      message: 'Diff calculated successfully',
      data: {
        before: {
          timestamp: snapshot.timestamp,
          ledgerSequence: snapshot.ledgerSequence,
          entryCount: snapshot.entries.length
        },
        current: {
          timestamp: currentSnapshot.timestamp,
          ledgerSequence: currentSnapshot.ledgerSequence,
          entryCount: currentSnapshot.entries.length
        },
        diff
      }
    });
  } catch (error) {
    console.error('Diff from snapshot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate diff',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
