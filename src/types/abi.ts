/**
 * Contract ABI (Application Binary Interface) types
 */

/**
 * Function parameter
 */
export interface FunctionParameter {
  name?: string;
  type: string;
}

/**
 * Contract function definition
 */
export interface ContractFunction {
  name: string;
  parameters: FunctionParameter[];
  returnType?: string;
  isExported: boolean;
}

/**
 * Contract ABI
 */
export interface ContractABI {
  functions: ContractFunction[];
  exports: string[];
  imports: string[];
  metadata?: {
    wasmVersion?: number;
    customSections?: string[];
  };
}

/**
 * WASM analysis result
 */
export interface WasmAnalysis {
  abi: ContractABI;
  hash: string;
  size: number;
  valid: boolean;
  error?: string;
}
