// backend/routes/communityRouter.js
import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { getCommunityPosts } from '../controllers/communityController.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/posts', getCommunityPosts);

export default router;