// backend/routes/eventsRouter.js
import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import {
    createEvent,
    getEvents,
    getEventDetails,
    registerForEvent,
    unregisterFromEvent,
    getEventRecommendations,
    updateEvent,
    cancelEvent,
    checkInToEvent
} from '../controllers/eventsController.js';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Event management
router.post('/create', createEvent);
router.get('/', getEvents);
router.get('/recommendations', getEventRecommendations);
router.get('/:eventId', getEventDetails);
router.put('/:eventId', updateEvent);
router.delete('/:eventId', cancelEvent);

// Event registration
router.post('/:eventId/register', registerForEvent);
router.delete('/:eventId/unregister', unregisterFromEvent);
router.post('/:eventId/check-in', checkInToEvent);

export default router;
