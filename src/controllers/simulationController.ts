import { Request, Response } from 'express';
import { SorobanClient } from '../engine/sorobanClient';
import { SimulationService } from '../services/simulationService';
import { SimulationRequest, SimulationResponse } from '../types/simulation';
import { getSessionStore } from '../store/sessionStore';
import { getNetworkStore } from '../store/networkStore';
import { v4 as uuidv4 } from 'uuid';

/**
 * Simulation controller
 */

/**
 * Get simulation service with network configuration
 */
function getSimulationService(networkId?: string): SimulationService {
  const networkStore = getNetworkStore();
  
  // Get network config - use provided networkId or default
  const network = networkId 
    ? networkStore.getNetwork(networkId) || networkStore.getDefaultNetwork()
    : networkStore.getDefaultNetwork();

  const sorobanClient = SorobanClient.fromNetworkConfig(network);
  return new SimulationService(sorobanClient);
}

/**
 * Simulate a contract invocation
 */
export const simulateInvocation = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const requestBody = req.body as SimulationRequest;
    const { sessionId, networkId } = req.query; // Optional session ID and network ID

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

    // Validate network if provided
    if (networkId && typeof networkId === 'string') {
      const networkStore = getNetworkStore();
      if (!networkStore.hasNetwork(networkId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid network ID',
          error: `Network with ID '${networkId}' not found`
        } as SimulationResponse);
        return;
      }
    }

    // Generate request ID for tracking
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    // Execute simulation with specified or default network
    const service = getSimulationService(networkId as string | undefined);
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
