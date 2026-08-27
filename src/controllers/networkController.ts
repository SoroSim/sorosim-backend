import { Request, Response } from 'express';
import { getNetworkStore } from '../store/networkStore';
import { NetworkConfig, NetworkListResponse, NetworkResponse, NetworkType } from '../types/network';

/**
 * Network configuration controller
 */

/**
 * Get all networks
 */
export const getAllNetworks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const networkStore = getNetworkStore();
    const networks = networkStore.getAllNetworks();

    res.status(200).json({
      success: true,
      count: networks.length,
      data: networks
    } as NetworkListResponse);
  } catch (error) {
    console.error('Get all networks error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as NetworkResponse);
  }
};

/**
 * Get network by ID
 */
export const getNetworkById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const networkStore = getNetworkStore();
    const network = networkStore.getNetwork(id);

    if (!network) {
      res.status(404).json({
        success: false,
        message: 'Network not found',
        error: `No network with ID: ${id}`
      } as NetworkResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: network
    } as NetworkResponse);
  } catch (error) {
    console.error('Get network error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as NetworkResponse);
  }
};

/**
 * Get default network
 */
export const getDefaultNetwork = async (_req: Request, res: Response): Promise<void> => {
  try {
    const networkStore = getNetworkStore();
    const network = networkStore.getDefaultNetwork();

    res.status(200).json({
      success: true,
      data: network
    } as NetworkResponse);
  } catch (error) {
    console.error('Get default network error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as NetworkResponse);
  }
};

/**
 * Set default network
 */
export const setDefaultNetwork = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const networkStore = getNetworkStore();

    const success = networkStore.setDefaultNetwork(id);

    if (!success) {
      res.status(404).json({
        success: false,
        message: 'Failed to set default network',
        error: `Network with ID ${id} not found`
      } as NetworkResponse);
      return;
    }

    const network = networkStore.getNetwork(id);
    res.status(200).json({
      success: true,
      message: 'Default network updated successfully',
      data: network
    } as NetworkResponse);
  } catch (error) {
    console.error('Set default network error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as NetworkResponse);
  }
};

/**
 * Add or update custom network
 */
export const addNetwork = async (req: Request, res: Response): Promise<void> => {
  try {
    const networkData = req.body as Partial<NetworkConfig>;

    // Validate required fields
    if (!networkData.id || !networkData.name || !networkData.rpcUrl || !networkData.networkPassphrase) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'id, name, rpcUrl, and networkPassphrase are required'
      } as NetworkResponse);
      return;
    }

    const networkStore = getNetworkStore();
    const network: NetworkConfig = {
      id: networkData.id,
      name: networkData.name,
      type: networkData.type || NetworkType.CUSTOM,
      rpcUrl: networkData.rpcUrl,
      networkPassphrase: networkData.networkPassphrase,
      description: networkData.description,
      isDefault: false
    };

    networkStore.addNetwork(network);

    res.status(201).json({
      success: true,
      message: 'Network added successfully',
      data: network
    } as NetworkResponse);
  } catch (error) {
    console.error('Add network error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as NetworkResponse);
  }
};

/**
 * Delete a network
 */
export const deleteNetwork = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const networkStore = getNetworkStore();

    const success = networkStore.deleteNetwork(id);

    if (!success) {
      res.status(400).json({
        success: false,
        message: 'Failed to delete network',
        error: 'Cannot delete predefined networks or the default network'
      } as NetworkResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Network deleted successfully'
    } as NetworkResponse);
  } catch (error) {
    console.error('Delete network error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as NetworkResponse);
  }
};
