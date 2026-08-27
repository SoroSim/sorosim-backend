/**
 * Ledger entry types and interfaces for mock ledger state
 */

/**
 * Supported ledger entry types in Soroban
 */
export enum LedgerEntryType {
  ACCOUNT = 'account',
  CONTRACT_DATA = 'contractData',
  CONTRACT_CODE = 'contractCode',
  TRUSTLINE = 'trustline',
  OFFER = 'offer',
  DATA = 'data',
  CLAIMABLE_BALANCE = 'claimableBalance',
  LIQUIDITY_POOL = 'liquidityPool',
  CONFIG_SETTING = 'configSetting',
  TTL = 'ttl'
}

/**
 * Base interface for all ledger entries
 */
export interface BaseLedgerEntry {
  type: LedgerEntryType;
  key: string; // Unique identifier for the entry
  lastModifiedLedgerSeq?: number;
  expirationLedgerSeq?: number;
}

/**
 * Account ledger entry
 */
export interface AccountEntry extends BaseLedgerEntry {
  type: LedgerEntryType.ACCOUNT;
  accountId: string;
  balance: string; // Native balance in stroops
  sequence: string;
  numSubEntries: number;
  flags: number;
  homeDomain?: string;
  thresholds: {
    low: number;
    medium: number;
    high: number;
  };
  signers?: Array<{
    key: string;
    weight: number;
  }>;
}

/**
 * Contract data ledger entry
 */
export interface ContractDataEntry extends BaseLedgerEntry {
  type: LedgerEntryType.CONTRACT_DATA;
  contract: string; // Contract address
  key: string; // Storage key
  durability: 'temporary' | 'persistent';
  val: unknown; // ScVal value (can be complex)
}

/**
 * Contract code (WASM) ledger entry
 */
export interface ContractCodeEntry extends BaseLedgerEntry {
  type: LedgerEntryType.CONTRACT_CODE;
  hash: string; // WASM hash
  code: string; // Base64 encoded WASM bytecode
  size: number;
}

/**
 * Trustline ledger entry
 */
export interface TrustlineEntry extends BaseLedgerEntry {
  type: LedgerEntryType.TRUSTLINE;
  accountId: string;
  asset: string;
  balance: string;
  limit: string;
  flags: number;
}

/**
 * Union type for all ledger entries
 */
export type LedgerEntry = 
  | AccountEntry 
  | ContractDataEntry 
  | ContractCodeEntry 
  | TrustlineEntry 
  | BaseLedgerEntry;

/**
 * Ledger snapshot metadata
 */
export interface LedgerSnapshot {
  version: string;
  createdAt: string;
  ledgerSequence: number;
  networkPassphrase: string;
  entries: LedgerEntry[];
}
