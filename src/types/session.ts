/**
 * Session types for tracking simulation sessions
 */

import { SimulationResult } from './simulation';

/**
 * Session status
 */
export enum SessionStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  CLOSED = 'closed'
}

/**
 * Simulation invocation record
 */
export interface SimulationInvocation {
  timestamp: string;
  requestId: string;
  contractId: string;
  method: string;
  args?: unknown[];
  result: SimulationResult;
  duration?: number; // Duration in milliseconds
}

/**
 * Simulation session
 */
export interface SimulationSession {
  sessionId: string;
  createdAt: string;
  lastActivityAt: string;
  status: SessionStatus;
  networkPassphrase?: string;
  metadata?: {
    name?: string;
    description?: string;
    tags?: string[];
    [key: string]: unknown;
  };
  invocationCount: number;
}

/**
 * Session with history
 */
export interface SessionWithHistory extends SimulationSession {
  invocations: SimulationInvocation[];
}

/**
 * Session creation options
 */
export interface CreateSessionOptions {
  name?: string;
  description?: string;
  networkPassphrase?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Session list item (summary)
 */
export interface SessionSummary {
  sessionId: string;
  createdAt: string;
  lastActivityAt: string;
  status: SessionStatus;
  invocationCount: number;
  name?: string;
}
