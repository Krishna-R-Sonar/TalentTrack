// backend/routes/newsRoutes.js
import express from 'express';
import { getLatestNews } from '../controllers/newsController.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.route('/').get(isAuthenticated, getLatestNews);

export default router;