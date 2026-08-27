import { getMockLedgerStore } from '../store/mockLedgerStore';
import { LedgerSnapshot } from '../types/ledger';
import fs from 'fs/promises';
import path from 'path';

/**
 * Service for managing ledger snapshots
 */
export class SnapshotService {
  private snapshotsDir: string;

  constructor(snapshotsDir?: string) {
    this.snapshotsDir = snapshotsDir || path.join(process.cwd(), 'snapshots');
  }

  /**
   * Create a snapshot of the current ledger state
   * 
   * @param networkPassphrase - Network passphrase (optional)
   * @returns Ledger snapshot
   */
  createSnapshot(networkPassphrase?: string): LedgerSnapshot {
    const store = getMockLedgerStore();
    
    return {
      version: '1.0',
      createdAt: new Date().toISOString(),
      ledgerSequence: store.getCurrentLedgerSeq(),
      networkPassphrase: networkPassphrase || 'Test SDF Network ; September 2015',
      entries: store.export()
    };
  }

  /**
   * Load a snapshot into the ledger store
   * 
   * @param snapshot - Ledger snapshot to load
   * @param clearExisting - Whether to clear existing entries first
   */
  loadSnapshot(snapshot: LedgerSnapshot, clearExisting = true): void {
    const store = getMockLedgerStore();
    
    // Import entries
    store.import(snapshot.entries, clearExisting);
    
    // Set ledger sequence
    store.setLedgerSeq(snapshot.ledgerSequence);
  }

  /**
   * Save snapshot to file
   * 
   * @param snapshot - Ledger snapshot
   * @param filename - Filename (without path)
   * @returns Full file path
   */
  async saveToFile(snapshot: LedgerSnapshot, filename: string): Promise<string> {
    // Ensure snapshots directory exists
    await this.ensureSnapshotsDir();
    
    // Generate filename if not provided
    const finalFilename = filename || this.generateFilename();
    const filePath = path.join(this.snapshotsDir, finalFilename);
    
    // Write snapshot to file
    await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');
    
    return filePath;
  }

  /**
   * Load snapshot from file
   * 
   * @param filename - Filename (with or without path)
   * @returns Ledger snapshot
   */
  async loadFromFile(filename: string): Promise<LedgerSnapshot> {
    // Check if filename includes path
    const filePath = path.isAbsolute(filename) 
      ? filename 
      : path.join(this.snapshotsDir, filename);
    
    // Read and parse snapshot file
    const content = await fs.readFile(filePath, 'utf-8');
    const snapshot = JSON.parse(content) as LedgerSnapshot;
    
    // Validate snapshot structure
    this.validateSnapshot(snapshot);
    
    return snapshot;
  }

  /**
   * List all available snapshot files
   * 
   * @returns Array of snapshot file information
   */
  async listSnapshots(): Promise<Array<{
    filename: string;
    path: string;
    size: number;
    created: Date;
  }>> {
    try {
      await this.ensureSnapshotsDir();
      
      const files = await fs.readdir(this.snapshotsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      const snapshots = await Promise.all(
        jsonFiles.map(async (filename) => {
          const filePath = path.join(this.snapshotsDir, filename);
          const stats = await fs.stat(filePath);
          
          return {
            filename,
            path: filePath,
            size: stats.size,
            created: stats.birthtime
          };
        })
      );
      
      return snapshots.sort((a, b) => b.created.getTime() - a.created.getTime());
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete a snapshot file
   * 
   * @param filename - Filename to delete
   * @returns True if deleted successfully
   */
  async deleteSnapshot(filename: string): Promise<boolean> {
    try {
      const filePath = path.isAbsolute(filename)
        ? filename
        : path.join(this.snapshotsDir, filename);
      
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Export snapshot as JSON string
   * 
   * @param snapshot - Ledger snapshot
   * @param pretty - Whether to format with indentation
   * @returns JSON string
   */
  exportToJSON(snapshot: LedgerSnapshot, pretty = true): string {
    return JSON.stringify(snapshot, null, pretty ? 2 : 0);
  }

  /**
   * Import snapshot from JSON string
   * 
   * @param json - JSON string
   * @returns Ledger snapshot
   */
  importFromJSON(json: string): LedgerSnapshot {
    const snapshot = JSON.parse(json) as LedgerSnapshot;
    this.validateSnapshot(snapshot);
    return snapshot;
  }

  /**
   * Validate snapshot structure
   * 
   * @param snapshot - Snapshot to validate
   * @throws Error if snapshot is invalid
   */
  private validateSnapshot(snapshot: LedgerSnapshot): void {
    if (!snapshot.version) {
      throw new Error('Snapshot missing version');
    }
    
    if (!snapshot.createdAt) {
      throw new Error('Snapshot missing createdAt');
    }
    
    if (typeof snapshot.ledgerSequence !== 'number') {
      throw new Error('Snapshot missing or invalid ledgerSequence');
    }
    
    if (!Array.isArray(snapshot.entries)) {
      throw new Error('Snapshot missing or invalid entries array');
    }
  }

  /**
   * Ensure snapshots directory exists
   */
  private async ensureSnapshotsDir(): Promise<void> {
    try {
      await fs.access(this.snapshotsDir);
    } catch {
      await fs.mkdir(this.snapshotsDir, { recursive: true });
    }
  }

  /**
   * Generate a unique filename for snapshot
   * 
   * @returns Filename
   */
  private generateFilename(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `snapshot-${timestamp}.json`;
  }
}

// Singleton instance
let instance: SnapshotService | null = null;

/**
 * Get the singleton instance of snapshot service
 * 
 * @returns Snapshot service instance
 */
export function getSnapshotService(): SnapshotService {
  if (!instance) {
    instance = new SnapshotService();
  }
  return instance;
}
