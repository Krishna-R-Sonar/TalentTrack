// backend/routes/endorsementsRouter.js
import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import {
    sendEndorsement,
    getEndorsementSuggestions,
    removeEndorsement,
    getUserEndorsements,
    getEndorsementStats
} from '../controllers/endorsementsController.js';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Endorsement management
router.post('/send/:userId', sendEndorsement);
router.delete('/remove/:userId', removeEndorsement);

// Get endorsements and suggestions
router.get('/suggestions/:userId', getEndorsementSuggestions);
router.get('/user/:userId', getUserEndorsements);
router.get('/stats/:userId', getEndorsementStats);

export default router;
