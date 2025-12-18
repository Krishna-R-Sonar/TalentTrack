// backend/controllers/jobController.js
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Job } from "../models/jobSchema.js";
import { User } from "../models/userSchema.js";
import { geminiAI } from "../utils/geminiAI.js";
import { awardPoints } from "../utils/impactPoints.js";

// Helper function to process AI recommendations
const processAiRecommendations = (allJobs, recommendations) => {
    if (!Array.isArray(recommendations)) {
        console.error("AI recommendations are not in the expected array format:", recommendations);
        return [];
    }
    const recommendationMap = new Map(recommendations.map(rec => [rec.id, rec.reason]));
    return allJobs
        .filter(job => recommendationMap.has(job._id.toString()))
        .map(job => ({
            ...job.toObject(),
            reason: recommendationMap.get(job._id.toString())
        }))
        .slice(0, 10); // Limit to top 10
};

export const getPersonalizedJobs = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }
    const allJobs = await Job.find({ expired: { $ne: true } });
    
    const aiRecommendations = await geminiAI.getPersonalizedJobRecommendations({
        skills: [user.niches.firstNiche, user.niches.secondNiche, user.niches.thirdNiche].filter(Boolean),
        experience: user.coverLetter || "No cover letter provided.",
        jobs: allJobs.map((job) => ({
            id: job._id.toString(),
            title: job.title,
            description: job.introduction,
            niche: job.jobNiche,
        })),
    });

    const recommendedJobs = processAiRecommendations(allJobs, aiRecommendations);

    res.status(200).json({
        success: true,
        recommendedJobs,
    });
});

export const getResumeBasedJobs = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user.resume?.url) {
        return next(new ErrorHandler("Please upload a resume to use this feature.", 400));
    }
    const allJobs = await Job.find({ expired: { $ne: true } });

    // Assuming resume is an image and we can guess the mime type from the extension.
    // A more robust solution would store the mime type in the user schema.
    const mimeType = user.resume.url.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const aiRecommendations = await geminiAI.getJobRecommendations({
        resumeUrl: user.resume.url,
        mimeType: mimeType,
        jobs: allJobs.map((job) => ({
            id: job._id.toString(),
            title: job.title,
            description: job.introduction,
            niche: job.jobNiche,
        })),
    });

    const recommendedJobs = processAiRecommendations(allJobs, aiRecommendations);

    res.status(200).json({
        success: true,
        recommendedJobs,
    });
});

// Other functions (postJob, getAllJobs, getNicheJobs, getMyJobs, getASingleJob, deleteJob) remain the same.
export const postJob = catchAsyncErrors(async (req, res, next) => {
    const {
        title, jobType, location, companyName, introduction, responsibilities,
        qualifications, offers, salary, hiringMultipleCandidates, personalWebsiteTitle,
        personalWebsiteUrl, jobNiche, workArrangement, isSocialImpact
    } = req.body;
    if (!title || !jobType || !location || !companyName || !introduction ||
        !responsibilities || !qualifications || !salary || !jobNiche || !workArrangement) {
        return next(new ErrorHandler("Please provide all required job details.", 400));
    }
    
    const postedBy = req.user._id;
    
    // Check monthly job limit (3 jobs per month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const jobsThisMonth = await Job.countDocuments({
        postedBy: postedBy,
        jobPostedOn: { $gte: startOfMonth }
    });
    
    if (jobsThisMonth >= 3) {
        return next(new ErrorHandler("You have reached the monthly limit of 3 job posts. Please try again next month.", 400));
    }
    
    const isVerified = req.user.isVerified;
    const job = await Job.create({
        title, jobType, location, companyName, introduction, responsibilities,
        qualifications, offers, salary, hiringMultipleCandidates,
        personalWebsite: { title: personalWebsiteTitle, url: personalWebsiteUrl },
        jobNiche, workArrangement, postedBy, isVerified, isSocialImpact: isSocialImpact || false,
    });
    if (job.isSocialImpact) {
        await awardPoints(postedBy, 'posted_impact_role');
    }
    res.status(201).json({
        success: true,
        message: "Job posted successfully.",
        job,
        jobsRemaining: 3 - (jobsThisMonth + 1),
    });
});

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
    const { city, niche, searchKeyword, workArrangement, jobType, minSalary, maxSalary } = req.query;
    const query = { expired: { $ne: true } };
    if (city) query.location = { $regex: city, $options: "i" };
    if (niche) query.jobNiche = { $regex: niche, $options: "i" };
    if (workArrangement) query.workArrangement = workArrangement;
    if (jobType) query.jobType = { $regex: jobType, $options: "i" };
    if (minSalary || maxSalary) {
        query.salary = {};
        if (minSalary) query.salary.$gte = parseInt(minSalary);
        if (maxSalary) query.salary.$lte = parseInt(maxSalary);
    }
    if (searchKeyword) {
        query.$or = [
            { title: { $regex: searchKeyword, $options: "i" } },
            { companyName: { $regex: searchKeyword, $options: "i" } },
            { introduction: { $regex: searchKeyword, $options: "i" } },
        ];
    }
    const jobs = await Job.find(query).populate("postedBy", "name email");
    res.status(200).json({
        success: true,
        jobs,
        count: jobs.length,
    });
});

export const getNicheJobs = catchAsyncErrors(async (req, res, next) => {
    const { niche, location } = req.query;
    if (!niche) return next(new ErrorHandler("Niche is required.", 400));
    const query = { jobNiche: { $regex: niche, $options: "i" }, expired: { $ne: true } };
    if (location) query.location = { $regex: location, $options: "i" };
    const jobs = await Job.find(query).populate("postedBy", "name email");
    res.status(200).json({
        success: true,
        jobs,
        count: jobs.length,
    });
});

export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
    const { _id } = req.user;
    const myJobs = await Job.find({ postedBy: _id });
    
    // Calculate jobs posted this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const jobsThisMonth = await Job.countDocuments({
        postedBy: _id,
        jobPostedOn: { $gte: startOfMonth }
    });
    
    res.status(200).json({
        success: true,
        myJobs,
        jobsThisMonth,
        jobsRemaining: Math.max(0, 3 - jobsThisMonth),
    });
});

export const getASingleJob = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const job = await Job.findById(id).populate("postedBy", "name email");
    if (!job) {
        return next(new ErrorHandler("Job not found.", 404));
    }
    res.status(200).json({
        success: true,
        job,
    });
});

export const deleteJob = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
        return next(new ErrorHandler("Job not found.", 404));
    }
    if (job.postedBy.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("You are not authorized to delete this job.", 403));
    }
    await job.deleteOne();
    res.status(200).json({
        success: true,
        message: "Job deleted successfully.",
    });
});

// New: Update job
export const updateJob = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
        return next(new ErrorHandler("Job not found.", 404));
    }
    if (job.postedBy.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("You are not authorized to update this job.", 403));
    }
    const updatedJob = await Job.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(200).json({
        success: true,
        message: "Job updated successfully.",
        job: updatedJob
    });
});