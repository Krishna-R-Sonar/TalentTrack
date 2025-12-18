// backend/routes/userRouter.js
import express from "express";
import {
    register, login, logout, getUser, updateProfile, updatePassword, getCareerAdvice,
    getUserPointTransactions, getImpactLeaderboard, redeemReward
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.put("/update/profile", isAuthenticated, updateProfile);
router.put("/update/password", isAuthenticated, updatePassword);
router.post("/career-advice", isAuthenticated, getCareerAdvice);
router.get("/impact/transactions", isAuthenticated, getUserPointTransactions);
router.get("/impact/leaderboard", getImpactLeaderboard);
router.post("/impact/redeem", isAuthenticated, redeemReward);

export default router;