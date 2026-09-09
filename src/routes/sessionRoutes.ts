import { Router } from 'express';
import {
  createSession,
  getAllSessions,
  getActiveSessions,
  getSession,
  updateSessionStatus,
  updateSessionMetadata,
  deleteSession,
  restoreSession,
  hardDeleteSession,
  getSessionInvocations,
  cleanupSessions,
  exportSessionHistory,
  getSessionStats
} from '../controllers/sessionController';
import {
  createSessionValidation,
  updateSessionStatusValidation,
  updateSessionMetadataValidation,
  cleanupSessionsValidation,
  uuidParamValidation,
  paginationValidation
} from '../middleware/validationSchemas';
import { validate } from '../middleware/validator';

const router = Router();

/**
 * POST /api/sessions
 * Create a new simulation session
 */
router.post('/', validate(createSessionValidation), createSession);

/**
 * GET /api/sessions
 * Get all sessions
 */
router.get('/', validate(paginationValidation), getAllSessions);

/**
 * GET /api/sessions/active
 * Get active sessions
 */
router.get('/active', validate(paginationValidation), getActiveSessions);

/**
 * GET /api/sessions/:sessionId
 * Get a specific session
 * Query params: includeHistory=true to include invocation history
 */
router.get('/:sessionId', validate(uuidParamValidation('sessionId')), getSession);

/**
 * GET /api/sessions/:sessionId/stats
 * Get session statistics
 */
router.get('/:sessionId/stats', validate(uuidParamValidation('sessionId')), getSessionStats);

/**
 * GET /api/sessions/:sessionId/export
 * Export session history as downloadable JSON
 */
router.get('/:sessionId/export', validate(uuidParamValidation('sessionId')), exportSessionHistory);

/**
 * PUT /api/sessions/:sessionId/status
 * Update session status
 */
router.put('/:sessionId/status', validate(updateSessionStatusValidation), updateSessionStatus);

/**
 * PUT /api/sessions/:sessionId/metadata
 * Update session metadata
 */
router.put('/:sessionId/metadata', validate(updateSessionMetadataValidation), updateSessionMetadata);

/**
 * DELETE /api/sessions/:sessionId
 * Soft delete a session
 */
router.delete('/:sessionId', validate(uuidParamValidation('sessionId')), deleteSession);

/**
 * POST /api/sessions/:sessionId/restore
 * Restore a soft-deleted session
 */
router.post('/:sessionId/restore', validate(uuidParamValidation('sessionId')), restoreSession);

/**
 * DELETE /api/sessions/:sessionId/permanent
 * Permanently delete a session (hard delete)
 */
router.delete('/:sessionId/permanent', validate(uuidParamValidation('sessionId')), hardDeleteSession);

/**
 * GET /api/sessions/:sessionId/invocations
 * Get session invocations
 * Query params: limit=10 to limit results
 */
router.get('/:sessionId/invocations', validate([...uuidParamValidation('sessionId'), ...paginationValidation]), getSessionInvocations);

/**
 * POST /api/sessions/cleanup
 * Clean up inactive sessions
 */
router.post('/cleanup', validate(cleanupSessionsValidation), cleanupSessions);

export default router;
