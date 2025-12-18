// frontend/src/pages/Register.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearUserErrors } from "../store/slices/userSlice.js";
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaFileAlt } from 'react-icons/fa';

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [firstNiche, setFirstNiche] = useState("");
    const [secondNiche, setSecondNiche] = useState("");
    const [thirdNiche, setThirdNiche] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [resume, setResume] = useState(null);

    const { loading, isAuthenticated, error } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigateTo = useNavigate();

    const resumeHandler = (e) => {
        setResume(e.target.files[0]);
    };

    const handleRegister = (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!firstNiche || !secondNiche || !thirdNiche) {
            toast.error("Please select all three preferred job niches");
            return;
        }
        if (!resume) {
            toast.error("Please upload your resume");
            return;
        }
        
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("password", password);
        formData.append("firstNiche", firstNiche);
        formData.append("secondNiche", secondNiche);
        formData.append("thirdNiche", thirdNiche);
        if (coverLetter) formData.append("coverLetter", coverLetter);
        formData.append("resume", resume);
        dispatch(register(formData));
    };

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearUserErrors());
        }
        if (isAuthenticated) {
            toast.success("Registration successful! Welcome.");
            navigateTo("/dashboard/account");
        }
    }, [dispatch, error, isAuthenticated, navigateTo]);

    const nichesArray = [
        "Software Development", "Web Development", "Cybersecurity", "Data Science",
        "Artificial Intelligence", "Cloud Computing", "DevOps", "Mobile App Development",
        "UI/UX Design", "Machine Learning", "IT Project Management"
    ];

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="max-w-2xl w-full p-6 sm:p-8 bg-white rounded-2xl shadow-lg">
                <h3 className="text-2xl sm:text-3xl font-bold text-dark text-center mb-6">Create a New Account</h3>
                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative"><FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-10 p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900" /></div>
                        <div className="relative"><FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900" /></div>
                        <div className="relative"><FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full pl-10 p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900" /></div>
                        <div className="relative"><FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full pl-10 p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900" /></div>
                    </div>
                    <div className="relative"><FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900" /></div>

                    <div className="space-y-4 p-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">Add your job preferences to get better recommendations</p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <select value={firstNiche} onChange={(e) => setFirstNiche(e.target.value)} required className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"><option value="">Preferred Niche 1 *</option>{nichesArray.map(n => <option key={n + "1"} value={n}>{n}</option>)}</select>
                                <select value={secondNiche} onChange={(e) => setSecondNiche(e.target.value)} required className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"><option value="">Preferred Niche 2 *</option>{nichesArray.map(n => <option key={n + "2"} value={n}>{n}</option>)}</select>
                                <select value={thirdNiche} onChange={(e) => setThirdNiche(e.target.value)} required className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"><option value="">Preferred Niche 3 *</option>{nichesArray.map(n => <option key={n + "3"} value={n}>{n}</option>)}</select>
                            </div>
                            <div>
                                <textarea placeholder="Cover Letter (Can be updated later)" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows="4" className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"></textarea>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Upload Your Resume *</label>
                                <div className="relative">
                                    <FaFileAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={resumeHandler}
                                        required
                                        className="w-full pl-10 p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-all duration-300">
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                    <Link to="/login" className="block text-center text-primary hover:underline mt-4 font-medium">
                        Already have an account? Login Now
                    </Link>
                </form>
            </div>
        </section>
    );
};

export default Register;