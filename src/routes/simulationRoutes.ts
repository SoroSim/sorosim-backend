import { Router } from 'express';
import { simulateInvocation } from '../controllers/simulationController';

const router = Router();

/**
 * POST /api/simulate
 * Simulate a Soroban contract invocation
 * 
 * @body contractId - Contract address
 * @body method - Contract function name
 * @body args - Array of function arguments (optional)
 * @body source - Source account public key (optional)
 * @body fee - Transaction fee in stroops (optional)
 * @returns Simulation result
 */
router.post('/', simulateInvocation);

export default router;
