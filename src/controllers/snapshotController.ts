import { Request, Response } from 'express';
import { getSnapshotService } from '../services/snapshotService';
import { LedgerSnapshot } from '../types/ledger';

/**
 * Snapshot controller for ledger state persistence
 */

/**
 * Create a snapshot of current ledger state
 */
export const createSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { networkPassphrase } = req.body;
    const service = getSnapshotService();
    
    const snapshot = service.createSnapshot(networkPassphrase);
    
    res.status(200).json({
      success: true,
      message: 'Snapshot created successfully',
      data: snapshot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create snapshot',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Save current ledger state to file
 */
export const saveSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename, networkPassphrase } = req.body;
    const service = getSnapshotService();
    
    // Create snapshot
    const snapshot = service.createSnapshot(networkPassphrase);
    
    // Save to file
    const filePath = await service.saveToFile(snapshot, filename);
    
    res.status(200).json({
      success: true,
      message: 'Snapshot saved to file successfully',
      data: {
        filePath,
        snapshot
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save snapshot',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Load snapshot from file
 */
export const loadSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename, clearExisting } = req.body;
    
    if (!filename) {
      res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
      return;
    }
    
    const service = getSnapshotService();
    
    // Load snapshot from file
    const snapshot = await service.loadFromFile(filename);
    
    // Load into store
    service.loadSnapshot(snapshot, clearExisting !== false);
    
    res.status(200).json({
      success: true,
      message: 'Snapshot loaded successfully',
      data: {
        entriesLoaded: snapshot.entries.length,
        ledgerSequence: snapshot.ledgerSequence,
        createdAt: snapshot.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load snapshot',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Load snapshot from JSON body
 */
export const loadSnapshotFromJSON = async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = req.body as LedgerSnapshot;
    const { clearExisting } = req.query;
    
    const service = getSnapshotService();
    
    // Validate and load snapshot
    service.loadSnapshot(snapshot, clearExisting !== 'false');
    
    res.status(200).json({
      success: true,
      message: 'Snapshot loaded successfully',
      data: {
        entriesLoaded: snapshot.entries.length,
        ledgerSequence: snapshot.ledgerSequence
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load snapshot',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * List all available snapshots
 */
export const listSnapshots = async (_req: Request, res: Response): Promise<void> => {
  try {
    const service = getSnapshotService();
    const snapshots = await service.listSnapshots();
    
    res.status(200).json({
      success: true,
      count: snapshots.length,
      data: snapshots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to list snapshots',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete a snapshot file
 */
export const deleteSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
      return;
    }
    
    const service = getSnapshotService();
    const deleted = await service.deleteSnapshot(filename);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Snapshot file not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Snapshot deleted successfully',
      filename
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete snapshot',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Export snapshot as downloadable JSON
 */
export const exportSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { networkPassphrase } = req.query;
    const service = getSnapshotService();
    
    const snapshot = service.createSnapshot(networkPassphrase as string);
    const json = service.exportToJSON(snapshot, true);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="ledger-snapshot-${Date.now()}.json"`);
    
    res.status(200).send(json);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export snapshot',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
