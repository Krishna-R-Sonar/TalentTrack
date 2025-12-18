// backend/models/jobSchema.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: { type: String, required: [true, "Please provide a job title."] },
    jobType: { type: String, required: true, enum: ["Full-time", "Part-time", "Internship", "Entry-level"] },
    location: { type: String, required: [true, "Please provide the job location."] },
    companyName: { type: String, required: [true, "Please provide the company name."] },
    introduction: { type: String, required: [true, "Please provide an introduction."] },
    responsibilities: { type: String, required: [true, "Please provide job responsibilities."] },
    qualifications: { type: String, required: [true, "Please provide required qualifications."] },
    offers: { type: String },
    salary: { type: String, required: [true, "Please provide the salary information."] },
    hiringMultipleCandidates: { type: String, default: "No", enum: ["Yes", "No"] },
    personalWebsite: { title: String, url: String },
    jobNiche: { type: String, required: [true, "Please provide the job niche."] },
    workArrangement: { type: String, required: true, enum: ["On-site", "Remote", "Hybrid"] },
    isSocialImpact: { type: Boolean, default: false },
    autoAppliesProcessed: { type: Boolean, default: false },
    expired: { type: Boolean, default: false },
    jobPostedOn: { type: Date, default: Date.now },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export const Job = mongoose.model("Job", jobSchema);