// backend/routes/groupsRouter.js
import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import {
    createGroup,
    getGroups,
    getGroupDetails,
    joinGroup,
    approveJoinRequest,
    createGroupPost,
    getGroupPosts,
    getPostSuggestions,
    likeGroupPost,
    addCommentToPost,
    editGroupPost,
    deleteGroupPost,
    editComment,
    deleteComment,
    pinPost
} from '../controllers/groupsController.js';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Group management
router.post('/create', createGroup);
router.get('/', getGroups);
router.get('/:groupId', getGroupDetails);
router.post('/:groupId/join', joinGroup);
router.post('/:groupId/approve/:userId', approveJoinRequest);

// Group posts
router.post('/:groupId/posts', createGroupPost);
router.get('/:groupId/posts', getGroupPosts);
router.get('/:groupId/suggestions', getPostSuggestions);
router.post('/:groupId/posts/:postId/like', likeGroupPost);
router.post('/:groupId/posts/:postId/comments', addCommentToPost);
router.put('/:groupId/posts/:postId', editGroupPost);
router.delete('/:groupId/posts/:postId', deleteGroupPost);
router.put('/:groupId/posts/:postId/comments/:commentId', editComment);
router.delete('/:groupId/posts/:postId/comments/:commentId', deleteComment);
router.post('/:groupId/posts/:postId/pin', pinPost);

export default router;
