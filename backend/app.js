// backend/app.js
import express from "express";
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import rateLimit from 'express-rate-limit';
import { connection } from "./database/connections.js";
import { errorMiddleware } from './middlewares/error.js';
import userRouter from './routes/userRouter.js';
import jobRouter from './routes/jobRouter.js';
import applicationRouter from './routes/applicationRouter.js';
import { autoApplyCron } from "./automation/autoApplyCron.js"; // Updated import
import { eventRemindersCron } from "./automation/eventRemindersCron.js"; // New event reminders cron
import newsRouter from './routes/newsRoutes.js';
// New enhanced feature routes
import connectionsRouter from './routes/connectionsRouter.js';
import endorsementsRouter from './routes/endorsementsRouter.js';
import groupsRouter from './routes/groupsRouter.js';
import eventsRouter from './routes/eventsRouter.js';
import communityRouter from './routes/communityRouter.js';

const app = express();
config({ path: './config/config.env' });

// Basic Middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));

// Rate Limiter for AI endpoints
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply rate limiting to specific AI-driven routes
app.use("/api/v1/application/post", aiLimiter);
app.use("/api/v1/job/personalized", aiLimiter);
app.use("/api/v1/job/resume-based", aiLimiter);
app.use("/api/v1/user/career-advice", aiLimiter);
// New AI endpoints for enhanced features
app.use("/api/v1/endorsements/suggestions", aiLimiter);
app.use("/api/v1/groups/suggestions", aiLimiter);
app.use("/api/v1/events/recommendations", aiLimiter);

// Routers
app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/news", newsRouter);
// New enhanced feature routers
app.use("/api/v1/connections", connectionsRouter);
app.use("/api/v1/endorsements", endorsementsRouter);
app.use("/api/v1/groups", groupsRouter);
app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/community", communityRouter);

// Database and Cron Jobs
connection();
autoApplyCron(); // Updated to invoke autoApplyCron
eventRemindersCron(); // Start event reminders cron job

// Error Middleware
app.use(errorMiddleware);

export default app;