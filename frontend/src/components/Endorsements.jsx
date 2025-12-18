// frontend/src/components/Endorsements.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const Endorsements = () => {
    const { user } = useSelector((state) => state.user);
    const [endorsements, setEndorsements] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEndorsements();
        fetchStats();
    }, []);

    const fetchEndorsements = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/endorsements/user/${user._id}`, {
                withCredentials: true
            });
            setEndorsements(response.data.endorsements);
        } catch (error) {
            toast.error('Failed to fetch endorsements');
            console.error('Error fetching endorsements:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`/api/v1/endorsements/stats/${user._id}`, {
                withCredentials: true
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching endorsement stats:', error);
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="p-4 sm:p-6 min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">My Endorsements</h1>
                
                {stats && (
                    <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Endorsement Statistics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{stats.totalEndorsements}</div>
                                <div className="text-gray-600">Total Endorsements</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{stats.uniqueSkills}</div>
                                <div className="text-gray-600">Unique Skills</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{stats.topSkills[0]?.count || 0}</div>
                                <div className="text-gray-600">Highest Endorsed Skill</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Top Skills</h2>
                    {stats?.topSkills.length > 0 ? (
                        <div className="space-y-4">
                            {stats.topSkills.map((skill, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                    <span className="font-medium">{skill.skill}</span>
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                        {skill.count} endorsements
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No endorsements yet.</p>
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">All Endorsements</h2>
                    {endorsements.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No endorsements received yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {endorsements.map((endorsement) => (
                                <div key={endorsement._id} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-lg">{endorsement.skill}</h3>
                                            <p className="text-sm text-gray-600">
                                                Endorsed by {endorsement.endorser.name} ({endorsement.endorser.role})
                                            </p>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(endorsement.endorsedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Endorsements;