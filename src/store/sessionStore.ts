import { v4 as uuidv4 } from 'uuid';
import {
  SimulationSession,
  SessionWithHistory,
  SimulationInvocation,
  SessionStatus,
  CreateSessionOptions,
  SessionSummary
} from '../types/session';

/**
 * In-memory session store for managing simulation sessions
 */
export class SessionStore {
  private sessions: Map<string, SimulationSession>;
  private invocations: Map<string, SimulationInvocation[]>;

  constructor() {
    this.sessions = new Map();
    this.invocations = new Map();
  }

  /**
   * Create a new simulation session
   * 
   * @param options - Session creation options
   * @returns Created session
   */
  createSession(options?: CreateSessionOptions): SimulationSession {
    const sessionId = uuidv4();
    const now = new Date().toISOString();

    const session: SimulationSession = {
      sessionId,
      createdAt: now,
      lastActivityAt: now,
      status: SessionStatus.ACTIVE,
      networkPassphrase: options?.networkPassphrase,
      metadata: {
        name: options?.name,
        description: options?.description,
        tags: options?.tags,
        ...options?.metadata
      },
      invocationCount: 0
    };

    this.sessions.set(sessionId, session);
    this.invocations.set(sessionId, []);

    return session;
  }

  /**
   * Get a session by ID
   * 
   * @param sessionId - Session ID
   * @returns Session or undefined
   */
  getSession(sessionId: string): SimulationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get a session with its invocation history
   * 
   * @param sessionId - Session ID
   * @returns Session with history or undefined
   */
  getSessionWithHistory(sessionId: string): SessionWithHistory | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return undefined;
    }

    const invocations = this.invocations.get(sessionId) || [];

    return {
      ...session,
      invocations
    };
  }

  /**
   * Get all sessions (summaries only)
   * 
   * @returns Array of session summaries
   */
  getAllSessions(): SessionSummary[] {
    return Array.from(this.sessions.values()).map(session => ({
      sessionId: session.sessionId,
      createdAt: session.createdAt,
      lastActivityAt: session.lastActivityAt,
      status: session.status,
      invocationCount: session.invocationCount,
      name: session.metadata?.name as string | undefined
    }));
  }

  /**
   * Get active sessions
   * 
   * @returns Array of active sessions
   */
  getActiveSessions(): SessionSummary[] {
    return this.getAllSessions().filter(s => s.status === SessionStatus.ACTIVE);
  }

  /**
   * Add an invocation to a session
   * 
   * @param sessionId - Session ID
   * @param invocation - Invocation record
   * @returns Updated session
   */
  addInvocation(sessionId: string, invocation: SimulationInvocation): SimulationSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return undefined;
    }

    // Add invocation to history
    const sessionInvocations = this.invocations.get(sessionId) || [];
    sessionInvocations.push(invocation);
    this.invocations.set(sessionId, sessionInvocations);

    // Update session
    session.lastActivityAt = new Date().toISOString();
    session.invocationCount++;

    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * Update session status
   * 
   * @param sessionId - Session ID
   * @param status - New status
   * @returns Updated session
   */
  updateStatus(sessionId: string, status: SessionStatus): SimulationSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return undefined;
    }

    session.status = status;
    session.lastActivityAt = new Date().toISOString();

    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * Update session metadata
   * 
   * @param sessionId - Session ID
   * @param metadata - Metadata to merge
   * @returns Updated session
   */
  updateMetadata(sessionId: string, metadata: Record<string, unknown>): SimulationSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return undefined;
    }

    session.metadata = {
      ...session.metadata,
      ...metadata
    };
    session.lastActivityAt = new Date().toISOString();

    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * Delete a session and its history
   * 
   * @param sessionId - Session ID
   * @returns True if deleted
   */
  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    this.invocations.delete(sessionId);
    return deleted;
  }

  /**
   * Clear all sessions
   */
  clear(): void {
    this.sessions.clear();
    this.invocations.clear();
  }

  /**
   * Get session count
   * 
   * @returns Number of sessions
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Get invocation count for a session
   * 
   * @param sessionId - Session ID
   * @returns Number of invocations
   */
  getInvocationCount(sessionId: string): number {
    const invocations = this.invocations.get(sessionId);
    return invocations ? invocations.length : 0;
  }

  /**
   * Get invocations for a session
   * 
   * @param sessionId - Session ID
   * @param limit - Maximum number of invocations to return (optional)
   * @returns Array of invocations
   */
  getInvocations(sessionId: string, limit?: number): SimulationInvocation[] {
    const invocations = this.invocations.get(sessionId) || [];
    
    if (limit && limit > 0) {
      return invocations.slice(-limit);
    }
    
    return invocations;
  }

  /**
   * Check if session exists
   * 
   * @param sessionId - Session ID
   * @returns True if exists
   */
  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Clean up inactive sessions
   * 
   * @param maxAgeMinutes - Maximum age in minutes for idle sessions
   * @returns Number of sessions cleaned up
   */
  cleanupInactiveSessions(maxAgeMinutes: number): number {
    const cutoffTime = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.status === SessionStatus.IDLE && session.lastActivityAt < cutoffTime) {
        this.deleteSession(sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}

// Singleton instance
let instance: SessionStore | null = null;

/**
 * Get the singleton instance of the session store
 * 
 * @returns Session store instance
 */
export function getSessionStore(): SessionStore {
  if (!instance) {
    instance = new SessionStore();
  }
  return instance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetSessionStore(): void {
  instance = new SessionStore();
}
