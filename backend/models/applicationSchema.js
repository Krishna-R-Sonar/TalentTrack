// backend/models/applicationSchema.js
import mongoose from 'mongoose';
import validator from 'validator';

const applicationSchema = new mongoose.Schema({
    jobSeekerInfo: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        email: { type: String, required: true, validate: [validator.isEmail, "Please provide a valid email."] },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        resume: { public_id: String, url: String },
        coverLetter: { type: String, required: true },
        role: { type: String, enum: ["Job Seeker"], default: "Job Seeker" },
    },
    employerInfo: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["Employer"], default: "Employer" },
    },
    jobInfo: {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
        jobTitle: { type: String, required: true },
        compatibilityScore: { type: Number, default: 0, min: 0, max: 100 },
    },
    deletedBy: {
        jobSeeker: { type: Boolean, default: false },
        employer: { type: Boolean, default: false },
    },
    appliedOn: {
      type: Date,
      default: Date.now,
    },
});

export const Application = mongoose.model("Application", applicationSchema);