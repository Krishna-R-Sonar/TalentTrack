// backend/models/groupSchema.js
import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a group name."],
        minLength: [3, "Group name must contain at least 3 characters."],
        maxLength: [50, "Group name cannot exceed 50 characters."],
        unique: true,
    },
    description: {
        type: String,
        required: [true, "Please provide a group description."],
        minLength: [10, "Description must contain at least 10 characters."],
        maxLength: [500, "Description cannot exceed 500 characters."],
    },
    niche: {
        type: String,
        required: [true, "Please specify the group's niche."],
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    pendingMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isPrivate: {
        type: Boolean,
        default: false,
    },
    memberCount: {
        type: Number,
        default: 0,
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroupPost'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update timestamp on save
groupSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export const Group = mongoose.model("Group", groupSchema);
