import { rpc, TransactionBuilder, Networks, Contract, xdr } from '@stellar/stellar-sdk';

/**
 * Soroban RPC client wrapper for contract simulation
 */
export class SorobanClient {
  private server: rpc.Server;
  private networkPassphrase: string;

  constructor(rpcUrl?: string, networkPassphrase?: string) {
    this.server = new rpc.Server(
      rpcUrl || process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'
    );
    this.networkPassphrase = networkPassphrase || Networks.TESTNET;
  }

  /**
   * Get the RPC server instance
   */
  getServer(): rpc.Server {
    return this.server;
  }

  /**
   * Get the network passphrase
   */
  getNetworkPassphrase(): string {
    return this.networkPassphrase;
  }

  /**
   * Get the latest ledger information
   */
  async getLatestLedger(): Promise<rpc.Api.GetLatestLedgerResponse> {
    return await this.server.getLatestLedger();
  }

  /**
   * Get network information
   */
  async getNetwork(): Promise<rpc.Api.GetNetworkResponse> {
    return await this.server.getNetwork();
  }

  /**
   * Get contract data entry
   */
  async getContractData(contractId: string, key: xdr.ScVal, durability?: rpc.Durability): Promise<rpc.Api.LedgerEntryResult> {
    const contract = new Contract(contractId);
    return await this.server.getContractData(contract.address(), key, durability);
  }

  /**
   * Simulate a transaction
   */
  async simulateTransaction(transaction: string): Promise<rpc.Api.SimulateTransactionResponse> {
    const tx = TransactionBuilder.fromXDR(transaction, this.networkPassphrase);
    return await this.server.simulateTransaction(tx);
  }

  /**
   * Check server health
   */
  async checkHealth(): Promise<boolean> {
    try {
      await this.server.getHealth();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default SorobanClient;
