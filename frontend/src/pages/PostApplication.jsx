// frontend/src/pages/PostApplication.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { postApplication, clearApplicationMessage, clearApplicationErrors } from "../store/slices/applicationSlice";
import { fetchSingleJob, clearJobErrors } from "../store/slices/jobSlice.js";
import Spinner from "../components/Spinner";

const PostApplication = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { singleJob, loading: jobLoading, error: jobError } = useSelector((state) => state.jobs);
    const { loading: appLoading, error: appError, message: appMessage, aiFeedback, compatibilityScore } = useSelector((state) => state.applications);
    const { user } = useSelector((state) => state.user);

    const [coverLetter, setCoverLetter] = useState('');
    const [resumeFile, setResumeFile] = useState(null);

    useEffect(() => {
        dispatch(fetchSingleJob(jobId));
    }, [dispatch, jobId]);

    useEffect(() => {
        if (jobError) {
            toast.error(jobError);
            dispatch(clearJobErrors());
            navigate('/jobs');
        }
        if (appError) {
            toast.error(appError);
            dispatch(clearApplicationErrors());
        }
        if (appMessage) {
            toast.success(appMessage);
            if (aiFeedback) {
                toast.info(`AI Feedback: ${aiFeedback} (Score: ${compatibilityScore})`);
            }
            dispatch(clearApplicationMessage());
            navigate("/dashboard/my-applications");
        }
    }, [dispatch, navigate, jobError, appError, appMessage, aiFeedback, compatibilityScore]);

    const handleFileChange = (e) => {
        setResumeFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", user.name);
        formData.append("email", user.email);
        formData.append("phone", user.phone);
        formData.append("address", user.address);
        formData.append("coverLetter", coverLetter);

        if (resumeFile) {
            formData.append("resume", resumeFile);
        }
        dispatch(postApplication({ jobId, formData }));
    };

    if (jobLoading || !singleJob) {
        return <Spinner />;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-center">
            <div className="max-w-3xl w-full p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl sm:text-3xl font-semibold text-primary mb-2">
                    Apply for {singleJob.title}
                </h2>
                <p className="text-lg text-dark mb-6">at {singleJob.companyName}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Your Cover Letter</label>
                        <textarea
                            name="coverLetter"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            className="w-full p-3 rounded-md bg-neutral border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                            rows="6"
                            placeholder="Write a compelling cover letter explaining why you are a good fit for this role."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Your Resume (Image only)</label>
                        <p className="text-sm text-gray-500 mb-2">
                            Your saved resume will be used by default. Upload a new one below to override it for this application only.
                        </p>
                        <input
                            type="file"
                            name="resume"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                        />
                        {user?.resume?.url && !resumeFile && (
                            <p className="text-gray-600 text-sm mt-2">
                                Currently using: <a href={user.resume.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Saved Resume</a>
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        disabled={appLoading}
                    >
                        {appLoading ? "Submitting..." : "Submit Application"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostApplication;