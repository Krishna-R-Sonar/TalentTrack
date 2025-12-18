// frontend/src/components/Groups.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import GroupPosts from './GroupPosts';
import AuthRequired from './AuthRequired';

const Groups = () => {
    const { user, isAuthenticated } = useSelector((state) => state.user);
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        name: '',
        description: '',
        niche: '',
        isPrivate: false
    });
    const [selectedNiche, setSelectedNiche] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            setAuthError(true);
            return;
        }
        if (groupId) {
            fetchGroupDetails();
        } else {
            fetchGroups();
            fetchMyGroups();
        }
    }, [groupId, isAuthenticated]);

    const fetchGroupDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/groups/${groupId}`, {
                withCredentials: true
            });
            setSelectedGroup(response.data.group);
            setAuthError(false);
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                setAuthError(true);
                setLoading(false);
                return;
            }
            toast.error('Failed to fetch group details');
            console.error('Error fetching group details:', error);
            navigate('/groups');
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedNiche) params.append('niche', selectedNiche);
            if (searchQuery) params.append('query', searchQuery);

            const response = await axios.get(`/api/v1/groups?${params}`, {
                withCredentials: true
            });
            setGroups(response.data.groups);
            setAuthError(false);
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                setAuthError(true);
                setLoading(false);
                return;
            }
            toast.error('Failed to fetch groups');
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyGroups = async () => {
        try {
            const response = await axios.get(`/api/v1/groups`, {
                withCredentials: true
            });
            // Filter groups where user is a member
            const userGroups = response.data.groups.filter(group => 
                group.members.some(member => member._id === user._id)
            );
            setMyGroups(userGroups);
        } catch (error) {
            console.error('Error fetching my groups:', error);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/v1/groups/create', createFormData, {
                withCredentials: true
            });
            toast.success('Group created successfully');
            setShowCreateForm(false);
            setCreateFormData({ name: '', description: '', niche: '', isPrivate: false });
            fetchGroups();
            fetchMyGroups();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create group');
        }
    };

    const joinGroup = async (groupId) => {
        try {
            await axios.post(`/api/v1/groups/${groupId}/join`, {}, {
                withCredentials: true
            });
            toast.success('Join request sent successfully');
            fetchGroups();
            fetchMyGroups();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join group');
        }
    };

    const getNicheOptions = () => {
        return ['Web Development', 'Mobile Development', 'Data Science', 'AI/ML', 'DevOps', 'UI/UX', 'Product Management', 'Marketing', 'Sales', 'Finance', 'Healthcare', 'Education'];
    };

    const handleSearch = () => {
        fetchGroups();
    };

    // If viewing a specific group, show group details and posts
    if (groupId && selectedGroup) {
        return (
            <div className="p-4 sm:p-6 min-h-screen bg-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/groups')}
                            className="text-primary hover:text-primary-dark mb-4 flex items-center gap-2"
                        >
                            ← Back to Groups
                        </button>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedGroup.name}</h1>
                                    <p className="text-gray-600 mb-2">{selectedGroup.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span><strong>Niche:</strong> {selectedGroup.niche}</span>
                                        <span><strong>Members:</strong> {selectedGroup.memberCount}</span>
                                        <span className={`px-2 py-1 rounded ${
                                            selectedGroup.isPrivate ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {selectedGroup.isPrivate ? 'Private' : 'Public'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Created by</p>
                                    <p className="font-semibold">{selectedGroup.creator?.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <GroupPosts groupId={groupId} groupName={selectedGroup.name} />
                </div>
            </div>
        );
    }

    if (authError || !isAuthenticated) {
        return <AuthRequired />;
    }

    if (loading && !groups.length) {
        return <Spinner />;
    }

    return (
        <div className="p-4 sm:p-6 min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Groups</h1>
                    <p className="text-gray-600">Connect with professionals in your niche and share knowledge</p>
                </div>

                {/* Search and Filter */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search groups..."
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
                        <button
                            onClick={handleSearch}
                            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                        >
                            Search
                        </button>
                    </div>
                    
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                    >
                        {showCreateForm ? 'Cancel' : 'Create New Group'}
                    </button>
                </div>

                {/* Create Group Form */}
                {showCreateForm && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Group Name
                                    </label>
                                    <input
                                        type="text"
                                        value={createFormData.name}
                                        onChange={(e) => setCreateFormData({
                                            ...createFormData,
                                            name: e.target.value
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Niche
                                    </label>
                                    <select
                                        value={createFormData.niche}
                                        onChange={(e) => setCreateFormData({
                                            ...createFormData,
                                            niche: e.target.value
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                        required
                                    >
                                        <option value="">Select a niche</option>
                                        {getNicheOptions().map(niche => (
                                            <option key={niche} value={niche}>{niche}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={createFormData.description}
                                    onChange={(e) => setCreateFormData({
                                        ...createFormData,
                                        description: e.target.value
                                    })}
                                    rows="3"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isPrivate"
                                    checked={createFormData.isPrivate}
                                    onChange={(e) => setCreateFormData({
                                        ...createFormData,
                                        isPrivate: e.target.checked
                                    })}
                                    className="h-4 w-4 text-primary rounded focus:ring-primary"
                                />
                                <label htmlFor="isPrivate" className="text-sm text-gray-700">
                                    Make this group private (requires approval to join)
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
                            >
                                Create Group
                            </button>
                        </form>
                    </div>
                )}

                {/* My Groups */}
                <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-4">My Groups</h4>
                    {myGroups.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">You haven't joined any groups yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myGroups.map(group => (
                                <div key={group._id} className="p-4 border rounded-lg bg-white">
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-semibold text-lg">{group.name}</h5>
                                        <span className={`px-2 py-1 text-xs rounded ${
                                            group.isPrivate ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {group.isPrivate ? 'Private' : 'Public'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                                    <p className="text-sm text-gray-500 mb-2">
                                        <strong>Niche:</strong> {group.niche}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-3">
                                        <strong>Members:</strong> {group.memberCount}
                                    </p>
                                    <button
                                        onClick={() => navigate(`/groups/${group._id}`)}
                                        className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                                    >
                                        View Group
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* All Groups */}
                <div>
                    <h4 className="text-lg font-semibold mb-4">Discover Groups</h4>
                    {groups.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No groups found matching your criteria.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groups.map(group => {
                                const isMember = group.members.some(member => member._id === user._id);
                                const isPending = group.pendingMembers?.some(member => member._id === user._id);
                                
                                return (
                                    <div key={group._id} className="p-4 border rounded-lg bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-semibold text-lg">{group.name}</h5>
                                            <span className={`px-2 py-1 text-xs rounded ${
                                                group.isPrivate ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {group.isPrivate ? 'Private' : 'Public'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                                        <p className="text-sm text-gray-500 mb-2">
                                            <strong>Niche:</strong> {group.niche}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-2">
                                            <strong>Members:</strong> {group.memberCount}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-3">
                                            <strong>Created by:</strong> {group.creator?.name}
                                        </p>
                                        
                                        {isMember ? (
                                            <button
                                                onClick={() => navigate(`/groups/${group._id}`)}
                                                className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                                            >
                                                View Group
                                            </button>
                                        ) : isPending ? (
                                            <button className="w-full bg-yellow-500 text-white px-3 py-2 rounded text-sm cursor-not-allowed">
                                                Request Pending
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => joinGroup(group._id)}
                                                className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                                            >
                                                Join Group
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Groups;
