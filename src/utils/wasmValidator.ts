/**
 * WASM file validation utilities
 */

/**
 * Magic number for WebAssembly binary format
 * Corresponds to "\0asm" in ASCII
 */
const WASM_MAGIC_NUMBER = [0x00, 0x61, 0x73, 0x6d];

/**
 * Supported WASM version (currently version 1)
 */
const WASM_VERSION = [0x01, 0x00, 0x00, 0x00];

/**
 * Maximum WASM file size (10 MB)
 */
export const MAX_WASM_SIZE = 10 * 1024 * 1024;

/**
 * Minimum WASM file size (header only - 8 bytes)
 */
export const MIN_WASM_SIZE = 8;

/**
 * Validates if a buffer contains a valid WASM file
 * 
 * @param buffer - The file buffer to validate
 * @returns true if valid WASM, false otherwise
 */
export function isValidWasm(buffer: Buffer): boolean {
  // Check minimum size
  if (buffer.length < MIN_WASM_SIZE) {
    return false;
  }

  // Check magic number (first 4 bytes)
  for (let i = 0; i < WASM_MAGIC_NUMBER.length; i++) {
    if (buffer[i] !== WASM_MAGIC_NUMBER[i]) {
      return false;
    }
  }

  // Check version (next 4 bytes)
  for (let i = 0; i < WASM_VERSION.length; i++) {
    if (buffer[4 + i] !== WASM_VERSION[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Validates WASM file size
 * 
 * @param size - File size in bytes
 * @returns true if size is within acceptable range
 */
export function isValidWasmSize(size: number): boolean {
  return size >= MIN_WASM_SIZE && size <= MAX_WASM_SIZE;
}

/**
 * Gets a human-readable error message for WASM validation failures
 * 
 * @param buffer - The file buffer that failed validation
 * @returns Error message describing the validation failure
 */
export function getWasmValidationError(buffer: Buffer): string {
  if (buffer.length < MIN_WASM_SIZE) {
    return `File too small. WASM files must be at least ${MIN_WASM_SIZE} bytes.`;
  }

  if (buffer.length > MAX_WASM_SIZE) {
    return `File too large. WASM files must not exceed ${MAX_WASM_SIZE / 1024 / 1024} MB.`;
  }

  // Check magic number
  const magicBytes = Array.from(buffer.slice(0, 4));
  if (JSON.stringify(magicBytes) !== JSON.stringify(WASM_MAGIC_NUMBER)) {
    return 'Invalid WASM magic number. File does not appear to be a valid WebAssembly binary.';
  }

  // Check version
  const versionBytes = Array.from(buffer.slice(4, 8));
  if (JSON.stringify(versionBytes) !== JSON.stringify(WASM_VERSION)) {
    return `Unsupported WASM version. Expected version 1, got bytes: [${versionBytes.join(', ')}]`;
  }

  return 'Unknown validation error';
}
