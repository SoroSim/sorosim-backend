import { Request, Response } from 'express';
import { ReportService } from '../services/reportService';
import { SimulationRequest, SimulationResult } from '../types/simulation';
import { ReportExportOptions } from '../types/report';
import { getSessionStore } from '../store/sessionStore';
import { getNetworkStore } from '../store/networkStore';

/**
 * Report generation controller
 */

/**
 * Generate and export a simulation report
 */
export const exportSimulationReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      request,
      result,
      requestId,
      timestamp,
      duration,
      networkId,
      options
    } = req.body as {
      request: SimulationRequest;
      result: SimulationResult;
      requestId: string;
      timestamp: string;
      duration: number;
      networkId?: string;
      options?: ReportExportOptions;
    };

    // Validate required fields
    if (!request || !result || !requestId || !timestamp) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'request, result, requestId, and timestamp are required'
      });
      return;
    }

    // Get network config if networkId provided
    let network;
    if (networkId) {
      const networkStore = getNetworkStore();
      network = networkStore.getNetwork(networkId);
    }

    const reportService = new ReportService();
    const report = reportService.generateReport(
      request,
      result,
      requestId,
      timestamp,
      duration || 0,
      network,
      options
    );

    // Format based on options
    const pretty = options?.format === 'pretty-json';
    const jsonReport = reportService.formatAsJson(report, pretty);

    // Return as JSON or downloadable file
    if (req.query.download === 'true') {
      const filename = reportService.getFilename(report);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(jsonReport);
    } else {
      res.status(200).json({
        success: true,
        message: 'Simulation report generated successfully',
        data: report
      });
    }
  } catch (error) {
    console.error('Export simulation report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate simulation report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Generate and export a batch report from session
 */
export const exportSessionReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const options = req.body.options as ReportExportOptions | undefined;

    // Validate session ID
    if (!sessionId) {
      res.status(400).json({
        success: false,
        message: 'Session ID is required',
        error: 'Missing sessionId in request'
      });
      return;
    }

    const sessionStore = getSessionStore();
    
    // Check if session exists
    if (!sessionStore.hasSession(sessionId)) {
      res.status(404).json({
        success: false,
        message: 'Session not found',
        error: `No session with ID: ${sessionId}`
      });
      return;
    }

    // Get session with invocations
    const session = sessionStore.getSession(sessionId);
    const invocations = sessionStore.getInvocations(sessionId);

    if (!invocations || invocations.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No invocations in session',
        error: 'Session has no simulation invocations to export'
      });
      return;
    }

    // Build metadata from session
    const metadata = {
      sessionId,
      sessionName: session?.metadata?.name,
      sessionDescription: session?.metadata?.description,
      sessionTags: session?.metadata?.tags,
      sessionCreatedAt: session?.createdAt,
      networkPassphrase: session?.networkPassphrase
    };

    const reportService = new ReportService();
    const batchReport = reportService.generateBatchReport(invocations, metadata, options);

    // Format based on options
    const pretty = options?.format === 'pretty-json';
    const jsonReport = reportService.formatAsJson(batchReport, pretty);

    // Return as JSON or downloadable file
    if (req.query.download === 'true') {
      const filename = `session-${sessionId}-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(jsonReport);
    } else {
      res.status(200).json({
        success: true,
        message: 'Session report generated successfully',
        data: batchReport
      });
    }
  } catch (error) {
    console.error('Export session report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate session report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Generate and export a batch report from multiple simulations
 */
export const exportBatchReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { simulations, metadata, options } = req.body as {
      simulations: Array<{
        request: SimulationRequest;
        result: SimulationResult;
        requestId: string;
        timestamp: string;
        duration?: number;
      }>;
      metadata?: Record<string, unknown>;
      options?: ReportExportOptions;
    };

    // Validate simulations array
    if (!simulations || !Array.isArray(simulations) || simulations.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Simulations array is required',
        error: 'Missing or empty simulations array in request body'
      });
      return;
    }

    // Convert to invocation format
    const invocations = simulations.map(sim => ({
      timestamp: sim.timestamp,
      requestId: sim.requestId,
      contractId: sim.request.contractId,
      method: sim.request.method,
      args: sim.request.args,
      result: sim.result,
      duration: sim.duration
    }));

    const reportService = new ReportService();
    const batchReport = reportService.generateBatchReport(invocations, metadata, options);

    // Format based on options
    const pretty = options?.format === 'pretty-json';
    const jsonReport = reportService.formatAsJson(batchReport, pretty);

    // Return as JSON or downloadable file
    if (req.query.download === 'true') {
      const filename = reportService.getFilename(batchReport);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(jsonReport);
    } else {
      res.status(200).json({
        success: true,
        message: 'Batch report generated successfully',
        data: batchReport
      });
    }
  } catch (error) {
    console.error('Export batch report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate batch report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
