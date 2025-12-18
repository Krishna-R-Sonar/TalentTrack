// frontend/src/components/Community.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import AuthRequired from './AuthRequired';

const Community = () => {
    const { user, isAuthenticated } = useSelector((state) => state.user);
    const [communityPosts, setCommunityPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedNiche, setSelectedNiche] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCommunityPosts();
        } else {
            setAuthError(true);
        }
    }, [isAuthenticated]);

    const fetchCommunityPosts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedNiche) params.append('niche', selectedNiche);
            if (selectedType !== 'all') params.append('type', selectedType);
            if (searchQuery) params.append('query', searchQuery);

            const response = await axios.get(`/api/v1/community/posts?${params}`, {
                withCredentials: true
            });
            setCommunityPosts(response.data.posts);
            setAuthError(false);
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                setAuthError(true);
                setLoading(false);
                return;
            }
            toast.error('Failed to fetch community posts');
            console.error('Error fetching community posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchCommunityPosts();
    };

    const getNicheOptions = () => {
        return ['Web Development', 'Mobile Development', 'Data Science', 'AI/ML', 'DevOps', 'UI/UX', 'Product Management', 'Marketing', 'Sales', 'Finance', 'Healthcare', 'Education'];
    };

    const getTypeOptions = () => {
        return [
            { value: 'all', label: 'All Types' },
            { value: 'discussion', label: 'Discussions' },
            { value: 'job_share', label: 'Job Shares' },
            { value: 'announcement', label: 'Announcements' },
            { value: 'question', label: 'Questions' }
        ];
    };

    const handleLike = async (groupId, postId) => {
        try {
            await axios.post(`/api/v1/groups/${groupId}/posts/${postId}/like`, {}, {
                withCredentials: true
            });
            fetchCommunityPosts();  // Refresh posts
        } catch (error) {
            toast.error('Failed to like post');
        }
    };

    const handleComment = async (groupId, postId, content) => {
        if (!content.trim()) return;
        try {
            await axios.post(`/api/v1/groups/${groupId}/posts/${postId}/comments`, { content }, {
                withCredentials: true
            });
            fetchCommunityPosts();  // Refresh posts
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    if (authError || !isAuthenticated) {
        return <AuthRequired />;
    }

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="p-4 sm:p-6 min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Community</h1>
                    <p className="text-gray-600">Discover discussions, job opportunities, and insights from the entire TalentTrack community</p>
                </div>

                {/* Search and Filter */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Search community posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        />
                        <select
                            value={selectedNiche}
                            onChange={(e) => setSelectedNiche(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        >
                            <option value="">All Niches</option>
                            {getNicheOptions().map(niche => (
                                <option key={niche} value={niche}>{niche}</option>
                            ))}
                        </select>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        >
                            {getTypeOptions().map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleSearch}
                            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Community Posts */}
                <div className="space-y-6">
                    {communityPosts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts found</h3>
                            <p className="text-gray-500">Try adjusting your search criteria or join some groups to see community posts.</p>
                        </div>
                    ) : (
                        communityPosts.map((post) => (
                            <CommunityPostCard 
                                key={post._id} 
                                post={post} 
                                currentUser={user} 
                                onLike={() => handleLike(post.group._id, post._id)}
                                onComment={(content) => handleComment(post.group._id, post._id, content)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const CommunityPostCard = ({ post, currentUser, onLike, onComment }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isLiked, setIsLiked] = useState(post.likes.some(like => like._id === currentUser._id));

    const handleLikeClick = () => {
        onLike();
        setIsLiked(!isLiked);
    };

    const handleCommentSubmit = () => {
        if (newComment.trim()) {
            onComment(newComment);
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
                        <div className="text-sm text-gray-500">
                            in <span className="text-primary font-medium">{post.group.name}</span> • {formatDate(post.createdAt)}
                        </div>
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
                    onClick={handleLikeClick}
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
                                    <button
                                        onClick={() => {/* Implement delete comment */}}
                                        className="text-xs text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
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
                            onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                        />
                        <button
                            onClick={handleCommentSubmit}
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

export default Community;