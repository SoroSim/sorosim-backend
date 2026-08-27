import { xdr, scValToNative } from '@stellar/stellar-sdk';
import { ContractEvent, EventType } from '../types/stateDiff';

/**
 * Service for extracting and parsing contract events from simulation results
 */
export class EventExtractor {
  /**
   * Extract and parse events from simulation result
   * 
   * @param rawEvents - Raw events from simulation
   * @returns Parsed contract events with enhanced details
   */
  extractEvents(rawEvents: unknown[]): ContractEvent[] {
    if (!Array.isArray(rawEvents) || rawEvents.length === 0) {
      return [];
    }

    return rawEvents
      .map((event, index) => this.parseEvent(event, index))
      .filter((event): event is ContractEvent => event !== null);
  }

  /**
   * Parse a single event
   * 
   * @param event - Raw event
   * @param index - Event index
   * @returns Parsed contract event or null
   */
  private parseEvent(event: unknown, index: number): ContractEvent | null {
    try {
      // Handle string XDR events
      if (typeof event === 'string') {
        return this.parseXdrEvent(event, index);
      }

      // Handle object events (already parsed by SDK)
      if (typeof event === 'object' && event !== null) {
        return this.parseObjectEvent(event as Record<string, unknown>, index);
      }

      // Unknown format
      console.warn(`Unknown event format at index ${index}`);
      return null;
    } catch (error) {
      console.error(`Failed to parse event ${index}:`, error);
      return {
        index,
        type: EventType.UNKNOWN,
        topics: [],
        data: event,
        raw: event
      };
    }
  }

  /**
   * Parse XDR-encoded event
   * 
   * @param eventXdr - XDR event string
   * @param index - Event index
   * @returns Parsed contract event
   */
  private parseXdrEvent(eventXdr: string, index: number): ContractEvent {
    try {
      const diagnosticEvent = xdr.DiagnosticEvent.fromXDR(eventXdr, 'base64');
      
      // Extract event data - diagnosticEvent.event is a property, not a method
      const event = diagnosticEvent.event;
      
      // Check if it's a contract event type
      if (!event || typeof event !== 'object') {
        throw new Error('Invalid event structure');
      }

      // For now, return basic parsed structure
      // Full XDR parsing would require deeper SDK knowledge
      return {
        index,
        type: EventType.CONTRACT,
        contractId: undefined,
        topics: [],
        data: { xdr: eventXdr },
        raw: eventXdr
      };
    } catch (error) {
      console.error(`Failed to parse XDR event:`, error);
      return {
        index,
        type: EventType.UNKNOWN,
        topics: [],
        data: eventXdr,
        raw: eventXdr
      };
    }
  }

  /**
   * Parse object-format event (already parsed by SDK)
   * 
   * @param event - Event object
   * @param index - Event index
   * @returns Parsed contract event
   */
  private parseObjectEvent(event: Record<string, unknown>, index: number): ContractEvent {
    // Determine event type
    let eventType = EventType.CONTRACT;
    if (event.type === 'contract') {
      eventType = EventType.CONTRACT;
    } else if (event.type === 'system') {
      eventType = EventType.SYSTEM;
    } else if (event.type === 'diagnostic') {
      eventType = EventType.DIAGNOSTIC;
    }

    // Extract contract ID
    let contractId: string | undefined;
    if (typeof event.contractId === 'string') {
      contractId = event.contractId;
    }

    // Parse topics
    let topics: unknown[] = [];
    if (Array.isArray(event.topics)) {
      topics = event.topics.map(topic => this.parseScVal(topic));
    }

    // Parse data
    const data = event.data ? this.parseScVal(event.data) : event;

    return {
      index,
      type: eventType,
      contractId,
      topics,
      data,
      raw: event
    };
  }

  /**
   * Parse ScVal to native JavaScript value
   * 
   * @param scVal - ScVal XDR or unknown value
   * @returns Native JavaScript value
   */
  private parseScVal(scVal: unknown): unknown {
    try {
      // If it's already an XDR ScVal, convert to native
      if (scVal && typeof scVal === 'object' && 'switch' in scVal) {
        return scValToNative(scVal as unknown as xdr.ScVal);
      }

      // If it's a string, try to parse as XDR
      if (typeof scVal === 'string') {
        try {
          const parsedScVal = xdr.ScVal.fromXDR(scVal, 'base64');
          return scValToNative(parsedScVal);
        } catch {
          // Not XDR, return as-is
          return scVal;
        }
      }

      // Return as-is
      return scVal;
    } catch (error) {
      console.warn('Failed to parse ScVal:', error);
      return scVal;
    }
  }

  /**
   * Filter events by type
   * 
   * @param events - Array of events
   * @param type - Event type to filter by
   * @returns Filtered events
   */
  filterByType(events: ContractEvent[], type: EventType): ContractEvent[] {
    return events.filter(event => event.type === type);
  }

  /**
   * Filter events by contract ID
   * 
   * @param events - Array of events
   * @param contractId - Contract ID to filter by
   * @returns Filtered events
   */
  filterByContract(events: ContractEvent[], contractId: string): ContractEvent[] {
    return events.filter(event => event.contractId === contractId);
  }

  /**
   * Group events by contract ID
   * 
   * @param events - Array of events
   * @returns Events grouped by contract ID
   */
  groupByContract(events: ContractEvent[]): Map<string, ContractEvent[]> {
    const grouped = new Map<string, ContractEvent[]>();

    for (const event of events) {
      const contractId = event.contractId || 'unknown';
      
      if (!grouped.has(contractId)) {
        grouped.set(contractId, []);
      }

      grouped.get(contractId)!.push(event);
    }

    return grouped;
  }

  /**
   * Get event summary statistics
   * 
   * @param events - Array of events
   * @returns Event statistics
   */
  getEventStats(events: ContractEvent[]): {
    total: number;
    byType: Record<string, number>;
    byContract: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    const byContract: Record<string, number> = {};

    for (const event of events) {
      // Count by type
      byType[event.type] = (byType[event.type] || 0) + 1;

      // Count by contract
      const contractId = event.contractId || 'unknown';
      byContract[contractId] = (byContract[contractId] || 0) + 1;
    }

    return {
      total: events.length,
      byType,
      byContract
    };
  }
}
