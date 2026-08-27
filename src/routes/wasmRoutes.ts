import { Router } from 'express';
import { wasmUpload } from '../config/multer';
import { uploadWasm } from '../controllers/wasmController';

const router = Router();

/**
 * POST /api/wasm/upload
 * Upload a WASM contract file
 * 
 * @body file - The .wasm file (multipart/form-data)
 * @returns Upload confirmation with file metadata
 */
router.post('/upload', wasmUpload.single('wasm'), uploadWasm);

export default router;
