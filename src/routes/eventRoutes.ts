import { Router } from 'express';
import {
  extractEvents,
  getEventStats,
  filterEventsByType,
  filterEventsByContract,
  groupEventsByContract
} from '../controllers/eventController';

const router = Router();

/**
 * Event extraction routes
 */

// POST /api/events/extract - Extract and parse events from raw simulation events
router.post('/extract', extractEvents);

// POST /api/events/stats - Get event statistics
router.post('/stats', getEventStats);

// POST /api/events/filter/type - Filter events by type
router.post('/filter/type', filterEventsByType);

// POST /api/events/filter/contract - Filter events by contract ID
router.post('/filter/contract', filterEventsByContract);

// POST /api/events/group - Group events by contract ID
router.post('/group', groupEventsByContract);

export default router;
