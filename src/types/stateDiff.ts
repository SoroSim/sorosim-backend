/**
 * State diff types for tracking ledger changes during simulation
 */

/**
 * Type of state change
 */
export enum StateChangeType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  UNCHANGED = 'unchanged'
}

/**
 * Individual ledger entry change
 */
export interface LedgerEntryChange {
  key: string;
  type: string; // Ledger entry type
  changeType: StateChangeType;
  before?: unknown; // State before simulation
  after?: unknown; // State after simulation
  diff?: Record<string, {
    before: unknown;
    after: unknown;
  }>;
}

/**
 * Contract storage change
 */
export interface StorageChange {
  contract: string;
  key: string;
  durability: 'temporary' | 'persistent';
  changeType: StateChangeType;
  before?: unknown;
  after?: unknown;
}

/**
 * Account balance change
 */
export interface BalanceChange {
  accountId: string;
  assetType: 'native' | 'credit';
  asset?: string;
  changeType: StateChangeType;
  before?: string;
  after?: string;
  delta?: string; // Calculated difference
}

/**
 * Contract event from simulation
 */
export interface ContractEvent {
  type: string;
  contractId?: string;
  topics: unknown[];
  data: unknown;
}

/**
 * Ledger snapshot for before/after comparison
 */
export interface LedgerSnapshot {
  timestamp: string;
  ledgerSequence: number;
  entries: Array<{
    key: string;
    type: string;
    [key: string]: unknown;
  }>; // Array of LedgerEntry objects with at least key and type
}

/**
 * Structured state diff result
 */
export interface StateDiff {
  ledgerEntryChanges: LedgerEntryChange[];
  storageChanges: StorageChange[];
  balanceChanges: BalanceChange[];
  events: ContractEvent[];
  summary: {
    totalChanges: number;
    entriesCreated: number;
    entriesUpdated: number;
    entriesDeleted: number;
    eventsEmitted: number;
  };
}

/**
 * Footprint from simulation - tracks which ledger entries were read/written
 */
export interface SimulationFootprint {
  readOnly: string[]; // Ledger entries that were read
  readWrite: string[]; // Ledger entries that were read and written
}
