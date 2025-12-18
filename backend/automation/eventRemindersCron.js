// backend/automation/eventRemindersCron.js
import cron from "node-cron";
import { Event } from "../models/eventSchema.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/sendEmail.js";
import { awardPoints } from "../utils/impactPoints.js";

export const eventRemindersCron = () => {
    // Send reminders 1 hour before events
    cron.schedule("0 * * * *", async () => {
        console.log("Running Event Reminders Cron Automation");
        try {
            const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
            const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
            
            const upcomingEvents = await Event.find({
                status: 'upcoming',
                date: { 
                    $gte: oneHourFromNow, 
                    $lte: twoHoursFromNow 
                },
                registeredAttendees: { $exists: true, $ne: [] }
            }).populate('registeredAttendees', 'name email');

            for (const event of upcomingEvents) {
                try {
                    // Send reminder emails to all registered attendees
                    for (const attendee of event.registeredAttendees) {
                        const subject = `Reminder: ${event.title} starts in 1 hour`;
                        const message = `Hi ${attendee.name},\n\nThis is a friendly reminder that "${event.title}" starts in 1 hour.\n\nEvent Details:\n- Date: ${new Date(event.date).toLocaleDateString()}\n- Time: ${new Date(event.date).toLocaleTimeString()}\n- Duration: ${event.duration} minutes\n- Type: ${event.type}\n\n${event.isOnline ? `Meeting Link: ${event.meetingLink}` : `Location: ${event.location}`}\n\nWe look forward to seeing you!\n\nBest Regards,\nTalentTrack Team`;

                        await sendEmail({ email: attendee.email, subject, message });
                    }

                    console.log(`Sent reminders for event: ${event.title}`);
                } catch (error) {
                    console.error(`Failed to send reminders for event ${event._id}:`, error);
                }
            }
        } catch (error) {
            console.error("Event reminders cron job failed:", error);
        }
    });

    // Mark completed events and award points to attendees
    cron.schedule("0 0 * * *", async () => {
        console.log("Running Event Completion Cron Automation");
        try {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            const completedEvents = await Event.find({
                status: 'upcoming',
                date: { $lte: yesterday },
                registeredAttendees: { $exists: true, $ne: [] }
            });

            for (const event of completedEvents) {
                try {
                    // Update event status
                    event.status = 'completed';
                    await event.save();

                    // Award points only to attendees who actually checked in
                    if (event.attendedAttendees && event.attendedAttendees.length > 0) {
                        for (const attendeeId of event.attendedAttendees) {
                            try {
                                await awardPoints(attendeeId, 'attended_event');
                            } catch (error) {
                                console.error(`Failed to award points to user ${attendeeId}:`, error);
                            }
                        }
                    }

                    console.log(`Marked event as completed: ${event.title}`);
                } catch (error) {
                    console.error(`Failed to process completed event ${event._id}:`, error);
                }
            }
        } catch (error) {
            console.error("Event completion cron job failed:", error);
        }
    });
};
