// frontend/src/pages/PostJob.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { postJob, clearJobErrors, resetJobPostState } from '../store/slices/jobSlice';
import Spinner from '../components/Spinner';
import AuthRequired from '../components/AuthRequired';

const PostJob = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, message } = useSelector((state) => state.jobs);
    const { user, isAuthenticated } = useSelector((state) => state.user);

    const [jobData, setJobData] = useState({
        title: '', jobType: '', location: '', companyName: '', introduction: '',
        responsibilities: '', qualifications: '', offers: '', salary: '',
        hiringMultipleCandidates: 'No', personalWebsiteTitle: '', personalWebsiteUrl: '',
        jobNiche: '', workArrangement: '', isSocialImpact: false,
    });

    useEffect(() => {
        // No role restriction - anyone can post jobs
    }, [user, navigate]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearJobErrors());
        }
        if (message) {
            toast.success(message);
            dispatch(resetJobPostState());
            navigate('/dashboard/my-jobs');
        }
    }, [error, message, dispatch, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setJobData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(postJob(jobData));
    };

    const nichesArray = [
        "Software Development", "Web Development", "Cybersecurity", "Data Science", "Artificial Intelligence", "Cloud Computing", "DevOps", "Mobile App Development", "Blockchain", "Database Administration", "Network Administration", "UI/UX Design", "Game Development", "IoT (Internet of Things)", "Big Data", "Machine Learning", "IT Project Management", "IT Support and Helpdesk", "Systems Administration", "IT Consulting",
    ];
    const cities = [
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", "Jaipur", "Lucknow", "Kanpur", "Surat", "Nagpur", "Patna", "Indore", "Bhopal", "Vadodara", "Coimbatore", "Thiruvananthapuram", "Visakhapatnam",
    ];
    const jobTypes = ["Full-time", "Part-time", "Internship", "Entry-level"];
    const workArrangements = ["On-site", "Remote", "Hybrid"];

    if (!isAuthenticated) {
        return <AuthRequired />;
    }

    if (loading) return <Spinner />;

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="max-w-4xl w-full p-6 sm:p-8 bg-white rounded-2xl shadow-lg">
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 text-center">Post a New Job</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-gray-700 mb-2 font-medium">Job Title</label><input type="text" name="title" value={jobData.title} onChange={handleInputChange} className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
                        <div><label className="block text-gray-700 mb-2 font-medium">Company Name</label><input type="text" name="companyName" value={jobData.companyName} onChange={handleInputChange} className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
                        <div><label className="block text-gray-700 mb-2 font-medium">Job Niche</label><select name="jobNiche" value={jobData.jobNiche} onChange={handleInputChange} className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" required><option value="">Select Niche</option>{nichesArray.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                        <div><label className="block text-gray-700 mb-2 font-medium">Location (City)</label><select name="location" value={jobData.location} onChange={handleInputChange} className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" required><option value="">Select City</option>{cities.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div><label className="block text-gray-700 mb-2 font-medium">Job Type</label><select name="jobType" value={jobData.jobType} onChange={handleInputChange} className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" required><option value="">Select Job Type</option>{jobTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label className="block text-gray-700 mb-2 font-medium">Work Arrangement</label><select name="workArrangement" value={jobData.workArrangement} onChange={handleInputChange} className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" required><option value="">Select Arrangement</option>{workArrangements.map(w => <option key={w} value={w}>{w}</option>)}</select></div>
                    </div>
                    <div><label className="block text-gray-700 mb-2 font-medium">Salary Range</label><input type="text" name="salary" value={jobData.salary} onChange={handleInputChange} placeholder="e.g., 80000 - 120000" className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
                    <div><label className="block text-gray-700 mb-2 font-medium">Job Introduction</label><textarea name="introduction" value={jobData.introduction} onChange={handleInputChange} rows="4" className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" required></textarea></div>
                    <div><label className="block text-gray-700 mb-2 font-medium">Responsibilities</label><textarea name="responsibilities" value={jobData.responsibilities} onChange={handleInputChange} rows="4" className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" required></textarea></div>
                    <div><label className="block text-gray-700 mb-2 font-medium">Qualifications</label><textarea name="qualifications" value={jobData.qualifications} onChange={handleInputChange} rows="4" className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" required></textarea></div>
                    <div><label className="block text-gray-700 mb-2 font-medium">What We Offer (Optional)</label><textarea name="offers" value={jobData.offers} onChange={handleInputChange} rows="3" className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"></textarea></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-gray-700 mb-2 font-medium">Hiring Multiple Candidates?</label><select name="hiringMultipleCandidates" value={jobData.hiringMultipleCandidates} onChange={handleInputChange} className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"><option value="No">No</option><option value="Yes">Yes</option></select></div>
                        <div className="flex items-center h-full mt-4"><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="isSocialImpact" checked={jobData.isSocialImpact} onChange={handleInputChange} className="h-5 w-5 text-primary rounded focus:ring-primary" /><span className="text-gray-700 font-medium">This is a social impact role</span></label></div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-gray-700 mb-2 font-medium">Personal Website Title (Optional)</label><input type="text" name="personalWebsiteTitle" value={jobData.personalWebsiteTitle} onChange={handleInputChange} className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                        <div><label className="block text-gray-700 mb-2 font-medium">Personal Website URL (Optional)</label><input type="url" name="personalWebsiteUrl" value={jobData.personalWebsiteUrl} onChange={handleInputChange} className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-all duration-300">
                        {loading ? "Posting..." : "Post Job"}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default PostJob;
