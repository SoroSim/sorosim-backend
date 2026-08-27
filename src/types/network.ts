/**
 * Network configuration types
 */

/**
 * Predefined network configurations
 */
export enum NetworkType {
  TESTNET = 'testnet',
  FUTURENET = 'futurenet',
  MAINNET = 'mainnet',
  CUSTOM = 'custom'
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  id: string;
  name: string;
  type: NetworkType;
  rpcUrl: string;
  networkPassphrase: string;
  description?: string;
  isDefault?: boolean;
}

/**
 * Network list response
 */
export interface NetworkListResponse {
  success: boolean;
  count: number;
  data: NetworkConfig[];
}

/**
 * Network response
 */
export interface NetworkResponse {
  success: boolean;
  message?: string;
  data?: NetworkConfig;
  error?: string;
}
