// backend/controllers/groupsController.js
import { Group } from '../models/groupSchema.js';
import { GroupPost } from '../models/groupPostSchema.js';
import { User } from '../models/userSchema.js';
import { awardPoints } from '../utils/impactPoints.js';
import { geminiAI } from '../utils/geminiAI.js';
import { sendEmail } from '../utils/sendEmail.js';
import ErrorHandler from '../middlewares/error.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';

// Create a new group
export const createGroup = catchAsyncErrors(async (req, res, next) => {
    const { name, description, niche, isPrivate } = req.body;
    const creatorId = req.user.id;

    // Check if group name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
        return next(new ErrorHandler("Group name already exists", 400));
    }

    const group = await Group.create({
        name,
        description,
        niche,
        creator: creatorId,
        admins: [creatorId],
        members: [creatorId],
        isPrivate: isPrivate || false,
        memberCount: 1
    });

    // Add group to creator's groups
    const creator = await User.findById(creatorId);
    creator.groups.push(group._id);
    await creator.save();

    // Award points for creating a group
    await awardPoints(creatorId, 'created_group');

    res.status(201).json({
        success: true,
        message: "Group created successfully",
        group
    });
});

// Get all groups (with filters)
export const getGroups = catchAsyncErrors(async (req, res, next) => {
    const { niche, query, isPrivate } = req.query;
    const currentUserId = req.user.id;

    let searchCriteria = {};

    if (niche) {
        searchCriteria.niche = niche;
    }

    if (query) {
        searchCriteria.name = { $regex: query, $options: 'i' };
    }

    if (isPrivate !== undefined) {
        searchCriteria.isPrivate = isPrivate === 'true';
    }

    const groups = await Group.find(searchCriteria)
        .populate('creator', 'name email role')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        groups
    });
});

// Get group details
export const getGroupDetails = catchAsyncErrors(async (req, res, next) => {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId)
        .populate('creator', 'name email role')
        .populate('admins', 'name email role')
        .populate('members', 'name email role')
        .populate('pendingMembers', 'name email role');

    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    // Check if user is a member or if group is public
    const isMember = group.members.some(member => member._id.toString() === currentUserId);
    const isAdmin = group.admins.some(admin => admin._id.toString() === currentUserId);
    const isPending = group.pendingMembers.some(member => member._id.toString() === currentUserId);

    if (group.isPrivate && !isMember && !isAdmin) {
        return next(new ErrorHandler("Access denied. This is a private group.", 403));
    }

    res.status(200).json({
        success: true,
        group,
        userStatus: {
            isMember,
            isAdmin,
            isPending
        }
    });
});

// Join group
export const joinGroup = catchAsyncErrors(async (req, res, next) => {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    const user = await User.findById(currentUserId);

    if (!group || !user) {
        return next(new ErrorHandler("Group or user not found", 404));
    }

    if (group.members.some(member => member._id.toString() === currentUserId)) {
        return next(new ErrorHandler("Already a member of this group", 400));
    }

    if (group.pendingMembers.some(member => member._id.toString() === currentUserId)) {
        return next(new ErrorHandler("Already requested to join this group", 400));
    }

    if (group.isPrivate) {
        // Add to pending members for private groups
        group.pendingMembers.push(currentUserId);
        await group.save();

        // Send email to group admins
        try {
            const adminEmails = await User.find({ _id: { $in: group.admins } }).select('email');
            const subject = `New Join Request for ${group.name}`;
            const message = `Hi,

${user.name} has requested to join the private group "${group.name}".

Review their request from the group management panel.

Best Regards,
TalentTrack Team`;
            
            for (const admin of adminEmails) {
                await sendEmail({ email: admin.email, subject, message });
            }
        } catch (error) {
            console.error('Failed to send join request email:', error);
        }

        res.status(200).json({
            success: true,
            message: "Join request sent. Waiting for admin approval."
        });
    } else {
        // Add directly to public groups
        group.members.push(currentUserId);
        group.memberCount = group.members.length;
        await group.save();

        user.groups.push(groupId);
        await user.save();

        // Award points for joining a group
        await awardPoints(currentUserId, 'joined_group');

        res.status(200).json({
            success: true,
            message: "Successfully joined the group"
        });
    }
});

// Approve join request (admin only)
export const approveJoinRequest = catchAsyncErrors(async (req, res, next) => {
    const { groupId, userId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    if (!group.admins.some(admin => admin._id.toString() === currentUserId)) {
        return next(new ErrorHandler("Only admins can approve join requests", 403));
    }

    if (!group.pendingMembers.some(member => member._id.toString() === userId)) {
        return next(new ErrorHandler("No pending request from this user", 400));
    }

    // Move from pending to members
    group.pendingMembers = group.pendingMembers.filter(id => id.toString() !== userId);
    group.members.push(userId);
    group.memberCount = group.members.length;
    await group.save();

    // Add group to user's groups
    const user = await User.findById(userId);
    user.groups.push(groupId);
    await user.save();

    // Award points for joining a group
    await awardPoints(userId, 'joined_group');

    // Send email notification
    try {
        const subject = `Join Request Approved for ${group.name}`;
        const message = `Hi ${user.name},

Great news! Your request to join "${group.name}" has been approved.

You can now participate in group discussions and access group content.

Best Regards,
TalentTrack Team`;
        await sendEmail({ email: user.email, subject, message });
    } catch (error) {
        console.error('Failed to send approval email:', error);
    }

    res.status(200).json({
        success: true,
        message: "Join request approved successfully"
    });
});

// Reject join request (admin only)
export const rejectJoinRequest = catchAsyncErrors(async (req, res, next) => {
    const { groupId, userId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    if (!group.admins.some(admin => admin._id.toString() === currentUserId)) {
        return next(new ErrorHandler("Only admins can reject join requests", 403));
    }

    if (!group.pendingMembers.some(member => member._id.toString() === userId)) {
        return next(new ErrorHandler("No pending request from this user", 400));
    }

    // Remove from pending
    group.pendingMembers = group.pendingMembers.filter(id => id.toString() !== userId);
    await group.save();

    res.status(200).json({
        success: true,
        message: "Join request rejected successfully"
    });
});

// Promote user to admin (admin only)
export const promoteToAdmin = catchAsyncErrors(async (req, res, next) => {
    const { groupId, userId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    if (!group.admins.some(admin => admin._id.toString() === currentUserId)) {
        return next(new ErrorHandler("Only admins can promote users", 403));
    }

    if (!group.members.some(member => member._id.toString() === userId)) {
        return next(new ErrorHandler("User is not a member of this group", 400));
    }

    if (group.admins.some(admin => admin._id.toString() === userId)) {
        return next(new ErrorHandler("User is already an admin", 400));
    }

    group.admins.push(userId);
    await group.save();

    res.status(200).json({
        success: true,
        message: "User promoted to admin successfully"
    });
});

// Remove member from group (admin only)
export const removeMember = catchAsyncErrors(async (req, res, next) => {
    const { groupId, userId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    if (!group.admins.some(admin => admin._id.toString() === currentUserId)) {
        return next(new ErrorHandler("Only admins can remove members", 403));
    }

    if (group.creator.toString() === userId) {
        return next(new ErrorHandler("Cannot remove the group creator", 403));
    }

    group.members = group.members.filter(id => id.toString() !== userId);
    group.admins = group.admins.filter(id => id.toString() !== userId);
    group.memberCount = group.members.length;
    await group.save();

    // Remove group from user's groups
    const user = await User.findById(userId);
    user.groups = user.groups.filter(id => id.toString() !== groupId);
    await user.save();

    res.status(200).json({
        success: true,
        message: "Member removed successfully"
    });
});

// Create group post
export const createGroupPost = catchAsyncErrors(async (req, res, next) => {
    const { groupId } = req.params;
    const { content, type, tags } = req.body;
    const authorId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    if (!group.members.some(member => member._id.toString() === authorId)) {
        return next(new ErrorHandler("Only group members can create posts", 403));
    }

    const post = await GroupPost.create({
        group: groupId,
        author: authorId,
        content,
        type: type || 'discussion',
        tags: tags || []
    });

    // Add post to group
    group.posts.push(post._id);
    await group.save();

    // Award points for posting in group
    await awardPoints(authorId, 'posted_in_group');

    const postWithAuthor = await GroupPost.findById(post._id)
        .populate('author', 'name email role');

    res.status(201).json({
        success: true,
        message: "Post created successfully",
        post: postWithAuthor
    });
});

// Get group posts
export const getGroupPosts = catchAsyncErrors(async (req, res, next) => {
    const { groupId } = req.params;
    const { type, page = 1, limit = 10 } = req.query;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    if (!group.members.some(member => member._id.toString() === currentUserId)) {
        return next(new ErrorHandler("Only group members can view posts", 403));
    }

    let searchCriteria = { group: groupId };

    if (type) {
        searchCriteria.type = type;
    }

    const posts = await GroupPost.find(searchCriteria)
        .populate('author', 'name email role')
        .populate('likes', 'name email')
        .populate('comments.author', 'name email')
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const totalPosts = await GroupPost.countDocuments(searchCriteria);

    res.status(200).json({
        success: true,
        posts,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts
        }
    });
});

// Edit group post (author or admin only)
export const editGroupPost = catchAsyncErrors(async (req, res, next) => {
    const { groupId, postId } = req.params;
    const { content, tags } = req.body;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    const post = await GroupPost.findById(postId);
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    const isAuthor = post.author.toString() === currentUserId;
    const isAdmin = group.admins.some(admin => admin._id.toString() === currentUserId);

    if (!isAuthor && !isAdmin) {
        return next(new ErrorHandler("You are not authorized to edit this post", 403));
    }

    post.content = content || post.content;
    post.tags = tags || post.tags;
    await post.save();

    res.status(200).json({
        success: true,
        message: "Post updated successfully",
        post
    });
});

// Delete group post (author or admin only)
export const deleteGroupPost = catchAsyncErrors(async (req, res, next) => {
    const { groupId, postId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    const post = await GroupPost.findById(postId);
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    const isAuthor = post.author.toString() === currentUserId;
    const isAdmin = group.admins.some(admin => admin._id.toString() === currentUserId);

    if (!isAuthor && !isAdmin) {
        return next(new ErrorHandler("You are not authorized to delete this post", 403));
    }

    await GroupPost.findByIdAndDelete(postId);

    // Remove post from group
    group.posts = group.posts.filter(id => id.toString() !== postId);
    await group.save();

    res.status(200).json({
        success: true,
        message: "Post deleted successfully"
    });
});

// Add comment to post
export const addCommentToPost = catchAsyncErrors(async (req, res, next) => {
    const { groupId, postId } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    if (!group.members.some(member => member._id.toString() === authorId)) {
        return next(new ErrorHandler("Only group members can comment", 403));
    }

    const post = await GroupPost.findById(postId);
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    post.comments.push({
        author: authorId,
        content,
        createdAt: new Date()
    });

    await post.save();

    const populatedPost = await GroupPost.findById(postId)
        .populate('comments.author', 'name email');

    res.status(201).json({
        success: true,
        message: "Comment added successfully",
        post: populatedPost
    });
});

// Edit comment (author only)
export const editComment = catchAsyncErrors(async (req, res, next) => {
    const { groupId, postId, commentId } = req.params;
    const { content } = req.body;
    const currentUserId = req.user.id;

    const post = await GroupPost.findById(postId);
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
        return next(new ErrorHandler("Comment not found", 404));
    }

    if (comment.author.toString() !== currentUserId) {
        return next(new ErrorHandler("You can only edit your own comments", 403));
    }

    comment.content = content;
    comment.updatedAt = new Date();
    await post.save();

    res.status(200).json({
        success: true,
        message: "Comment updated successfully"
    });
});

// Delete comment (author or admin only)
export const deleteComment = catchAsyncErrors(async (req, res, next) => {
    const { groupId, postId, commentId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    const post = await GroupPost.findById(postId);
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
        return next(new ErrorHandler("Comment not found", 404));
    }

    const isAuthor = comment.author.toString() === currentUserId;
    const isAdmin = group.admins.some(admin => admin._id.toString() === currentUserId);

    if (!isAuthor && !isAdmin) {
        return next(new ErrorHandler("You are not authorized to delete this comment", 403));
    }

    post.comments.pull(commentId);
    await post.save();

    res.status(200).json({
        success: true,
        message: "Comment deleted successfully"
    });
});

// Pin post (admin only)
export const pinPost = catchAsyncErrors(async (req, res, next) => {
    const { groupId, postId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    if (!group.admins.some(admin => admin._id.toString() === currentUserId)) {
        return next(new ErrorHandler("Only admins can pin posts", 403));
    }

    const post = await GroupPost.findById(postId);
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.status(200).json({
        success: true,
        message: post.isPinned ? "Post pinned successfully" : "Post unpinned successfully"
    });
});

// Get AI post suggestions
export const getPostSuggestions = catchAsyncErrors(async (req, res, next) => {
    const { groupId } = req.params;
    const { postType } = req.query;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    const user = await User.findById(currentUserId);

    if (!group || !user) {
        return next(new ErrorHandler("Group or user not found", 404));
    }

    if (!group.members.some(member => member._id.toString() === currentUserId)) {
        return next(new ErrorHandler("Only group members can get post suggestions", 403));
    }

    try {
        const suggestions = await geminiAI.generateGroupPostSuggestions({
            userProfile: user,
            groupNiche: group.niche,
            postType: postType || 'discussion'
        });

        res.status(200).json({
            success: true,
            suggestions
        });
    } catch (error) {
        console.error('AI post suggestions failed:', error);
        // Fallback suggestions
        const fallbackSuggestions = [
            {
                title: `Share your experience in ${group.niche}`,
                content: `What challenges have you faced in ${group.niche} and how did you overcome them? Share your story to help others in the community.`
            },
            {
                title: `Ask the community about ${group.niche}`,
                content: `What questions do you have about ${group.niche}? The community is here to help and share knowledge.`
            },
            {
                title: `Job opportunity in ${group.niche}`,
                content: `Know of any job openings in ${group.niche}? Share them with the community to help fellow professionals.`
            }
        ];

        res.status(200).json({
            success: true,
            suggestions: fallbackSuggestions
        });
    }
});

// Like group post
export const likeGroupPost = catchAsyncErrors(async (req, res, next) => {
    const { groupId, postId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    if (!group.members.some(member => member._id.toString() === currentUserId)) {
        return next(new ErrorHandler("Only group members can like posts", 403));
    }

    const post = await GroupPost.findById(postId);
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    const isLiked = post.likes.some(like => like.toString() === currentUserId);

    if (isLiked) {
        post.likes = post.likes.filter(id => id.toString() !== currentUserId);
    } else {
        post.likes.push(currentUserId);
    }

    await post.save();

    res.status(200).json({
        success: true,
        message: isLiked ? "Post unliked successfully" : "Post liked successfully"
    });
});
