import { Request, Response } from 'express';
import { getSessionStore } from '../store/sessionStore';
import { CreateSessionOptions, SessionStatus } from '../types/session';
import { parsePaginationParams, createPaginatedResponse } from '../utils/pagination';

/**
 * Session management controller
 */

/**
 * Create a new simulation session
 */
export const createSession = (req: Request, res: Response): void => {
  try {
    const options = req.body as CreateSessionOptions;
    const store = getSessionStore();
    
    const session = store.createSession(options);
    
    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all sessions
 */
export const getAllSessions = (req: Request, res: Response): void => {
  try {
    const { page, limit, includeDeleted } = req.query;
    const store = getSessionStore();
    const sessions = store.getAllSessions(includeDeleted === 'true');
    
    // Parse pagination params
    const paginationParams = parsePaginationParams(page as string, limit as string);
    
    // Create paginated response
    const { data, metadata } = createPaginatedResponse(
      sessions,
      paginationParams.page,
      paginationParams.limit
    );
    
    res.status(200).json({
      success: true,
      count: data.length,
      data,
      pagination: metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sessions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get active sessions
 */
export const getActiveSessions = (req: Request, res: Response): void => {
  try {
    const { page, limit } = req.query;
    const store = getSessionStore();
    const sessions = store.getActiveSessions();
    
    // Parse pagination params
    const paginationParams = parsePaginationParams(page as string, limit as string);
    
    // Create paginated response
    const { data, metadata } = createPaginatedResponse(
      sessions,
      paginationParams.page,
      paginationParams.limit
    );
    
    res.status(200).json({
      success: true,
      count: data.length,
      data,
      pagination: metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve active sessions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get a specific session
 */
export const getSession = (req: Request, res: Response): void => {
  try {
    const { sessionId } = req.params;
    const { includeHistory } = req.query;
    
    const store = getSessionStore();
    
    if (includeHistory === 'true') {
      const session = store.getSessionWithHistory(sessionId);
      
      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Session not found',
          sessionId
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: session
      });
    } else {
      const session = store.getSession(sessionId);
      
      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Session not found',
          sessionId
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: session
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update session status
 */
export const updateSessionStatus = (req: Request, res: Response): void => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;
    
    if (!status || !Object.values(SessionStatus).includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status',
        error: `Status must be one of: ${Object.values(SessionStatus).join(', ')}`
      });
      return;
    }
    
    const store = getSessionStore();
    const session = store.updateStatus(sessionId, status);
    
    if (!session) {
      res.status(404).json({
        success: false,
        message: 'Session not found',
        sessionId
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Session status updated successfully',
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update session status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update session metadata
 */
export const updateSessionMetadata = (req: Request, res: Response): void => {
  try {
    const { sessionId } = req.params;
    const metadata = req.body;
    
    const store = getSessionStore();
    const session = store.updateMetadata(sessionId, metadata);
    
    if (!session) {
      res.status(404).json({
        success: false,
        message: 'Session not found',
        sessionId
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Session metadata updated successfully',
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update session metadata',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete a session
 */
export const deleteSession = (req: Request, res: Response): void => {
  try {
    const { sessionId } = req.params;
    
    const store = getSessionStore();
    const deleted = store.deleteSession(sessionId);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Session not found',
        sessionId
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Session soft deleted successfully',
      sessionId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Restore a soft-deleted session
 */
export const restoreSession = (req: Request, res: Response): void => {
  try {
    const { sessionId } = req.params;
    
    const store = getSessionStore();
    const session = store.restoreSession(sessionId);
    
    if (!session) {
      res.status(404).json({
        success: false,
        message: 'Session not found or not deleted',
        sessionId
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Session restored successfully',
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to restore session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Permanently delete a session (hard delete)
 */
export const hardDeleteSession = (req: Request, res: Response): void => {
  try {
    const { sessionId } = req.params;
    
    const store = getSessionStore();
    const deleted = store.hardDeleteSession(sessionId);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Session not found',
        sessionId
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Session permanently deleted',
      sessionId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to permanently delete session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get session invocations
 */
export const getSessionInvocations = (req: Request, res: Response): void => {
  try {
    const { sessionId } = req.params;
    const { page, limit: queryLimit } = req.query;
    
    const store = getSessionStore();
    
    if (!store.hasSession(sessionId)) {
      res.status(404).json({
        success: false,
        message: 'Session not found',
        sessionId
      });
      return;
    }
    
    // Get all invocations
    const allInvocations = store.getInvocations(sessionId);
    
    // Parse pagination params
    const paginationParams = parsePaginationParams(page as string, queryLimit as string);
    
    // Create paginated response
    const { data, metadata } = createPaginatedResponse(
      allInvocations,
      paginationParams.page,
      paginationParams.limit
    );
    
    res.status(200).json({
      success: true,
      count: data.length,
      data,
      pagination: metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session invocations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Clean up inactive sessions
 */
export const cleanupSessions = (req: Request, res: Response): void => {
  try {
    const { maxAgeMinutes = 60 } = req.body;
    
    const store = getSessionStore();
    const cleanedCount = store.cleanupInactiveSessions(maxAgeMinutes);
    
    res.status(200).json({
      success: true,
      message: `Cleaned up ${cleanedCount} inactive sessions`,
      cleanedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup sessions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Export session history as JSON
 */
export const exportSessionHistory = (req: Request, res: Response): void => {
  try {
    const { sessionId } = req.params;
    
    const store = getSessionStore();
    const session = store.getSessionWithHistory(sessionId);
    
    if (!session) {
      res.status(404).json({
        success: false,
        message: 'Session not found',
        sessionId
      });
      return;
    }
    
    // Set headers for file download
    const filename = `session-${sessionId}-${Date.now()}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.status(200).send(JSON.stringify(session, null, 2));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export session history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get session statistics
 */
export const getSessionStats = (req: Request, res: Response): void => {
  try {
    const { sessionId } = req.params;
    
    const store = getSessionStore();
    const session = store.getSession(sessionId);
    
    if (!session) {
      res.status(404).json({
        success: false,
        message: 'Session not found',
        sessionId
      });
      return;
    }
    
    const invocations = store.getInvocations(sessionId);
    
    // Calculate statistics
    const stats = {
      sessionId: session.sessionId,
      totalInvocations: invocations.length,
      successfulInvocations: invocations.filter(inv => inv.result.success).length,
      failedInvocations: invocations.filter(inv => !inv.result.success).length,
      averageDuration: invocations.length > 0
        ? invocations.reduce((sum, inv) => sum + (inv.duration || 0), 0) / invocations.length
        : 0,
      uniqueContracts: new Set(invocations.map(inv => inv.contractId)).size,
      uniqueMethods: new Set(invocations.map(inv => inv.method)).size,
      firstInvocation: invocations.length > 0 ? invocations[0].timestamp : null,
      lastInvocation: invocations.length > 0 ? invocations[invocations.length - 1].timestamp : null
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get session statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
