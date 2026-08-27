import { Request, Response } from 'express';
import { EventExtractor } from '../services/eventExtractor';
import { EventType } from '../types/stateDiff';

/**
 * Event extraction controller
 */

/**
 * Extract events from raw simulation events
 */
export const extractEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { events } = req.body as { events: unknown[] };

    // Validate request
    if (!events || !Array.isArray(events)) {
      res.status(400).json({
        success: false,
        message: 'Events array is required',
        error: 'Missing or invalid events in request body'
      });
      return;
    }

    const eventExtractor = new EventExtractor();
    const parsedEvents = eventExtractor.extractEvents(events);

    res.status(200).json({
      success: true,
      message: 'Events extracted successfully',
      data: {
        events: parsedEvents,
        count: parsedEvents.length
      }
    });
  } catch (error) {
    console.error('Extract events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get event statistics
 */
export const getEventStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { events } = req.body as { events: unknown[] };

    // Validate request
    if (!events || !Array.isArray(events)) {
      res.status(400).json({
        success: false,
        message: 'Events array is required',
        error: 'Missing or invalid events in request body'
      });
      return;
    }

    const eventExtractor = new EventExtractor();
    const parsedEvents = eventExtractor.extractEvents(events);
    const stats = eventExtractor.getEventStats(parsedEvents);

    res.status(200).json({
      success: true,
      message: 'Event statistics calculated successfully',
      data: stats
    });
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate event statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Filter events by type
 */
export const filterEventsByType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { events, type } = req.body as { events: unknown[]; type: string };

    // Validate request
    if (!events || !Array.isArray(events)) {
      res.status(400).json({
        success: false,
        message: 'Events array is required',
        error: 'Missing or invalid events in request body'
      });
      return;
    }

    if (!type) {
      res.status(400).json({
        success: false,
        message: 'Event type is required',
        error: 'Missing type in request body'
      });
      return;
    }

    // Validate event type
    const eventType = type.toUpperCase() as EventType;
    if (!Object.values(EventType).includes(eventType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event type',
        error: `Type must be one of: ${Object.values(EventType).join(', ')}`
      });
      return;
    }

    const eventExtractor = new EventExtractor();
    const parsedEvents = eventExtractor.extractEvents(events);
    const filtered = eventExtractor.filterByType(parsedEvents, eventType);

    res.status(200).json({
      success: true,
      message: `Events filtered by type: ${eventType}`,
      data: {
        events: filtered,
        count: filtered.length,
        originalCount: parsedEvents.length
      }
    });
  } catch (error) {
    console.error('Filter events by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to filter events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Filter events by contract ID
 */
export const filterEventsByContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const { events, contractId } = req.body as { events: unknown[]; contractId: string };

    // Validate request
    if (!events || !Array.isArray(events)) {
      res.status(400).json({
        success: false,
        message: 'Events array is required',
        error: 'Missing or invalid events in request body'
      });
      return;
    }

    if (!contractId) {
      res.status(400).json({
        success: false,
        message: 'Contract ID is required',
        error: 'Missing contractId in request body'
      });
      return;
    }

    const eventExtractor = new EventExtractor();
    const parsedEvents = eventExtractor.extractEvents(events);
    const filtered = eventExtractor.filterByContract(parsedEvents, contractId);

    res.status(200).json({
      success: true,
      message: `Events filtered by contract: ${contractId}`,
      data: {
        events: filtered,
        count: filtered.length,
        originalCount: parsedEvents.length
      }
    });
  } catch (error) {
    console.error('Filter events by contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to filter events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Group events by contract ID
 */
export const groupEventsByContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const { events } = req.body as { events: unknown[] };

    // Validate request
    if (!events || !Array.isArray(events)) {
      res.status(400).json({
        success: false,
        message: 'Events array is required',
        error: 'Missing or invalid events in request body'
      });
      return;
    }

    const eventExtractor = new EventExtractor();
    const parsedEvents = eventExtractor.extractEvents(events);
    const grouped = eventExtractor.groupByContract(parsedEvents);

    // Convert Map to object for JSON response
    const groupedObject: Record<string, unknown[]> = {};
    grouped.forEach((eventList, contractId) => {
      groupedObject[contractId] = eventList;
    });

    res.status(200).json({
      success: true,
      message: 'Events grouped by contract successfully',
      data: {
        groups: groupedObject,
        contractCount: grouped.size,
        totalEvents: parsedEvents.length
      }
    });
  } catch (error) {
    console.error('Group events by contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to group events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
