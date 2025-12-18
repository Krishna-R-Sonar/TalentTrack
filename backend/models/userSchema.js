// backend/models/userSchema.js
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide your name."],
        minLength: [3, "Name must contain at least 3 characters."],
        maxLength: [30, "Name cannot exceed 30 characters."],
    },
    email: {
        type: String,
        required: [true, "Please provide your email."],
        unique: true,
        validate: [validator.isEmail, "Please provide a valid email."],
    },
    phone: {
        type: String,
        required: [true, "Please provide your phone number."],
    },
    address: {
        type: String,
        required: [true, "Please provide your address."],
    },
    niches: {
        firstNiche: String,
        secondNiche: String,
        thirdNiche: String,
    },
    password: {
        type: String,
        required: [true, "Please provide a password."],
        minLength: [8, "Password must contain at least 8 characters."],
        maxLength: [32, "Password cannot exceed 32 characters."],
        select: false,
    },
    resume: {
        public_id: String,
        url: String,
    },
    coverLetter: String,
    careerGoals: String,
    role: {
        type: String,
        required: true,
        enum: ["Job Seeker", "Employer"],
    },
    autoApplyOptIn: {
        type: Boolean,
        default: true,
    },
    isVerified: { // For employer verification
      type: Boolean,
      default: false
    },
    // New fields for connections
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    pendingConnections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    sentConnectionRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // New fields for endorsements
    endorsements: [{
        skill: {
            type: String,
            required: true
        },
        endorser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        endorsedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // New fields for groups
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }],
    // New fields for events
    registeredEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    hostedEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    totalImpactPoints: {
        type: Number,
        default: 0,
    },
    impactPointsByCategory: {
        type: Map,
        of: Number,
        default: {},
    },
    impactTier: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold'],
        default: 'Bronze',
    },
});

// Hash password before saving
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.getJWTToken = function() {
    return jwt.sign({
        id: this._id,
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

export const User = mongoose.model("User", userSchema);