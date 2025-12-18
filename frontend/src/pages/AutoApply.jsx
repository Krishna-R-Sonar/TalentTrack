// frontend/src/pages/AutoApply.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { autoApplyJobs, clearApplicationErrors, clearApplicationMessage } from '../store/slices/applicationSlice';
import Spinner from '../components/Spinner';

const AutoApply = () => {
  const dispatch = useDispatch();
  const { loading, error, message, autoAppliedJobs } = useSelector((state) => state.applications);
  const { user } = useSelector((state) => state.user);

  const [isAutoApplyTriggered, setIsAutoApplyTriggered] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearApplicationErrors());
    }
    if (message) {
      toast.success(message);
      dispatch(clearApplicationMessage());
    }
  }, [error, message, dispatch]);

  const handleAutoApply = () => {
    if (!user?.resume?.url) {
      toast.error('Please upload a resume to use the auto-apply feature.');
      return;
    }
    dispatch(autoApplyJobs());
    setIsAutoApplyTriggered(true);
  };

  if (loading) return <Spinner />;

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-4xl w-full p-6 sm:p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 text-center">
          AI Auto-Apply for Jobs
        </h2>
        <p className="text-lg text-dark mb-6 text-center">
          Let our AI apply to jobs that match your resume. You’ll receive email confirmations for each application.
        </p>
        {!isAutoApplyTriggered ? (
          <button
            onClick={handleAutoApply}
            className="w-full py-3 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-all duration-300"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Start AI Auto-Apply'}
          </button>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-dark">Auto-Applied Jobs</h3>
            {autoAppliedJobs.length === 0 ? (
              <p className="text-gray-600">No jobs were auto-applied. Try again later or check your profile matches.</p>
            ) : (
              <ul className="space-y-4">
                {autoAppliedJobs.map((job) => (
                  <li key={job.jobId} className="p-4 bg-neutral rounded-md shadow-sm">
                    <p className="font-medium text-dark">Job: {job.jobTitle}</p>
                    <p className="text-gray-600">Company: {job.companyName}</p>
                    <p className="text-gray-600">Location: {job.location}</p>
                    <p className="text-gray-600">AI Score: {job.score}</p>
                    <p className="text-gray-600">Feedback: {job.feedback}</p>
                    <p className="text-green-600 font-medium">Application Submitted</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AutoApply;