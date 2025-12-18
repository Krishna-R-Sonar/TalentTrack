// backend/automation/autoApplyCron.js
import cron from "node-cron";
import { Job } from "../models/jobSchema.js";
import { User } from "../models/userSchema.js";
import { Application } from "../models/applicationSchema.js";
import { ApplicationMetrics } from "../models/applicationMetricsSchema.js";
import { geminiAI } from "../utils/geminiAI.js";
import { sendEmail } from "../utils/sendEmail.js";

export const autoApplyCron = () => {
    cron.schedule("0 0 * * *", async () => {
        console.log("Running Auto Apply Cron Automation");
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const jobs = await Job.find({
                autoAppliesProcessed: false,
                jobPostedOn: { $gte: oneDayAgo },
            });

            for (const job of jobs) {
                try {
                    const filteredUsers = await User.find({
                        $or: [
                            { "niches.firstNiche": job.jobNiche },
                            { "niches.secondNiche": job.jobNiche },
                            { "niches.thirdNiche": job.jobNiche },
                        ],
                        autoApplyOptIn: true,
                        resume: { $exists: true, $ne: null },
                    });

                    let appliesDone = false;
                    for (const user of filteredUsers) {
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

                        try {
                            const subject = `Application Submitted for ${job.title} at ${job.companyName}`;
                            const message = `Hi ${user.name},\n\nYour application for the ${job.title} position at ${job.companyName} has been automatically submitted based on your profile match.\n\nJob Details:\n- **Position:** ${job.title}\n- **Company:** ${job.companyName}\n- **Location:** ${job.location}\n- **AI Compatibility Score:** ${aiAnalysis.score}\n- **AI Feedback:** ${aiAnalysis.feedback}\n\nYou can view your application status in your dashboard.\n\nBest Regards,\nTalentTrack Team`;
                            await sendEmail({ email: user.email, subject, message });
                        } catch (emailError) {
                            console.error(`Failed to send confirmation email for user ${user._id} job ${job._id}:`, emailError);
                        }

                        appliesDone = true;
                    }

                    if (appliesDone) {
                        job.autoAppliesProcessed = true;
                        await job.save();
                    }
                } catch (error) {
                    console.error(`Error processing job ${job._id} in auto apply cron:`, error);
                }
            }
        } catch (error) {
            console.error("Error in auto apply cron job:", error);
        }
    });
};