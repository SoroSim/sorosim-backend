import { Router } from 'express';
import {
  getAllNetworks,
  getNetworkById,
  getDefaultNetwork,
  setDefaultNetwork,
  addNetwork,
  deleteNetwork
} from '../controllers/networkController';

const router = Router();

/**
 * Network configuration routes
 */

// GET /api/networks - Get all networks
router.get('/', getAllNetworks);

// GET /api/networks/default - Get default network
router.get('/default', getDefaultNetwork);

// GET /api/networks/:id - Get network by ID
router.get('/:id', getNetworkById);

// PUT /api/networks/default/:id - Set default network
router.put('/default/:id', setDefaultNetwork);

// POST /api/networks - Add or update custom network
router.post('/', addNetwork);

// DELETE /api/networks/:id - Delete a network
router.delete('/:id', deleteNetwork);

export default router;
