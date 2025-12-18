// frontend/src/components/Applications.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import axios from "axios";
import {
    clearApplicationErrors, // Corrected import name
    deleteApplication,
    fetchEmployerApplications,
    clearApplicationMessage,
} from "../store/slices/applicationSlice";
import Spinner from "./Spinner";

const Applications = () => {
    const { applications, loading, error, message } = useSelector((state) => state.applications);
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [metrics, setMetrics] = useState({});

    const fetchMetricsForApplications = useCallback(async (apps) => {
        if (user.role !== "Employer" || !apps || apps.length === 0) return;
        const jobIds = [...new Set(apps.map(app => app.jobInfo.jobId))];
        
        try {
            const metricPromises = jobIds.map(jobId =>
                axios.get(`/application/metrics/${jobId}`, { withCredentials: true })
            );
            const responses = await Promise.all(metricPromises);
            const newMetrics = {};
            responses.forEach(response => {
                const metricData = response.data.metrics;
                if (metricData) {
                    newMetrics[metricData.jobId] = metricData.submissionCount;
                }
            });
            setMetrics(prev => ({ ...prev, ...newMetrics }));
        } catch (err) {
            console.error("Failed to fetch application metrics:", err);
            toast.error("Could not load application submission counts.");
        }
    }, [user.role]);

    useEffect(() => {
        if (user.role === "Employer") {
            dispatch(fetchEmployerApplications());
        }
    }, [dispatch, user.role]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearApplicationErrors()); // Corrected dispatch
        }
        if (message) {
            toast.success(message);
            dispatch(clearApplicationMessage());
        }
        if (applications && applications.length > 0) {
            fetchMetricsForApplications(applications);
        }
    }, [error, message, applications, dispatch, fetchMetricsForApplications]);

    const handleDeleteApplication = (id) => {
        if(window.confirm("Are you sure you want to delete this application?")){
            dispatch(deleteApplication(id));
        }
    };

    if (loading && (!applications || applications.length === 0)) {
        return <Spinner />;
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-semibold text-primary mb-6">Applications For Your Jobs</h3>
            {applications && applications.length > 0 ? (
                <div className="space-y-6">
                    {applications.map((element) => (
                        <div key={element._id} className="bg-neutral p-4 sm:p-6 rounded-lg shadow-md">
                             <div className="flex flex-col sm:flex-row justify-between items-start">
                                <div>
                                    <p className="text-xl font-bold text-dark">{element.jobInfo.jobTitle}</p>
                                    <p className="text-gray-600 font-medium">
                                        Total Submissions for this Job: <span className="font-bold text-primary">{metrics[element.jobInfo.jobId] || 'Loading...'}</span>
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        <span className="font-semibold text-dark">Applicant:</span> {element.jobSeekerInfo.name}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-semibold text-dark">Email:</span> {element.jobSeekerInfo.email}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-semibold text-dark">Phone:</span> {element.jobSeekerInfo.phone}
                                    </p>
                                     <p className="text-gray-600 mt-2">
                                        <span className="font-semibold text-dark">Cover Letter:</span> {element.jobSeekerInfo.coverLetter}
                                    </p>
                                </div>
                                <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end gap-3">
                                    {element.jobSeekerInfo.resume?.url && (
                                        <a href={element.jobSeekerInfo.resume.url} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors text-center" target="_blank" rel="noopener noreferrer">
                                            View Resume
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDeleteApplication(element._id)}
                                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Delete Application
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-neutral rounded-lg">
                    <h1 className="text-xl font-semibold text-dark">You have no applications from job seekers.</h1>
                </div>
            )}
        </div>
    );
};

export default Applications;
