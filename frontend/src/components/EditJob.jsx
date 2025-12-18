// frontend/src/components/EditJob.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { updateJob, fetchMyJobs } from '../store/slices/jobSlice';
import Spinner from './Spinner';

const EditJob = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { jobs, loading, error } = useSelector((state) => state.jobs);
    const [formData, setFormData] = useState({
        title: '',
        companyName: '',
        location: '',
        salary: '',
        jobType: '',
        jobNiche: '',
        introduction: '',
        responsibilities: '',
        qualifications: '',
    });

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
        // Find the job to edit
        const job = jobs.find((job) => job._id === jobId);
        if (job) {
            setFormData({
                title: job.title,
                companyName: job.companyName,
                location: job.location,
                salary: job.salary,
                jobType: job.jobType,
                jobNiche: job.jobNiche,
                introduction: job.introduction,
                responsibilities: job.responsibilities,
                qualifications: job.qualifications,
            });
        } else {
            // Fetch jobs if not found in state
            dispatch(fetchMyJobs());
        }
    }, [error, jobs, jobId, dispatch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateJob({ jobId, formData })).unwrap();
            toast.success('Job updated successfully');
            navigate('/dashboard/my-jobs');
        } catch (err) {
            toast.error('Failed to update job');
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-6">Edit Job Posting</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Job Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Company Name</label>
                    <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Salary</label>
                    <input
                        type="text"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Job Type</label>
                    <select
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        required
                    >
                        <option value="">Select Job Type</option>
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Job Niche</label>
                    <select
                        name="jobNiche"
                        value={formData.jobNiche}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        required
                    >
                        <option value="">Select Niche</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="Data Science">Data Science</option>
                        <option value="AI/ML">AI/ML</option>
                        <option value="DevOps">DevOps</option>
                        <option value="UI/UX">UI/UX</option>
                        <option value="Product Management">Product Management</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Introduction</label>
                    <textarea
                        name="introduction"
                        value={formData.introduction}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        rows="4"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Responsibilities</label>
                    <textarea
                        name="responsibilities"
                        value={formData.responsibilities}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        rows="4"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Qualifications</label>
                    <textarea
                        name="qualifications"
                        value={formData.qualifications}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        rows="4"
                        required
                    />
                </div>
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Job'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/my-jobs')}
                        className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditJob;
