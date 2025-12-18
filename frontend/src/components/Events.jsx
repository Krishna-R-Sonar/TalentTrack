// frontend/src/components/Events.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import AuthRequired from './AuthRequired';

const Events = () => {
    const { user, isAuthenticated } = useSelector((state) => state.user);
    const [events, setEvents] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        title: '',
        description: '',
        date: '',
        duration: 60,
        type: 'webinar',
        niche: '',
        maxAttendees: 100,
        isOnline: true,
        meetingLink: '',
        location: '',
        isFree: true,
        price: 0,
        tags: []
    });
    const [selectedNiche, setSelectedNiche] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            setAuthError(true);
            return;
        }
        fetchEvents();
        fetchMyEvents();
        fetchRecommendations();
    }, [isAuthenticated]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedNiche) params.append('niche', selectedNiche);
            if (selectedType) params.append('type', selectedType);
            if (searchQuery) params.append('query', searchQuery);

            const response = await axios.get(`/api/v1/events?${params}`, {
                withCredentials: true
            });
            setEvents(response.data.events);
            setAuthError(false);
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                setAuthError(true);
                setLoading(false);
                return;
            }
            toast.error('Failed to fetch events');
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyEvents = async () => {
        try {
            const response = await axios.get(`/api/v1/events`, {
                withCredentials: true
            });
            // Filter events where user is registered or hosting
            const userEvents = response.data.events.filter(event => 
                event.registeredAttendees.some(attendee => attendee._id === user._id) ||
                event.host._id === user._id
            );
            setMyEvents(userEvents);
        } catch (error) {
            console.error('Error fetching my events:', error);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const response = await axios.get('/api/v1/events/recommendations', {
                withCredentials: true
            });
            setRecommendations(response.data.recommendations);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/v1/events/create', createFormData, {
                withCredentials: true
            });
            toast.success('Event created successfully');
            setShowCreateForm(false);
            setCreateFormData({
                title: '', description: '', date: '', duration: 60, type: 'webinar',
                niche: '', maxAttendees: 100, isOnline: true, meetingLink: '',
                location: '', isFree: true, price: 0, tags: []
            });
            fetchEvents();
            fetchMyEvents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create event');
        }
    };

    const registerForEvent = async (eventId) => {
        try {
            await axios.post(`/api/v1/events/${eventId}/register`, {}, {
                withCredentials: true
            });
            toast.success('Successfully registered for the event');
            fetchEvents();
            fetchMyEvents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register for event');
        }
    };

    const unregisterFromEvent = async (eventId) => {
        try {
            await axios.delete(`/api/v1/events/${eventId}/unregister`, {
                withCredentials: true
            });
            toast.success('Successfully unregistered from the event');
            fetchEvents();
            fetchMyEvents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to unregister from event');
        }
    };

    const checkInToEvent = async (eventId) => {
        try {
            await axios.post(`/api/v1/events/${eventId}/check-in`, {}, {
                withCredentials: true
            });
            toast.success('Successfully checked in to the event');
            fetchEvents();
            fetchMyEvents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to check in to event');
        }
    };

    const getNicheOptions = () => {
        return ['Web Development', 'Mobile Development', 'Data Science', 'AI/ML', 'DevOps', 'UI/UX', 'Product Management', 'Marketing', 'Sales', 'Finance', 'Healthcare', 'Education'];
    };

    const getEventTypes = () => {
        return ['webinar', 'workshop', 'networking', 'career_fair', 'panel_discussion'];
    };

    const handleSearch = () => {
        fetchEvents();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
    };

    if (authError || !isAuthenticated) {
        return <AuthRequired />;
    }

    if (loading && !events.length) {
        return <Spinner />;
    }

    return (
        <div className="account_components">
            <div className="flex justify-between items-center mb-6">
                <h3>Events & Webinars</h3>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                >
                    {showCreateForm ? 'Cancel' : 'Create Event'}
                </button>
            </div>

            {/* Create Event Form */}
            {showCreateForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-lg font-semibold mb-4">Create New Event</h4>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Event Title"
                                value={createFormData.title}
                                onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})}
                                className="p-2 border rounded-md"
                                required
                            />
                            <select
                                value={createFormData.type}
                                onChange={(e) => setCreateFormData({...createFormData, type: e.target.value})}
                                className="p-2 border rounded-md"
                                required
                            >
                                {getEventTypes().map(type => (
                                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="datetime-local"
                                value={createFormData.date}
                                onChange={(e) => setCreateFormData({...createFormData, date: e.target.value})}
                                className="p-2 border rounded-md"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Duration (minutes)"
                                value={createFormData.duration}
                                onChange={(e) => setCreateFormData({...createFormData, duration: parseInt(e.target.value)})}
                                className="p-2 border rounded-md"
                                min="15"
                                max="480"
                                required
                            />
                            <select
                                value={createFormData.niche}
                                onChange={(e) => setCreateFormData({...createFormData, niche: e.target.value})}
                                className="p-2 border rounded-md"
                                required
                            >
                                <option value="">Select Niche</option>
                                {getNicheOptions().map(niche => (
                                    <option key={niche} value={niche}>{niche}</option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            placeholder="Event Description"
                            value={createFormData.description}
                            onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                            className="w-full p-2 border rounded-md"
                            rows="3"
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Max Attendees"
                                value={createFormData.maxAttendees}
                                onChange={(e) => setCreateFormData({...createFormData, maxAttendees: parseInt(e.target.value)})}
                                className="p-2 border rounded-md"
                                min="1"
                                required
                            />
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={createFormData.isOnline}
                                        onChange={(e) => setCreateFormData({...createFormData, isOnline: e.target.checked})}
                                        className="mr-2"
                                    />
                                    Online Event
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={createFormData.isFree}
                                        onChange={(e) => setCreateFormData({...createFormData, isFree: e.target.checked})}
                                        className="mr-2"
                                    />
                                    Free Event
                                </label>
                            </div>
                        </div>
                        {createFormData.isOnline && (
                            <input
                                type="url"
                                placeholder="Meeting Link"
                                value={createFormData.meetingLink}
                                onChange={(e) => setCreateFormData({...createFormData, meetingLink: e.target.value})}
                                className="p-2 border rounded-md"
                                required
                            />
                        )}
                        {!createFormData.isOnline && (
                            <input
                                type="text"
                                placeholder="Location"
                                value={createFormData.location}
                                onChange={(e) => setCreateFormData({...createFormData, location: e.target.value})}
                                className="p-2 border rounded-md"
                                required
                            />
                        )}
                        {!createFormData.isFree && (
                            <input
                                type="number"
                                placeholder="Price"
                                value={createFormData.price}
                                onChange={(e) => setCreateFormData({...createFormData, price: parseFloat(e.target.value)})}
                                className="p-2 border rounded-md"
                                min="0"
                                step="0.01"
                                required
                            />
                        )}
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                            Create Event
                        </button>
                    </form>
                </div>
            )}

            {/* Search and Filter */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Search Events</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="p-2 border rounded-md"
                    />
                    <select
                        value={selectedNiche}
                        onChange={(e) => setSelectedNiche(e.target.value)}
                        className="p-2 border rounded-md"
                    >
                        <option value="">All Niches</option>
                        {getNicheOptions().map(niche => (
                            <option key={niche} value={niche}>{niche}</option>
                        ))}
                    </select>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="p-2 border rounded-md"
                    >
                        <option value="">All Types</option>
                        {getEventTypes().map(type => (
                            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleSearch}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
                <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-4">Recommended for You</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendations.map(rec => {
                            const event = events.find(e => e._id === rec.id);
                            if (!event) return null;
                            
                            return (
                                <div key={event._id} className="p-4 border rounded-lg bg-blue-50">
                                    <h5 className="font-semibold text-lg">{event.title}</h5>
                                    <p className="text-sm text-gray-600 mb-2">{event.description.substring(0, 100)}...</p>
                                    <p className="text-sm text-gray-500 mb-2">
                                        <strong>Date:</strong> {formatDate(event.date)}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-2">
                                        <strong>Type:</strong> {event.type}
                                    </p>
                                    <p className="text-sm text-blue-600 mb-3">
                                        <strong>Why:</strong> {rec.reason}
                                    </p>
                                    <button
                                        onClick={() => registerForEvent(event._id)}
                                        className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                                    >
                                        Register Now
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* My Events */}
            <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4">My Events</h4>
                {myEvents.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">You haven't registered for or hosted any events yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myEvents.map(event => {
                            const isRegistered = event.registeredAttendees.some(attendee => attendee._id === user._id);
                            const isHost = event.host._id === user._id;
                            
                            return (
                                <div key={event._id} className="p-4 border rounded-lg bg-white">
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-semibold text-lg">{event.title}</h5>
                                        <span className={`px-2 py-1 text-xs rounded ${
                                            isHost ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {isHost ? 'Hosting' : 'Registered'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{event.description.substring(0, 100)}...</p>
                                    <p className="text-sm text-gray-500 mb-2">
                                        <strong>Date:</strong> {formatDate(event.date)}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-2">
                                        <strong>Type:</strong> {event.type}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-3">
                                        <strong>Attendees:</strong> {event.registeredAttendees.length}/{event.maxAttendees}
                                    </p>
                                    
                                    {event.coHosts && event.coHosts.length > 0 && (
                                        <p className="text-sm text-gray-500 mb-2">
                                            <strong>Co-Hosts:</strong> {event.coHosts.map(ch => ch.name).join(', ')}
                                        </p>
                                    )}
                                    
                                    {isHost ? (
                                        <button
                                            onClick={() => window.location.href = `/events/${event._id}`}
                                            className="w-full bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600"
                                        >
                                            Manage Event
                                        </button>
                                    ) : (
                                        <div className="space-y-2">
                                            {(() => {
                                                const eventStartTime = new Date(event.date);
                                                const checkInStartTime = new Date(eventStartTime.getTime() - 15 * 60 * 1000);
                                                const eventEndTime = new Date(eventStartTime.getTime() + (event.duration || 60) * 60 * 1000);
                                                const now = new Date();
                                                const canCheckIn = now >= checkInStartTime && now <= eventEndTime;
                                                const hasCheckedIn = event.attendedAttendees && event.attendedAttendees.some(a => a._id === user._id);
                                                
                                                if (hasCheckedIn) {
                                                    return (
                                                        <button className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm cursor-default">
                                                            ✓ Checked In
                                                        </button>
                                                    );
                                                } else if (canCheckIn) {
                                                    return (
                                                        <button
                                                            onClick={() => checkInToEvent(event._id)}
                                                            className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                                                        >
                                                            Check In
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            <button
                                                onClick={() => unregisterFromEvent(event._id)}
                                                className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                                            >
                                                Unregister
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* All Events */}
            <div>
                <h4 className="text-lg font-semibold mb-4">Discover Events</h4>
                {events.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No events found matching your criteria.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {events.map(event => {
                            const isRegistered = event.registeredAttendees.some(attendee => attendee._id === user._id);
                            const isHost = event.host._id === user._id;
                            const isFull = event.registeredAttendees.length >= event.maxAttendees;
                            
                            return (
                                <div key={event._id} className="p-4 border rounded-lg bg-white">
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-semibold text-lg">{event.title}</h5>
                                        <span className={`px-2 py-1 text-xs rounded ${
                                            event.isFree ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {event.isFree ? 'Free' : `$${event.price}`}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{event.description.substring(0, 100)}...</p>
                                    <p className="text-sm text-gray-500 mb-2">
                                        <strong>Date:</strong> {formatDate(event.date)}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-2">
                                        <strong>Type:</strong> {event.type}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-2">
                                        <strong>Niche:</strong> {event.niche}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-2">
                                        <strong>Attendees:</strong> {event.registeredAttendees.length}/{event.maxAttendees}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-3">
                                        <strong>Host:</strong> {event.host?.name}
                                    </p>
                                    
                                    {event.coHosts && event.coHosts.length > 0 && (
                                        <p className="text-sm text-gray-500 mb-2">
                                            <strong>Co-Hosts:</strong> {event.coHosts.map(ch => ch.name).join(', ')}
                                        </p>
                                    )}
                                    
                                    {isHost ? (
                                        <button
                                            onClick={() => window.location.href = `/events/${event._id}`}
                                            className="w-full bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600"
                                        >
                                            Manage Event
                                        </button>
                                    ) : isRegistered ? (
                                        <div className="space-y-2">
                                            {(() => {
                                                const eventStartTime = new Date(event.date);
                                                const checkInStartTime = new Date(eventStartTime.getTime() - 15 * 60 * 1000);
                                                const eventEndTime = new Date(eventStartTime.getTime() + (event.duration || 60) * 60 * 1000);
                                                const now = new Date();
                                                const canCheckIn = now >= checkInStartTime && now <= eventEndTime;
                                                const hasCheckedIn = event.attendedAttendees && event.attendedAttendees.some(a => a._id === user._id);
                                                
                                                if (hasCheckedIn) {
                                                    return (
                                                        <button className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm cursor-default">
                                                            ✓ Checked In
                                                        </button>
                                                    );
                                                } else if (canCheckIn) {
                                                    return (
                                                        <button
                                                            onClick={() => checkInToEvent(event._id)}
                                                            className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                                                        >
                                                            Check In
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            <button
                                                onClick={() => unregisterFromEvent(event._id)}
                                                className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                                            >
                                                Unregister
                                            </button>
                                        </div>
                                    ) : isFull ? (
                                        <button className="w-full bg-gray-400 text-white px-3 py-2 rounded text-sm cursor-not-allowed">
                                            Event Full
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => registerForEvent(event._id)}
                                            className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                                        >
                                            Register
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;
