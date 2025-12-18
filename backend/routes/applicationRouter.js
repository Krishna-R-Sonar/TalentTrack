// backend/routes/applicationRouter.js
import express from 'express';
import { isAuthenticated, isAuthorized } from '../middlewares/auth.js';
import {
    postApplication,
    deleteApplication,
    employerGetAllApplication,
    jobSeekerGetAllApplication,
    getApplicationMetrics,
    autoApplyForUser  // New import
} from '../controllers/applicationController.js';

const router = express.Router();

router.post("/post/:id", isAuthenticated, isAuthorized("Job Seeker"), postApplication);
router.get("/employer/getall", isAuthenticated, isAuthorized("Employer"), employerGetAllApplication);
router.get("/jobseeker/getall", isAuthenticated, isAuthorized("Job Seeker"), jobSeekerGetAllApplication);
router.delete("/delete/:id", isAuthenticated, deleteApplication);
router.get("/metrics/:jobId", isAuthenticated, isAuthorized("Employer"), getApplicationMetrics);
router.post("/auto-apply", isAuthenticated, isAuthorized("Job Seeker"), autoApplyForUser);  // New route

export default router;