// frontend/src/components/GroupPosts.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const GroupPosts = ({ groupId, groupName }) => {
    const { user } = useSelector((state) => state.user);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        content: '',
        type: 'discussion',
        tags: []
    });
    const [newTag, setNewTag] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    useEffect(() => {
        if (groupId) {
            fetchPosts();
        }
    }, [groupId]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/groups/${groupId}/posts`, {
                withCredentials: true
            });
            setPosts(response.data.posts);
        } catch (error) {
            toast.error('Failed to fetch group posts');
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/v1/groups/${groupId}/posts`, createFormData, {
                withCredentials: true
            });
            toast.success('Post created successfully');
            setShowCreateForm(false);
            setCreateFormData({ content: '', type: 'discussion', tags: [] });
            fetchPosts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create post');
        }
    };

    const addTag = () => {
        if (newTag.trim() && !createFormData.tags.includes(newTag.trim())) {
            setCreateFormData({
                ...createFormData,
                tags: [...createFormData.tags, newTag.trim()]
            });
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setCreateFormData({
            ...createFormData,
            tags: createFormData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const likePost = async (postId) => {
        try {
            await axios.post(`/api/v1/groups/${groupId}/posts/${postId}/like`, {}, {
                withCredentials: true
            });
            fetchPosts();
        } catch (error) {
            toast.error('Failed to like post');
        }
    };

    const addComment = async (postId, comment) => {
        try {
            await axios.post(`/api/v1/groups/${groupId}/posts/${postId}/comments`, {
                content: comment
            }, {
                withCredentials: true
            });
            fetchPosts();
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    const filteredPosts = selectedType === 'all' 
        ? posts 
        : posts.filter(post => post.type === selectedType);

    if (loading && !posts.length) {
        return <Spinner />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                    Posts in {groupName}
                </h3>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                >
                    {showCreateForm ? 'Cancel' : 'Create Post'}
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-semibold mb-4">Create New Post</h4>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Post Type
                            </label>
                            <select
                                value={createFormData.type}
                                onChange={(e) => setCreateFormData({
                                    ...createFormData,
                                    type: e.target.value
                                })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            >
                                <option value="discussion">Discussion</option>
                                <option value="job_share">Job Share</option>
                                <option value="announcement">Announcement</option>
                                <option value="question">Question</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content
                            </label>
                            <textarea
                                value={createFormData.content}
                                onChange={(e) => setCreateFormData({
                                    ...createFormData,
                                    content: e.target.value
                                })}
                                rows="4"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                placeholder="What would you like to share?"
                                maxLength="2000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    placeholder="Add a tag"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {createFormData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-primary text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="text-white hover:text-red-200"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
                        >
                            Create Post
                        </button>
                    </form>
                </div>
            )}

            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setSelectedType('all')}
                    className={`px-4 py-2 rounded-md ${
                        selectedType === 'all' 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    All Posts
                </button>
                <button
                    onClick={() => setSelectedType('discussion')}
                    className={`px-4 py-2 rounded-md ${
                        selectedType === 'discussion' 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Discussions
                </button>
                <button
                    onClick={() => setSelectedType('job_share')}
                    className={`px-4 py-2 rounded-md ${
                        selectedType === 'job_share' 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Job Shares
                </button>
                <button
                    onClick={() => setSelectedType('announcement')}
                    className={`px-4 py-2 rounded-md ${
                        selectedType === 'announcement' 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Announcements
                </button>
                <button
                    onClick={() => setSelectedType('question')}
                    className={`px-4 py-2 rounded-md ${
                        selectedType === 'question' 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Questions
                </button>
            </div>

            <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No posts found in this group.
                    </div>
                ) : (
                    filteredPosts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            groupId={groupId}
                            onLike={likePost}
                            onComment={addComment}
                            currentUser={user}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const PostCard = ({ post, groupId, onLike, onComment, currentUser }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser._id));

    const handleLike = () => {
        onLike(post._id);
        setIsLiked(!isLiked);
    };

    const handleComment = () => {
        if (newComment.trim()) {
            onComment(post._id, newComment);
            setNewComment('');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {post.author.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-800">{post.author.name}</div>
                        <div className="text-sm text-gray-500">{formatDate(post.createdAt)}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.type === 'announcement' ? 'bg-red-100 text-red-800' :
                        post.type === 'question' ? 'bg-blue-100 text-blue-800' :
                        post.type === 'job_share' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {post.type.replace('_', ' ').charAt(0).toUpperCase() + post.type.slice(1).replace('_', ' ')}
                    </span>
                    {post.isPinned && (
                        <span className="text-yellow-500">📌</span>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 hover:text-primary ${
                        isLiked ? 'text-primary' : ''
                    }`}
                >
                    <span>{isLiked ? '❤️' : '🤍'}</span>
                    {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 hover:text-primary"
                >
                    💬 {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                </button>
            </div>

            {showComments && (
                <div className="border-t pt-4">
                    <div className="space-y-3 mb-4">
                        {post.comments.map((comment, index) => (
                            <div key={index} className="flex gap-3">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                                    {comment.author.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-sm text-gray-800">
                                        {comment.author.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {comment.content}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {formatDate(comment.createdAt)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                        />
                        <button
                            onClick={handleComment}
                            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                        >
                            Comment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupPosts;
