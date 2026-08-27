/**
 * Simulation request and response types
 */

import { StateDiff } from './stateDiff';

/**
 * Simulation request parameters
 */
export interface SimulationRequest {
  contractId: string;
  method: string;
  args?: unknown[];
  source?: string; // Source account (optional)
  fee?: string; // Transaction fee in stroops (optional)
}

/**
 * Simulation cost breakdown
 */
export interface SimulationCost {
  cpuInsns: string;
  memBytes: string;
  // Add more cost fields as needed
}

/**
 * Simulation result from RPC
 */
export interface SimulationResult {
  success: boolean;
  result?: unknown; // Contract invocation result
  auth?: unknown[]; // Authorization requirements
  events?: unknown[]; // Contract events
  transactionData?: string; // XDR transaction data
  minResourceFee?: string; // Minimum resource fee
  cost?: SimulationCost; // Resource consumption
  latestLedger?: number; // Latest ledger sequence
  error?: string; // Error message if failed
  stateDiff?: StateDiff; // Parsed state changes
}

/**
 * Simulation response wrapper
 */
export interface SimulationResponse {
  success: boolean;
  message: string;
  data?: SimulationResult;
  error?: string;
  requestId?: string;
  timestamp?: string;
}
