import { Router } from 'express';
import {
  createSession,
  getAllSessions,
  getActiveSessions,
  getSession,
  updateSessionStatus,
  updateSessionMetadata,
  deleteSession,
  getSessionInvocations,
  cleanupSessions
} from '../controllers/sessionController';

const router = Router();

/**
 * POST /api/sessions
 * Create a new simulation session
 */
router.post('/', createSession);

/**
 * GET /api/sessions
 * Get all sessions
 */
router.get('/', getAllSessions);

/**
 * GET /api/sessions/active
 * Get active sessions
 */
router.get('/active', getActiveSessions);

/**
 * GET /api/sessions/:sessionId
 * Get a specific session
 * Query params: includeHistory=true to include invocation history
 */
router.get('/:sessionId', getSession);

/**
 * PUT /api/sessions/:sessionId/status
 * Update session status
 */
router.put('/:sessionId/status', updateSessionStatus);

/**
 * PUT /api/sessions/:sessionId/metadata
 * Update session metadata
 */
router.put('/:sessionId/metadata', updateSessionMetadata);

/**
 * DELETE /api/sessions/:sessionId
 * Delete a session
 */
router.delete('/:sessionId', deleteSession);

/**
 * GET /api/sessions/:sessionId/invocations
 * Get session invocations
 * Query params: limit=10 to limit results
 */
router.get('/:sessionId/invocations', getSessionInvocations);

/**
 * POST /api/sessions/cleanup
 * Clean up inactive sessions
 */
router.post('/cleanup', cleanupSessions);

export default router;
