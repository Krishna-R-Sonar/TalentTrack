// backend/controllers/connectionsController.js
import { User } from '../models/userSchema.js';
import { awardPoints } from '../utils/impactPoints.js';
import { sendEmail } from '../utils/sendEmail.js';
import ErrorHandler from '../middlewares/error.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';

// Send connection request
export const sendConnectionRequest = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === userId) {
        return next(new ErrorHandler("You cannot connect with yourself", 400));
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
        return next(new ErrorHandler("User not found", 404));
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already connected or request pending
    if (currentUser.connections.includes(userId)) {
        return next(new ErrorHandler("Already connected with this user", 400));
    }

    if (currentUser.sentConnectionRequests.includes(userId)) {
        return next(new ErrorHandler("Connection request already sent", 400));
    }

    if (targetUser.pendingConnections.includes(currentUserId)) {
        return next(new ErrorHandler("Connection request already pending", 400));
    }

    // Add to sent requests and pending connections
    currentUser.sentConnectionRequests.push(userId);
    targetUser.pendingConnections.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    // Send email notification
    try {
        const subject = `New Connection Request from ${currentUser.name}`;
        const message = `Hi ${targetUser.name},\n\n${currentUser.name} has sent you a connection request on TalentTrack.\n\nView their profile and respond to the request from your dashboard.\n\nBest Regards,\nTalentTrack Team`;
        await sendEmail({ email: targetUser.email, subject, message });
    } catch (error) {
        console.error('Failed to send connection request email:', error);
    }

    res.status(200).json({
        success: true,
        message: "Connection request sent successfully"
    });
});

// Accept connection request
export const acceptConnectionRequest = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const requestingUser = await User.findById(userId);

    if (!currentUser || !requestingUser) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (!currentUser.pendingConnections.includes(userId)) {
        return next(new ErrorHandler("No pending connection request from this user", 400));
    }

    // Remove from pending and sent requests
    currentUser.pendingConnections = currentUser.pendingConnections.filter(id => id.toString() !== userId);
    requestingUser.sentConnectionRequests = requestingUser.sentConnectionRequests.filter(id => id.toString() !== currentUserId);

    // Add to connections for both users
    currentUser.connections.push(userId);
    requestingUser.connections.push(currentUserId);

    await currentUser.save();
    await requestingUser.save();

    // Award points to both users
    await awardPoints(currentUserId, 'accepted_connection');
    await awardPoints(userId, 'accepted_connection');

    // Send email notification
    try {
        const subject = `Connection Request Accepted by ${currentUser.name}`;
        const message = `Hi ${requestingUser.name},\n\nGreat news! ${currentUser.name} has accepted your connection request on TalentTrack.\n\nYou're now connected and can view each other's profiles and share opportunities.\n\nBest Regards,\nTalentTrack Team`;
        await sendEmail({ email: requestingUser.email, subject, message });
    } catch (error) {
        console.error('Failed to send connection accepted email:', error);
    }

    res.status(200).json({
        success: true,
        message: "Connection request accepted successfully"
    });
});

// Reject connection request
export const rejectConnectionRequest = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const requestingUser = await User.findById(userId);

    if (!currentUser || !requestingUser) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (!currentUser.pendingConnections.includes(userId)) {
        return next(new ErrorHandler("No pending connection request from this user", 400));
    }

    // Remove from pending and sent requests
    currentUser.pendingConnections = currentUser.pendingConnections.filter(id => id.toString() !== userId);
    requestingUser.sentConnectionRequests = requestingUser.sentConnectionRequests.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await requestingUser.save();

    res.status(200).json({
        success: true,
        message: "Connection request rejected successfully"
    });
});

// Remove connection
export const removeConnection = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const connectedUser = await User.findById(userId);

    if (!currentUser || !connectedUser) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (!currentUser.connections.includes(userId)) {
        return next(new ErrorHandler("Not connected with this user", 400));
    }

    // Remove from connections for both users
    currentUser.connections = currentUser.connections.filter(id => id.toString() !== userId);
    connectedUser.connections = connectedUser.connections.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await connectedUser.save();

    res.status(200).json({
        success: true,
        message: "Connection removed successfully"
    });
});

// Get user connections
export const getUserConnections = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Users can only view their own connections or if they're connected
    if (userId !== currentUserId) {
        const currentUser = await User.findById(currentUserId);
        if (!currentUser.connections.includes(userId)) {
            return next(new ErrorHandler("Not authorized to view this user's connections", 403));
        }
    }

    const user = await User.findById(userId)
        .populate('connections', 'name email role niches')
        .populate('pendingConnections', 'name email role niches')
        .populate('sentConnectionRequests', 'name email role niches');

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        connections: user.connections,
        pendingConnections: user.pendingConnections,
        sentConnectionRequests: user.sentConnectionRequests
    });
});

// Search users to connect with
export const searchUsersToConnect = catchAsyncErrors(async (req, res, next) => {
    const { query, niche, role } = req.query;
    const currentUserId = req.user.id;

    let searchCriteria = {
        _id: { $ne: currentUserId },
        $and: [
            { $or: [
                { connections: { $ne: currentUserId } },
                { connections: { $exists: false } }
            ]},
            { $or: [
                { pendingConnections: { $ne: currentUserId } },
                { pendingConnections: { $exists: false } }
            ]},
            { $or: [
                { sentConnectionRequests: { $ne: currentUserId } },
                { sentConnectionRequests: { $exists: false } }
            ]}
        ]
    };

    if (query) {
        searchCriteria.name = { $regex: query, $options: 'i' };
    }

    if (niche) {
        searchCriteria.$or = [
            { 'niches.firstNiche': niche },
            { 'niches.secondNiche': niche },
            { 'niches.thirdNiche': niche }
        ];
    }

    if (role) {
        searchCriteria.role = role;
    }

    const users = await User.find(searchCriteria)
        .select('name email role niches')
        .limit(20);

    res.status(200).json({
        success: true,
        users
    });
});
