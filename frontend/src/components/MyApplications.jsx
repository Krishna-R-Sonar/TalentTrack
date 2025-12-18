// frontend/src/components/MyApplications.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
    clearApplicationErrors,
    clearApplicationMessage,
    deleteApplication,
    fetchJobSeekerApplications,
} from "../store/slices/applicationSlice";
import Spinner from "./Spinner";

const MyApplications = () => {
    const { loading, error, applications, message } = useSelector((state) => state.applications);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchJobSeekerApplications());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearApplicationErrors());
        }
        if (message) {
            toast.success(message);
            dispatch(clearApplicationMessage());
        }
    }, [dispatch, error, message]);

    const handleDelete = (id) => {
        dispatch(deleteApplication(id));
    };

    if (loading) return <Spinner />;

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <h3 className="text-2xl sm:text-3xl font-semibold text-primary mb-6">My Applications</h3>
            {!applications || applications.length === 0 ? (
                <h1 className="text-xl text-center text-dark py-6">You have not applied for any jobs yet.</h1>
            ) : (
                <div className="space-y-6">
                    {applications.map((app) => (
                        <div key={app._id} className="bg-neutral p-4 sm:p-6 rounded-md shadow-md">
                            <p className="text-lg font-semibold text-dark">{app.jobInfo.jobTitle}</p>
                            <p className="text-gray-600 mt-1">Applied on: {new Date(app.appliedOn).toLocaleDateString()}</p>
                            <div className="mt-4 flex flex-wrap gap-4 items-center">
                                <a href={app.jobSeekerInfo.resume.url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                    View Submitted Resume
                                </a>
                                <button
                                    onClick={() => handleDelete(app._id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                >
                                    Withdraw Application
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyApplications;