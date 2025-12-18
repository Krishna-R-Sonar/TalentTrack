// backend/controllers/eventsController.js
import { Event } from '../models/eventSchema.js';
import { User } from '../models/userSchema.js';
import { awardPoints } from '../utils/impactPoints.js';
import { geminiAI } from '../utils/geminiAI.js';
import { sendEmail } from '../utils/sendEmail.js';
import ErrorHandler from '../middlewares/error.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';

// Create a new event
export const createEvent = catchAsyncErrors(async (req, res, next) => {
    const {
        title,
        description,
        date,
        duration,
        type,
        niche,
        maxAttendees,
        isOnline,
        meetingLink,
        location,
        isFree,
        price,
        tags,
        coHosts
    } = req.body;

    const hostId = req.user.id;

    // Validate date (must be in the future)
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
        return next(new ErrorHandler("Event date must be in the future", 400));
    }

    const event = await Event.create({
        title,
        description,
        date: eventDate,
        duration,
        type,
        niche,
        host: hostId,
        coHosts: coHosts || [],
        maxAttendees: maxAttendees || 100,
        isOnline,
        meetingLink,
        location,
        isFree,
        price: isFree ? 0 : price,
        tags: tags || [],
        registeredAttendees: [hostId] // Host is automatically registered
    });

    // Add event to host's hosted events
    const host = await User.findById(hostId);
    host.hostedEvents.push(event._id);
    await host.save();

    // Award points for hosting an event
    await awardPoints(hostId, 'hosted_event');

    res.status(201).json({
        success: true,
        message: "Event created successfully",
        event
    });
});

// Get all events (with filters)
export const getEvents = catchAsyncErrors(async (req, res, next) => {
    const { niche, type, status, query, page = 1, limit = 10 } = req.query;
    const currentUserId = req.user.id;

    let searchCriteria = {};

    if (niche) {
        searchCriteria.niche = niche;
    }

    if (type) {
        searchCriteria.type = type;
    }

    if (status) {
        searchCriteria.status = status;
    } else {
        // Default to upcoming events
        searchCriteria.date = { $gte: new Date() };
    }

    if (query) {
        searchCriteria.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }

    const events = await Event.find(searchCriteria)
        .populate('host', 'name email role')
        .populate('coHosts', 'name email role')
        .sort({ date: 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const totalEvents = await Event.countDocuments(searchCriteria);

    res.status(200).json({
        success: true,
        events,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalEvents / limit),
            totalEvents
        }
    });
});

// Get event details
export const getEventDetails = catchAsyncErrors(async (req, res, next) => {
    const { eventId } = req.params;
    const currentUserId = req.user.id;

    const event = await Event.findById(eventId)
        .populate('host', 'name email role')
        .populate('coHosts', 'name email role')
        .populate('registeredAttendees', 'name email role')
        .populate('attendedAttendees', 'name email role');

    if (!event) {
        return next(new ErrorHandler("Event not found", 404));
    }

    // Check if user is registered
    const isRegistered = event.registeredAttendees.some(attendee => 
        attendee._id.toString() === currentUserId
    );

    // Check if user has checked in
    const hasCheckedIn = event.attendedAttendees && event.attendedAttendees.some(attendee => 
        attendee._id.toString() === currentUserId
    );

    // Check if user is host or co-host
    const isHost = event.host._id.toString() === currentUserId;
    const isCoHost = event.coHosts.some(coHost => coHost._id.toString() === currentUserId);

    // Check if check-in is available (15 min before event to event end)
    const eventStartTime = new Date(event.date);
    const checkInStartTime = new Date(eventStartTime.getTime() - 15 * 60 * 1000);
    const eventEndTime = new Date(eventStartTime.getTime() + event.duration * 60 * 1000);
    const now = new Date();
    const canCheckIn = isRegistered && !hasCheckedIn && now >= checkInStartTime && now <= eventEndTime;

    res.status(200).json({
        success: true,
        event,
        userStatus: {
            isRegistered,
            isHost,
            isCoHost,
            hasCheckedIn: hasCheckedIn || false,
            canCheckIn
        }
    });
});

// Register for event
export const registerForEvent = catchAsyncErrors(async (req, res, next) => {
    const { eventId } = req.params;
    const currentUserId = req.user.id;

    const event = await Event.findById(eventId);
    const user = await User.findById(currentUserId);

    if (!event || !user) {
        return next(new ErrorHandler("Event or user not found", 404));
    }

    if (event.status !== 'upcoming') {
        return next(new ErrorHandler("Cannot register for this event", 400));
    }

    if (event.registeredAttendees.includes(currentUserId)) {
        return next(new ErrorHandler("Already registered for this event", 400));
    }

    if (event.registeredAttendees.length >= event.maxAttendees) {
        return next(new ErrorHandler("Event is full", 400));
    }

    // Register user for event
    event.registeredAttendees.push(currentUserId);
    await event.save();

    // Add event to user's registered events
    user.registeredEvents.push(eventId);
    await user.save();

    // Award points for registering for an event
    await awardPoints(currentUserId, 'registered_for_event');

    // Send confirmation email
    try {
        const subject = `Event Registration Confirmed: ${event.title}`;
        const message = `Hi ${user.name},\n\nYou have successfully registered for "${event.title}" on TalentTrack.\n\nEvent Details:\n- Date: ${new Date(event.date).toLocaleDateString()}\n- Time: ${new Date(event.date).toLocaleTimeString()}\n- Duration: ${event.duration} minutes\n- Type: ${event.type}\n\n${event.isOnline ? `Meeting Link: ${event.meetingLink}` : `Location: ${event.location}`}\n\nWe'll send you a reminder before the event.\n\nBest Regards,\nTalentTrack Team`;
        await sendEmail({ email: user.email, subject, message });
    } catch (error) {
        console.error('Failed to send registration confirmation email:', error);
    }

    res.status(200).json({
        success: true,
        message: "Successfully registered for the event"
    });
});

// Unregister from event
export const unregisterFromEvent = catchAsyncErrors(async (req, res, next) => {
    const { eventId } = req.params;
    const currentUserId = req.user.id;

    const event = await Event.findById(eventId);
    const user = await User.findById(currentUserId);

    if (!event || !user) {
        return next(new ErrorHandler("Event or user not found", 404));
    }

    if (!event.registeredAttendees.includes(currentUserId)) {
        return next(new ErrorHandler("Not registered for this event", 400));
    }

    // Remove user from event
    event.registeredAttendees = event.registeredAttendees.filter(
        id => id.toString() !== currentUserId
    );
    await event.save();

    // Remove event from user's registered events
    user.registeredEvents = user.registeredEvents.filter(
        id => id.toString() !== eventId
    );
    await user.save();

    res.status(200).json({
        success: true,
        message: "Successfully unregistered from the event"
    });
});

// Get AI event recommendations
export const getEventRecommendations = catchAsyncErrors(async (req, res, next) => {
    const currentUserId = req.user.id;

    const user = await User.findById(currentUserId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Get upcoming events in user's niches
    const userNiches = [user.niches.firstNiche, user.niches.secondNiche, user.niches.thirdNiche].filter(Boolean);
    
    const relevantEvents = await Event.find({
        niche: { $in: userNiches },
        status: 'upcoming',
        date: { $gte: new Date() }
    }).limit(20);

    if (relevantEvents.length === 0) {
        return res.status(200).json({
            success: true,
            recommendations: [],
            message: "No relevant events found for your niches"
        });
    }

    try {
        const recommendations = await geminiAI.suggestRelevantEvents({
            userProfile: user,
            availableEvents: relevantEvents.map(e => ({
                id: e._id,
                title: e.title,
                niche: e.niche,
                type: e.type,
                date: e.date
            }))
        });

        res.status(200).json({
            success: true,
            recommendations
        });
    } catch (error) {
        console.error('AI event recommendations failed:', error);
        // Fallback to basic recommendations
        const fallbackRecommendations = relevantEvents
            .slice(0, 5)
            .map(event => ({
                id: event._id,
                reason: `Relevant to your ${event.niche} expertise`
            }));

        res.status(200).json({
            success: true,
            recommendations: fallbackRecommendations
        });
    }
});

// Update event (host only)
export const updateEvent = catchAsyncErrors(async (req, res, next) => {
    const { eventId } = req.params;
    const currentUserId = req.user.id;
    const updateData = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
        return next(new ErrorHandler("Event not found", 404));
    }

    if (event.host.toString() !== currentUserId) {
        return next(new ErrorHandler("Only the host can update this event", 403));
    }

    // Prevent updating certain fields
    delete updateData.host;
    delete updateData.registeredAttendees;
    delete updateData.status;

    const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
    ).populate('host', 'name email role');

    res.status(200).json({
        success: true,
        message: "Event updated successfully",
        event: updatedEvent
    });
});

// Check-in for event (attendee only, during event time window)
export const checkInToEvent = catchAsyncErrors(async (req, res, next) => {
    const { eventId } = req.params;
    const currentUserId = req.user.id;

    const event = await Event.findById(eventId);
    const user = await User.findById(currentUserId);

    if (!event || !user) {
        return next(new ErrorHandler("Event or user not found", 404));
    }

    if (!event.registeredAttendees.includes(currentUserId)) {
        return next(new ErrorHandler("You must be registered to check in", 400));
    }

    if (event.attendedAttendees && event.attendedAttendees.includes(currentUserId)) {
        return next(new ErrorHandler("Already checked in to this event", 400));
    }

    // Check if event has started (allow check-in 15 minutes before start time)
    const eventStartTime = new Date(event.date);
    const checkInStartTime = new Date(eventStartTime.getTime() - 15 * 60 * 1000);
    const eventEndTime = new Date(eventStartTime.getTime() + event.duration * 60 * 1000);
    const now = new Date();

    if (now < checkInStartTime) {
        return next(new ErrorHandler("Check-in opens 15 minutes before the event starts", 400));
    }

    if (now > eventEndTime) {
        return next(new ErrorHandler("Event has ended. Check-in is no longer available", 400));
    }

    // Add to attended attendees
    if (!event.attendedAttendees) {
        event.attendedAttendees = [];
    }
    event.attendedAttendees.push(currentUserId);
    await event.save();

    res.status(200).json({
        success: true,
        message: "Successfully checked in to the event"
    });
});

// Cancel event (host only)
export const cancelEvent = catchAsyncErrors(async (req, res, next) => {
    const { eventId } = req.params;
    const currentUserId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
        return next(new ErrorHandler("Event not found", 404));
    }

    if (event.host.toString() !== currentUserId) {
        return next(new ErrorHandler("Only the host can cancel this event", 403));
    }

    if (event.status === 'cancelled') {
        return next(new ErrorHandler("Event is already cancelled", 400));
    }

    event.status = 'cancelled';
    await event.save();

    // Send cancellation emails to registered attendees
    if (event.registeredAttendees.length > 0) {
        try {
            const attendeeEmails = await User.find({ 
                _id: { $in: event.registeredAttendees } 
            }).select('email name');

            const subject = `Event Cancelled: ${event.title}`;
            
            for (const attendee of attendeeEmails) {
                const message = `Hi ${attendee.name},\n\nUnfortunately, "${event.title}" has been cancelled by the host.\n\nWe apologize for any inconvenience this may cause.\n\nBest Regards,\nTalentTrack Team`;
                await sendEmail({ email: attendee.email, subject, message });
            }
        } catch (error) {
            console.error('Failed to send cancellation emails:', error);
        }
    }

    res.status(200).json({
        success: true,
        message: "Event cancelled successfully"
    });
});
