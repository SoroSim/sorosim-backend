import { Request, Response } from 'express';
import { isValidWasm, getWasmValidationError } from '../utils/wasmValidator';

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

    // TODO: Store WASM file (will be implemented in later steps)
    // For now, just return success with metadata

    res.status(200).json({
      success: true,
      message: 'WASM file uploaded successfully',
      data: {
        filename,
        size: wasmBuffer.length,
        hash,
        uploadedAt: new Date().toISOString()
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
