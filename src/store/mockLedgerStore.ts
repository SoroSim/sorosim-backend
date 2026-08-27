import { 
  LedgerEntry, 
  LedgerEntryType, 
  AccountEntry, 
  ContractDataEntry, 
  ContractCodeEntry, 
  TrustlineEntry 
} from '../types/ledger';

/**
 * In-memory mock ledger store for simulating Soroban ledger state
 */
export class MockLedgerStore {
  private entries: Map<string, LedgerEntry>;
  private currentLedgerSeq: number;

  constructor() {
    this.entries = new Map();
    this.currentLedgerSeq = 1;
  }

  /**
   * Add or update a ledger entry
   * 
   * @param entry - The ledger entry to store
   * @returns The stored entry
   */
  set(entry: LedgerEntry): LedgerEntry {
    const key = this.generateKey(entry);
    const storedEntry = {
      ...entry,
      key,
      lastModifiedLedgerSeq: this.currentLedgerSeq
    };
    this.entries.set(key, storedEntry);
    return storedEntry;
  }

  /**
   * Get a ledger entry by key
   * 
   * @param key - The unique key of the entry
   * @returns The ledger entry or undefined if not found
   */
  get(key: string): LedgerEntry | undefined {
    return this.entries.get(key);
  }

  /**
   * Get a ledger entry by type and identifier
   * 
   * @param type - The entry type
   * @param identifier - Type-specific identifier
   * @returns The ledger entry or undefined if not found
   */
  getByTypeAndId(type: LedgerEntryType, identifier: string): LedgerEntry | undefined {
    const key = `${type}:${identifier}`;
    return this.entries.get(key);
  }

  /**
   * Delete a ledger entry by key
   * 
   * @param key - The unique key of the entry
   * @returns true if deleted, false if not found
   */
  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  /**
   * Get all ledger entries
   * 
   * @returns Array of all ledger entries
   */
  getAll(): LedgerEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Get all entries of a specific type
   * 
   * @param type - The entry type to filter by
   * @returns Array of matching entries
   */
  getByType(type: LedgerEntryType): LedgerEntry[] {
    return Array.from(this.entries.values()).filter(entry => entry.type === type);
  }

  /**
   * Check if an entry exists
   * 
   * @param key - The unique key of the entry
   * @returns true if exists, false otherwise
   */
  has(key: string): boolean {
    return this.entries.has(key);
  }

  /**
   * Get the total number of entries
   * 
   * @returns Number of entries in the store
   */
  size(): number {
    return this.entries.size;
  }

  /**
   * Clear all entries from the store
   */
  clear(): void {
    this.entries.clear();
    this.currentLedgerSeq = 1;
  }

  /**
   * Get the current ledger sequence number
   * 
   * @returns Current ledger sequence
   */
  getCurrentLedgerSeq(): number {
    return this.currentLedgerSeq;
  }

  /**
   * Increment the ledger sequence (simulates ledger progression)
   * 
   * @returns New ledger sequence
   */
  incrementLedgerSeq(): number {
    return ++this.currentLedgerSeq;
  }

  /**
   * Set the ledger sequence to a specific value
   * 
   * @param seq - The new ledger sequence
   */
  setLedgerSeq(seq: number): void {
    this.currentLedgerSeq = seq;
  }

  /**
   * Get store statistics
   * 
   * @returns Object with store statistics
   */
  getStats(): {
    totalEntries: number;
    currentLedgerSeq: number;
    entriesByType: Record<string, number>;
  } {
    const entriesByType: Record<string, number> = {};
    
    for (const entry of this.entries.values()) {
      entriesByType[entry.type] = (entriesByType[entry.type] || 0) + 1;
    }

    return {
      totalEntries: this.entries.size,
      currentLedgerSeq: this.currentLedgerSeq,
      entriesByType
    };
  }

  /**
   * Export all entries as a plain object array
   * 
   * @returns Array of ledger entries
   */
  export(): LedgerEntry[] {
    return this.getAll();
  }

  /**
   * Import entries from an array
   * 
   * @param entries - Array of ledger entries to import
   * @param clearExisting - Whether to clear existing entries first
   */
  import(entries: LedgerEntry[], clearExisting = false): void {
    if (clearExisting) {
      this.clear();
    }

    for (const entry of entries) {
      this.set(entry);
    }
  }

  /**
   * Generate a unique key for a ledger entry based on its type
   * 
   * @param entry - The ledger entry
   * @returns Unique key string
   */
  private generateKey(entry: LedgerEntry): string {
    switch (entry.type) {
      case LedgerEntryType.ACCOUNT:
        return `${entry.type}:${(entry as AccountEntry).accountId}`;
      case LedgerEntryType.CONTRACT_DATA:
        return `${entry.type}:${(entry as ContractDataEntry).contract}:${(entry as ContractDataEntry).storageKey}`;
      case LedgerEntryType.CONTRACT_CODE:
        return `${entry.type}:${(entry as ContractCodeEntry).hash}`;
      case LedgerEntryType.TRUSTLINE:
        return `${entry.type}:${(entry as TrustlineEntry).accountId}:${(entry as TrustlineEntry).asset}`;
      default:
        return entry.key || `${entry.type}:${Date.now()}:${Math.random()}`;
    }
  }
}

// Singleton instance for the application
let instance: MockLedgerStore | null = null;

/**
 * Get the singleton instance of the mock ledger store
 * 
 * @returns The mock ledger store instance
 */
export function getMockLedgerStore(): MockLedgerStore {
  if (!instance) {
    instance = new MockLedgerStore();
  }
  return instance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetMockLedgerStore(): void {
  instance = new MockLedgerStore();
}
