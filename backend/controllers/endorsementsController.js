// backend/controllers/endorsementsController.js
import { User } from '../models/userSchema.js';
import { awardPoints } from '../utils/impactPoints.js';
import { geminiAI } from '../utils/geminiAI.js';
import { sendEmail } from '../utils/sendEmail.js';
import ErrorHandler from '../middlewares/error.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';

// Send endorsement
export const sendEndorsement = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const { skill } = req.body;
    const currentUserId = req.user.id;

    if (currentUserId === userId) {
        return next(new ErrorHandler("You cannot endorse yourself", 400));
    }

    if (!skill) {
        return next(new ErrorHandler("Skill is required", 400));
    }

    const targetUser = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Check if already endorsed this skill
    const existingEndorsement = targetUser.endorsements.find(
        e => e.endorser.toString() === currentUserId && e.skill === skill
    );

    if (existingEndorsement) {
        return next(new ErrorHandler("You have already endorsed this skill for this user", 400));
    }

    // Check if users are connected (optional requirement)
    if (!targetUser.connections.includes(currentUserId)) {
        return next(new ErrorHandler("You can only endorse skills for users you are connected with", 403));
    }

    // Add endorsement
    targetUser.endorsements.push({
        skill,
        endorser: currentUserId,
        endorsedAt: new Date()
    });

    await targetUser.save();

    // Award points to endorser
    await awardPoints(currentUserId, 'sent_endorsement');
    await awardPoints(userId, 'received_endorsement');

    // Send email notification
    try {
        const subject = `New Skill Endorsement from ${currentUser.name}`;
        const message = `Hi ${targetUser.name},\n\nGreat news! ${currentUser.name} has endorsed your "${skill}" skill on TalentTrack.\n\nThis endorsement helps build your professional credibility and increases your impact points.\n\nBest Regards,\nTalentTrack Team`;
        await sendEmail({ email: targetUser.email, subject, message });
    } catch (error) {
        console.error('Failed to send endorsement email:', error);
    }

    res.status(200).json({
        success: true,
        message: "Skill endorsed successfully"
    });
});

// Get endorsement suggestions using AI
export const getEndorsementSuggestions = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const targetUser = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Check if users are connected
    if (!targetUser.connections.includes(currentUserId)) {
        return next(new ErrorHandler("You can only get endorsement suggestions for users you are connected with", 403));
    }

    // Find shared niche
    const sharedNiche = targetUser.niches.firstNiche === currentUser.niches.firstNiche ? targetUser.niches.firstNiche :
                       targetUser.niches.secondNiche === currentUser.niches.secondNiche ? targetUser.niches.secondNiche :
                       targetUser.niches.thirdNiche === currentUser.niches.thirdNiche ? targetUser.niches.thirdNiche : null;

    if (!sharedNiche) {
        return next(new ErrorHandler("No shared niche found for endorsement suggestions", 400));
    }

    try {
        const suggestions = await geminiAI.suggestEndorsements({
            userProfile: targetUser,
            endorserProfile: currentUser,
            sharedNiche
        });

        res.status(200).json({
            success: true,
            suggestions
        });
    } catch (error) {
        console.error('AI endorsement suggestions failed:', error);
        // Fallback to basic suggestions
        const fallbackSuggestions = [
            { skill: sharedNiche, reason: `Based on shared expertise in ${sharedNiche}` },
            { skill: "Professional Communication", reason: "Based on professional interaction" },
            { skill: "Team Collaboration", reason: "Based on shared work experience" }
        ];

        res.status(200).json({
            success: true,
            suggestions: fallbackSuggestions
        });
    }
});

// Remove endorsement
export const removeEndorsement = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const { skill } = req.body;
    const currentUserId = req.user.id;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Find and remove the endorsement
    const endorsementIndex = targetUser.endorsements.findIndex(
        e => e.endorser.toString() === currentUserId && e.skill === skill
    );

    if (endorsementIndex === -1) {
        return next(new ErrorHandler("Endorsement not found", 404));
    }

    targetUser.endorsements.splice(endorsementIndex, 1);
    await targetUser.save();

    res.status(200).json({
        success: true,
        message: "Endorsement removed successfully"
    });
});

// Get user endorsements
export const getUserEndorsements = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Users can view their own endorsements or if they're connected
    if (userId !== currentUserId) {
        const currentUser = await User.findById(currentUserId);
        if (!currentUser.connections.includes(userId)) {
            return next(new ErrorHandler("Not authorized to view this user's endorsements", 403));
        }
    }

    const userWithEndorsements = await User.findById(userId)
        .populate('endorsements.endorser', 'name email role');

    res.status(200).json({
        success: true,
        endorsements: userWithEndorsements.endorsements
    });
});

// Get endorsement statistics
export const getEndorsementStats = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Users can view their own stats or if they're connected
    if (userId !== currentUserId) {
        const currentUser = await User.findById(currentUserId);
        if (!currentUser.connections.includes(userId)) {
            return next(new ErrorHandler("Not authorized to view this user's endorsement stats", 403));
        }
    }

    // Calculate endorsement statistics
    const skillCounts = {};
    targetUser.endorsements.forEach(endorsement => {
        skillCounts[endorsement.skill] = (skillCounts[endorsement.skill] || 0) + 1;
    });

    const topSkills = Object.entries(skillCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([skill, count]) => ({ skill, count }));

    res.status(200).json({
        success: true,
        totalEndorsements: targetUser.endorsements.length,
        uniqueSkills: Object.keys(skillCounts).length,
        topSkills,
        skillBreakdown: skillCounts
    });
});
