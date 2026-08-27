import { NetworkConfig, NetworkType } from '../types/network';

/**
 * Network configuration store
 */
export class NetworkStore {
  private networks: Map<string, NetworkConfig>;
  private defaultNetworkId: string;

  constructor() {
    this.networks = new Map();
    this.defaultNetworkId = 'testnet';
    
    // Initialize with predefined networks
    this.initializePredefinedNetworks();
  }

  /**
   * Initialize predefined Stellar networks
   */
  private initializePredefinedNetworks(): void {
    const predefinedNetworks: NetworkConfig[] = [
      {
        id: 'testnet',
        name: 'Stellar Testnet',
        type: NetworkType.TESTNET,
        rpcUrl: 'https://soroban-testnet.stellar.org',
        networkPassphrase: 'Test SDF Network ; September 2015',
        description: 'Official Stellar testnet for development and testing',
        isDefault: true
      },
      {
        id: 'futurenet',
        name: 'Stellar Futurenet',
        type: NetworkType.FUTURENET,
        rpcUrl: 'https://rpc-futurenet.stellar.org',
        networkPassphrase: 'Test SDF Future Network ; October 2022',
        description: 'Experimental network for testing upcoming features'
      },
      {
        id: 'mainnet',
        name: 'Stellar Mainnet',
        type: NetworkType.MAINNET,
        rpcUrl: 'https://mainnet.stellar.validationcloud.io/v1',
        networkPassphrase: 'Public Global Stellar Network ; September 2015',
        description: 'Production Stellar mainnet - use with caution'
      }
    ];

    predefinedNetworks.forEach(network => {
      this.networks.set(network.id, network);
    });
  }

  /**
   * Get all networks
   */
  getAllNetworks(): NetworkConfig[] {
    return Array.from(this.networks.values());
  }

  /**
   * Get network by ID
   */
  getNetwork(id: string): NetworkConfig | undefined {
    return this.networks.get(id);
  }

  /**
   * Get default network
   */
  getDefaultNetwork(): NetworkConfig {
    const network = this.networks.get(this.defaultNetworkId);
    if (!network) {
      throw new Error('Default network not found');
    }
    return network;
  }

  /**
   * Set default network
   */
  setDefaultNetwork(id: string): boolean {
    if (!this.networks.has(id)) {
      return false;
    }

    // Update isDefault flag
    this.networks.forEach((network, networkId) => {
      network.isDefault = networkId === id;
    });

    this.defaultNetworkId = id;
    return true;
  }

  /**
   * Add or update custom network
   */
  addNetwork(network: NetworkConfig): void {
    // Ensure type is CUSTOM for user-added networks
    if (!['testnet', 'futurenet', 'mainnet'].includes(network.id)) {
      network.type = NetworkType.CUSTOM;
    }

    this.networks.set(network.id, network);
  }

  /**
   * Delete a network (cannot delete predefined networks)
   */
  deleteNetwork(id: string): boolean {
    // Prevent deletion of predefined networks
    if (['testnet', 'futurenet', 'mainnet'].includes(id)) {
      return false;
    }

    // Prevent deletion of default network
    if (id === this.defaultNetworkId) {
      return false;
    }

    return this.networks.delete(id);
  }

  /**
   * Check if network exists
   */
  hasNetwork(id: string): boolean {
    return this.networks.has(id);
  }

  /**
   * Get network count
   */
  getNetworkCount(): number {
    return this.networks.size;
  }

  /**
   * Get networks by type
   */
  getNetworksByType(type: NetworkType): NetworkConfig[] {
    return Array.from(this.networks.values()).filter(
      network => network.type === type
    );
  }
}

// Singleton instance
let networkStoreInstance: NetworkStore | null = null;

/**
 * Get or create network store singleton
 */
export function getNetworkStore(): NetworkStore {
  if (!networkStoreInstance) {
    networkStoreInstance = new NetworkStore();
  }
  return networkStoreInstance;
}

export default NetworkStore;
