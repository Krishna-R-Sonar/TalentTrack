// frontend/src/components/Connections.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getUser } from '../store/slices/userSlice';
import Spinner from './Spinner';
import AuthRequired from './AuthRequired';

const Connections = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.user);
    const [connections, setConnections] = useState([]);
    const [pendingConnections, setPendingConnections] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNiche, setSelectedNiche] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('connections');
    const [endorsementModalOpen, setEndorsementModalOpen] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState(null);
    const [endorsementSuggestions, setEndorsementSuggestions] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            setAuthError(true);
            return;
        }
        if (user) {
            fetchConnections();
        }
    }, [user, isAuthenticated]);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/connections/user/${user._id}`, {
                withCredentials: true
            });
            setConnections(response.data.connections);
            setPendingConnections(response.data.pendingConnections);
            setSentRequests(response.data.sentConnectionRequests);
            setAuthError(false);
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                setAuthError(true);
                setLoading(false);
                return;
            }
            toast.error('Failed to fetch connections');
            console.error('Error fetching connections:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchUsers = async () => {
        if (!searchQuery.trim()) return;
        
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchQuery) params.append('query', searchQuery);
            if (selectedNiche) params.append('niche', selectedNiche);
            if (selectedRole) params.append('role', selectedRole);

            const response = await axios.get(`/api/v1/connections/search?${params}`, {
                withCredentials: true
            });
            setSearchResults(response.data.users);
        } catch (error) {
            toast.error('Failed to search users');
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendConnectionRequest = async (userId) => {
        try {
            await axios.post(`/api/v1/connections/request/${userId}`, {}, {
                withCredentials: true
            });
            toast.success('Connection request sent successfully');
            fetchConnections();
            searchUsers(); // Refresh search results
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send connection request');
        }
    };

    const acceptConnection = async (userId) => {
        try {
            await axios.post(`/api/v1/connections/accept/${userId}`, {}, {
                withCredentials: true
            });
            toast.success('Connection request accepted');
            fetchConnections();
            dispatch(getUser()); // Refresh user data for impact points
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept connection');
        }
    };

    const rejectConnection = async (userId) => {
        try {
            await axios.post(`/api/v1/connections/reject/${userId}`, {}, {
                withCredentials: true
            });
            toast.success('Connection request rejected');
            fetchConnections();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject connection');
        }
    };

    const removeConnection = async (userId) => {
        if (window.confirm('Are you sure you want to remove this connection?')) {
            try {
                await axios.delete(`/api/v1/connections/remove/${userId}`, {
                    withCredentials: true
                });
                toast.success('Connection removed successfully');
                fetchConnections();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to remove connection');
            }
        }
    };

    const fetchEndorsementSuggestions = async (userId) => {
        try {
            const response = await axios.get(`/api/v1/endorsements/suggestions/${userId}`, {
                withCredentials: true
            });
            setEndorsementSuggestions(response.data.suggestions);
        } catch (error) {
            toast.error('Failed to fetch endorsement suggestions');
            console.error('Error fetching suggestions:', error);
        }
    };

    const openEndorsementModal = async (connection) => {
        setSelectedConnection(connection);
        await fetchEndorsementSuggestions(connection._id);
        setEndorsementModalOpen(true);
    };

    const sendEndorsement = async () => {
        if (!selectedSkill) {
            toast.error('Please select a skill');
            return;
        }
        try {
            await axios.post(`/api/v1/endorsements/send/${selectedConnection._id}`, {
                skill: selectedSkill
            }, {
                withCredentials: true
            });
            toast.success('Endorsement sent successfully');
            setEndorsementModalOpen(false);
            setSelectedSkill('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send endorsement');
        }
    };

    const getNicheOptions = () => {
        const niches = ['Web Development', 'Mobile Development', 'Data Science', 'AI/ML', 'DevOps', 'UI/UX', 'Product Management', 'Marketing', 'Sales', 'Finance', 'Healthcare', 'Education'];
        return niches;
    };

    const getRoleOptions = () => {
        return ['Job Seeker', 'Employer'];
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
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Connections</h1>
                
                {/* Search Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4">Find People to Connect With</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search by name..."
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
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        >
                            <option value="">All Roles</option>
                            {getRoleOptions().map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <button
                            onClick={searchUsers}
                            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                        >
                            Search
                        </button>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Search Results:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {searchResults.map(u => (
                                    <div key={u._id} className="p-4 border rounded-lg bg-white">
                                        <h4 className="font-semibold">{u.name}</h4>
                                        <p className="text-sm text-gray-600">{u.role}</p>
                                        <p className="text-sm text-gray-500">
                                            {u.niches?.firstNiche}, {u.niches?.secondNiche}
                                        </p>
                                        <button
                                            onClick={() => sendConnectionRequest(u._id)}
                                            className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-sm"
                                        >
                                            Connect
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 border-b pb-2">
                    <button
                        onClick={() => setActiveTab('connections')}
                        className={`px-4 py-2 rounded-md ${activeTab === 'connections' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Connections ({connections.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 rounded-md ${activeTab === 'pending' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Pending ({pendingConnections.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`px-4 py-2 rounded-md ${activeTab === 'sent' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Sent ({sentRequests.length})
                    </button>
                </div>

                {/* Connections Tab */}
                {activeTab === 'connections' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {connections.length === 0 ? (
                            <p className="col-span-full text-center text-gray-500 py-8">No connections yet. Start searching and connecting!</p>
                        ) : (
                            connections.map(connection => (
                                <div key={connection._id} className="p-4 border rounded-lg bg-white">
                                    <h4 className="font-semibold text-lg mb-2">{connection.name}</h4>
                                    <p className="text-sm text-gray-600 mb-1">{connection.role}</p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Niches: {connection.niches?.firstNiche}, {connection.niches?.secondNiche}, {connection.niches?.thirdNiche}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEndorsementModal(connection)}
                                            className="flex-1 bg-green-500 text-white py-2 rounded text-sm hover:bg-green-600"
                                        >
                                            Endorse
                                        </button>
                                        <button
                                            onClick={() => removeConnection(connection._id)}
                                            className="flex-1 bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Pending Tab */}
                {activeTab === 'pending' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingConnections.length === 0 ? (
                            <p className="col-span-full text-center text-gray-500 py-8">No pending requests.</p>
                        ) : (
                            pendingConnections.map(connection => (
                                <div key={connection._id} className="p-4 border rounded-lg bg-white">
                                    <h4 className="font-semibold text-lg mb-2">{connection.name}</h4>
                                    <p className="text-sm text-gray-600 mb-1">{connection.role}</p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Niches: {connection.niches?.firstNiche}, {connection.niches?.secondNiche}, {connection.niches?.thirdNiche}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => acceptConnection(connection._id)}
                                            className="flex-1 bg-green-500 text-white py-2 rounded text-sm hover:bg-green-600"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => rejectConnection(connection._id)}
                                            className="flex-1 bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Sent Tab */}
                {activeTab === 'sent' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sentRequests.length === 0 ? (
                            <p className="col-span-full text-center text-gray-500 py-8">No sent requests.</p>
                        ) : (
                            sentRequests.map(connection => (
                                <div key={connection._id} className="p-4 border rounded-lg bg-white">
                                    <h4 className="font-semibold text-lg mb-2">{connection.name}</h4>
                                    <p className="text-sm text-gray-600 mb-1">{connection.role}</p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Niches: {connection.niches?.firstNiche}, {connection.niches?.secondNiche}, {connection.niches?.thirdNiche}
                                    </p>
                                    <p className="text-sm text-yellow-600 text-center bg-yellow-50 py-2 rounded">
                                        Request Pending
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Endorsement Modal */}
                {endorsementModalOpen && selectedConnection && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                            <h3 className="text-xl font-semibold mb-4">Endorse {selectedConnection.name}</h3>
                            <p className="text-gray-600 mb-4">Select a skill to endorse based on suggestions:</p>
                            {endorsementSuggestions.length > 0 ? (
                                <div className="space-y-3 mb-4">
                                    {endorsementSuggestions.map((sug, index) => (
                                        <label key={index} className="flex items-start gap-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="skill"
                                                value={sug.skill}
                                                onChange={(e) => setSelectedSkill(e.target.value)}
                                                className="mt-1"
                                            />
                                            <div>
                                                <div className="font-medium">{sug.skill}</div>
                                                <div className="text-sm text-gray-600">{sug.reason}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 mb-4">No suggestions available. Enter a custom skill.</p>
                            )}
                            <input
                                type="text"
                                placeholder="Or enter custom skill..."
                                value={selectedSkill}
                                onChange={(e) => setSelectedSkill(e.target.value)}
                                className="w-full p-2 border rounded-md mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setEndorsementModalOpen(false);
                                        setSelectedSkill('');
                                    }}
                                    className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={sendEndorsement}
                                    disabled={!selectedSkill}
                                    className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Send Endorsement
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Connections;