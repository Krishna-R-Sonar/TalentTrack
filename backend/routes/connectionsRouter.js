// backend/routes/connectionsRouter.js
import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import {
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    removeConnection,
    getUserConnections,
    searchUsersToConnect
} from '../controllers/connectionsController.js';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Connection management
router.post('/request/:userId', sendConnectionRequest);
router.post('/accept/:userId', acceptConnectionRequest);
router.post('/reject/:userId', rejectConnectionRequest);
router.delete('/remove/:userId', removeConnection);

// Get connections
router.get('/user/:userId', getUserConnections);
router.get('/search', searchUsersToConnect);

export default router;
