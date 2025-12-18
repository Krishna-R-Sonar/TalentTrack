// backend/routes/jobRouter.js
import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import {
    postJob, getAllJobs, getMyJobs, deleteJob, getASingleJob,
    getPersonalizedJobs, getNicheJobs, getResumeBasedJobs, updateJob  // Added updateJob
} from "../controllers/jobController.js";

const router = express.Router();

router.post("/post", isAuthenticated, postJob);
router.get("/getall", getAllJobs);
router.get("/personalized", isAuthenticated, getPersonalizedJobs);
router.get("/niche", getNicheJobs);
router.get("/resume-based", isAuthenticated, getResumeBasedJobs);
router.get("/getmyjobs", isAuthenticated, getMyJobs);
router.delete("/delete/:id", isAuthenticated, deleteJob);
router.get("/get/:id", getASingleJob);
router.put("/update/:id", isAuthenticated, updateJob);

export default router;