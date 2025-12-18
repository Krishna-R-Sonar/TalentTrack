// frontend/src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import Account from '../components/Account';
import Applications from '../components/Applications';
import MyJobs from '../components/MyJobs';
import MyApplications from '../components/MyApplications';
import CareerAdvice from '../components/CareerAdvice';
import ResumeBasedJobSearch from '../components/ResumeBasedJobSearch';
import Endorsements from '../components/Endorsements';
import ImpactPoints from '../components/ImpactPoints';
import AutoApply from './AutoApply';
import EditJob from '../components/EditJob';  // New import
import { toast } from 'react-toastify';
import { updateProfile } from '../store/slices/updateProfileSlice';
import { getUser } from '../store/slices/userSlice';

const Dashboard = () => {
    const { user } = useSelector((state) => state.user);
    const [newsletterOptIn, setNewsletterOptIn] = useState(user?.newsletterOptIn ?? true);
    const dispatch = useDispatch();
    const location = useLocation();

    const handleNewsletterToggle = async () => {
        const newPreference = !newsletterOptIn;
        setNewsletterOptIn(newPreference);
        const formData = new FormData();
        // Send all existing data to prevent it from being wiped
        formData.append("name", user.name);
        formData.append("email", user.email);
        formData.append("phone", user.phone);
        formData.append("address", user.address);
        if (user.role === 'Job Seeker') {
            formData.append("firstNiche", user.niches.firstNiche);
            formData.append("secondNiche", user.niches.secondNiche);
            formData.append("thirdNiche", user.niches.thirdNiche);
        }
        formData.append("newsletterOptIn", newPreference);

        try {
            await dispatch(updateProfile(formData)).unwrap();
            dispatch(getUser()); // Refresh user data
            toast.success('Newsletter preference updated.');
        } catch (error) {
            setNewsletterOptIn(!newPreference); // Revert on failure
            toast.error(error?.message || 'Failed to update newsletter preference');
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    const getLinkClass = (path) => {
        return location.pathname === path
            ? 'block p-3 bg-primary text-white rounded-md'
            : 'block p-3 text-gray-600 hover:bg-neutral hover:text-primary rounded-md';
    };

    return (
        <div className="p-4 sm:p-6 min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
                <aside className="md:w-1/4 bg-white p-4 rounded-lg shadow-md self-start">
                    <h4 className="text-xl font-semibold text-dark mb-6">Dashboard</h4>
                    <nav className="flex flex-col gap-2">
                        <Link to="/dashboard/account" className={getLinkClass('/dashboard/account')}>Account</Link>
                        <Link to="/dashboard/my-jobs" className={getLinkClass('/dashboard/my-jobs')}>Posted Jobs</Link>
                        {user.role === 'Employer' ? (
                            <>
                                <Link to="/dashboard/applications" className={getLinkClass('/dashboard/applications')}>Applications</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/dashboard/my-applications" className={getLinkClass('/dashboard/my-applications')}>My Applications</Link>
                                <Link to="/dashboard/career-advice" className={getLinkClass('/dashboard/career-advice')}>AI Career Assistant</Link>
                                <Link to="/dashboard/resume-jobs" className={getLinkClass('/dashboard/resume-jobs')}>Resume-Based Jobs</Link>
                                <Link to="/dashboard/endorsements" className={getLinkClass('/dashboard/endorsements')}>Endorsements</Link>
                                <Link to="/dashboard/impact-points" className={getLinkClass('/dashboard/impact-points')}>Impact Points</Link>
                                <Link to="/dashboard/auto-apply" className={getLinkClass('/dashboard/auto-apply')}>Auto-Apply</Link>
                            </>
                        )}
                    </nav>
                    <div className="mt-6 pt-4 border-t">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={newsletterOptIn}
                                onChange={handleNewsletterToggle}
                                className="h-5 w-5 text-primary rounded focus:ring-primary"
                            />
                            <span className="text-gray-600">Receive Job Newsletters</span>
                        </label>
                    </div>
                </aside>
                <div className="md:w-3/4 bg-white p-6 rounded-lg shadow-md">
                    <Routes>
                        <Route path="account" element={<Account />} />
                        <Route path="applications" element={<Applications />} />
                        <Route path="my-jobs" element={<MyJobs />} />
                        <Route path="my-applications" element={<MyApplications />} />
                        <Route path="career-advice" element={<CareerAdvice />} />
                        <Route path="resume-jobs" element={<ResumeBasedJobSearch />} />
                        <Route path="endorsements" element={<Endorsements />} />
                        <Route path="impact-points" element={<ImpactPoints />} />
                        <Route path="auto-apply" element={<AutoApply />} />
                        <Route path="edit-job/:jobId" element={<EditJob />} />  {/* New route */}
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
