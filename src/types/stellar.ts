/**
 * Stellar account JSON format types for interoperability
 */

/**
 * Stellar account signer
 */
export interface StellarSigner {
  key: string;
  weight: number;
  type: string;
}

/**
 * Stellar account balance/trustline
 */
export interface StellarBalance {
  balance: string;
  limit?: string;
  buying_liabilities?: string;
  selling_liabilities?: string;
  last_modified_ledger?: number;
  is_authorized?: boolean;
  is_authorized_to_maintain_liabilities?: boolean;
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}

/**
 * Stellar account data entry
 */
export interface StellarDataEntry {
  [key: string]: string;
}

/**
 * Stellar account thresholds
 */
export interface StellarThresholds {
  low_threshold: number;
  med_threshold: number;
  high_threshold: number;
}

/**
 * Stellar account flags
 */
export interface StellarFlags {
  auth_required: boolean;
  auth_revocable: boolean;
  auth_immutable: boolean;
  auth_clawback_enabled: boolean;
}

/**
 * Stellar account export format
 */
export interface StellarAccount {
  id: string;
  account_id: string;
  sequence: string;
  subentry_count: number;
  last_modified_ledger: number;
  last_modified_time?: string;
  thresholds: StellarThresholds;
  flags: StellarFlags;
  balances: StellarBalance[];
  signers: StellarSigner[];
  data: StellarDataEntry;
  num_sponsoring?: number;
  num_sponsored?: number;
  sponsor?: string;
  paging_token?: string;
}

/**
 * Stellar ledger export format
 */
export interface StellarLedgerExport {
  _links?: {
    self: { href: string };
  };
  accounts: StellarAccount[];
  ledger_sequence: number;
  network_passphrase: string;
  exported_at: string;
}
