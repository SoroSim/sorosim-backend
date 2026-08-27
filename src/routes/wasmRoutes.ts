import { Router } from 'express';
import { wasmUpload } from '../config/multer';
import { uploadWasm, analyzeWasm } from '../controllers/wasmController';

const router = Router();

/**
 * POST /api/wasm/upload
 * Upload a WASM contract file
 * 
 * @body file - The .wasm file (multipart/form-data)
 * @returns Upload confirmation with file metadata and ABI
 */
router.post('/upload', wasmUpload.single('wasm'), uploadWasm);

/**
 * POST /api/wasm/analyze
 * Analyze WASM from base64 string
 * 
 * @body wasmBase64 - Base64 encoded WASM data
 * @returns WASM analysis with ABI
 */
router.post('/analyze', analyzeWasm);

export default router;
