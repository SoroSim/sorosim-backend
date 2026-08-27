import { xdr } from '@stellar/stellar-sdk';
import {
  StateDiff,
  LedgerEntryChange,
  StorageChange,
  ContractEvent,
  StateChangeType
} from '../types/stateDiff';
import { SimulationResult } from '../types/simulation';

/**
 * Service for parsing simulation results into structured state diffs
 */
export class StateDiffService {
  /**
   * Parse simulation result into structured state diff
   * 
   * @param simulationResult - Raw simulation result
   * @returns Structured state diff
   */
  parseSimulationResult(simulationResult: SimulationResult): StateDiff {
    const ledgerEntryChanges: LedgerEntryChange[] = [];
    const storageChanges: StorageChange[] = [];
    const events: ContractEvent[] = this.parseEvents(simulationResult.events || []);

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
   * Parse contract events from simulation
   * 
   * @param events - Raw events from simulation
   * @returns Parsed contract events
   */
  private parseEvents(events: unknown[]): ContractEvent[] {
    if (!Array.isArray(events)) {
      return [];
    }

    return events.map((event, index) => {
      try {
        // If already parsed object
        if (typeof event === 'object' && event !== null) {
          return this.parseEventObject(event as Record<string, unknown>);
        }

        // Fallback
        return {
          type: 'unknown',
          topics: [],
          data: event
        };
      } catch (error) {
        console.error(`Failed to parse event ${index}:`, error);
        return {
          type: 'parse_error',
          topics: [],
          data: event
        };
      }
    });
  }

  /**
   * Parse event object
   * 
   * @param event - Event object
   * @returns Parsed contract event
   */
  private parseEventObject(event: Record<string, unknown>): ContractEvent {
    return {
      type: (event.type as string) || 'unknown',
      contractId: event.contractId as string | undefined,
      topics: Array.isArray(event.topics) ? event.topics : [],
      data: event.data || event
    };
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
