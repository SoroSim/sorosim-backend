import { xdr } from '@stellar/stellar-sdk';
import {
  StateDiff,
  LedgerEntryChange,
  StorageChange,
  BalanceChange,
  ContractEvent,
  StateChangeType,
  LedgerSnapshot
} from '../types/stateDiff';
import { SimulationResult } from '../types/simulation';
import { getMockLedgerStore } from '../store/mockLedgerStore';
import { EventExtractor } from './eventExtractor';

/**
 * Simplified entry type for snapshots
 */
type SnapshotEntry = {
  key: string;
  type: string;
  [key: string]: unknown;
};

/**
 * Service for parsing simulation results into structured state diffs
 */
export class StateDiffService {
  private eventExtractor: EventExtractor;

  constructor() {
    this.eventExtractor = new EventExtractor();
  }
  /**
   * Calculate before/after diff for ledger state changes
   * 
   * @param beforeSnapshot - Ledger state before simulation
   * @param afterSnapshot - Ledger state after simulation
   * @returns Detailed state diff with before/after values
   */
  calculateBeforeAfterDiff(beforeSnapshot: LedgerSnapshot, afterSnapshot: LedgerSnapshot): StateDiff {
    const ledgerEntryChanges: LedgerEntryChange[] = [];
    const storageChanges: StorageChange[] = [];
    const balanceChanges: BalanceChange[] = [];

    const beforeKeys = new Set(beforeSnapshot.entries.map(e => e.key));
    const afterKeys = new Set(afterSnapshot.entries.map(e => e.key));

    // Build maps for efficient lookup
    const beforeMap = new Map<string, SnapshotEntry>(beforeSnapshot.entries.map(e => [e.key, e]));
    const afterMap = new Map<string, SnapshotEntry>(afterSnapshot.entries.map(e => [e.key, e]));

    // Find created entries (in after but not in before)
    for (const key of afterKeys) {
      if (!beforeKeys.has(key)) {
        const afterEntry = afterMap.get(key)!;
        ledgerEntryChanges.push({
          key,
          type: afterEntry.type,
          changeType: StateChangeType.CREATED,
          before: undefined,
          after: afterEntry,
          diff: undefined
        });

        // Add to storage changes if contract data
        if (afterEntry.type === 'contractData') {
          storageChanges.push(this.createStorageChangeFromEntry(afterEntry, StateChangeType.CREATED));
        }
      }
    }

    // Find deleted entries (in before but not in after)
    for (const key of beforeKeys) {
      if (!afterKeys.has(key)) {
        const beforeEntry = beforeMap.get(key)!;
        ledgerEntryChanges.push({
          key,
          type: beforeEntry.type,
          changeType: StateChangeType.DELETED,
          before: beforeEntry,
          after: undefined,
          diff: undefined
        });

        // Add to storage changes if contract data
        if (beforeEntry.type === 'contractData') {
          storageChanges.push(this.createStorageChangeFromEntry(beforeEntry, StateChangeType.DELETED));
        }
      }
    }

    // Find updated entries (in both but different)
    for (const key of beforeKeys) {
      if (afterKeys.has(key)) {
        const beforeEntry = beforeMap.get(key)!;
        const afterEntry = afterMap.get(key)!;

        const diff = this.computeEntryDiff(beforeEntry, afterEntry);
        
        if (diff && Object.keys(diff).length > 0) {
          ledgerEntryChanges.push({
            key,
            type: beforeEntry.type,
            changeType: StateChangeType.UPDATED,
            before: beforeEntry,
            after: afterEntry,
            diff
          });

          // Add to storage changes if contract data
          if (beforeEntry.type === 'contractData') {
            storageChanges.push(this.createStorageChangeFromEntry(afterEntry, StateChangeType.UPDATED, beforeEntry));
          }

          // Add to balance changes if account
          if (beforeEntry.type === 'account' && 'balance' in beforeEntry && 'balance' in afterEntry) {
            const balanceChange = this.computeBalanceChange(beforeEntry, afterEntry);
            if (balanceChange) {
              balanceChanges.push(balanceChange);
            }
          }
        }
      }
    }

    // Calculate summary
    const summary = {
      totalChanges: ledgerEntryChanges.length,
      entriesCreated: ledgerEntryChanges.filter(c => c.changeType === StateChangeType.CREATED).length,
      entriesUpdated: ledgerEntryChanges.filter(c => c.changeType === StateChangeType.UPDATED).length,
      entriesDeleted: ledgerEntryChanges.filter(c => c.changeType === StateChangeType.DELETED).length,
      eventsEmitted: 0 // No events in before/after comparison
    };

    return {
      ledgerEntryChanges,
      storageChanges,
      balanceChanges,
      events: [],
      summary
    };
  }

  /**
   * Create a snapshot of current ledger state
   * 
   * @returns Ledger snapshot
   */
  captureSnapshot(): LedgerSnapshot {
    const store = getMockLedgerStore();
    const entries = store.getAll();
    
    // Convert to snapshot format
    const snapshotEntries = entries.map(entry => ({
      ...entry,
      key: entry.key,
      type: entry.type
    }));

    return {
      timestamp: new Date().toISOString(),
      ledgerSequence: store.getCurrentLedgerSeq(),
      entries: snapshotEntries
    };
  }

  /**
   * Compute differences between two ledger entries
   * 
   * @param before - Entry before change
   * @param after - Entry after change
   * @returns Object with field-level differences
   */
  private computeEntryDiff(
    before: SnapshotEntry,
    after: SnapshotEntry
  ): Record<string, { before: unknown; after: unknown }> | undefined {
    const diff: Record<string, { before: unknown; after: unknown }> = {};

    // Compare all enumerable properties
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

    for (const key of allKeys) {
      // Skip the key field itself and metadata
      if (key === 'key' || key === 'lastModifiedLedgerSeq') {
        continue;
      }

      const beforeVal = before[key];
      const afterVal = after[key];

      // Deep comparison for objects
      if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
        diff[key] = {
          before: beforeVal,
          after: afterVal
        };
      }
    }

    return Object.keys(diff).length > 0 ? diff : undefined;
  }

  /**
   * Create storage change from ledger entry
   * 
   * @param entry - Ledger entry
   * @param changeType - Type of change
   * @param beforeEntry - Previous entry state (for updates)
   * @returns Storage change
   */
  private createStorageChangeFromEntry(
    entry: SnapshotEntry,
    changeType: StateChangeType,
    beforeEntry?: SnapshotEntry
  ): StorageChange {
    return {
      contract: (entry.contract as string) || 'unknown',
      key: entry.key,
      durability: (entry.durability as 'temporary' | 'persistent') || 'persistent',
      changeType,
      before: beforeEntry ? beforeEntry.value : undefined,
      after: entry.value
    };
  }

  /**
   * Compute balance change between two account entries
   * 
   * @param before - Account before change
   * @param after - Account after change
   * @returns Balance change or undefined if no change
   */
  private computeBalanceChange(before: SnapshotEntry, after: SnapshotEntry): BalanceChange | undefined {
    const beforeBalance = before.balance as string;
    const afterBalance = after.balance as string;
    
    if (beforeBalance === afterBalance) {
      return undefined;
    }

    const beforeBalanceBigInt = BigInt(beforeBalance || '0');
    const afterBalanceBigInt = BigInt(afterBalance || '0');
    const delta = afterBalanceBigInt - beforeBalanceBigInt;

    return {
      accountId: after.accountId as string,
      assetType: 'native',
      changeType: StateChangeType.UPDATED,
      before: beforeBalance,
      after: afterBalance,
      delta: delta.toString()
    };
  }
  /**
   * Parse simulation result into structured state diff
   * 
   * @param simulationResult - Raw simulation result
   * @returns Structured state diff
   */
  parseSimulationResult(simulationResult: SimulationResult): StateDiff {
    const ledgerEntryChanges: LedgerEntryChange[] = [];
    const storageChanges: StorageChange[] = [];
    
    // Extract and parse events using EventExtractor
    const events: ContractEvent[] = this.eventExtractor.extractEvents(simulationResult.events || []);

    // Parse footprint to identify changed entries
    if (simulationResult.transactionData) {
      try {
        const footprint = this.parseFootprint(simulationResult.transactionData);
        
        // Process read-write entries (these are the ones that changed)
        for (const entryKey of footprint.readWrite) {
          const change = this.createLedgerEntryChange(entryKey, StateChangeType.UPDATED);
          ledgerEntryChanges.push(change);
          
          // If it's a contract data entry, add to storage changes
          if (this.isContractDataEntry(entryKey)) {
            const storageChange = this.createStorageChange(entryKey, StateChangeType.UPDATED);
            if (storageChange) {
              storageChanges.push(storageChange);
            }
          }
        }
      } catch (error) {
        console.error('Failed to parse footprint:', error);
      }
    }

    // Calculate summary statistics
    const summary = {
      totalChanges: ledgerEntryChanges.length,
      entriesCreated: ledgerEntryChanges.filter(c => c.changeType === StateChangeType.CREATED).length,
      entriesUpdated: ledgerEntryChanges.filter(c => c.changeType === StateChangeType.UPDATED).length,
      entriesDeleted: ledgerEntryChanges.filter(c => c.changeType === StateChangeType.DELETED).length,
      eventsEmitted: events.length
    };

    return {
      ledgerEntryChanges,
      storageChanges,
      balanceChanges: [], // Balance changes require more context
      events,
      summary
    };
  }

  /**
   * Get event extractor instance for advanced event operations
   * 
   * @returns Event extractor
   */
  getEventExtractor(): EventExtractor {
    return this.eventExtractor;
  }

  /**
   * Parse footprint from transaction data
   * 
   * @param transactionData - XDR transaction data string
   * @returns Footprint with read-only and read-write entries
   */
  private parseFootprint(transactionData: string): { readOnly: string[]; readWrite: string[] } {
    try {
      const sorobanData = xdr.SorobanTransactionData.fromXDR(transactionData, 'base64');
      
      // Access footprint through the XDR structure
      const readOnly: string[] = [];
      const readWrite: string[] = [];

      // Try to extract footprint data
      // The exact API may vary by SDK version
      try {
        const footprintXdr = sorobanData.toXDR('base64');
        readWrite.push(footprintXdr);
      } catch {
        // Fallback - mark as having changes
        readWrite.push('footprint:changed');
      }

      return { readOnly, readWrite };
    } catch (error) {
      console.error('Failed to parse footprint:', error);
      return { readOnly: [], readWrite: [] };
    }
  }

  /**
   * Create ledger entry change record
   * 
   * @param entryKey - Ledger entry key
   * @param changeType - Type of change
   * @returns Ledger entry change
   */
  private createLedgerEntryChange(entryKey: string, changeType: StateChangeType): LedgerEntryChange {
    const [type] = entryKey.split(':');
    
    return {
      key: entryKey,
      type,
      changeType,
      before: undefined, // Would need to query mock ledger store
      after: undefined // Would need to query mock ledger store after simulation
    };
  }

  /**
   * Check if entry is a contract data entry
   * 
   * @param entryKey - Ledger entry key
   * @returns True if contract data entry
   */
  private isContractDataEntry(entryKey: string): boolean {
    return entryKey.startsWith('scvContractData:') || entryKey.includes('ContractData') || entryKey.includes('footprint');
  }

  /**
   * Create storage change record
   * 
   * @param entryKey - Ledger entry key
   * @param changeType - Type of change
   * @returns Storage change or null
   */
  private createStorageChange(entryKey: string, changeType: StateChangeType): StorageChange | null {
    try {
      // Parse contract data from entry key
      // This is a simplified version - actual implementation would decode XDR
      return {
        contract: 'unknown', // Would extract from XDR
        key: entryKey,
        durability: 'persistent',
        changeType,
        before: undefined,
        after: undefined
      };
    } catch {
      return null;
    }
  }
}
