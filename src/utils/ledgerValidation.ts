/**
 * Validation utilities for ledger entries
 */

import {
  LedgerEntry,
  LedgerEntryType,
  AccountEntry,
  ContractDataEntry,
  ContractCodeEntry,
  TrustlineEntry
} from '../types/ledger';

/**
 * Validation result
 */
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate account entry
 */
export function validateAccountEntry(entry: Partial<AccountEntry>): ValidationResult {
  const errors: string[] = [];

  if (!entry.accountId) {
    errors.push('accountId is required');
  }

  if (!entry.balance) {
    errors.push('balance is required');
  } else if (!/^\d+$/.test(entry.balance)) {
    errors.push('balance must be a numeric string (stroops)');
  }

  if (!entry.sequence) {
    errors.push('sequence is required');
  } else if (!/^\d+$/.test(entry.sequence)) {
    errors.push('sequence must be a numeric string');
  }

  if (entry.numSubEntries === undefined) {
    errors.push('numSubEntries is required');
  } else if (typeof entry.numSubEntries !== 'number' || entry.numSubEntries < 0) {
    errors.push('numSubEntries must be a non-negative number');
  }

  if (entry.flags === undefined) {
    errors.push('flags is required');
  } else if (typeof entry.flags !== 'number') {
    errors.push('flags must be a number');
  }

  if (!entry.thresholds) {
    errors.push('thresholds is required');
  } else {
    if (typeof entry.thresholds.low !== 'number') {
      errors.push('thresholds.low must be a number');
    }
    if (typeof entry.thresholds.medium !== 'number') {
      errors.push('thresholds.medium must be a number');
    }
    if (typeof entry.thresholds.high !== 'number') {
      errors.push('thresholds.high must be a number');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate contract data entry
 */
export function validateContractDataEntry(entry: Partial<ContractDataEntry>): ValidationResult {
  const errors: string[] = [];

  if (!entry.contract) {
    errors.push('contract address is required');
  }

  if (!entry.storageKey) {
    errors.push('storageKey is required');
  }

  if (!entry.durability) {
    errors.push('durability is required');
  } else if (entry.durability !== 'temporary' && entry.durability !== 'persistent') {
    errors.push('durability must be either "temporary" or "persistent"');
  }

  if (entry.val === undefined) {
    errors.push('val (value) is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate contract code entry
 */
export function validateContractCodeEntry(entry: Partial<ContractCodeEntry>): ValidationResult {
  const errors: string[] = [];

  if (!entry.hash) {
    errors.push('hash is required');
  }

  if (!entry.code) {
    errors.push('code (base64 WASM) is required');
  }

  if (!entry.size) {
    errors.push('size is required');
  } else if (typeof entry.size !== 'number' || entry.size <= 0) {
    errors.push('size must be a positive number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate trustline entry
 */
export function validateTrustlineEntry(entry: Partial<TrustlineEntry>): ValidationResult {
  const errors: string[] = [];

  if (!entry.accountId) {
    errors.push('accountId is required');
  }

  if (!entry.asset) {
    errors.push('asset is required');
  }

  if (!entry.balance) {
    errors.push('balance is required');
  } else if (!/^\d+$/.test(entry.balance)) {
    errors.push('balance must be a numeric string');
  }

  if (!entry.limit) {
    errors.push('limit is required');
  } else if (!/^\d+$/.test(entry.limit)) {
    errors.push('limit must be a numeric string');
  }

  if (entry.flags === undefined) {
    errors.push('flags is required');
  } else if (typeof entry.flags !== 'number') {
    errors.push('flags must be a number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate ledger entry based on its type
 */
export function validateLedgerEntry(entry: Partial<LedgerEntry>): ValidationResult {
  if (!entry.type) {
    return {
      valid: false,
      errors: ['type is required']
    };
  }

  switch (entry.type) {
    case LedgerEntryType.ACCOUNT:
      return validateAccountEntry(entry as Partial<AccountEntry>);
    case LedgerEntryType.CONTRACT_DATA:
      return validateContractDataEntry(entry as Partial<ContractDataEntry>);
    case LedgerEntryType.CONTRACT_CODE:
      return validateContractCodeEntry(entry as Partial<ContractCodeEntry>);
    case LedgerEntryType.TRUSTLINE:
      return validateTrustlineEntry(entry as Partial<TrustlineEntry>);
    default:
      // For other types, just check that type exists
      return {
        valid: true,
        errors: []
      };
  }
}

/**
 * Create a default account entry
 */
export function createDefaultAccountEntry(accountId: string): AccountEntry {
  return {
    type: LedgerEntryType.ACCOUNT,
    key: `${LedgerEntryType.ACCOUNT}:${accountId}`,
    accountId,
    balance: '0',
    sequence: '0',
    numSubEntries: 0,
    flags: 0,
    thresholds: {
      low: 1,
      medium: 1,
      high: 1
    }
  };
}

/**
 * Create a default contract data entry
 */
export function createDefaultContractDataEntry(contract: string, storageKey: string): ContractDataEntry {
  return {
    type: LedgerEntryType.CONTRACT_DATA,
    key: `${LedgerEntryType.CONTRACT_DATA}:${contract}:${storageKey}`,
    contract,
    storageKey,
    durability: 'persistent',
    val: null
  };
}

/**
 * Create a default contract code entry
 */
export function createDefaultContractCodeEntry(hash: string, code: string): ContractCodeEntry {
  return {
    type: LedgerEntryType.CONTRACT_CODE,
    key: `${LedgerEntryType.CONTRACT_CODE}:${hash}`,
    hash,
    code,
    size: Buffer.from(code, 'base64').length
  };
}
