// backend/controllers/userController.js
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from 'cloudinary';
import { sendToken } from "../utils/jwtToken.js";
import { geminiAI } from "../utils/geminiAI.js";
import { PointTransaction } from "../models/pointTransactionSchema.js";

export const getCareerAdvice = catchAsyncErrors(async (req, res, next) => {
    const { query } = req.body;
    const userProfile = req.user;

    if (!query) {
        return next(new ErrorHandler("A query is required to get advice.", 400));
    }
     if (!userProfile) {
        return next(new ErrorHandler("User profile not found.", 400));
    }

    const advice = await geminiAI.getCareerAdvice({
        userProfile,
        query,
    });

    res.status(200).json({
        success: true,
        response: advice,
    });
});

// Other functions (register, login, logout, getUser, updateProfile, etc.) remain largely the same.
export const register = catchAsyncErrors(async (req, res, next) => {
    const { name, email, phone, address, password, firstNiche, secondNiche, thirdNiche, coverLetter } = req.body;
    if (!name || !email || !phone || !address || !password) {
        return next(new ErrorHandler("All required fields must be provided", 400));
    }

    // Validate required fields: niches and resume
    if (!firstNiche || !secondNiche || !thirdNiche) {
        return next(new ErrorHandler("Please provide all three preferred job niches", 400));
    }

    if (!req.files || !req.files.resume) {
        return next(new ErrorHandler("Please upload your resume", 400));
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler("Email is already registered", 400));
    }

    // Set default role - default to "Job Seeker"
    const userData = { 
        name, 
        email, 
        phone, 
        address, 
        password, 
        role: "Job Seeker", // Default role, can be changed later
        coverLetter: coverLetter || "", 
        niches: { 
            firstNiche, 
            secondNiche, 
            thirdNiche
        } 
    };

    const { resume } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedFormats.includes(resume.mimetype)) {
        return next(new ErrorHandler("Invalid file type. Please upload a PNG, JPG, or JPEG file.", 400));
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath, {
        folder: "Job_Seekers_Resume"
    });
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        return next(new ErrorHandler("Failed to upload resume to Cloudinary.", 500));
    }
    userData.resume = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
    };

    const user = await User.create(userData);
    sendToken(user, 201, res, "User registered successfully.");
});

export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Email and password are required.", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid email or password.", 400));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password.", 400));
    }
    sendToken(user, 200, res, "User logged in successfully.");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
    res.status(200).cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "None",
        secure: true,
    }).json({
        success: true,
        message: "Logged out successfully."
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        coverLetter: req.body.coverLetter,
        niches: {
            firstNiche: req.body.firstNiche,
            secondNiche: req.body.secondNiche,
            thirdNiche: req.body.thirdNiche,
        },
        autoApplyOptIn: req.body.autoApplyOptIn,
    };

    if (req.user.role === "Job Seeker") {
        const { firstNiche, secondNiche, thirdNiche } = newUserData.niches;
        if (!firstNiche || !secondNiche || !thirdNiche) {
            return next(new ErrorHandler("Please provide all three of your preferred job niches.", 400));
        }
    }

    if (req.files && req.files.resume) {
        const { resume } = req.files;
        const allowedFormats = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedFormats.includes(resume.mimetype)) {
            return next(new ErrorHandler("Invalid file type. Please upload a PNG, JPG, or JPEG file.", 400));
        }
        const currentResumeId = req.user.resume.public_id;
        if (currentResumeId) {
            await cloudinary.uploader.destroy(currentResumeId);
        }
        const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
            folder: "Job_Seekers_Resume",
        });
        newUserData.resume = {
            public_id: newResume.public_id,
            url: newResume.secure_url,
        };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        user,
        message: "Profile updated successfully.",
    });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword) {
        return next(new ErrorHandler("Please provide old password, new password, and confirm password.", 400));
    }
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(oldPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect.", 400));
    }
    if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("New password and confirm password do not match.", 400));
    }
    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res, "Password updated successfully.");
});

export const getUserPointTransactions = catchAsyncErrors(async (req, res, next) => {
    const transactions = await PointTransaction.find({ user: req.user._id }).sort({ timestamp: -1 });
    res.status(200).json({
        success: true,
        transactions,
    });
});

export const getImpactLeaderboard = catchAsyncErrors(async (req, res, next) => {
    const topUsers = await User.find().sort({ totalImpactPoints: -1 }).limit(10).select('name totalImpactPoints impactTier');
    res.status(200).json({
        success: true,
        leaderboard: topUsers,
    });
});

export const redeemReward = catchAsyncErrors(async (req, res, next) => {
    const { rewardId } = req.body;
    const user = req.user;
    const rewards = {
        'skill_up_credit': { name: 'Skill-Up Credit', points: 100 },
        'visibility_boost': { name: 'Visibility Boost', points: 150 },
        'community_perk': { name: 'Community Perk', points: 200 },
        'charitable_grant': { name: 'Charitable Grant', points: 250 },
    };
    const reward = rewards[rewardId];
    if (!reward) {
        return next(new ErrorHandler('Invalid reward', 400));
    }
    if (user.totalImpactPoints < reward.points) {
        return next(new ErrorHandler('Insufficient points', 400));
    }
    user.totalImpactPoints -= reward.points;
    console.log(`User ${user._id} redeemed ${reward.name}`);
    await user.save();
    res.status(200).json({
        success: true,
        message: `Successfully redeemed ${reward.name}`,
    });
});