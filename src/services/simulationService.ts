import {
  Keypair,
  rpc,
  TransactionBuilder,
  Operation,
  BASE_FEE,
  Address,
  nativeToScVal,
  xdr
} from '@stellar/stellar-sdk';
import { SorobanClient } from '../engine/sorobanClient';
import { SimulationRequest, SimulationResult } from '../types/simulation';

/**
 * Service for simulating Soroban contract invocations
 */
export class SimulationService {
  private sorobanClient: SorobanClient;

  constructor(sorobanClient: SorobanClient) {
    this.sorobanClient = sorobanClient;
  }

  /**
   * Simulate a contract invocation
   * 
   * @param request - Simulation request parameters
   * @returns Simulation result
   */
  async simulateInvocation(request: SimulationRequest): Promise<SimulationResult> {
    try {
      const { contractId, method, args = [], source, fee } = request;

      // Use provided source or generate a temporary keypair
      const sourceKeypair = source 
        ? Keypair.fromPublicKey(source)
        : Keypair.random();

      // Get the latest ledger for transaction construction
      const latestLedger = await this.sorobanClient.getLatestLedger();

      // Convert arguments to ScVal format
      const scValArgs = this.convertArgsToScVal(args);

      // Build the contract invocation operation
      const contractOperation = Operation.invokeContractFunction({
        contract: contractId,
        function: method,
        args: scValArgs
      });

      // Build the transaction
      const sourceAccount = await this.getSourceAccount(sourceKeypair.publicKey());
      
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: fee || BASE_FEE,
        networkPassphrase: this.sorobanClient.getNetworkPassphrase()
      })
        .addOperation(contractOperation)
        .setTimeout(30)
        .build();

      // Simulate the transaction
      const simulation = await this.sorobanClient
        .getServer()
        .simulateTransaction(transaction);

      // Parse simulation result
      return this.parseSimulationResult(simulation, latestLedger.sequence);
    } catch (error) {
      console.error('Simulation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown simulation error'
      };
    }
  }

  /**
   * Convert arguments to ScVal format
   * 
   * @param args - Array of arguments
   * @returns Array of ScVal arguments
   */
  private convertArgsToScVal(args: unknown[]): xdr.ScVal[] {
    return args.map(arg => {
      // Handle different argument types
      if (typeof arg === 'string') {
        // Check if it's an address
        try {
          Address.fromString(arg);
          return nativeToScVal(arg, { type: 'address' });
        } catch {
          // Not an address, treat as string/symbol
          return nativeToScVal(arg, { type: 'symbol' });
        }
      }
      
      if (typeof arg === 'number') {
        return nativeToScVal(arg, { type: 'u64' });
      }

      if (typeof arg === 'boolean') {
        return nativeToScVal(arg, { type: 'bool' });
      }

      // For complex types, try direct conversion
      return nativeToScVal(arg);
    });
  }

  /**
   * Get or create a source account for the transaction
   * 
   * @param publicKey - Account public key
   * @returns Account object
   */
  private async getSourceAccount(publicKey: string): Promise<{
    accountId: () => string;
    sequenceNumber: () => string;
    incrementSequenceNumber: () => void;
  }> {
    try {
      // Try to get account from network
      const server = this.sorobanClient.getServer();
      const account = await server.getAccount(publicKey);
      return account;
    } catch {
      // If account doesn't exist, create a mock account
      // This is useful for simulation without a funded account
      return {
        accountId: () => publicKey,
        sequenceNumber: () => '0',
        incrementSequenceNumber: () => {}
      };
    }
  }

  /**
   * Parse the simulation result from Soroban RPC
   * 
   * @param simulation - Raw simulation response
   * @param latestLedger - Latest ledger sequence
   * @returns Parsed simulation result
   */
  private parseSimulationResult(
    simulation: rpc.Api.SimulateTransactionResponse,
    latestLedger: number
  ): SimulationResult {
    // Check if simulation was successful
    if (rpc.Api.isSimulationSuccess(simulation)) {
      return {
        success: true,
        result: simulation.result?.retval,
        auth: simulation.result?.auth,
        events: simulation.events,
        transactionData: simulation.transactionData?.toString(),
        minResourceFee: simulation.minResourceFee,
        latestLedger
      };
    }

    // Handle simulation errors
    if (rpc.Api.isSimulationError(simulation)) {
      return {
        success: false,
        error: simulation.error,
        latestLedger
      };
    }

    // Handle restore simulation (when contract data needs restoration)
    if (rpc.Api.isSimulationRestore(simulation)) {
      return {
        success: false,
        error: 'Contract data needs restoration before invocation',
        latestLedger
      };
    }

    // Unexpected simulation result
    return {
      success: false,
      error: 'Unexpected simulation result format',
      latestLedger
    };
  }
}
