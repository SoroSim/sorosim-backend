import { v4 as uuidv4 } from 'uuid';
import {
  SimulationReport,
  BatchSimulationReport,
  ReportExportOptions,
  ReportMetadata,
  SimulationDetails,
  NetworkDetails,
  PerformanceMetrics,
  ReportSummary,
  BatchSummary
} from '../types/report';
import { SimulationRequest, SimulationResult } from '../types/simulation';
import { SimulationInvocation } from '../types/session';
import { NetworkConfig } from '../types/network';

/**
 * Service for generating simulation reports
 */
export class ReportService {
  private readonly REPORT_VERSION = '1.0.0';

  /**
   * Generate a comprehensive simulation report
   * 
   * @param request - Original simulation request
   * @param result - Simulation result
   * @param requestId - Request ID for tracking
   * @param timestamp - Timestamp of simulation
   * @param duration - Duration in milliseconds
   * @param network - Network configuration used
   * @param options - Export options
   * @returns Complete simulation report
   */
  generateReport(
    request: SimulationRequest,
    result: SimulationResult,
    requestId: string,
    timestamp: string,
    duration: number,
    network?: NetworkConfig,
    options?: ReportExportOptions
  ): SimulationReport {
    const reportId = uuidv4();
    const generatedAt = new Date().toISOString();

    // Build metadata
    const metadata: ReportMetadata = {
      ...options?.metadata
    };

    // Build simulation details
    const simulation: SimulationDetails = {
      request,
      requestId,
      timestamp,
      contractId: request.contractId,
      method: request.method,
      args: request.args,
      source: request.source,
      fee: request.fee
    };

    // Build network details
    const networkDetails: NetworkDetails = network ? {
      networkId: network.id,
      networkName: network.name,
      rpcUrl: network.rpcUrl,
      networkPassphrase: network.networkPassphrase,
      latestLedger: result.latestLedger
    } : {
      latestLedger: result.latestLedger
    };

    // Build performance metrics
    const performance: PerformanceMetrics = {
      duration,
      cpuInsns: result.cost?.cpuInsns,
      memBytes: result.cost?.memBytes,
      minResourceFee: result.minResourceFee,
      transactionSize: result.transactionData ? result.transactionData.length : undefined
    };

    // Build summary
    const summary: ReportSummary = {
      success: result.success,
      hasResult: !!result.result,
      hasEvents: !!(result.events && result.events.length > 0),
      hasStateDiff: !!result.stateDiff,
      hasAuth: !!(result.auth && result.auth.length > 0),
      eventCount: result.events?.length || 0,
      stateChanges: result.stateDiff?.summary?.totalChanges || 0,
      authRequirements: result.auth?.length || 0,
      errorMessage: result.error
    };

    // Filter result based on options
    const filteredResult = this.filterResult(result, options);

    return {
      reportId,
      generatedAt,
      version: this.REPORT_VERSION,
      metadata,
      simulation,
      network: networkDetails,
      result: filteredResult,
      stateDiff: options?.includeStateDiff !== false ? result.stateDiff : undefined,
      performance,
      summary
    };
  }

  /**
   * Generate a batch report from multiple simulations
   * 
   * @param invocations - Array of simulation invocations
   * @param metadata - Report metadata
   * @param options - Export options
   * @returns Batch simulation report
   */
  generateBatchReport(
    invocations: SimulationInvocation[],
    metadata?: ReportMetadata,
    options?: ReportExportOptions
  ): BatchSimulationReport {
    const reportId = uuidv4();
    const generatedAt = new Date().toISOString();

    // Generate individual reports
    const simulations = invocations.map(invocation => 
      this.generateReport(
        {
          contractId: invocation.contractId,
          method: invocation.method,
          args: invocation.args
        },
        invocation.result,
        invocation.requestId,
        invocation.timestamp,
        invocation.duration || 0,
        undefined,
        options
      )
    );

    // Calculate batch summary
    const batchSummary = this.calculateBatchSummary(simulations);

    return {
      reportId,
      generatedAt,
      version: this.REPORT_VERSION,
      metadata: metadata || {},
      simulations,
      batchSummary
    };
  }

  /**
   * Filter simulation result based on export options
   * 
   * @param result - Original simulation result
   * @param options - Export options
   * @returns Filtered result
   */
  private filterResult(result: SimulationResult, options?: ReportExportOptions): SimulationResult {
    const filtered: SimulationResult = { ...result };

    // Remove events if not included
    if (options?.includeEvents === false) {
      delete filtered.events;
    }

    // Remove auth if not included
    if (options?.includeAuth === false) {
      delete filtered.auth;
    }

    // Remove state diff if not included
    if (options?.includeStateDiff === false) {
      delete filtered.stateDiff;
    }

    // Remove raw data if not included
    if (options?.includeRawData === false) {
      delete filtered.transactionData;
    }

    return filtered;
  }

  /**
   * Calculate batch summary statistics
   * 
   * @param reports - Array of simulation reports
   * @returns Batch summary
   */
  private calculateBatchSummary(reports: SimulationReport[]): BatchSummary {
    const successfulSimulations = reports.filter(r => r.summary.success).length;
    const totalDuration = reports.reduce((sum, r) => sum + r.performance.duration, 0);
    
    // Get unique contracts and methods
    const uniqueContracts = new Set(reports.map(r => r.simulation.contractId));
    const uniqueMethods = new Set(reports.map(r => r.simulation.method));
    
    // Sum events and state changes
    const totalEvents = reports.reduce((sum, r) => sum + r.summary.eventCount, 0);
    const totalStateChanges = reports.reduce((sum, r) => sum + r.summary.stateChanges, 0);

    return {
      totalSimulations: reports.length,
      successfulSimulations,
      failedSimulations: reports.length - successfulSimulations,
      totalDuration,
      averageDuration: reports.length > 0 ? totalDuration / reports.length : 0,
      uniqueContracts: uniqueContracts.size,
      uniqueMethods: uniqueMethods.size,
      totalEvents,
      totalStateChanges
    };
  }

  /**
   * Format report as JSON string
   * 
   * @param report - Simulation report or batch report
   * @param pretty - Whether to pretty-print JSON
   * @returns JSON string
   */
  formatAsJson(report: SimulationReport | BatchSimulationReport, pretty = false): string {
    return JSON.stringify(report, null, pretty ? 2 : 0);
  }

  /**
   * Get report filename suggestion
   * 
   * @param report - Simulation report
   * @returns Suggested filename
   */
  getFilename(report: SimulationReport | BatchSimulationReport): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    if ('simulations' in report) {
      // Batch report
      return `batch-simulation-report-${timestamp}.json`;
    } else {
      // Single report
      const contractShort = report.simulation.contractId.substring(0, 8);
      const method = report.simulation.method;
      return `simulation-${contractShort}-${method}-${timestamp}.json`;
    }
  }
}
