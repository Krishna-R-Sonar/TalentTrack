// backend/models/eventSchema.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please provide an event title."],
        minLength: [5, "Event title must contain at least 5 characters."],
        maxLength: [100, "Event title cannot exceed 100 characters."],
    },
    description: {
        type: String,
        required: [true, "Please provide an event description."],
        minLength: [20, "Description must contain at least 20 characters."],
        maxLength: [1000, "Description cannot exceed 1000 characters."],
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    coHosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    date: {
        type: Date,
        required: [true, "Please provide an event date."],
    },
    duration: {
        type: Number, // in minutes
        required: [true, "Please provide event duration."],
        min: [15, "Event must be at least 15 minutes."],
        max: [480, "Event cannot exceed 8 hours."],
    },
    type: {
        type: String,
        enum: ['webinar', 'workshop', 'networking', 'career_fair', 'panel_discussion'],
        default: 'webinar',
    },
    niche: {
        type: String,
        required: [true, "Please specify the event's niche."],
    },
    maxAttendees: {
        type: Number,
        default: 100,
    },
    registeredAttendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    attendedAttendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isOnline: {
        type: Boolean,
        default: true,
    },
    meetingLink: String,
    location: String,
    isFree: {
        type: Boolean,
        default: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming',
    },
    tags: [String],
    materials: [{
        title: String,
        url: String,
        type: String, // pdf, video, link, etc.
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
eventSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
    return this.registeredAttendees.length;
});

// Virtual for remaining spots
eventSchema.virtual('remainingSpots').get(function() {
    return Math.max(0, this.maxAttendees - this.registeredAttendees.length);
});

export const Event = mongoose.model("Event", eventSchema);
