import { ContractABI, ContractFunction, WasmAnalysis } from '../types/abi';
import crypto from 'crypto';

/**
 * Service for parsing WASM contracts and extracting ABI information
 */
export class AbiParser {
  /**
   * Parse WASM buffer and extract contract ABI
   * 
   * @param wasmBuffer - WASM file buffer
   * @returns WASM analysis with ABI
   */
  parseWasm(wasmBuffer: Buffer): WasmAnalysis {
    try {
      const hash = this.calculateHash(wasmBuffer);
      const abi = this.extractABI(wasmBuffer);

      return {
        abi,
        hash,
        size: wasmBuffer.length,
        valid: true
      };
    } catch (error) {
      return {
        abi: {
          functions: [],
          exports: [],
          imports: []
        },
        hash: this.calculateHash(wasmBuffer),
        size: wasmBuffer.length,
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error parsing WASM'
      };
    }
  }

  /**
   * Extract ABI from WASM buffer
   * Simple parser that extracts export names
   * 
   * @param wasmBuffer - WASM file buffer
   * @returns Contract ABI
   */
  private extractABI(wasmBuffer: Buffer): ContractABI {
    const functions: ContractFunction[] = [];
    const exports: string[] = [];
    const imports: string[] = [];

    // Parse WASM sections
    let offset = 8; // Skip magic number and version

    while (offset < wasmBuffer.length) {
      try {
        const sectionId = wasmBuffer[offset++];
        const { value: sectionSize, bytesRead } = this.readVarUint32(wasmBuffer, offset);
        offset += bytesRead;
        const sectionStart = offset;

        // Export section (id = 7)
        if (sectionId === 7) {
          const { value: count, bytesRead: countBytes } = this.readVarUint32(wasmBuffer, offset);
          offset += countBytes;

          for (let i = 0; i < count; i++) {
            try {
              // Read export name
              const { value: nameLen, bytesRead: nameLenBytes } = this.readVarUint32(wasmBuffer, offset);
              offset += nameLenBytes;
              
              const name = wasmBuffer.toString('utf8', offset, offset + nameLen);
              offset += nameLen;

              // Read export kind and index
              const kind = wasmBuffer[offset++];
              const { bytesRead: indexBytes } = this.readVarUint32(wasmBuffer, offset);
              offset += indexBytes;

              exports.push(name);

              // If it's a function export (kind = 0)
              if (kind === 0) {
                functions.push({
                  name,
                  parameters: [], // Would need full type parsing
                  returnType: undefined,
                  isExported: true
                });
              }
            } catch {
              break;
            }
          }
        } else {
          // Skip other sections
          offset = sectionStart + sectionSize;
        }
      } catch {
        break;
      }
    }

    return {
      functions,
      exports,
      imports,
      metadata: {}
    };
  }

  /**
   * Read variable-length unsigned integer
   */
  private readVarUint32(buffer: Buffer, offset: number): { value: number; bytesRead: number } {
    let value = 0;
    let shift = 0;
    let bytesRead = 0;

    while (offset < buffer.length) {
      const byte = buffer[offset++];
      bytesRead++;
      value |= (byte & 0x7F) << shift;
      if ((byte & 0x80) === 0) {
        break;
      }
      shift += 7;
    }

    return { value, bytesRead };
  }

  /**
   * Calculate SHA-256 hash of WASM buffer
   */
  private calculateHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Extract function names that match Soroban contract patterns
   * 
   * @param abi - Contract ABI
   * @returns Array of contract function names
   */
  filterSorobanFunctions(abi: ContractABI): string[] {
    // Filter out common non-contract functions
    const excludePatterns = [
      /^__/,           // Internal functions
      /^_start$/,      // Entry point
      /^memory$/,      // Memory exports
      /^__data_end$/,  // Data section markers
      /^__heap_base$/, // Heap markers
    ];

    return abi.exports.filter(name => {
      return !excludePatterns.some(pattern => pattern.test(name));
    });
  }
}
