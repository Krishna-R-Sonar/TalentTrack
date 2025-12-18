// backend/models/groupPostSchema.js
import mongoose from "mongoose";

const groupPostSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: [true, "Post content is required."],
        minLength: [1, "Post cannot be empty."],
        maxLength: [2000, "Post cannot exceed 2000 characters."],
    },
    type: {
        type: String,
        enum: ['discussion', 'job_share', 'announcement', 'question'],
        default: 'discussion',
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxLength: [500, "Comment cannot exceed 500 characters."],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
    tags: [String],
    isPinned: {
        type: Boolean,
        default: false,
    },
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
groupPostSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export const GroupPost = mongoose.model("GroupPost", groupPostSchema);
