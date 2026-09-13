import { getMockLedgerStore } from '../store/mockLedgerStore';
import { getNetworkStore } from '../store/networkStore';
import { AccountEntry, LedgerEntryType, TrustlineEntry } from '../types/ledger';
import {
  StellarAccount,
  StellarBalance,
  StellarLedgerExport,
  StellarSigner,
  StellarDataEntry,
  StellarThresholds,
  StellarFlags
} from '../types/stellar';

/**
 * Service for exporting ledger state to Stellar account JSON format
 */
export class StellarExportService {
  /**
   * Export all accounts in Stellar JSON format
   * 
   * @returns Stellar ledger export
   */
  exportLedgerState(): StellarLedgerExport {
    const store = getMockLedgerStore();
    const networkStore = getNetworkStore();
    const network = networkStore.getDefaultNetwork();

    // Get all account entries
    const accountEntries = store.getByType(LedgerEntryType.ACCOUNT) as AccountEntry[];
    
    // Get all trustline entries for mapping to accounts
    const trustlineEntries = store.getByType(LedgerEntryType.TRUSTLINE) as TrustlineEntry[];
    
    // Group trustlines by account
    const trustlinesByAccount = new Map<string, TrustlineEntry[]>();
    for (const trustline of trustlineEntries) {
      const existing = trustlinesByAccount.get(trustline.accountId) || [];
      existing.push(trustline);
      trustlinesByAccount.set(trustline.accountId, existing);
    }

    // Convert each account to Stellar format
    const stellarAccounts = accountEntries.map(account => 
      this.convertAccountToStellarFormat(account, trustlinesByAccount.get(account.accountId) || [])
    );

    return {
      accounts: stellarAccounts,
      ledger_sequence: store.getCurrentLedgerSeq(),
      network_passphrase: network.networkPassphrase,
      exported_at: new Date().toISOString()
    };
  }

  /**
   * Convert an account entry to Stellar account format
   * 
   * @param account - Account ledger entry
   * @param trustlines - Associated trustlines
   * @returns Stellar account object
   */
  private convertAccountToStellarFormat(
    account: AccountEntry,
    trustlines: TrustlineEntry[]
  ): StellarAccount {
    // Build balances array (native + trustlines)
    const balances: StellarBalance[] = [];

    // Add native balance
    balances.push({
      balance: this.stroopsToLumens(account.balance),
      asset_type: 'native',
      buying_liabilities: '0.0000000',
      selling_liabilities: '0.0000000'
    });

    // Add trustline balances
    for (const trustline of trustlines) {
      balances.push(this.convertTrustlineToBalance(trustline));
    }

    // Convert signers
    const signers: StellarSigner[] = account.signers?.map(signer => ({
      key: signer.key,
      weight: signer.weight,
      type: this.determineSignerType(signer.key)
    })) || [];

    // Add account itself as master signer if not already present
    if (!signers.find(s => s.key === account.accountId)) {
      signers.push({
        key: account.accountId,
        weight: 1,
        type: 'ed25519_public_key'
      });
    }

    // Build thresholds
    const thresholds: StellarThresholds = {
      low_threshold: account.thresholds.low,
      med_threshold: account.thresholds.medium,
      high_threshold: account.thresholds.high
    };

    // Parse flags
    const flags: StellarFlags = this.parseAccountFlags(account.flags);

    // Build data entries (empty for now, can be extended)
    const data: StellarDataEntry = {};

    return {
      id: account.accountId,
      account_id: account.accountId,
      sequence: account.sequence,
      subentry_count: account.numSubEntries,
      last_modified_ledger: account.lastModifiedLedgerSeq || 0,
      last_modified_time: new Date().toISOString(),
      thresholds,
      flags,
      balances,
      signers,
      data,
      paging_token: account.accountId
    };
  }

  /**
   * Convert trustline entry to Stellar balance format
   * 
   * @param trustline - Trustline entry
   * @returns Stellar balance object
   */
  private convertTrustlineToBalance(trustline: TrustlineEntry): StellarBalance {
    // Parse asset from format "CODE:ISSUER"
    const [assetCode, assetIssuer] = trustline.asset.split(':');

    return {
      balance: trustline.balance,
      limit: trustline.limit,
      buying_liabilities: '0.0000000',
      selling_liabilities: '0.0000000',
      last_modified_ledger: trustline.lastModifiedLedgerSeq,
      is_authorized: (trustline.flags & 1) === 1,
      is_authorized_to_maintain_liabilities: (trustline.flags & 2) === 2,
      asset_type: assetCode.length <= 4 ? 'credit_alphanum4' : 'credit_alphanum12',
      asset_code: assetCode,
      asset_issuer: assetIssuer
    };
  }

  /**
   * Convert stroops (smallest unit) to lumens (XLM)
   * 
   * @param stroops - Amount in stroops
   * @returns Amount in lumens as string
   */
  private stroopsToLumens(stroops: string): string {
    const stroopsNum = BigInt(stroops);
    const lumens = Number(stroopsNum) / 10000000;
    return lumens.toFixed(7);
  }

  /**
   * Determine signer type from key format
   * 
   * @param key - Signer key
   * @returns Signer type
   */
  private determineSignerType(key: string): string {
    if (key.startsWith('G')) {
      return 'ed25519_public_key';
    }
    if (key.startsWith('X')) {
      return 'sha256_hash';
    }
    if (key.startsWith('T')) {
      return 'preauth_tx';
    }
    return 'ed25519_public_key'; // Default
  }

  /**
   * Parse account flags from numeric value
   * 
   * @param flags - Numeric flags value
   * @returns Stellar flags object
   */
  private parseAccountFlags(flags: number): StellarFlags {
    return {
      auth_required: (flags & 1) === 1,
      auth_revocable: (flags & 2) === 2,
      auth_immutable: (flags & 4) === 4,
      auth_clawback_enabled: (flags & 8) === 8
    };
  }
}
