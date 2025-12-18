// frontend/src/components/ResumeBasedJobSearch.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { fetchResumeBasedJobs, clearJobErrors } from '../store/slices/jobSlice';  // Correct path (assuming slices is in store)
import Spinner from './Spinner';

const ResumeBasedJobSearch = () => {
    const { isAuthenticated, user } = useSelector((state) => state.user);
    const { recommendedJobs, recommendationsLoading, error } = useSelector((state) => state.jobs);
    const dispatch = useDispatch();

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearJobErrors());
        }
    }, [error, dispatch]);
    
    useEffect(() => {
        if (isAuthenticated && user.resume?.url) {
            dispatch(fetchResumeBasedJobs());
        }
    }, [dispatch, isAuthenticated, user.resume]);

    if (!isAuthenticated) {
        return <div className="p-6 text-center text-dark">Please log in to use this feature.</div>;
    }

    if (!user.resume?.url) {
        return (
            <div className="p-6 text-center text-dark">
                Please <Link to="/dashboard/update-profile" className="text-primary underline">upload a resume</Link> to find jobs matched to your profile.
            </div>
        );
    }
    
    if (recommendationsLoading) {
        return <Spinner />;
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-semibold text-primary mb-6">Jobs Matched to Your Resume</h3>
            {!recommendedJobs || recommendedJobs.length === 0 ? (
                <p className="text-gray-600 text-center">No jobs matched your resume. Try updating your resume or check back later.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedJobs.map((job) => (
                        <div key={job._id} className="bg-neutral p-6 rounded-md shadow-md flex flex-col justify-between">
                            <div>
                                <h4 className="text-xl font-semibold text-dark">{job.title}</h4>
                                <p className="text-gray-700 font-medium">{job.companyName} - {job.location}</p>
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-sm text-blue-800 font-semibold">AI Match Reason:</p>
                                    <p className="text-sm text-blue-700">{job.reason}</p>
                                </div>
                                <p className="text-gray-600 mt-3"><span className="font-semibold">Salary:</span> {job.salary}</p>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Link to={`/jobs/${job._id}`} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors">
                                    View & Apply
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResumeBasedJobSearch;