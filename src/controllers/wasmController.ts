import { Request, Response } from 'express';
import { isValidWasm, getWasmValidationError } from '../utils/wasmValidator';
import { AbiParser } from '../services/abiParser';

/**
 * WASM upload and management controller
 */

interface WasmUploadResponse {
  success: boolean;
  message: string;
  data?: {
    filename: string;
    size: number;
    hash: string;
    uploadedAt: string;
    abi?: {
      functions: string[];
      exports: string[];
      imports: string[];
    };
  };
  error?: string;
}

/**
 * Handle WASM file upload
 */
export const uploadWasm = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
        error: 'Please upload a .wasm file'
      } as WasmUploadResponse);
      return;
    }

    const wasmBuffer = req.file.buffer;
    const filename = req.file.originalname;

    // Validate WASM file format
    if (!isValidWasm(wasmBuffer)) {
      const errorMsg = getWasmValidationError(wasmBuffer);
      res.status(400).json({
        success: false,
        message: 'Invalid WASM file',
        error: errorMsg
      } as WasmUploadResponse);
      return;
    }

    // Generate hash for the WASM file
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(wasmBuffer).digest('hex');

    // Parse WASM to extract ABI
    const parser = new AbiParser();
    const analysis = parser.parseWasm(wasmBuffer);

    // Extract Soroban contract functions
    const contractFunctions = parser.filterSorobanFunctions(analysis.abi);

    // TODO: Store WASM file (will be implemented in later steps)
    // For now, just return success with metadata

    res.status(200).json({
      success: true,
      message: 'WASM file uploaded and analyzed successfully',
      data: {
        filename,
        size: wasmBuffer.length,
        hash,
        uploadedAt: new Date().toISOString(),
        abi: {
          functions: contractFunctions,
          exports: analysis.abi.exports,
          imports: analysis.abi.imports
        }
      }
    } as WasmUploadResponse);
  } catch (error) {
    console.error('WASM upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process WASM upload',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as WasmUploadResponse);
  }
};

/**
 * Analyze WASM from base64 string
 */
export const analyzeWasm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { wasmBase64 } = req.body;

    if (!wasmBase64) {
      res.status(400).json({
        success: false,
        message: 'WASM data is required',
        error: 'Please provide wasmBase64 in request body'
      });
      return;
    }

    // Decode base64 to buffer
    const wasmBuffer = Buffer.from(wasmBase64, 'base64');

    // Validate WASM file format
    if (!isValidWasm(wasmBuffer)) {
      const errorMsg = getWasmValidationError(wasmBuffer);
      res.status(400).json({
        success: false,
        message: 'Invalid WASM data',
        error: errorMsg
      });
      return;
    }

    // Parse WASM to extract ABI
    const parser = new AbiParser();
    const analysis = parser.parseWasm(wasmBuffer);

    // Extract Soroban contract functions
    const contractFunctions = parser.filterSorobanFunctions(analysis.abi);

    res.status(200).json({
      success: true,
      message: 'WASM analyzed successfully',
      data: {
        size: wasmBuffer.length,
        hash: analysis.hash,
        valid: analysis.valid,
        abi: {
          functions: contractFunctions,
          exports: analysis.abi.exports,
          imports: analysis.abi.imports,
          metadata: analysis.abi.metadata
        }
      }
    });
  } catch (error) {
    console.error('WASM analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze WASM',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
