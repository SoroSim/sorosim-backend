import multer from 'multer';
import path from 'path';
import { MAX_WASM_SIZE } from '../utils/wasmValidator';

/**
 * Multer configuration for WASM file uploads
 */

// Configure storage to use memory storage for processing
const storage = multer.memoryStorage();

// File filter to only accept .wasm files
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (ext === '.wasm') {
    cb(null, true);
  } else {
    cb(new Error('Only .wasm files are allowed'));
  }
};

// Create multer instance with configuration
export const wasmUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_WASM_SIZE,
    files: 1 // Only allow single file upload
  }
});
