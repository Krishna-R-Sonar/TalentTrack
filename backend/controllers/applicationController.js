// backend/controllers/applicationController.js
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import { Application } from '../models/applicationSchema.js';
import { Job } from '../models/jobSchema.js';
import { ApplicationMetrics } from '../models/applicationMetricsSchema.js';
import { v2 as cloudinary } from 'cloudinary';
import { geminiAI } from '../utils/geminiAI.js';
import { sendEmail } from '../utils/sendEmail.js';
import { User } from '../models/userSchema.js';  // Added for user fetch in auto-apply

export const postApplication = catchAsyncErrors(async (req, res, next) => {
    const { role } = req.user;
    if (role !== "Job Seeker") {
        return next(new ErrorHandler("Only Job Seekers can apply for jobs.", 400));
    }

    const { id } = req.params; // Job ID
    const { name, email, phone, address, coverLetter } = req.body;

    if (!name || !email || !phone || !address || !coverLetter) {
        return next(new ErrorHandler("All fields are required.", 400));
    }

    const jobDetails = await Job.findById(id);
    if (!jobDetails) {
        return next(new ErrorHandler('Job not found.', 404));
    }

    const isAlreadyApplied = await Application.findOne({ "jobInfo.jobId": id, "jobSeekerInfo.id": req.user._id });
    if (isAlreadyApplied) {
        return next(new ErrorHandler('You have already applied for this job.', 400));
    }

    const jobSeekerInfo = { id: req.user._id, name, email, phone, address, coverLetter, role: "Job Seeker" };
    let resumeMimeType = null;

    if (req.files && req.files.resume) {
        const { resume } = req.files;
        const allowedFormats = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedFormats.includes(resume.mimetype)) {
            return next(new ErrorHandler("Invalid file type. Please upload a PNG, JPG, or JPEG file.", 400));
        }
        const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath, { folder: 'Job_Seekers_Resumes' });
        if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(new ErrorHandler('Failed to upload resume to Cloudinary.', 400));
        }
        jobSeekerInfo.resume = { public_id: cloudinaryResponse.public_id, url: cloudinaryResponse.secure_url };
        resumeMimeType = resume.mimetype;
    } else if (req.user.resume && req.user.resume.url) {
        jobSeekerInfo.resume = { public_id: req.user.resume.public_id, url: req.user.resume.url };
        resumeMimeType = 'image/jpeg';
    } else {
        return next(new ErrorHandler('A resume is required to apply. Please upload one to your profile.', 400));
    }

    let aiAnalysis = { score: 0, feedback: "AI analysis could not be performed." };
    try {
        aiAnalysis = await geminiAI.calculateCompatibility({
            resumeUrl: jobSeekerInfo.resume.url,
            mimeType: resumeMimeType,
            jobDescription: `${jobDetails.title} ${jobDetails.introduction} ${jobDetails.qualifications}`,
        });
    } catch (aiError) {
        console.error("Gemini AI compatibility check failed:", aiError);
    }

    const application = await Application.create({
        jobSeekerInfo,
        employerInfo: { id: jobDetails.postedBy, role: "Employer" },
        jobInfo: {
            jobId: id,
            jobTitle: jobDetails.title,
            compatibilityScore: aiAnalysis.score,
        },
    });

    await ApplicationMetrics.findOneAndUpdate({ jobId: id }, { $inc: { submissionCount: 1 } }, { upsert: true, new: true });

    res.status(201).json({
        success: true,
        message: "Application submitted successfully.",
        application,
        aiFeedback: aiAnalysis.feedback,
        compatibilityScore: aiAnalysis.score,
    });
});

// Existing functions remain unchanged
export const employerGetAllApplication = catchAsyncErrors(async (req, res, next) => {
    const { role, _id } = req.user;
    if (role !== "Employer") {
        return next(new ErrorHandler("Only Employers can view applications.", 400));
    }
    const applications = await Application.find({
        "employerInfo.id": _id,
        "deletedBy.employer": false,
    });
    res.status(200).json({
        success: true,
        applications,
    });
});

export const jobSeekerGetAllApplication = catchAsyncErrors(async (req, res, next) => {
    const { role, _id } = req.user;
    if (role !== "Job Seeker") {
        return next(new ErrorHandler("Only Job Seekers can view their applications.", 400));
    }
    const applications = await Application.find({
        "jobSeekerInfo.id": _id,
        "deletedBy.jobSeeker": false,
    });
    res.status(200).json({
        success: true,
        applications,
    });
});

export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
        return next(new ErrorHandler("Application not found.", 404));
    }
    const { role, _id } = req.user;
    let unauthorized = false;
    if (role === 'Job Seeker' && application.jobSeekerInfo.id.toString() === _id.toString()) {
        application.deletedBy.jobSeeker = true;
    } else if (role === 'Employer' && application.employerInfo.id.toString() === _id.toString()) {
        application.deletedBy.employer = true;
    } else {
        unauthorized = true;
    }
    if (unauthorized) {
        return next(new ErrorHandler("You are not authorized to delete this application.", 403));
    }
    await application.save();
    if (application.deletedBy.employer && application.deletedBy.jobSeeker) {
        await application.deleteOne();
    }
    res.status(200).json({
        success: true,
        message: "Application Deleted Successfully.",
    });
});

export const getApplicationMetrics = catchAsyncErrors(async (req, res, next) => {
    const { jobId } = req.params;
    const metrics = await ApplicationMetrics.findOne({ jobId });
    res.status(200).json({
        success: true,
        metrics: metrics || { jobId, submissionCount: 0 },
    });
});

// New: Manual auto-apply for current user
export const autoApplyForUser = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user || user.role !== 'Job Seeker') {
        return next(new ErrorHandler('Only Job Seekers can use auto-apply.', 403));
    }
    if (!user.resume?.url) {
        return next(new ErrorHandler('Please upload a resume to use auto-apply.', 400));
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const jobs = await Job.find({
        autoAppliesProcessed: false,
        jobPostedOn: { $gte: oneDayAgo },
    });

    const appliedJobs = [];

    for (const job of jobs) {
        if (!([user.niches.firstNiche, user.niches.secondNiche, user.niches.thirdNiche].includes(job.jobNiche))) continue;

        const hasApplied = await Application.findOne({
            "jobInfo.jobId": job._id,
            "jobSeekerInfo.id": user._id,
        });
        if (hasApplied) continue;

        const mimeType = user.resume.url.endsWith('.png') ? 'image/png' : 'image/jpeg';

        let aiAnalysis;
        try {
            aiAnalysis = await geminiAI.calculateCompatibility({
                resumeUrl: user.resume.url,
                mimeType,
                jobDescription: `${job.title} ${job.introduction} ${job.qualifications}`,
            });
        } catch (aiError) {
            console.error(`AI compatibility failed for user ${user._id} job ${job._id}:`, aiError);
            continue;
        }

        if (aiAnalysis.score < 70) continue;

        let coverLetter = "Auto-generated: I am excited to apply for this position as my skills and experience align well with the job requirements.";
        try {
            const coverLetterResponse = await geminiAI.getCareerAdvice({
                userProfile: user,
                query: `Write a concise cover letter (2-3 sentences) for a ${job.title} role at ${job.companyName}, highlighting why my skills in ${user.niches.firstNiche}, ${user.niches.secondNiche}, and ${user.niches.thirdNiche} make me a strong fit.`,
            });
            coverLetter = coverLetterResponse;
        } catch (aiError) {
            console.error(`Failed to generate cover letter for user ${user._id} job ${job._id}:`, aiError);
        }

        const jobSeekerInfo = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            coverLetter,
            role: "Job Seeker",
            resume: user.resume,
        };

        const application = await Application.create({
            jobSeekerInfo,
            employerInfo: { id: job.postedBy, role: "Employer" },
            jobInfo: {
                jobId: job._id,
                jobTitle: job.title,
                compatibilityScore: aiAnalysis.score,
            },
        });

        await ApplicationMetrics.findOneAndUpdate(
            { jobId: job._id },
            { $inc: { submissionCount: 1 } },
            { upsert: true, new: true }
        );

        // Try to send email, but don't fail the request if email fails
        const subject = `Application Submitted for ${job.title} at ${job.companyName}`;
        const message = `Hi ${user.name},\n\nYour application for the ${job.title} position at ${job.companyName} has been automatically submitted based on your profile match.\n\nJob Details:\n- **Position:** ${job.title}\n- **Company:** ${job.companyName}\n- **Location:** ${job.location}\n- **AI Compatibility Score:** ${aiAnalysis.score}\n- **AI Feedback:** ${aiAnalysis.feedback}\n\nYou can view your application status in your dashboard.\n\nBest Regards,\nTalentTrack Team`;
        const emailResult = await sendEmail({ email: user.email, subject, message });
        if (!emailResult.success) {
            console.error(`Failed to send confirmation email for user ${user._id} job ${job._id}:`, emailResult.error);
        }

        appliedJobs.push({
            jobId: job._id,
            jobTitle: job.title,
            companyName: job.companyName,
            location: job.location,
            score: aiAnalysis.score,
            feedback: aiAnalysis.feedback
        });
    }

    res.status(200).json({
        success: true,
        message: `Auto-applied to ${appliedJobs.length} jobs successfully.`,
        appliedJobs
    });
});