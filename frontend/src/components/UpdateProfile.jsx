// frontend/src/components/UpdateProfile.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearUpdateProfileState, updateProfile } from "../store/slices/updateProfileSlice";
import { toast } from "react-toastify";
import { getUser } from "../store/slices/userSlice";
import Spinner from "./Spinner";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const UpdateProfile = () => {
    const { user } = useSelector((state) => state.user);
    const { loading, error, isUpdated, message } = useSelector((state) => state.updateProfile);
    const dispatch = useDispatch();
    const navigateTo = useNavigate();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [coverLetter, setCoverLetter] = useState(user?.coverLetter || '');
    const [firstNiche, setFirstNiche] = useState(user?.niches?.firstNiche || '');
    const [secondNiche, setSecondNiche] = useState(user?.niches?.secondNiche || '');
    const [thirdNiche, setThirdNiche] = useState(user?.niches?.thirdNiche || '');
    const [resume, setResume] = useState(null);
    const [resumePreview, setResumePreview] = useState(user?.resume?.url || '');

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("address", address);
        if (user?.role === "Job Seeker") {
            formData.append("firstNiche", firstNiche);
            formData.append("secondNiche", secondNiche);
            formData.append("thirdNiche", thirdNiche);
            formData.append("coverLetter", coverLetter);
            if (resume) {
                formData.append("resume", resume);
            }
        }
        dispatch(updateProfile(formData));
    };

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearUpdateProfileState());
        }
        if (isUpdated) {
            toast.success(message || "Profile Updated Successfully!");
            dispatch(getUser());
            dispatch(clearUpdateProfileState());
            navigateTo('/dashboard/account');
        }
    }, [dispatch, error, isUpdated, message, navigateTo]);

    const resumeHandler = (e) => {
        const file = e.target.files[0];
        setResume(file);
        setResumePreview(URL.createObjectURL(file));
    };

    const nichesArray = [
        "Software Development", "Web Development", "Cybersecurity", "Data Science",
        "Artificial Intelligence", "Cloud Computing", "DevOps", "Mobile App Development",
        "UI/UX Design", "Machine Learning", "IT Project Management"
    ];

    if (loading) return <Spinner />;

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
            <h3 className="text-2xl sm:text-3xl font-semibold text-primary mb-6">Update Profile</h3>
            <form className="space-y-6" onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-gray-700 mb-2 font-medium">Full Name</label><div className="relative"><FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" /></div></div>
                    <div><label className="block text-gray-700 mb-2 font-medium">Email</label><div className="relative"><FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" /></div></div>
                    <div><label className="block text-gray-700 mb-2 font-medium">Phone</label><div className="relative"><FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-10 p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" /></div></div>
                    <div><label className="block text-gray-700 mb-2 font-medium">Address</label><div className="relative"><FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full pl-10 p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" /></div></div>
                </div>
                {user?.role === 'Job Seeker' && (
                    <div className="space-y-6 pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-gray-700 mb-2 font-medium">Niche 1</label><select value={firstNiche} onChange={(e) => setFirstNiche(e.target.value)} className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"><option value="">Select Niche</option>{nichesArray.map(n => <option key={n + "1"} value={n}>{n}</option>)}</select></div>
                            <div><label className="block text-gray-700 mb-2 font-medium">Niche 2</label><select value={secondNiche} onChange={(e) => setSecondNiche(e.target.value)} className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"><option value="">Select Niche</option>{nichesArray.map(n => <option key={n + "2"} value={n}>{n}</option>)}</select></div>
                            <div><label className="block text-gray-700 mb-2 font-medium">Niche 3</label><select value={thirdNiche} onChange={(e) => setThirdNiche(e.target.value)} className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"><option value="">Select Niche</option>{nichesArray.map(n => <option key={n + "3"} value={n}>{n}</option>)}</select></div>
                        </div>
                        <div><label className="block text-gray-700 mb-2 font-medium">Cover Letter</label><textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows="5" className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"></textarea></div>
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">Update Resume</label>
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={resumeHandler}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100" />
                            {resumePreview && <a href={resumePreview} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mt-2 inline-block">View Current Resume</a>}
                        </div>
                    </div>
                )}
                <div className="flex justify-end gap-4 pt-4">
                    <Link to="/dashboard/account" className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400 transition-colors">Cancel</Link>
                    <button type="submit" className="px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

export default UpdateProfile;