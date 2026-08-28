/**
 * Simulation report types for exporting comprehensive simulation data
 */

import { SimulationRequest, SimulationResult } from './simulation';
import { StateDiff } from './stateDiff';

/**
 * Full simulation report with all details
 */
export interface SimulationReport {
  reportId: string;
  generatedAt: string;
  version: string;
  metadata: ReportMetadata;
  simulation: SimulationDetails;
  network: NetworkDetails;
  result: SimulationResult;
  stateDiff?: StateDiff;
  performance: PerformanceMetrics;
  summary: ReportSummary;
}

/**
 * Report metadata
 */
export interface ReportMetadata {
  reportName?: string;
  description?: string;
  tags?: string[];
  sessionId?: string;
  exportedBy?: string;
  [key: string]: unknown;
}

/**
 * Simulation details
 */
export interface SimulationDetails {
  request: SimulationRequest;
  requestId: string;
  timestamp: string;
  contractId: string;
  method: string;
  args?: unknown[];
  source?: string;
  fee?: string;
}

/**
 * Network details
 */
export interface NetworkDetails {
  networkId?: string;
  networkName?: string;
  rpcUrl?: string;
  networkPassphrase?: string;
  latestLedger?: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  duration: number; // Total duration in milliseconds
  cpuInsns?: string;
  memBytes?: string;
  minResourceFee?: string;
  transactionSize?: number; // Size of transaction data in bytes
}

/**
 * Report summary
 */
export interface ReportSummary {
  success: boolean;
  hasResult: boolean;
  hasEvents: boolean;
  hasStateDiff: boolean;
  hasAuth: boolean;
  eventCount: number;
  stateChanges: number;
  authRequirements: number;
  errorMessage?: string;
}

/**
 * Batch simulation report (multiple simulations)
 */
export interface BatchSimulationReport {
  reportId: string;
  generatedAt: string;
  version: string;
  metadata: ReportMetadata;
  simulations: SimulationReport[];
  batchSummary: BatchSummary;
}

/**
 * Batch summary statistics
 */
export interface BatchSummary {
  totalSimulations: number;
  successfulSimulations: number;
  failedSimulations: number;
  totalDuration: number;
  averageDuration: number;
  uniqueContracts: number;
  uniqueMethods: number;
  totalEvents: number;
  totalStateChanges: number;
}

/**
 * Report export options
 */
export interface ReportExportOptions {
  format?: 'json' | 'pretty-json';
  includeRawData?: boolean;
  includeStateDiff?: boolean;
  includeEvents?: boolean;
  includeAuth?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Report response wrapper
 */
export interface ReportResponse {
  success: boolean;
  message: string;
  data?: SimulationReport | BatchSimulationReport;
  error?: string;
}
