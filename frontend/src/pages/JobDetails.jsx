// frontend/src/pages/JobDetails.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSingleJob, clearJobErrors } from '../store/slices/jobSlice';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import AuthRequired from '../components/AuthRequired';

const JobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { singleJob, loading, error } = useSelector((state) => state.jobs);
    const { isAuthenticated } = useSelector((state) => state.user);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }
        dispatch(fetchSingleJob(jobId));
    }, [dispatch, jobId, isAuthenticated]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearJobErrors());
            navigate('/jobs');
        }
    }, [error, dispatch, navigate]);

    if (!isAuthenticated) {
        return <AuthRequired />;
    }

    if (loading || !singleJob) {
        return <Spinner />;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/jobs')}
                    className="mb-4 text-primary hover:text-primary-dark flex items-center gap-2"
                >
                    ← Back to Jobs
                </button>
                
                <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{singleJob.title}</h1>
                        <p className="text-xl text-gray-600 mb-4">{singleJob.companyName}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                📍 {singleJob.location}
                            </span>
                            <span className="flex items-center gap-1">
                                💼 {singleJob.jobType}
                            </span>
                            <span className="flex items-center gap-1">
                                🏢 {singleJob.workArrangement}
                            </span>
                            <span className="flex items-center gap-1">
                                💰 {singleJob.salary}
                            </span>
                            <span className="flex items-center gap-1">
                                🎯 {singleJob.jobNiche}
                            </span>
                        </div>
                    </div>

                    <div className="border-t pt-6 space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-3">Job Introduction</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{singleJob.introduction}</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-3">Responsibilities</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{singleJob.responsibilities}</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-3">Qualifications</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{singleJob.qualifications}</p>
                        </div>

                        {singleJob.offers && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-3">What We Offer</h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{singleJob.offers}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Hiring Multiple Candidates</p>
                                <p className="font-medium text-gray-800">{singleJob.hiringMultipleCandidates || 'No'}</p>
                            </div>
                            {singleJob.isSocialImpact && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Social Impact Role</p>
                                    <p className="font-medium text-green-600">Yes</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Posted On</p>
                                <p className="font-medium text-gray-800">
                                    {new Date(singleJob.jobPostedOn).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            {singleJob.postedBy && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Posted By</p>
                                    <p className="font-medium text-gray-800">{singleJob.postedBy.name || 'N/A'}</p>
                                </div>
                            )}
                        </div>

                        {singleJob.personalWebsite?.url && (
                            <div className="pt-4 border-t">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {singleJob.personalWebsite.title || 'Company Website'}
                                </h3>
                                <a
                                    href={singleJob.personalWebsite.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline break-all"
                                >
                                    {singleJob.personalWebsite.url}
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t">
                        <Link
                            to={`/post/application/${singleJob._id}`}
                            className="w-full sm:w-auto inline-block text-center px-8 py-3 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Apply Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;

