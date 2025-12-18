// backend/controllers/communityController.js
import { GroupPost } from '../models/groupPostSchema.js';
import { Group } from '../models/groupSchema.js';
import { User } from '../models/userSchema.js';
import ErrorHandler from '../middlewares/error.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';

// Get community posts (global feed from public groups)
export const getCommunityPosts = catchAsyncErrors(async (req, res, next) => {
    const { niche, type, query, page = 1, limit = 20 } = req.query;
    const currentUserId = req.user.id;

    let searchCriteria = { 
        'group.isPrivate': false  // Only public groups
    };

    if (niche) {
        searchCriteria['group.niche'] = { $regex: niche, $options: 'i' };
    }

    if (type) {
        searchCriteria.type = type;
    }

    if (query) {
        searchCriteria.$or = [
            { content: { $regex: query, $options: 'i' } },
            { 'group.name': { $regex: query, $options: 'i' } }
        ];
    }

    // Aggregate to join with groups
    const posts = await GroupPost.aggregate([
        {
            $lookup: {
                from: 'groups',
                localField: 'group',
                foreignField: '_id',
                as: 'group'
            }
        },
        { $unwind: '$group' },
        { $match: searchCriteria },
        {
            $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author'
            }
        },
        { $unwind: '$author' },
        {
            $lookup: {
                from: 'users',
                localField: 'likes',
                foreignField: '_id',
                as: 'likes'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'comments.author',
                foreignField: '_id',
                as: 'commentAuthors'
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
    ]);

    const totalPosts = await GroupPost.aggregate([
        { $lookup: { from: 'groups', localField: 'group', foreignField: '_id', as: 'group' } },
        { $unwind: '$group' },
        { $match: searchCriteria },
        { $count: 'total' }
    ]);

    res.status(200).json({
        success: true,
        posts,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil((totalPosts[0]?.total || 0) / limit),
            totalPosts: totalPosts[0]?.total || 0
        }
    });
});