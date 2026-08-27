import { Request, Response } from 'express';
import { SorobanClient } from '../engine/sorobanClient';
import { SimulationService } from '../services/simulationService';
import { SimulationRequest, SimulationResponse } from '../types/simulation';
import { getSessionStore } from '../store/sessionStore';
import { v4 as uuidv4 } from 'uuid';

/**
 * Simulation controller
 */

// Create singleton simulation service
let simulationService: SimulationService | null = null;

function getSimulationService(): SimulationService {
  if (!simulationService) {
    const sorobanClient = new SorobanClient();
    simulationService = new SimulationService(sorobanClient);
  }
  return simulationService;
}

/**
 * Simulate a contract invocation
 */
export const simulateInvocation = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const requestBody = req.body as SimulationRequest;
    const { sessionId } = req.query; // Optional session ID

    // Validate request
    if (!requestBody.contractId) {
      res.status(400).json({
        success: false,
        message: 'Contract ID is required',
        error: 'Missing contractId in request body'
      } as SimulationResponse);
      return;
    }

    if (!requestBody.method) {
      res.status(400).json({
        success: false,
        message: 'Method name is required',
        error: 'Missing method in request body'
      } as SimulationResponse);
      return;
    }

    // Generate request ID for tracking
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    // Execute simulation
    const service = getSimulationService();
    const result = await service.simulateInvocation(requestBody);

    // Add state diff if simulation was successful
    if (result.success && !result.error) {
      result.stateDiff = service.getStateDiff(result);
    }

    // Calculate duration
    const duration = Date.now() - startTime;

    // Log to session if session ID provided
    if (sessionId && typeof sessionId === 'string') {
      const sessionStore = getSessionStore();
      
      if (sessionStore.hasSession(sessionId)) {
        sessionStore.addInvocation(sessionId, {
          timestamp,
          requestId,
          contractId: requestBody.contractId,
          method: requestBody.method,
          args: requestBody.args,
          result,
          duration
        });
      }
    }

    // Return result
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Simulation completed successfully',
        data: result,
        requestId,
        timestamp,
        duration,
        sessionId: sessionId as string | undefined
      } as SimulationResponse);
    } else {
      res.status(400).json({
        success: false,
        message: 'Simulation failed',
        error: result.error,
        requestId,
        timestamp,
        duration
      } as SimulationResponse);
    }
  } catch (error) {
    console.error('Simulation controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during simulation',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    } as SimulationResponse);
  }
};
