import { body, param, query } from 'express-validator';

/**
 * Validation schemas for API endpoints
 */

/**
 * Session creation validation
 */
export const createSessionValidation = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('networkPassphrase')
    .optional()
    .isString()
    .withMessage('Network passphrase must be a string')
    .trim()
    .notEmpty()
    .withMessage('Network passphrase cannot be empty'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .trim()
    .notEmpty()
    .withMessage('Tags cannot be empty strings'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

/**
 * Session status update validation
 */
export const updateSessionStatusValidation = [
  param('sessionId')
    .isUUID()
    .withMessage('Session ID must be a valid UUID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['active', 'idle', 'closed'])
    .withMessage('Status must be one of: active, idle, closed')
];

/**
 * Session metadata update validation
 */
export const updateSessionMetadataValidation = [
  param('sessionId')
    .isUUID()
    .withMessage('Session ID must be a valid UUID'),
  body()
    .isObject()
    .withMessage('Request body must be a valid object')
    .notEmpty()
    .withMessage('Metadata cannot be empty')
];

/**
 * Session cleanup validation
 */
export const cleanupSessionsValidation = [
  body('maxAgeMinutes')
    .optional()
    .isInt({ min: 1, max: 10080 })
    .withMessage('Max age must be between 1 and 10080 minutes (1 week)')
    .toInt()
];

/**
 * Simulation request validation
 */
export const simulationValidation = [
  body('contractId')
    .notEmpty()
    .withMessage('Contract ID is required')
    .isString()
    .withMessage('Contract ID must be a string')
    .trim()
    .matches(/^C[A-Z0-9]{55}$/)
    .withMessage('Contract ID must be a valid Stellar contract address'),
  body('method')
    .notEmpty()
    .withMessage('Method name is required')
    .isString()
    .withMessage('Method must be a string')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Method name must be between 1 and 255 characters'),
  body('args')
    .optional()
    .isArray()
    .withMessage('Arguments must be an array'),
  body('sessionId')
    .optional()
    .isUUID()
    .withMessage('Session ID must be a valid UUID'),
  body('sourceAccount')
    .optional()
    .isString()
    .withMessage('Source account must be a string')
    .trim()
    .matches(/^G[A-Z0-9]{55}$/)
    .withMessage('Source account must be a valid Stellar address')
];

/**
 * Ledger entry creation validation
 */
export const createLedgerEntryValidation = [
  body('key')
    .notEmpty()
    .withMessage('Key is required')
    .isString()
    .withMessage('Key must be a string')
    .trim()
    .notEmpty()
    .withMessage('Key cannot be empty'),
  body('value')
    .notEmpty()
    .withMessage('Value is required'),
  body('contractId')
    .optional()
    .isString()
    .withMessage('Contract ID must be a string')
    .trim()
    .matches(/^C[A-Z0-9]{55}$/)
    .withMessage('Contract ID must be a valid Stellar contract address')
];

/**
 * Account creation validation
 */
export const createAccountValidation = [
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isString()
    .withMessage('Address must be a string')
    .trim()
    .matches(/^G[A-Z0-9]{55}$/)
    .withMessage('Address must be a valid Stellar address'),
  body('balance')
    .notEmpty()
    .withMessage('Balance is required')
    .isString()
    .withMessage('Balance must be a string')
    .trim()
    .matches(/^\d+$/)
    .withMessage('Balance must be a valid number string'),
  body('sequence')
    .optional()
    .isString()
    .withMessage('Sequence must be a string')
    .trim()
    .matches(/^\d+$/)
    .withMessage('Sequence must be a valid number string')
];

/**
 * Snapshot creation validation
 */
export const createSnapshotValidation = [
  body('name')
    .notEmpty()
    .withMessage('Snapshot name is required')
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('sessionId')
    .optional()
    .isUUID()
    .withMessage('Session ID must be a valid UUID')
];

/**
 * Network configuration validation
 */
export const networkConfigValidation = [
  body('rpcUrl')
    .notEmpty()
    .withMessage('RPC URL is required')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('RPC URL must be a valid HTTP/HTTPS URL'),
  body('networkPassphrase')
    .notEmpty()
    .withMessage('Network passphrase is required')
    .isString()
    .withMessage('Network passphrase must be a string')
    .trim()
    .notEmpty()
    .withMessage('Network passphrase cannot be empty'),
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters')
];

/**
 * UUID parameter validation
 */
export const uuidParamValidation = (paramName: string) => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`)
];

/**
 * Pagination query validation
 */
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt()
];

/**
 * Session list query validation with search and filters
 */
export const sessionListValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .trim(),
  query('status')
    .optional()
    .isIn(['active', 'idle', 'closed'])
    .withMessage('Status must be one of: active, idle, closed'),
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a comma-separated string')
    .trim(),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
];
